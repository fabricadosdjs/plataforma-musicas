import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const daysPerPage = 4; // 4 dias por página
        const offset = (page - 1) * daysPerPage;

        console.log(`📊 API New Tracks chamada - page: ${page}, daysPerPage: ${daysPerPage}, offset: ${offset}`);

        // Buscar todas as músicas ordenadas por data de lançamento
        const allTracks = await prisma.track.findMany({
            orderBy: [
                { releaseDate: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                version: true,
                releaseDate: true,
                createdAt: true,
                imageUrl: true,
                previewUrl: true,
                downloadUrl: true,
                isCommunity: true,
                uploadedBy: true,
                bitrate: true,
            }
        });

        console.log(`📊 Total de músicas carregadas: ${allTracks.length}`);

        // Agrupar músicas por data
        const tracksByDate = new Map<string, any[]>();

        allTracks.forEach(track => {
            let dateKey: string;

            if (track.releaseDate) {
                try {
                    const date = new Date(track.releaseDate);
                    if (!isNaN(date.getTime())) {
                        dateKey = date.toISOString().split('T')[0];
                    } else {
                        dateKey = 'no-date';
                    }
                } catch {
                    dateKey = 'no-date';
                }
            } else if (track.createdAt) {
                try {
                    const date = new Date(track.createdAt);
                    if (!isNaN(date.getTime())) {
                        dateKey = date.toISOString().split('T')[0];
                    } else {
                        dateKey = 'no-date';
                    }
                } catch {
                    dateKey = 'no-date';
                }
            } else {
                dateKey = 'no-date';
            }

            if (!tracksByDate.has(dateKey)) {
                tracksByDate.set(dateKey, []);
            }
            tracksByDate.get(dateKey)!.push(track);
        });

        // Ordenar datas (mais recente primeiro)
        const sortedDates = Array.from(tracksByDate.keys()).sort((a, b) => {
            if (a === 'no-date') return 1;
            if (b === 'no-date') return 1;
            return b.localeCompare(a);
        });

        console.log(`📊 Datas únicas encontradas: ${sortedDates.length}`);
        console.log(`📊 Primeiras 5 datas:`, sortedDates.slice(0, 5));

        // Calcular quais datas devem ser exibidas nesta página
        const startDateIndex = offset;
        const endDateIndex = Math.min(startDateIndex + daysPerPage, sortedDates.length);
        const datesForThisPage = sortedDates.slice(startDateIndex, endDateIndex);

        console.log(`📊 Página ${page}: datas ${startDateIndex + 1} a ${endDateIndex} de ${sortedDates.length}`);
        console.log(`📊 Datas desta página:`, datesForThisPage);

        // Filtrar músicas apenas das datas desta página
        const tracksForThisPage = allTracks.filter(track => {
            let trackDate: string;

            if (track.releaseDate) {
                try {
                    const date = new Date(track.releaseDate);
                    if (!isNaN(date.getTime())) {
                        trackDate = date.toISOString().split('T')[0];
                    } else {
                        return false;
                    }
                } catch {
                    return false;
                }
            } else if (track.createdAt) {
                try {
                    const date = new Date(track.createdAt);
                    if (!isNaN(date.getTime())) {
                        trackDate = date.toISOString().split('T')[0];
                    } else {
                        return false;
                    }
                } catch {
                    return false;
                }
            } else {
                return false;
            }

            return datesForThisPage.includes(trackDate);
        });

        console.log(`📊 Músicas filtradas para esta página: ${tracksForThisPage.length}`);

        // Processar tracks para retorno
        const processedTracks = tracksForThisPage.map((track: any) => ({
            ...track,
            previewUrl: track.downloadUrl || '',
            downloadCount: 0,
            likeCount: 0,
            playCount: 0,
        }));

        // Calcular estatísticas
        const totalDays = sortedDates.length;
        const totalPages = Math.ceil(totalDays / daysPerPage);
        const hasMore = page < totalPages;

        console.log(`📊 Estatísticas: ${totalDays} dias total, ${totalPages} páginas, página atual: ${page}, tem mais: ${hasMore}`);

        return NextResponse.json({
            tracks: processedTracks,
            page,
            hasMore,
            totalDays,
            totalPages,
            daysPerPage,
            currentDays: datesForThisPage.length,
            datesForThisPage,
            offset,
            startDateIndex: startDateIndex + 1,
            endDateIndex
        });

    } catch (error) {
        console.error("[GET_NEW_TRACKS_ERROR]", error);

        if (error instanceof Error) {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }

        return NextResponse.json({
            error: "Erro interno do servidor ao buscar músicas novas",
            tracks: [],
            page: 1,
            hasMore: false,
            totalDays: 0,
            totalPages: 1,
            daysPerPage: 4,
            currentDays: 0,
            datesForThisPage: [],
            offset: 0,
            startDateIndex: 1,
            endDateIndex: 0
        }, { status: 500 });
    }
}


