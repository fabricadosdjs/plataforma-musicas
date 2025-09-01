// src/app/api/tracks/all/route.ts
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        console.log(`📊 API Tracks All chamada - página ${page}, limite ${limit}`);

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar músicas com paginação
        const [tracks, totalCount] = await Promise.all([
            prisma.track.findMany({
                orderBy: [
                    { releaseDate: 'desc' },
                    { createdAt: 'desc' }
                ],
                select: {
                    id: true,
                    songName: true,
                    artist: true,
                    style: true,
                    pool: true,
                    version: true,
                    folder: true,
                    releaseDate: true,
                    createdAt: true,
                    imageUrl: true,
                    downloadUrl: true
                },
                skip: offset,
                take: limit
            }),
            prisma.track.count()
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        console.log(`📊 Músicas carregadas: ${tracks.length}/${totalCount} (página ${page}/${totalPages})`);

        return NextResponse.json({
            tracks,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage,
                hasPrevPage,
                limit
            }
        });

    } catch (error) {
        console.error("[GET_TRACKS_ALL_ERROR]", error);

        // Log mais detalhado do erro
        if (error instanceof Error) {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }

        return NextResponse.json({
            error: "Erro interno do servidor ao buscar músicas"
        }, { status: 500 });
    }
}

