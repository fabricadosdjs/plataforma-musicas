import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { apiCache, getCacheKey } from '@/lib/cache';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    // Segunda-feira como início da semana
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const cacheKey = getCacheKey('styles_most_downloaded_week', { week: startOfWeek.toISOString() });
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'X-Cache': 'HIT'
        }
      });
    }

    // Agregação semanal por estilo: downloads e número de faixas distintas
    // Limita para top 20 para payload pequeno
    const result: Array<{ name: string; downloadcount: number; trackcount: number }> = await prisma.$queryRaw`
      SELECT
        t."style" AS name,
        COUNT(*)::int AS downloadCount,
        COUNT(DISTINCT t."id")::int AS trackCount
      FROM "Download" d
      JOIN "Track" t ON t."id" = d."trackId"
      WHERE d."downloadedAt" >= ${startOfWeek} AND t."style" IS NOT NULL AND t."style" <> ''
      GROUP BY t."style"
      ORDER BY COUNT(*) DESC
      LIMIT 20;
    ` as any;

    // Normalizar chaves e ordenar por downloadCount desc
    const styles = (result || [])
      .map((row: any) => ({
        name: row.name,
        downloadCount: Number(row.downloadcount ?? row.downloadCount ?? 0),
        trackCount: Number(row.trackcount ?? row.trackCount ?? 0),
      }))
      .sort((a, b) => b.downloadCount - a.downloadCount);

    const response = { success: true, styles, weekStart: startOfWeek.toISOString() };
    apiCache.set(cacheKey, response, 300); // 5 minutos

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error fetching styles most downloaded:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
