// API de fallback para playlists - versão mais robusta
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: NextRequest) {
    let prisma: PrismaClient | null = null;

    try {
        console.log('🔍 API Playlists Fallback: Iniciando...');

        // Criar nova instância do Prisma para evitar problemas de cache
        prisma = new PrismaClient({
            log: ['error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        console.log('📋 Parâmetros:', { page, limit });

        // Query mais simples primeiro
        console.log('🔍 Testando query simples...');
        const totalCount = await prisma.playlist.count();
        console.log(`📊 Total de playlists: ${totalCount}`);

        if (totalCount === 0) {
            return NextResponse.json({
                playlists: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalCount: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        // Buscar playlists com query mais simples
        console.log('🔍 Buscando playlists...');
        const playlists = await prisma.playlist.findMany({
            orderBy: [
                { isFeatured: 'desc' },
                { createdAt: 'desc' }
            ],
            skip: (page - 1) * limit,
            take: limit
        });

        console.log(`✅ Playlists encontradas: ${playlists.length}`);

        // Buscar contagem de tracks para cada playlist
        const playlistsWithCounts = await Promise.all(
            playlists.map(async (playlist) => {
                try {
                    const trackCount = await prisma!.playlistTrack.count({
                        where: { playlistId: playlist.id }
                    });

                    return {
                        ...playlist,
                        trackCount
                    };
                } catch (error) {
                    console.error(`Erro ao contar tracks da playlist ${playlist.id}:`, error);
                    return {
                        ...playlist,
                        trackCount: 0
                    };
                }
            })
        );

        const totalPages = Math.ceil(totalCount / limit);

        console.log('📤 Enviando resposta...');
        return NextResponse.json({
            playlists: playlistsWithCounts,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Error in fallback API:', error);
        console.error('Stack trace:', (error as Error).stack);

        return NextResponse.json(
            {
                error: 'Erro ao buscar playlists (fallback)',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            },
            { status: 500 }
        );
    } finally {
        if (prisma) {
            try {
                await prisma.$disconnect();
                console.log('🔌 Conexão Prisma encerrada');
            } catch (error) {
                console.error('Erro ao desconectar Prisma:', error);
            }
        }
    }
}
