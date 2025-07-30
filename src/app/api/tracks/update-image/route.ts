import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        const isAdmin = session?.user?.email === 'admin@djpool.com' ||
            session?.user?.name === 'Admin' ||
            session?.user?.email === 'edersonleonardo@nexorrecords.com.br';

        if (!session?.user || !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { trackId, imageUrl } = await request.json();

        if (!trackId || !imageUrl) {
            return NextResponse.json({ error: 'Track ID and image URL are required' }, { status: 400 });
        }

        // Validate image URL format
        try {
            new URL(imageUrl);
        } catch {
            return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 });
        }

        // Update the track image
        const updatedTrack = await prisma.track.update({
            where: { id: trackId },
            data: { imageUrl },
        });

        return NextResponse.json({
            success: true,
            message: 'Track image updated successfully',
            track: {
                id: updatedTrack.id,
                songName: updatedTrack.songName,
                artist: updatedTrack.artist,
                imageUrl: updatedTrack.imageUrl,
            }
        });

    } catch (error) {
        console.error('Error updating track image:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
} 