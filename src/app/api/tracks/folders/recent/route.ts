import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { apiCache, getCacheKey } from '@/lib/cache';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Verificar cache primeiro
        const cacheKey = getCacheKey('folders_recent');
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log('🚀 Cache hit para folders recent');
            return NextResponse.json(cached, {
                headers: {
                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
                    'X-Cache': 'HIT'
                }
            });
        }

        // Query otimizada - usar aggregation em uma única query
        const foldersStats = await prisma.$queryRaw`
            SELECT 
                t.folder as name,
                COUNT(t.id) as trackCount,
                COUNT(d.id) as downloadCount,
                MAX(t."updatedAt") as lastUpdated,
                MAX(t."createdAt") as newestTrack,
                COALESCE(
                    (SELECT t2."imageUrl" FROM "Track" t2 
                     WHERE t2.folder = t.folder AND t2."imageUrl" IS NOT NULL 
                     ORDER BY t2."updatedAt" DESC LIMIT 1),
                    '/images/default-folder.jpg'
                ) as imageUrl
            FROM "Track" t
            LEFT JOIN "Download" d ON t.id = d."trackId"
            WHERE t.folder IS NOT NULL
            GROUP BY t.folder
            ORDER BY MAX(t."updatedAt") DESC, COUNT(t.id) DESC
            LIMIT 20
        ` as Array<{
            name: string;
            trackcount: bigint;
            downloadcount: bigint;
            lastupdated: Date;
            newesttrack: Date;
            imageurl: string;
        }>;

        // Processar resultados
        const processedFolders = foldersStats.map(folder => ({
            name: folder.name,
            trackCount: Number(folder.trackcount),
            downloadCount: Number(folder.downloadcount),
            imageUrl: folder.imageurl || '/images/default-folder.jpg',
            lastUpdated: folder.lastupdated?.toISOString() || folder.newesttrack?.toISOString() || new Date().toISOString()
        }));

        const response = {
            success: true,
            folders: processedFolders,
            total: processedFolders.length
        };

        // Cachear por 3 minutos
        apiCache.set(cacheKey, response, 180);

        console.log(`📁 ${processedFolders.length} folders carregados`);

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, max-age=180, stale-while-revalidate=360',
                'X-Cache': 'MISS'
            }
        });

    } catch (error) {
        console.error('❌ API: Erro ao buscar folders recentes:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                message: 'Não foi possível buscar os folders recentes'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
