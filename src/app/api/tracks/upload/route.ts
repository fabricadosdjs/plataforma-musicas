import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { contaboStorage } from '@/lib/contabo-storage';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Verificar se o usuário está autenticado e é VIP
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário é VIP
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { is_vip: true }
        });

        if (!user?.is_vip) {
            return NextResponse.json(
                { success: false, error: 'Apenas usuários VIP podem fazer upload de músicas' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const songName = formData.get('songName') as string;
        const artist = formData.get('artist') as string;
        const style = formData.get('style') as string;
        const version = formData.get('version') as string || 'Original';
        const pool = formData.get('pool') as string || 'Nexor Records';
        const releaseDate = formData.get('releaseDate') as string;
        const coverUrl = formData.get('coverUrl') as string || '';

        // Validações
        if (!file || !songName || !artist || !style || !releaseDate) {
            return NextResponse.json(
                { success: false, error: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Validar se é um arquivo de áudio
        const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/mp4'];
        if (!audioTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Apenas arquivos de áudio são permitidos' },
                { status: 400 }
            );
        }

        // Validar tamanho do arquivo (máximo 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'Arquivo muito grande. Máximo 50MB' },
                { status: 400 }
            );
        }

        console.log(`📤 Upload de música: ${songName} - ${artist} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        // Gerar chave única para o arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `community/${session.user.id}/${timestamp}_${sanitizedFileName}`;

        console.log(`🔑 Chave do arquivo: ${key}`);

        // Converter arquivo para buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`📦 Buffer criado: ${buffer.length} bytes`);

        // Verificar configuração do Contabo
        console.log(`🔧 Configuração Contabo:`);
        console.log(`   Endpoint: ${process.env.CONTABO_ENDPOINT ? '✅ Configurado' : '❌ Não configurado'}`);
        console.log(`   Region: ${process.env.CONTABO_REGION || 'Não configurado'}`);
        console.log(`   Access Key: ${process.env.CONTABO_ACCESS_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
        console.log(`   Secret Key: ${process.env.CONTABO_SECRET_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
        console.log(`   Bucket: ${process.env.CONTABO_BUCKET_NAME || 'Não configurado'}`);

        // Upload para Contabo
        console.log(`🚀 Iniciando upload para Contabo...`);
        const downloadUrl = await contaboStorage.uploadFile(key, buffer, file.type);
        console.log(`✅ Upload concluído! URL: ${downloadUrl}`);

        // Gerar URL de preview (mesma URL por enquanto)
        const previewUrl = downloadUrl;

        // Gerar URL da imagem (usar coverUrl se fornecido, senão placeholder)
        const imageUrl = coverUrl || 'https://via.placeholder.com/300x300/1f2937/ffffff?text=🎵';

        // Criar registro no banco de dados
        const track = await prisma.track.create({
            data: {
                songName: songName.trim(),
                artist: artist.trim(),
                style: style.trim(),
                version: version.trim(),
                pool: pool.trim(),
                imageUrl,
                previewUrl,
                downloadUrl,
                releaseDate: new Date(releaseDate),
                isCommunity: true,
                uploadedBy: session.user.id,
            }
        });

        console.log(`✅ Música enviada com sucesso: ${track.id}`);

        return NextResponse.json({
            success: true,
            message: 'Música enviada com sucesso!',
            track: {
                id: track.id,
                songName: track.songName,
                artist: track.artist,
                style: track.style,
                version: track.version,
                imageUrl: track.imageUrl,
                previewUrl: track.previewUrl,
                downloadUrl: track.downloadUrl,
                releaseDate: track.releaseDate,
                isCommunity: track.isCommunity,
                uploadedBy: track.uploadedBy,
            }
        });

    } catch (error) {
        console.error('❌ Erro no upload de música:', error);
        console.error('📋 Detalhes do erro:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            cause: error instanceof Error ? error.cause : 'No cause'
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Erro durante o upload da música',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verificar se o usuário está autenticado
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Buscar músicas enviadas pelo usuário
        const tracks = await prisma.track.findMany({
            where: {
                uploadedBy: session.user.id,
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                version: true,
                imageUrl: true,
                releaseDate: true,
                createdAt: true,
                _count: {
                    select: {
                        downloads: true,
                        likes: true,
                        plays: true,
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            tracks
        });

    } catch (error) {
        console.error('❌ Erro ao buscar músicas do usuário:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao buscar músicas',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
} 