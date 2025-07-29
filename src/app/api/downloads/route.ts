// src/app/api/downloads/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Changed prisma.profile to prisma.user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        downloads: {
          select: {
            trackId: true,
            downloadedAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const downloadedTrackIds = user.downloads.map(download => download.trackId);

    // Ensure isVip reflects the actual field name in the User model
    return NextResponse.json({
      downloads: downloadedTrackIds,
      isVip: user.is_vip // Changed from user.isPro or previous logic to user.is_vip
    });
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trackId, confirmReDownload } = await req.json();
    if (!trackId) {
      return NextResponse.json({ error: "ID da música é obrigatório" }, { status: 400 });
    }

    console.log('🔍 Debug Downloads API:', {
      userEmail: session.user.email,
      trackId: trackId,
      timestamp: new Date().toISOString()
    });

    // Changed prisma.profile to prisma.user
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado no banco:', session.user.email);
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    console.log('👤 Usuário encontrado:', {
      id: user.id,
      isVip: user.is_vip, // Changed from isPro
      name: user.name
    });

    // Check if user is VIP (using user.is_vip)
    if (!user.is_vip) {
      console.log('🚫 Usuário não é VIP:', user.id);
      return NextResponse.json({
        error: 'VIP membership required',
        message: 'Apenas usuários VIP podem baixar músicas'
      }, { status: 403 });
    }

    console.log('✅ Usuário VIP confirmado, processando download...');
    const userId = user.id; // Correct variable declaration

    const DOWNLOAD_LIMIT = 15; // Consider fetching this from user.benefits or plan config
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Verificar se esta música JÁ foi baixada por este usuário ANTES (em qualquer momento)
    const existingDownload = await prisma.download.findFirst({
      where: {
        userId: user.id,
        trackId: trackId,
      },
    });

    // 2. Verificar se esta música foi baixada RECENTEMENTE (nas últimas 24 horas)
    const recentDownload = await prisma.download.findFirst({
      where: {
        userId: user.id,
        trackId: trackId,
        downloadedAt: {
          gte: twentyFourHoursAgo, // Baixado a partir de 24 horas atrás
        },
      },
    });

    let shouldIncrementDailyCount = false; // Flag para controlar se o contador diário deve ser incrementado

    // Lógica para re-download no mesmo dia
    if (recentDownload && !confirmReDownload) { // Se já baixou HOJE e NÃO CONFIRMOU
      return NextResponse.json({
        message: `Você já baixou "${trackId}" hoje. Deseja baixar novamente?`,
        dailyDownloadCount: user.dailyDownloadCount, // Envia a contagem atual
        lastDownloadReset: user.lastDownloadReset?.toISOString(),
        downloadedTrackIds: (await prisma.download.findMany({ where: { userId } })).map((d: { trackId: any; }) => d.trackId),
        needsConfirmation: true, // <-- NOVO: Indica que o frontend precisa de confirmação
        trackIdToConfirm: trackId, // Opcional, para o frontend saber qual música confirmar
      }, { status: 202 }); // 202 Accepted: Requisição aceita, mas processamento pendente (confirmação)
    }

    // Se é um download novo (nunca baixado antes) OU um re-download confirmado
    // The logic here is a bit tricky. If existingDownload is null, it's a new download.
    // If existingDownload exists but not a recent one (older than 24h), it's also a new "daily" download.
    // If it's a recent download AND confirmReDownload is true, it's a re-download that should NOT increment daily count again.

    if (!existingDownload || (existingDownload && !recentDownload)) {
        shouldIncrementDailyCount = true;
    } else if (existingDownload && recentDownload && confirmReDownload) {
        // This is a confirmed re-download within 24h. We should NOT increment the daily count.
        shouldIncrementDailyCount = false;
    }


    // Lógica para verificar e resetar o contador diário ANTES de verificar o limite
    // This logic should be here to ensure user.dailyDownloadCount and lastDownloadReset are fresh
    if (!user.lastDownloadReset || user.lastDownloadReset < twentyFourHoursAgo) {
      user = await prisma.user.update({ // Changed from prisma.profile to prisma.user
        where: { id: userId },
        data: {
          dailyDownloadCount: 0,
          lastDownloadReset: now,
        },
      });
    }

    // Verificar se o limite de downloads diários foi atingido
    // Use actual benefit limit if available, otherwise default to DOWNLOAD_LIMIT
    const maxDailyDownloads = (user as any).benefits?.downloadsPerDay || DOWNLOAD_LIMIT;
    if ((user.dailyDownloadCount || 0) >= maxDailyDownloads && shouldIncrementDailyCount) {
        const resetTime = new Date((user.lastDownloadReset || new Date()).getTime() + 24 * 60 * 60 * 1000);
        return NextResponse.json({
          message: `Você atingiu seu limite de ${maxDailyDownloads} downloads diários. Tente novamente após ${resetTime.toLocaleString('pt-BR')}.`,
          dailyDownloadCount: user.dailyDownloadCount || 0,
          lastDownloadReset: (user.lastDownloadReset || new Date()).toISOString(),
          isExistingDownload: !!existingDownload,
          needsConfirmation: false,
        }, { status: 429 });
    }


    // Use upsert to create or update the download record
    const download = await prisma.download.upsert({
      where: {
        userId_trackId: { // Use the compound unique field name
            userId: userId,
            trackId: trackId, // Ensure trackId is a number if it's Int in schema
        }
      },
      update: {
        downloadedAt: now,
        nextAllowedDownload: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Set next allowed download
      },
      create: {
        userId: userId,
        trackId: trackId, // Ensure trackId is a number if it's Int in schema
        downloadedAt: now,
        nextAllowedDownload: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Set next allowed download
      }
    });


    let updatedUser = user;
    if (shouldIncrementDailyCount) {
      // Incrementa o contador diário apenas se for a primeira vez que o usuário baixa esta música HOJE
      updatedUser = await prisma.user.update({ // Changed from prisma.profile to prisma.user
        where: { id: userId },
        data: {
          dailyDownloadCount: {
            increment: 1,
          },
          // lastDownloadReset should already be set above if it needed resetting
        }
      });
    } else {
        // If not incrementing, ensure we have the most up-to-date user object
        // This findUnique call might be redundant if 'user' is already up-to-date from above ops
        const foundUser = await prisma.user.findUnique({ where: { id: userId } });
        if (foundUser) {
            updatedUser = foundUser;
        }
    }

    const allDownloadedTracks = await prisma.download.findMany({ where: { userId } });
    const uniqueDownloadedTrackIds = [...new Set(allDownloadedTracks.map((d: { trackId: any; }) => d.trackId))];

    return NextResponse.json({
      message: existingDownload ? 'Música já baixada anteriormente. Download permitido.' : 'Download registrado com sucesso!',
      dailyDownloadCount: updatedUser.dailyDownloadCount,
      lastDownloadReset: updatedUser.lastDownloadReset?.toISOString(),
      downloadedTrackIds: uniqueDownloadedTrackIds,
      isExistingDownload: !!existingDownload,
      needsConfirmation: false, // Não precisa de confirmação aqui
    }, { status: 200 });

  } catch (error) {
    console.error("[DOWNLOADS_POST_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor ao processar download.", { status: 500 });
  }
}