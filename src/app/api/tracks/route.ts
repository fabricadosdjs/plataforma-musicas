// src/app/api/tracks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url);
    const style = searchParams.get('style');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const skip = (page - 1) * limit;

    // Construir filtros
    const whereClause: any = {};
    if (style) {
      whereClause.style = {
        equals: style,
        mode: 'insensitive'
      };
    }

    // Buscar músicas com filtros
    const [tracks, totalCount] = await Promise.all([
      prisma.track.findMany({
        where: whereClause,
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
        },
        skip,
        take: limit
      }),
      prisma.track.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Buscar dados do usuário primeiro
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        is_vip: true,
        dailyDownloadCount: true,
        lastDownloadReset: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Buscar downloads do usuário
    const userDownloads = await prisma.download.findMany({
      where: {
        userId: user.id
      },
      select: {
        trackId: true,
        downloadedAt: true
      }
    });

    // Buscar likes do usuário
    const userLikes = await prisma.like.findMany({
      where: {
        userId: user.id
      },
      select: {
        trackId: true
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
      tracks: tracks.map((track: any) => ({
        ...track,
        downloadCount: 0, // Será calculado separadamente se necessário
        likeCount: 0, // Será calculado separadamente se necessário
        isDownloaded: userDownloads.some((d: any) => d.trackId === track.id),
        isLiked: userLikes.some((l: any) => l.trackId === track.id),
        downloadedAt: userDownloads.find((d: any) => d.trackId === track.id)?.downloadedAt || null
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      userData: {
        isVip: user?.is_vip || false,
        downloadsLeft,
        downloadedTrackIds: userDownloads.map((d: any) => d.trackId),
        likedTrackIds: userLikes.map((l: any) => l.trackId),
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