import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const playlistId = parseInt(id);

        if (isNaN(playlistId)) {
            return NextResponse.json(
                { success: false, error: 'ID da playlist inválido' },
                { status: 400 }
            );
        }

        const { folder } = await request.json();

        if (!folder) {
            return NextResponse.json(
                { success: false, error: 'Nome da pasta é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se a playlist existe
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!playlist) {
            return NextResponse.json(
                { success: false, error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Buscar músicas da pasta do storage
        const { ContaboStorage } = await import('@/lib/contabo-storage');

        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT!,
            region: process.env.CONTABO_REGION!,
            accessKeyId: process.env.CONTABO_ACCESS_KEY!,
            secretAccessKey: process.env.CONTABO_SECRET_KEY!,
            bucketName: process.env.CONTABO_BUCKET_NAME!,
        });

        const files = await storage.listAudioFiles(folder + '/');

        if (files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Nenhuma música encontrada nesta pasta do storage' },
                { status: 404 }
            );
        }

        // Converter arquivos do storage em tracks para adicionar à playlist
        const tracksToAdd = files.map((file, index) => {
            // Analisar nome do arquivo para extrair artista e música
            const nameWithoutExt = file.filename.replace(/\.[^/.]+$/, '');
            const parts = nameWithoutExt.split(' - ');

            return {
                songName: parts.length > 1 ? parts[1] : nameWithoutExt,
                artist: parts.length > 1 ? parts[0] : 'Artista Desconhecido',
                style: 'Unknown',
                version: null,
                pool: 'Storage',
                folder: folder,
                imageUrl: null,
                previewUrl: file.url,
                downloadUrl: file.url,
                releaseDate: file.lastModified.toISOString().split('T')[0],
                storageKey: file.key,
                fileSize: file.size
            };
        });

        // Verificar quais músicas já estão na playlist (por storageKey)
        const existingTracks = await prisma.playlistTrack.findMany({
            where: {
                playlistId: playlistId,
                track: {
                    storageKey: {
                        in: tracksToAdd.map((t: any) => t.storageKey)
                    }
                }
            },
            include: {
                track: {
                    select: {
                        storageKey: true
                    }
                }
            }
        });

        const existingStorageKeys = existingTracks.map((t: any) => t.track?.storageKey).filter(Boolean);
        const newTracks = tracksToAdd.filter((t: any) => !existingStorageKeys.includes(t.storageKey));

        if (newTracks.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Todas as músicas desta pasta já estão na playlist' },
                { status: 400 }
            );
        }

        // Obter a próxima ordem disponível
        const lastOrder = await prisma.playlistTrack.findFirst({
            where: { playlistId: playlistId },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const nextOrder = (lastOrder?.order || 0) + 1;

        // Criar as tracks no banco de dados e adicionar à playlist
        const createdTracks = [];
        const playlistTracks = [];

        for (let i = 0; i < newTracks.length; i++) {
            const trackData = newTracks[i];

            // Criar a track no banco
            const createdTrack = await prisma.track.create({
                data: {
                    songName: trackData.songName,
                    artist: trackData.artist,
                    style: trackData.style,
                    version: trackData.version,
                    pool: trackData.pool,
                    folder: trackData.folder,
                    imageUrl: trackData.imageUrl,
                    previewUrl: trackData.previewUrl,
                    downloadUrl: trackData.downloadUrl,
                    releaseDate: trackData.releaseDate,
                    storageKey: trackData.storageKey,
                    fileSize: trackData.fileSize
                }
            });

            createdTracks.push(createdTrack);

            // Adicionar à playlist
            playlistTracks.push({
                playlistId: playlistId,
                trackId: createdTrack.id,
                order: nextOrder + i
            });
        }

        // Adicionar as músicas à playlist
        await prisma.playlistTrack.createMany({
            data: playlistTracks
        });

        return NextResponse.json({
            success: true,
            message: `${newTracks.length} músicas adicionadas à playlist`,
            addedCount: newTracks.length,
            totalInFolder: tracksToAdd.length,
            alreadyInPlaylist: existingStorageKeys.length
        });

    } catch (error) {
        console.error('Error adding folder tracks to playlist:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
