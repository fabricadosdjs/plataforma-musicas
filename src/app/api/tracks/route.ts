// src/app/api/tracks/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

// Função GET para buscar todas as músicas (já existente)
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

// Função POST para adicionar uma nova música
export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);
    // TODO: Adicionar verificação de role de admin
    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await req.json();
    const {
      songName,
      artist,
      style,
      version,
      duration,
      fileSize,
      releaseDate,
      imageUrl,
      previewUrl,
      downloadUrl,
    } = body;

    // Validação dos dados
    if (!songName || !artist || !style || !version || !duration || !fileSize || !releaseDate || !imageUrl || !previewUrl || !downloadUrl) {
        return new NextResponse("Todos os campos são obrigatórios", { status: 400 });
    }

    const newTrack = await prisma.track.create({
        data: {
            songName,
            artist,
            style,
            version,
            duration,
            fileSize,
            releaseDate: new Date(releaseDate),
            imageUrl,
            previewUrl,
            downloadUrl,
        }
    });

    return NextResponse.json(newTrack, { status: 201 });

  } catch (error) {
    console.error("[TRACK_POST_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor ao criar a música", { status: 500 });
  }
}