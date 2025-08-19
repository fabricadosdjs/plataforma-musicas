import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const genre = searchParams.get('genre') || 'all';

    // Calcular data limite baseada no período
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // Desde o início
    }

    // Filtros baseados no período
    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    // Buscar estatísticas básicas
    const [
      totalTracks,
      totalDownloads,
      totalPlays,
      totalLikes,
      tracksData,
      downloadsData
    ] = await Promise.all([
      prisma.track.count(),
      prisma.download.count(),
      prisma.play.count(),
      prisma.like.count(),
      prisma.track.findMany({
        where: genre !== 'all' ? { style: genre } : {},
        select: {
          id: true,
          songName: true,
          artist: true,
          style: true,
          pool: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.download.findMany({
        where: dateFilter,
        include: {
          track: {
            select: {
              id: true,
              songName: true,
              artist: true,
              style: true
            }
          }
        },
        orderBy: { downloadedAt: 'desc' },
        take: 10
      })
    ]);

    // Agrupar por gênero
    const genres = await prisma.track.groupBy({
      by: ['style'],
      where: {
        style: { not: null }
      },
      _count: {
        style: true
      },
      orderBy: {
        _count: {
          style: 'desc'
        }
      }
    });

    // Agrupar por artista
    const artists = await prisma.track.groupBy({
      by: ['artist'],
      _count: {
        artist: true
      },
      orderBy: {
        _count: {
          artist: 'desc'
        }
      },
      take: 10
    });

    // Agrupar por pool
    const pools = await prisma.track.groupBy({
      by: ['pool'],
      where: {
        pool: { not: null }
      },
      _count: {
        pool: true
      },
      orderBy: {
        _count: {
          pool: 'desc'
        }
      }
    });

    // Converter para o formato esperado
    const genresMap = genres.reduce((acc, item) => {
      if (item.style) {
        acc[item.style] = item._count.style;
      }
      return acc;
    }, {} as Record<string, number>);

    const artistsMap = artists.reduce((acc, item) => {
      acc[item.artist] = item._count.artist;
      return acc;
    }, {} as Record<string, number>);

    const poolsMap = pools.reduce((acc, item) => {
      if (item.pool) {
        acc[item.pool] = item._count.pool;
      }
      return acc;
    }, {} as Record<string, number>);

    // Top tracks por downloads
    const topTracks = downloadsData.map(download => ({
      id: download.track.id,
      songName: download.track.songName,
      artist: download.track.artist,
      style: download.track.style,
      downloadCount: 1 // Simplificado - em produção seria melhor agrupar
    }));

    const stats = {
      totalTracks,
      totalDownloads,
      totalPlays,
      totalLikes,
      genres: genresMap,
      artists: artistsMap,
      pools: poolsMap,
      recentTracks: tracksData,
      topTracks
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 