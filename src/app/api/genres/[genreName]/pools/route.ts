import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ genreName: string }> }) {
    try {
        const resolvedParams = await params;
        const genreName = resolvedParams.genreName;
        const decodedGenreName = decodeURIComponent(genreName);

        // Normalização inteligente: tentar múltiplas variações
        const variations = [];

        // Variação 1: Com hífen preservado
        if (decodedGenreName.includes('-')) {
            const withHyphen = decodedGenreName
                .split('-')
                .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('-');
            variations.push(withHyphen);
        }

        // Variação 2: Com espaços (para casos como drum-&-bass)
        const withSpaces = decodedGenreName
            .replace(/-/g, ' ')
            .replace(/&/g, '&')
            .split(' ')
            .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        variations.push(withSpaces);

        // Variação 3: Lidar com barras (para casos como organic-house-/-downtempo)
        if (decodedGenreName.includes('-/-') || decodedGenreName.includes('/')) {
            const withSlash = decodedGenreName
                .replace(/-/g, ' ')
                .replace('/-/', ' / ')
                .replace(/\//g, ' / ')
                .split(/\s+/)
                .filter((word: any) => word.length > 0)
                .map((word: any) => word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word)
                .join(' ');
            variations.push(withSlash);
        }

        console.log('🔍 Buscando pools para gênero:', {
            original: genreName,
            decoded: decodedGenreName,
            variations: variations
        });

        const pools = await prisma.track.findMany({
            where: {
                OR: variations.map((variation: any) => ({
                    style: {
                        equals: variation,
                        mode: 'insensitive'
                    }
                }))
            },
            select: {
                pool: true
            },
            distinct: ['pool'],
            orderBy: {
                pool: 'asc'
            }
        });

        const uniquePools = pools
            .map((t: any) => t.pool)
            .filter((pool: any): pool is string => pool !== null && pool !== undefined);

        return NextResponse.json(uniquePools);

    } catch (error) {
        console.error('❌ Erro na API /api/genres/[genreName]/pools GET:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
        }, { status: 500 });
    }
}