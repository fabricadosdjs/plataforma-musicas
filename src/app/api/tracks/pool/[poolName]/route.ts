// src/app/api/tracks/pool/[poolName]/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ poolName: string }> }
) {
    try {
        const { poolName } = await params;
        const decodedPoolName = decodeURIComponent(poolName);

        console.log('🔍 API Pool Tracks chamada para:', decodedPoolName);

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar todas as tracks da pool específica
        const tracks = await prisma.track.findMany({
            where: {
                pool: decodedPoolName
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                imageUrl: true,
                downloadUrl: true,
                releaseDate: true,
                createdAt: true,
                previewUrl: true,
                isCommunity: true,
                uploadedBy: true,
            },
            orderBy: [
                { createdAt: 'desc' }
            ],
        });

        console.log(`📊 Pool ${decodedPoolName}: ${tracks.length} tracks encontradas`);

        // Processar tracks
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
            poolName: decodedPoolName,
            totalCount: tracks.length
        });

    } catch (error) {
        console.error("[GET_POOL_TRACKS_ERROR]", error);

        if (error instanceof Error) {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
            });
        }

        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}



