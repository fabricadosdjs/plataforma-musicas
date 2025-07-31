import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Remover verificação de autenticação para permitir acesso público ao trending
        // const session = await getServerSession(authOptions);
        // if (!session?.user) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // Get the current date and calculate weeks
        const now = new Date();
        const weeks = [];

        // Generate data for the last 8 weeks
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

        const trendingTracks = [];

        for (const week of weeks) {
            // Get the most downloaded tracks for this week (top 40)
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
                take: 40 // Changed from 50 to 40
            });

            // Get the full track details for the most downloaded tracks
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

            // Sort tracks by download count and add week information
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

            trendingTracks.push(...tracksWithDownloadCount);
        }

        return NextResponse.json({
            tracks: trendingTracks,
            totalWeeks: weeks.length
        });

    } catch (error) {
        console.error('Error fetching trending tracks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 