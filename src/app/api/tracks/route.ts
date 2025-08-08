// src/app/api/tracks/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '0') : undefined;

    console.log('🔍 API Tracks chamada - carregando todas as músicas');

    // Query para retornar todas as músicas (sem limite)
    const tracks = await prisma.track.findMany({
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
      ...(limit && { take: limit }),
    });

    console.log(`📊 Resultado: ${tracks.length} músicas encontradas.`);

    // Processar tracks de forma ultra-simplificada
    const tracksWithPreview = tracks.map((track: any) => ({
      ...track,
      previewUrl: track.downloadUrl || '',
      isCommunity: false,
      uploadedBy: null,
      downloadCount: 0,
      likeCount: 0,
      playCount: 0,
    }));

    return NextResponse.json({
      tracks: tracksWithPreview,
      totalCount: tracksWithPreview.length,
      currentPage: 1,
      totalPages: 1,
      hasMore: false
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