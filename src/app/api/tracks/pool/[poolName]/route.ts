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

        // Extrair parâmetros de paginação da URL
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '60');
        const offset = (page - 1) * limit;

        console.log('🔍 API Pool Tracks chamada para:', decodedPoolName, `- página ${page}, limite ${limit}`);

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar tracks da pool específica com paginação
        // Primeiro, tentar encontrar a pool exata
        let poolTracks = await prisma.track.findMany({
            where: {
                pool: decodedPoolName
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
                { createdAt: 'desc' }
            ],
            skip: offset,
            take: limit
        });

        // Se não encontrou, tentar buscar por similaridade (case insensitive)
        if (poolTracks.length === 0) {
            const allPools = await prisma.track.findMany({
                select: {
                    pool: true
                },
                distinct: ['pool']
            });

            // Encontrar pool que corresponde ao slug
            const matchingPool = allPools.find((p: any) => {
                const poolSlug = p.pool.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                return poolSlug === decodedPoolName.toLowerCase();
            });

            if (matchingPool) {
                poolTracks = await prisma.track.findMany({
                    where: {
                        pool: matchingPool.pool
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
                        { createdAt: 'desc' }
                    ],
                    skip: offset,
                    take: limit
                });
            }
        }

        const totalCount = await prisma.track.count({
            where: {
                pool: poolTracks.length > 0 ? poolTracks[0].pool : decodedPoolName
            }
        });

        const totalPages = Math.ceil(totalCount / limit);

        console.log(`📊 Pool ${decodedPoolName}: ${poolTracks.length}/${totalCount} tracks encontradas (página ${page}/${totalPages})`);

        // Processar tracks
        const tracksWithPreview = poolTracks.map((track: any) => ({
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
            totalCount,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
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