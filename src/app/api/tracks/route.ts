// src/app/api/tracks/route.ts (versão com reconexão forçada)
import prisma, { safeQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const genre = searchParams.get('genre');
    const artist = searchParams.get('artist');
    const search = searchParams.get('search');
    const dateRange = searchParams.get('dateRange');
    const version = searchParams.get('version');
    const month = searchParams.get('month');

    console.log('🔍 API Tracks chamada com parâmetros:', {
      page, limit, genre, artist, search, dateRange, version, month
    });



    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (genre && genre !== 'all') {
      where.style = {
        contains: genre,
        mode: 'insensitive'
      };
    }

    if (artist && artist !== 'all') {
      where.artist = {
        contains: artist,
        mode: 'insensitive'
      };
    }

    if (search) {
      where.OR = [
        {
          songName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          artist: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Filtro por mês específico (tem prioridade sobre dateRange)
    if (month && month !== 'all') {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 1);
      endDate.setMilliseconds(-1);

      console.log('📅 Filtro de mês:', {
        month,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      where.releaseDate = {
        gte: startDate,
        lte: endDate
      };
    }

    console.log('🔍 Filtros construídos:', JSON.stringify(where, null, 2));

    // EXECUTAR QUERIES COM CONEXÃO GARANTIDA
    console.log('📊 Executando query de tracks...');
    const [tracks, total] = await Promise.all([
      await safeQuery(
        () => prisma.track.findMany({
          where,
          orderBy: [
            { releaseDate: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit,
        }),
        []
      ),
      await safeQuery(
        () => prisma.track.count({ where }),
        0
      )
    ]);

    console.log(`📊 Resultado: ${tracks.length} músicas encontradas de ${total} total`);

    // Buscar dados para filtros (apenas se não há filtros específicos)
    let genresList: any[] = [];
    let artistsList: any[] = [];
    let versionsList: any[] = [];

    if (!search && !genre && !artist && !version && !month && !dateRange) {
      console.log('🔧 Buscando dados para filtros...');
      [genresList, artistsList, versionsList] = await Promise.all([
        await safeQuery(
          () => prisma.track.findMany({
            select: { style: true },
            distinct: ['style'],
            orderBy: { style: 'asc' },
            take: 100
          }),
          []
        ),
        await safeQuery(
          () => prisma.track.findMany({
            select: { artist: true },
            distinct: ['artist'],
            orderBy: { artist: 'asc' },
            take: 100
          }),
          []
        ),
        await safeQuery(
          () => prisma.track.findMany({
            select: { version: true },
            distinct: ['version'],
            where: { version: { not: null } },
            orderBy: { version: 'asc' },
            take: 100
          }),
          []
        )
      ]);
      console.log(`🔧 Filtros carregados: ${genresList.length} gêneros, ${artistsList.length} artistas, ${versionsList.length} versões`);
    }

    // Formatar dados
    const formattedTracks = tracks.map((track: any) => ({
      ...track,
      releaseDate: track.releaseDate.toISOString().split('T')[0],
    }));

    // Agrupar tracks por data de lançamento
    const tracksByDate = formattedTracks.reduce((groups: any, track: any) => {
      const date = track.releaseDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(track);
      return groups;
    }, {});

    // Ordenar as datas em ordem decrescente
    const sortedDates = Object.keys(tracksByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return NextResponse.json({
      tracks: formattedTracks,
      tracksByDate,
      sortedDates,
      total,
      totalCount: total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        genres: genresList.map((g: any) => g.style),
        artists: artistsList.map((a: any) => a.artist),
        versions: versionsList.map((v: any) => v.version).filter(Boolean)
      }
    });

  } catch (error) {
    console.error("[GET_TRACKS_ERROR]", error);
    return NextResponse.json({
      error: "Erro interno do servidor ao buscar músicas",
      tracks: [],
      total: 0,
      page: 1,
      totalPages: 0,
      filters: {
        genres: [],
        artists: [],
        versions: []
      }
    }, { status: 500 });
  }
}
