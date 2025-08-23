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

        console.log('🔍 API Genre Tracks chamada para:', decodedGenreName);

        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        const tracks = await prisma.track.findMany({
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
                folder: true, // Adicionando o campo folder
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
        });

        console.log(`📊 Gênero ${decodedGenreName}: ${tracks.length} tracks encontradas`);

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
            genreName: decodedGenreName,
            totalCount: tracks.length,
        });
    } catch (error) {
        console.error('[GET_GENRE_TRACKS_ERROR]', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}



