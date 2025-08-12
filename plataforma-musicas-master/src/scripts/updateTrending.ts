import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTrendingData() {
    try {
        console.log('Starting trending data update...');

        // Get current date
        const now = new Date();

        // Check if it's Sunday (0 = Sunday)
        if (now.getDay() !== 0) {
            console.log('Not Sunday, skipping trending update');
            return;
        }

        // Check if it's around midnight (between 00:00 and 00:05)
        const hour = now.getHours();
        const minute = now.getMinutes();

        if (hour !== 0 || minute > 5) {
            console.log('Not midnight, skipping trending update');
            return;
        }

        console.log('Sunday midnight detected, updating trending data...');

        // Calculate the week that just ended (previous week)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7); // Go back 7 days
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Get the top 40 most downloaded tracks for the week
        const mostDownloadedTracks = await prisma.download.groupBy({
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
            take: 40
        });

        // Get track details
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
                            gte: weekStart,
                            lte: weekEnd
                        }
                    }
                }
            }
        });

        // Sort by download count
        const trendingTracks = tracks.map(track => {
            const downloadCount = track.downloads.length;
            return {
                id: track.id,
                songName: track.songName,
                artist: track.artist,
                downloadCount,
                weekStart: weekStart.toISOString(),
                weekEnd: weekEnd.toISOString()
            };
        }).sort((a, b) => b.downloadCount - a.downloadCount);

        console.log(`Updated trending data for week ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);
        console.log(`Found ${trendingTracks.length} trending tracks`);

        // Log top 10 for monitoring
        trendingTracks.slice(0, 10).forEach((track, index) => {
            console.log(`${index + 1}. ${track.artist} - ${track.songName} (${track.downloadCount} downloads)`);
        });

    } catch (error) {
        console.error('Error updating trending data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the update function
updateTrendingData(); 