// src/app/api/tracks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todas as músicas com informações básicas
    const tracks = await prisma.track.findMany({
      select: {
        id: true,
        songName: true,
        artist: true,
        style: true,
        version: true,
        pool: true,
        imageUrl: true,
        previewUrl: true,
        downloadUrl: true,
        releaseDate: true,
        createdAt: true,
        isCommunity: true,
        uploadedBy: true,
        bitrate: true
      },
      orderBy: {
        releaseDate: 'desc'
      }
    });

    // Buscar downloads do usuário
    const userDownloads = await prisma.download.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        trackId: true,
        downloadedAt: true
      }
    });

    // Buscar likes do usuário
    const userLikes = await prisma.like.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        trackId: true
      }
    });

    // Buscar dados do usuário para verificar VIP
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        is_vip: true,
        dailyDownloadCount: true,
        lastDownloadReset: true
      }
    });

    // Calcular downloads restantes para hoje
    let downloadsLeft: number | string = 'Ilimitado';
    if (!user?.is_vip) {
      const now = new Date();
      const lastReset = user?.lastDownloadReset ? new Date(user.lastDownloadReset) : null;

      if (!lastReset || (now.getTime() - lastReset.getTime()) > (24 * 60 * 60 * 1000)) {
        downloadsLeft = 15; // Reset diário
      } else {
        const used = user?.dailyDownloadCount || 0;
        downloadsLeft = Math.max(15 - used, 0);
      }
    }

    // Preparar resposta com cache
    const response = {
      tracks: tracks.map(track => ({
        ...track,
        downloadCount: 0, // Será calculado separadamente se necessário
        likeCount: 0, // Será calculado separadamente se necessário
        isDownloaded: userDownloads.some(d => d.trackId === track.id),
        isLiked: userLikes.some(l => l.trackId === track.id),
        downloadedAt: userDownloads.find(d => d.trackId === track.id)?.downloadedAt || null
      })),
      userData: {
        isVip: user?.is_vip || false,
        downloadsLeft,
        downloadedTrackIds: userDownloads.map(d => d.trackId),
        likedTrackIds: userLikes.map(l => l.trackId),
        dailyDownloadCount: user?.dailyDownloadCount || 0
      },
      cacheInfo: {
        timestamp: new Date().toISOString(),
        totalTracks: tracks.length,
        totalDownloads: userDownloads.length,
        totalLikes: userLikes.length
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro na API /tracks GET:', error);

    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('❌ Mensagem de erro:', error.message);
      console.error('❌ Stack trace:', error.stack);
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}