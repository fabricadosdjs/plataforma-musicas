// src/app/api/tracks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /tracks: Iniciando requisição GET');

    const session = await getServerSession(authOptions);
    console.log('🔍 API /tracks: Session:', session?.user);

    if (!session?.user?.id) {
      console.log('❌ API /tracks: Usuário não autenticado');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 API /tracks: Usuário autenticado, ID:', session.user.id);

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

    console.log('🔍 API /tracks: Tracks encontradas:', tracks.length);

    // Buscar downloads do usuário
    console.log('🔍 API /tracks: Buscando downloads para usuário:', session.user.id);
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
    console.log('🔍 API /tracks: Buscando likes para usuário:', session.user.id);
    const userLikes = await prisma.like.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        trackId: true
      }
    });

    console.log('🔍 API /tracks: Downloads encontrados:', userDownloads.length);
    console.log('🔍 API /tracks: Likes encontrados:', userLikes.length);

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

    console.log('✅ API /tracks: Retornando dados com cache');
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