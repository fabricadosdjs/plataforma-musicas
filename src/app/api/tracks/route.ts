// src/app/api/tracks/route.ts
import prisma, { safeQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const artist = searchParams.get('artist');
    const search = searchParams.get('search');
    const dateRange = searchParams.get('dateRange');
    const version = searchParams.get('version');
    const month = searchParams.get('month');
    const pool = searchParams.get('pool');

    // REMOVIDO: Lógica de paginação por faixas (page, limit, skip)
    // const page = parseInt(searchParams.get('page') || '1');
    // const limit = parseInt(searchParams.get('limit') || '100');
    // const skip = (page - 1) * limit;

    console.log('🔍 API Tracks chamada com parâmetros:', {
      genre, artist, search, dateRange, version, month
    });

    const where: any = {};

    if (genre && genre !== 'all') {
      where.style = { contains: genre, mode: 'insensitive' };
    }
    if (artist && artist !== 'all') {
      where.artist = { contains: artist, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { songName: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (pool && pool !== 'all') {
      where.pool = { contains: pool, mode: 'insensitive' };
    }

    // Filtro por mês (tem prioridade)
    if (month && month !== 'all') {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0); // O dia 0 do próximo mês é o último dia do mês atual
      endDate.setHours(23, 59, 59, 999);

      where.releaseDate = { gte: startDate, lte: endDate };

      // ADICIONADO: Lógica para o filtro 'dateRange' que estava faltando
    } else if (dateRange && dateRange !== 'all') {
      const now = new Date();
      if (dateRange === 'today') {
        where.releaseDate = { gte: startOfDay(now), lte: endOfDay(now) };
      } else if (dateRange === 'yesterday') {
        const yesterday = subDays(now, 1);
        where.releaseDate = { gte: startOfDay(yesterday), lte: endOfDay(yesterday) };
      } else if (dateRange === 'week') {
        where.releaseDate = { gte: startOfDay(subDays(now, 7)), lte: endOfDay(now) };
      }
    }

    console.log('🔍 Filtros construídos:', JSON.stringify(where, null, 2));

    // CORREÇÃO: A query agora busca TODOS os resultados, sem skip ou take.
    const tracks = await safeQuery(
      () => prisma.track.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              downloads: true,
              likes: true,
              plays: true
            }
          }
        },
        orderBy: [
          { releaseDate: 'desc' },
          { createdAt: 'desc' }
        ],
      }),
      []
    );

    console.log(`📊 Resultado: ${tracks.length} músicas encontradas no total.`);

    // Otimização: Não busca filtros se já está filtrando
    let filtersData = {};
    if (!search && !genre && !artist && !version && !month && !dateRange && !pool) {
      // Esta lógica para buscar filtros pode permanecer como está
      const [genresList, artistsList, versionsList, poolsList] = await Promise.all([
        await safeQuery(() => prisma.track.findMany({ select: { style: true }, distinct: ['style'], orderBy: { style: 'asc' } }), []),
        await safeQuery(() => prisma.track.findMany({ select: { artist: true }, distinct: ['artist'], orderBy: { artist: 'asc' } }), []),
        await safeQuery(() => prisma.track.findMany({ select: { version: true }, distinct: ['version'], where: { version: { not: null } }, orderBy: { version: 'asc' } }), []),
        await safeQuery(() => prisma.track.findMany({ select: { pool: true }, distinct: ['pool'], where: { pool: { not: null } }, orderBy: { pool: 'asc' } }), [])
      ]);
      filtersData = {
        genres: genresList.map((g: any) => g.style),
        artists: artistsList.map((a: any) => a.artist),
        versions: versionsList.map((v: any) => v.version).filter(Boolean),
        pools: poolsList.map((p: any) => p.pool).filter(Boolean)
      };
    }

    // Garante que cada track tenha previewUrl (fallback para downloadUrl) e inclui campos da comunidade
    const tracksWithPreview = tracks.map((track: any) => ({
      ...track,
      previewUrl: track.previewUrl || track.downloadUrl || '',
      isCommunity: track.isCommunity || false,
      uploadedBy: track.uploadedBy || null,
      downloadCount: track._count?.downloads || 0,
      likeCount: track._count?.likes || 0,
      playCount: track._count?.plays || 0,
    }));

    // Agrupar tracks por data
    const tracksByDate = tracksWithPreview.reduce((groups: any, track: any) => {
      const date = track.releaseDate.toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(track);
      return groups;
    }, {});

    const sortedDates = Object.keys(tracksByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return NextResponse.json({
      tracks: tracksWithPreview, // Envia todas as tracks, a formatação de data pode ser no front-end
      tracksByDate,
      sortedDates,
      totalCount: tracksWithPreview.length,
      filters: filtersData
    });

  } catch (error) {
    console.error("[GET_TRACKS_ERROR]", error);
    return NextResponse.json({
      error: "Erro interno do servidor ao buscar músicas",
      tracks: [],
      totalCount: 0
    }, { status: 500 });
  }
}