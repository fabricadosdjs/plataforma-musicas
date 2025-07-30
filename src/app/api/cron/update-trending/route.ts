import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        // Verify the request is from a legitimate cron job
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.CRON_SECRET_TOKEN;

        if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting trending data update via cron...');

        // Get current date
        const now = new Date();

        // Check if it's Sunday (0 = Sunday)
        if (now.getDay() !== 0) {
            console.log('Not Sunday, skipping trending update');
            return NextResponse.json({ message: 'Not Sunday, update skipped' });
        }

        // Check if it's around midnight (between 00:00 and 00:05)
        const hour = now.getHours();
        const minute = now.getMinutes();

        if (hour !== 0 || minute > 5) {
            console.log('Not midnight, skipping trending update');
            return NextResponse.json({ message: 'Not midnight, update skipped' });
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

        return NextResponse.json({
            success: true,
            message: 'Trending data updated successfully',
            weekStart: weekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
            tracksCount: trendingTracks.length,
            topTracks: trendingTracks.slice(0, 10)
        });

    } catch (error) {
        console.error('Error updating trending data:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
} 