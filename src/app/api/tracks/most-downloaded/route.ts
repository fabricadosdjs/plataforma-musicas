import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Endpoint público: não exigir sessão para exibir estatísticas agregadas

        // Get the start of the current week (Monday)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        // Get the most downloaded tracks of the week
        const mostDownloadedTracks = await prisma.download.groupBy({
            by: ['trackId'],
            where: {
                downloadedAt: {
                    gte: startOfWeek
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
            take: 4
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
                            gte: startOfWeek
                        }
                    }
                }
            }
        });

        // Sort tracks by download count and add download count
        const tracksWithDownloadCount = tracks.map(track => {
            const downloadCount = track.downloads.length;
            return {
                id: track.id,
                songName: track.songName,
                artist: track.artist,
                imageUrl: track.imageUrl,
                style: track.style,
                downloadCount,
                downloadUrl: track.downloadUrl
            };
        }).sort((a, b) => b.downloadCount - a.downloadCount);

        return NextResponse.json({
            tracks: tracksWithDownloadCount,
            weekStart: startOfWeek.toISOString()
        });

    } catch (error) {
        console.error('Error fetching most downloaded tracks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 