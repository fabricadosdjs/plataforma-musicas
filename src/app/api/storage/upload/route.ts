import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

// Configuração do storage
const STORAGE_BASE_PATH = process.env.STORAGE_BASE_PATH || '/var/www/html/storage';
const COMMUNITY_PATH = join(STORAGE_BASE_PATH, 'community');
const COVERS_PATH = join(STORAGE_BASE_PATH, 'community', 'covers');

export async function POST(request: NextRequest) {
    try {
        console.log('📤 API Storage Upload: Iniciando...');

        // Verificar se o usuário está autenticado
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            console.log('❌ Usuário não autenticado');
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        console.log('👤 Usuário autenticado:', session.user.email);

        // Verificar se é multipart/form-data
        const contentType = request.headers.get('content-type');
        if (!contentType?.includes('multipart/form-data')) {
            return NextResponse.json(
                { success: false, error: 'Content-Type deve ser multipart/form-data' },
                { status: 400 }
            );
        }

        // Fazer parse do form data
        const formData = await request.formData();
        const audioFile = formData.get('audioFile') as File;
        const coverImage = formData.get('coverImage') as File;
        const songName = formData.get('songName') as string;
        const artist = formData.get('artist') as string;

        console.log('📁 Arquivos recebidos:', {
            audioFile: audioFile?.name,
            coverImage: coverImage?.name,
            songName,
            artist
        });

        // Validações
        if (!audioFile || !coverImage || !songName || !artist) {
            return NextResponse.json(
                { success: false, error: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Validar tipo do arquivo de áudio
        if (!audioFile.name.toLowerCase().endsWith('.mp3')) {
            return NextResponse.json(
                { success: false, error: 'Arquivo de áudio deve ser MP3' },
                { status: 400 }
            );
        }

        // Validar tipo da imagem
        if (!coverImage.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'Arquivo de capa deve ser uma imagem' },
                { status: 400 }
            );
        }

        // Validar tamanhos
        if (audioFile.size > 50 * 1024 * 1024) { // 50MB
            return NextResponse.json(
                { success: false, error: 'Arquivo de áudio deve ter no máximo 50MB' },
                { status: 400 }
            );
        }

        if (coverImage.size > 5 * 1024 * 1024) { // 5MB
            return NextResponse.json(
                { success: false, error: 'Imagem de capa deve ter no máximo 5MB' },
                { status: 400 }
            );
        }

        // Criar diretórios se não existirem
        console.log('📁 Criando diretórios...');
        if (!existsSync(COMMUNITY_PATH)) {
            await mkdir(COMMUNITY_PATH, { recursive: true });
            console.log('✅ Diretório community criado');
        }

        if (!existsSync(COVERS_PATH)) {
            await mkdir(COVERS_PATH, { recursive: true });
            console.log('✅ Diretório covers criado');
        }

        // Gerar nomes únicos para os arquivos
        const timestamp = Date.now();
        const audioFileName = `${timestamp}_${artist.replace(/[^a-zA-Z0-9]/g, '_')}_${songName.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
        const coverFileName = `${timestamp}_${artist.replace(/[^a-zA-Z0-9]/g, '_')}_${songName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;

        const audioFilePath = join(COMMUNITY_PATH, audioFileName);
        const coverFilePath = join(COVERS_PATH, coverFileName);

        console.log('📝 Salvando arquivos...');
        console.log('🎵 Áudio:', audioFilePath);
        console.log('🖼️ Capa:', coverFilePath);

        // Converter arquivos para Buffer e salvar
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const coverBuffer = Buffer.from(await coverImage.arrayBuffer());

        await writeFile(audioFilePath, audioBuffer);
        await writeFile(coverFilePath, coverBuffer);

        console.log('✅ Arquivos salvos com sucesso');

        // URLs para acesso público (ajustar conforme sua configuração)
        const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:3000/storage';
        const audioUrl = `${baseUrl}/community/${audioFileName}`;
        const coverUrl = `${baseUrl}/community/covers/${coverFileName}`;

        return NextResponse.json({
            success: true,
            message: 'Arquivos enviados com sucesso para o storage',
            files: {
                audio: {
                    name: audioFileName,
                    path: audioFilePath,
                    url: audioUrl,
                    size: audioFile.size
                },
                cover: {
                    name: coverFileName,
                    path: coverFilePath,
                    url: coverUrl,
                    size: coverImage.size
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro no upload para storage:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}


