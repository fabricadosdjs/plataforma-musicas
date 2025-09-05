import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Buscar todos os gêneros únicos da tabela de tracks
        const genres = await prisma.track.groupBy({
            by: ['style'],
            _count: {
                style: true
            },
            _max: {
                createdAt: true
            },
            where: {
                style: {
                    not: null
                }
            },
            orderBy: {
                _count: {
                    style: 'desc'
                }
            }
        });

        // Formatar os dados
        const formattedGenres = genres.map((genre, index) => ({
            id: index + 1,
            name: genre.style || 'Unknown',
            slug: (genre.style || 'unknown').toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-%2F-').replace(/--/g, '-'),
            trackCount: genre._count.style,
            lastUpdated: genre._max.createdAt ? new Date(genre._max.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            isPopular: index < 10, // Top 10 são populares
            isTrending: index < 5   // Top 5 são trending
        }));

        return NextResponse.json(formattedGenres);
    } catch (error) {
        console.error('Error fetching genres:', error);
        return NextResponse.json(
            { error: 'Failed to fetch genres' },
            { status: 500 }
        );
    }
}
