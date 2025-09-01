import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ genreName: string }> }
) {
    try {
        const { genreName } = await params;
        const decodedGenreName = decodeURIComponent(genreName);

        console.log('🔍 API Genre Top 10 chamada para:', decodedGenreName);

        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar tracks do gênero com contadores reais de download, like e play
        const topTracks = await prisma.track.findMany({
            where: {
                style: {
                    equals: decodedGenreName,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                _count: {
                    select: {
                        downloads: true,
                        likes: true,
                        plays: true,
                    }
                }
            },
            orderBy: [
                { downloads: { _count: 'desc' } },
                { likes: { _count: 'desc' } },
                { plays: { _count: 'desc' } },
            ],
            take: 10,
        });

        // Transformar os dados para o formato esperado
        const tracksWithCounts = topTracks.map(track => ({
            id: track.id,
            songName: track.songName,
            artist: track.artist,
            style: track.style,
            pool: track.pool,
            downloadCount: track._count.downloads,
            likeCount: track._count.likes,
            playCount: track._count.plays,
        }));

        console.log(`📊 Top 10 do gênero ${decodedGenreName}: ${tracksWithCounts.length} tracks encontradas`);

        // Log dos primeiros tracks para debug
        if (tracksWithCounts.length > 0) {
            console.log('🏆 Primeiros 3 tracks do Top 10:', tracksWithCounts.slice(0, 3).map(t => ({
                songName: t.songName,
                downloads: t.downloadCount,
                likes: t.likeCount,
                plays: t.playCount
            })));
        }

        return NextResponse.json({
            tracks: tracksWithCounts,
            genreName: decodedGenreName,
            totalCount: tracksWithCounts.length,
        });
    } catch (error) {
        console.error('[GET_GENRE_TOP10_ERROR]', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
