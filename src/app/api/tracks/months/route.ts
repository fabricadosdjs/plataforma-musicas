import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { apiCache, getCacheKey } from '@/lib/cache';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Months API called');

        // Cache key para meses
        const cacheKey = getCacheKey('available_months');
        const cached = apiCache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached, {
                headers: {
                    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
                    'X-Cache': 'HIT'
                }
            });
        }

        // Buscar todos os meses únicos onde há músicas
        const monthsData = await prisma.track.groupBy({
            by: ['createdAt'],
            _count: {
                id: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Agrupar por mês/ano
        const monthsMap = new Map<string, number>();

        monthsData.forEach(item => {
            const date = new Date(item.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const count = monthsMap.get(monthKey) || 0;
            monthsMap.set(monthKey, count + item._count.id);
        });

        // Converter para array e formatar
        const months = Array.from(monthsMap.entries())
            .map(([monthKey, count]) => {
                const [year, monthNum] = monthKey.split('-');
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                const monthNames = [
                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ];

                return {
                    value: monthKey,
                    label: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
                    count
                };
            })
            .sort((a, b) => b.value.localeCompare(a.value)); // Ordenar do mais recente para o mais antigo

        const response = {
            months,
            total: months.length
        };

        apiCache.set(cacheKey, response, 3600); // 1 hora

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
                'X-Cache': 'MISS'
            }
        });
    } catch (error) {
        console.error('Error fetching available months:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

