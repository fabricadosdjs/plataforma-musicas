// src/app/api/tracks/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: {
        releaseDate: 'desc',
      },
      include: {
        _count: {
          select: {
            likes: true,
            downloads: true,
          },
        },
      },
    });

    // Formata os dados para serem usados na interface, agora sem duration e fileSize
    const formattedTracks = tracks.map(track => ({
      ...track,
      releaseDate: track.releaseDate.toISOString().split('T')[0],
      likeCount: track._count.likes,
      downloadCount: track._count.downloads,
    }));

    return NextResponse.json(formattedTracks);
  } catch (error) {
    console.error("[GET_TRACKS_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor ao buscar músicas", { status: 500 });
  }
}