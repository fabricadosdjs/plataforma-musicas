const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTrendingAPI() {
    try {
        console.log('🧪 Testando API de trending...\n');

        // Simular a lógica da API de trending
        const now = new Date();
        const weeks = [];

        // Gerar dados para as últimas 8 semanas
        for (let i = 0; i < 8; i++) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            weeks.push({
                weekNumber: i + 1,
                start: weekStart,
                end: weekEnd
            });
        }

        console.log('📅 Semanas calculadas:');
        weeks.forEach(week => {
            console.log(`Semana ${week.weekNumber}: ${week.start.toISOString()} até ${week.end.toISOString()}`);
        });

        const trendingTracks = [];

        for (const week of weeks) {
            console.log(`\n🔍 Processando semana ${week.weekNumber}...`);

            // Buscar os tracks mais baixados desta semana (top 40)
            const mostDownloadedTracks = await prisma.download.groupBy({
                by: ['trackId'],
                where: {
                    downloadedAt: {
                        gte: week.start,
                        lte: week.end
                    }
                },
                _count: {
                    trackId: true
                },
                orderBy: {
                    _count: {
                        trackId: 'desc'
                    }
                },
                take: 40
            });

            console.log(`📊 Encontrados ${mostDownloadedTracks.length} tracks com downloads na semana ${week.weekNumber}`);

            if (mostDownloadedTracks.length > 0) {
                // Buscar detalhes completos dos tracks
                const trackIds = mostDownloadedTracks.map(item => item.trackId);
                const tracks = await prisma.track.findMany({
                    where: {
                        id: {
                            in: trackIds
                        }
                    },
                    include: {
                        downloads: {
                            where: {
                                downloadedAt: {
                                    gte: week.start,
                                    lte: week.end
                                }
                            }
                        },
                        likes: true
                    }
                });

                console.log(`🎵 Detalhes carregados para ${tracks.length} tracks`);

                // Ordenar tracks por contagem de downloads e adicionar informações da semana
                const tracksWithDownloadCount = tracks.map(track => {
                    const downloadCount = track.downloads.length;
                    const likeCount = track.likes.length;
                    return {
                        id: track.id,
                        songName: track.songName,
                        artist: track.artist,
                        imageUrl: track.imageUrl,
                        style: track.style,
                        downloadCount,
                        likeCount,
                        downloadUrl: track.downloadUrl,
                        weekNumber: week.weekNumber,
                        weekStart: week.start.toISOString()
                    };
                }).sort((a, b) => b.downloadCount - a.downloadCount);

                console.log(`🏆 Top 5 da semana ${week.weekNumber}:`);
                tracksWithDownloadCount.slice(0, 5).forEach((track, index) => {
                    console.log(`${index + 1}. ${track.artist} - ${track.songName} (${track.downloadCount} downloads)`);
                });

                trendingTracks.push(...tracksWithDownloadCount);
            }
        }

        console.log(`\n📈 Total de tracks trending encontrados: ${trendingTracks.length}`);

        // Filtrar apenas tracks da semana atual (week 1)
        const currentWeekTracks = trendingTracks.filter(track => track.weekNumber === 1);
        console.log(`🎯 Tracks da semana atual: ${currentWeekTracks.length}`);

        if (currentWeekTracks.length > 0) {
            console.log('\n🏆 Top 10 da semana atual:');
            currentWeekTracks.slice(0, 10).forEach((track, index) => {
                console.log(`${index + 1}. ${track.artist} - ${track.songName} (${track.downloadCount} downloads, ${track.likeCount} likes)`);
            });
        } else {
            console.log('❌ Nenhum track encontrado para a semana atual');
        }

    } catch (error) {
        console.error('❌ Erro ao testar API de trending:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testTrendingAPI(); 