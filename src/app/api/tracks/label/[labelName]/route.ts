import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ labelName: string }> }
) {
    try {
        const { labelName } = await params;
        const decodedLabelName = decodeURIComponent(labelName);

        // Paginação
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        console.log('🔍 API Label Tracks chamada para:', decodedLabelName, 'limit:', limit, 'offset:', offset);

        await prisma.$connect();

        // Busca por label (pool)
        const tracks = await prisma.track.findMany({
            where: {
                pool: {
                    equals: decodedLabelName,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                folder: true,
                imageUrl: true,
                downloadUrl: true,
                releaseDate: true,
                createdAt: true,
                previewUrl: true,
                isCommunity: true,
                uploadedBy: true,
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
            take: limit,
            skip: offset,
        });

        const tracksWithPreview = tracks.map((track: any) => ({
            ...track,
            previewUrl: track.downloadUrl || '',
            isCommunity: false,
            uploadedBy: null,
            downloadCount: 0,
            likeCount: 0,
            playCount: 0,
        }));

        return NextResponse.json({
            tracks: tracksWithPreview,
            labelName: decodedLabelName,
            totalCount: tracks.length,
        });
    } catch (error) {
        console.error('[GET_LABEL_TRACKS_ERROR]', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
