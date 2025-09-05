import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API Search Options chamada');

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            // Retornar dados estáticos como fallback
            console.log('🔄 Retornando dados estáticos como fallback');
            return NextResponse.json({
                styles: ['House', 'Techno', 'Trance', 'Progressive', 'Deep House', 'Tech House', 'Minimal', 'Ambient'],
                artists: ['Artist 1', 'Artist 2', 'Artist 3', 'Artist 4', 'Artist 5'],
                pools: ['Pool 1', 'Pool 2', 'Pool 3', 'Pool 4', 'Pool 5']
            });
        }

        // Buscar estilos únicos (sem filtro de null, deixar o filter() cuidar disso)
        const styles = await prisma.track.findMany({
            select: {
                style: true,
            },
            distinct: ['style'],
            orderBy: {
                style: 'asc',
            },
        });

        // Buscar artistas únicos (sem filtro de null, deixar o filter() cuidar disso)
        const artists = await prisma.track.findMany({
            select: {
                artist: true,
            },
            distinct: ['artist'],
            orderBy: {
                artist: 'asc',
            },
        });

        // Buscar pools únicos (sem filtro de null, deixar o filter() cuidar disso)
        const pools = await prisma.track.findMany({
            select: {
                pool: true,
            },
            distinct: ['pool'],
            orderBy: {
                pool: 'asc',
            },
        });

        const result = {
            styles: styles.map(s => s.style).filter(Boolean).filter(s => s.trim() !== ''),
            artists: artists.map(a => a.artist).filter(Boolean).filter(a => a.trim() !== ''),
            pools: pools.map(p => p.pool).filter(Boolean).filter(p => p.trim() !== ''),
        };

        console.log('📊 Search Options carregadas:', {
            styles: result.styles.length,
            artists: result.artists.length,
            pools: result.pools.length
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('❌ Error fetching search options:', error);
        // Retornar dados estáticos como fallback em caso de erro
        console.log('🔄 Retornando dados estáticos como fallback (catch)');
        return NextResponse.json({
            styles: ['House', 'Techno', 'Trance', 'Progressive', 'Deep House', 'Tech House', 'Minimal', 'Ambient'],
            artists: ['Artist 1', 'Artist 2', 'Artist 3', 'Artist 4', 'Artist 5'],
            pools: ['Pool 1', 'Pool 2', 'Pool 3', 'Pool 4', 'Pool 5']
        });
    }
}