const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTrendingData() {
    try {
        console.log('🔍 Verificando dados de trending...\n');

        // 1. Verificar total de tracks
        const totalTracks = await prisma.track.count();
        console.log(`📊 Total de tracks no banco: ${totalTracks}`);

        // 2. Verificar total de downloads
        const totalDownloads = await prisma.download.count();
        console.log(`📥 Total de downloads no banco: ${totalDownloads}`);

        // 3. Verificar downloads da semana atual
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(now);
        weekEnd.setHours(23, 59, 59, 999);

        const weeklyDownloads = await prisma.download.count({
            where: {
                downloadedAt: {
                    gte: weekStart,
                    lte: weekEnd
                }
            }
        });
        console.log(`📅 Downloads da semana atual: ${weeklyDownloads}`);

        // 4. Verificar top 10 downloads da semana
        const topDownloads = await prisma.download.groupBy({
            by: ['trackId'],
            where: {
                downloadedAt: {
                    gte: weekStart,
                    lte: weekEnd
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
            take: 10
        });

        console.log('\n🏆 Top 10 downloads da semana:');
        for (let i = 0; i < topDownloads.length; i++) {
            const item = topDownloads[i];
            const track = await prisma.track.findUnique({
                where: { id: item.trackId }
            });
            console.log(`${i + 1}. ${track?.artist || 'N/A'} - ${track?.songName || 'N/A'} (${item._count.trackId} downloads)`);
        }

        // 5. Verificar se há downloads em diferentes semanas
        console.log('\n📈 Downloads por semana (últimas 4 semanas):');
        for (let week = 0; week < 4; week++) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (week * 7));
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const weekDownloads = await prisma.download.count({
                where: {
                    downloadedAt: {
                        gte: weekStart,
                        lte: weekEnd
                    }
                }
            });

            console.log(`Semana ${week + 1}: ${weekDownloads} downloads`);
        }

        // 6. Verificar se há tracks com downloads
        const tracksWithDownloads = await prisma.track.findMany({
            where: {
                downloads: {
                    some: {}
                }
            },
            include: {
                _count: {
                    select: {
                        downloads: true
                    }
                }
            },
            take: 5
        });

        console.log('\n🎵 Tracks com downloads:');
        tracksWithDownloads.forEach(track => {
            console.log(`- ${track.artist} - ${track.songName} (${track._count.downloads} downloads)`);
        });

        // 7. Verificar se há usuários que fizeram downloads
        const usersWithDownloads = await prisma.user.findMany({
            where: {
                downloads: {
                    some: {}
                }
            },
            include: {
                _count: {
                    select: {
                        downloads: true
                    }
                }
            },
            take: 5
        });

        console.log('\n👥 Usuários com downloads:');
        usersWithDownloads.forEach(user => {
            console.log(`- ${user.email} (${user._count.downloads} downloads)`);
        });

    } catch (error) {
        console.error('❌ Erro ao verificar dados:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTrendingData(); 