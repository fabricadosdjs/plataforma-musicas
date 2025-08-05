import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar todos os gêneros únicos
    const genres = await prisma.track.findMany({
      select: {
        style: true
      },
      distinct: ['style'],
      orderBy: {
        style: 'asc'
      }
    });

    // Buscar todos os artistas únicos
    const artists = await prisma.track.findMany({
      select: {
        artist: true
      },
      distinct: ['artist'],
      orderBy: {
        artist: 'asc'
      }
    });

    // Buscar todas as versões únicas
    const versions = await prisma.track.findMany({
      select: {
        version: true
      },
      distinct: ['version'],
      orderBy: {
        version: 'asc'
      }
    });

    // Buscar todos os pools únicos
    const pools = await prisma.track.findMany({
      select: {
        pool: true
      },
      distinct: ['pool'],
      orderBy: {
        pool: 'asc'
      }
    });

    return NextResponse.json({
      genres: genres.map(g => g.style).filter(style => style && style.trim() !== ''),
      artists: artists.map(a => a.artist).filter(artist => artist && artist.trim() !== ''),
      versions: versions.map(v => v.version).filter(version => version && version.trim() !== ''),
      pools: pools.map(p => p.pool).filter(pool => pool && pool.trim() !== '')
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar filtros' },
      { status: 500 }
    );
  }
} 