import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('🔍 API Pools chamada');

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar todas as pools únicas com contagem de tracks
        const poolsData = await prisma.track.groupBy({
            by: ['pool'],
            where: {
                pool: {
                    not: null
                },
                AND: {
                    pool: {
                        not: ''
                    }
                }
            },
            _count: {
                id: true
            },
            _max: {
                createdAt: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });

        // Processar dados das pools
        const pools = poolsData.map((poolData: any) => ({
            id: poolData.pool,
            name: poolData.pool,
            slug: poolData.pool.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, ''),
            trackCount: poolData._count.id,
            lastUpdated: poolData._max.createdAt,
            isPopular: poolData._count.id > 50, // Pools com mais de 50 tracks são populares
            isTrending: poolData._count.id > 100 // Pools com mais de 100 tracks são trending
        }));

        console.log(`📊 ${pools.length} pools encontradas`);

        return NextResponse.json(pools);

    } catch (error) {
        console.error("[GET_POOLS_ERROR]", error);

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
