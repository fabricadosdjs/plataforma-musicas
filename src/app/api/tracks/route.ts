// src/app/api/tracks/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '0') : 50; // Limite padrão de 50
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    const search = searchParams.get('search') || ''; // Parâmetro de busca
    const community = searchParams.get('community'); // Parâmetro para filtrar músicas da comunidade
    const offset = (page - 1) * limit;

    console.log('🔍 API Tracks chamada - carregando músicas com paginação');
    console.log('🔍 Parâmetros:', { limit, page, offset, search, community, searchParams: Object.fromEntries(searchParams.entries()) });

    // Query otimizada com paginação, índices e busca
    console.log('🔍 Executando query Prisma otimizada...');

    // Construir condições de busca
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { songName: { contains: search, mode: 'insensitive' as const } },
        { artist: { contains: search, mode: 'insensitive' as const } },
        { style: { contains: search, mode: 'insensitive' as const } },
        { pool: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    // Filtrar por músicas da comunidade se especificado
    if (community === 'true') {
      whereClause.isCommunity = true;
    } else if (community === 'false') {
      whereClause.isCommunity = false;
    }

    // Primeiro, contar total de tracks (query rápida)
    const totalCount = await prisma.track.count({
      where: whereClause
    });

    // Depois, buscar tracks paginadas
    const tracks = await prisma.track.findMany({
      where: whereClause,
      select: {
        id: true,
        songName: true,
        artist: true,
        style: true,
        pool: true,
        imageUrl: true,
        downloadUrl: true,
        releaseDate: true,
        createdAt: true,
        previewUrl: true,
        isCommunity: true,
        uploadedBy: true,
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset,
    });

    console.log(`📊 Resultado: ${tracks.length} músicas encontradas (página ${page} de ${Math.ceil(totalCount / limit)})${search ? ` para busca: "${search}"` : ''}${community ? ` (comunidade: ${community})` : ''}`);

    // Processar tracks de forma otimizada
    const tracksWithPreview = tracks.map((track: any) => ({
      ...track,
      previewUrl: track.downloadUrl || '',
      // Preservar isCommunity original
      downloadCount: 0,
      likeCount: 0,
      playCount: 0,
    }));

    console.log(`✅ Processamento concluído${search ? ` para busca: "${search}"` : ''}${community ? ` (comunidade: ${community})` : ''}, retornando resposta otimizada`);

    return NextResponse.json({
      tracks: tracksWithPreview,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page < Math.ceil(totalCount / limit),
      limit,
      offset
    });

  } catch (error) {
    console.error('❌ Erro na API Tracks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}