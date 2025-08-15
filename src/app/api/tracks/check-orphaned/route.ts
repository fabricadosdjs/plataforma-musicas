import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { ContaboStorage } from '@/lib/contabo-storage';

const storage = new ContaboStorage({
    endpoint: process.env.CONTABO_ENDPOINT!,
    region: process.env.CONTABO_REGION!,
    accessKeyId: process.env.CONTABO_ACCESS_KEY!,
    secretAccessKey: process.env.CONTABO_SECRET_KEY!,
    bucketName: process.env.CONTABO_BUCKET_NAME!,
});

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Apenas admin pode executar esta operação
        if (session?.user?.email !== 'edersonleonardo@nexorrecords.com.br') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        console.log('🔍 Verificando músicas órfãs...');

        // Buscar todas as músicas do banco
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                downloadUrl: true,
                previewUrl: true,
                url: true
            }
        });

        console.log(`📊 Total de músicas no banco: ${tracks.length}`);

        const orphanedTracks = [];
        const validTracks = [];

        // Verificar cada música no storage
        for (const track of tracks) {
            const audioUrl = track.downloadUrl || track.previewUrl || track.url;

            if (!audioUrl || !audioUrl.includes('contabostorage.com')) {
                validTracks.push(track);
                continue;
            }

            try {
                // Extrair a chave do arquivo da URL
                const bucketPattern = 'plataforma-de-musicas/';
                const bucketIndex = audioUrl.indexOf(bucketPattern);

                if (bucketIndex === -1) {
                    console.log(`⚠️ Música ${track.id} não tem padrão de bucket válido:`, audioUrl);
                    orphanedTracks.push(track);
                    continue;
                }

                const key = audioUrl.substring(bucketIndex + bucketPattern.length);

                // Verificar se o arquivo existe no storage
                const fileInfo = await storage.getFileInfo(key);

                if (!fileInfo) {
                    console.log(`❌ Música órfã encontrada: ${track.id} - ${track.artist} - ${track.songName}`);
                    orphanedTracks.push(track);
                } else {
                    console.log(`✅ Música válida: ${track.id} - ${track.artist} - ${track.songName}`);
                    validTracks.push(track);
                }
            } catch (error) {
                console.error(`❌ Erro ao verificar música ${track.id}:`, error);
                orphanedTracks.push(track);
            }
        }

        console.log(`📊 Resultado: ${validTracks.length} válidas, ${orphanedTracks.length} órfãs`);

        return NextResponse.json({
            success: true,
            total: tracks.length,
            valid: validTracks.length,
            orphaned: orphanedTracks.length,
            orphanedTracks: orphanedTracks.map(track => ({
                id: track.id,
                songName: track.songName,
                artist: track.artist,
                downloadUrl: track.downloadUrl
            }))
        });

    } catch (error) {
        console.error('Erro ao verificar músicas órfãs:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Apenas admin pode executar esta operação
        if (session?.user?.email !== 'edersonleonardo@nexorrecords.com.br') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const trackIds = searchParams.get('trackIds');

        if (!trackIds) {
            return NextResponse.json({ error: 'IDs das músicas são obrigatórios' }, { status: 400 });
        }

        const ids = trackIds.split(',').map(id => parseInt(id.trim()));

        console.log(`🗑️ Excluindo músicas órfãs:`, ids);

        // Excluir as músicas do banco
        const result = await prisma.track.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        console.log(`✅ ${result.count} músicas órfãs excluídas do banco`);

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
            message: `${result.count} músicas órfãs foram excluídas do banco de dados`
        });

    } catch (error) {
        console.error('Erro ao excluir músicas órfãs:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 