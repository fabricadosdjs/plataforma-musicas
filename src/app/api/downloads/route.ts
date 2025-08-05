// src/app/api/downloads/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // ... (a sua função GET pode permanecer como está)
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        is_vip: true,
        dailyDownloadCount: true,
        lastDownloadReset: true,
        downloads: {
          select: {
            trackId: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const downloadedTrackIds = user.downloads.map(download => download.trackId);
    
    // ALTERADO: Retornar também a contagem e limite para o contexto saber o estado inicial
    return NextResponse.json({
      downloads: downloadedTrackIds,
      isVip: user.is_vip,
      dailyDownloadCount: user.dailyDownloadCount || 0,
      dailyLimit: (session.user as any).benefits?.downloadsPerDay || 15 // Envia o limite
    });

  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trackId, confirmReDownload } = await req.json();
    if (!trackId) {
      return NextResponse.json({ error: "ID da música é obrigatório" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }
    // Verificar se é VIP ou admin
    const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
    if (!user.is_vip && !isAdmin) {
      return NextResponse.json({ error: 'Apenas usuários VIP podem baixar músicas' }, { status: 403 });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Lógica para resetar o contador diário
    if (!user.lastDownloadReset || user.lastDownloadReset < twentyFourHoursAgo) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { dailyDownloadCount: 0, lastDownloadReset: now },
      });
    }

    const dailyLimit = (session.user as any).benefits?.downloadsPerDay || 15;

    // Lógica de confirmação de re-download
    const recentDownload = await prisma.download.findFirst({
      where: { userId: user.id, trackId: trackId, downloadedAt: { gte: twentyFourHoursAgo } },
    });

    if (recentDownload && !confirmReDownload) {
      return NextResponse.json({ needsConfirmation: true, message: `Você já baixou esta música hoje. Deseja baixar novamente?` }, { status: 202 });
    }
    
    // Verifica se o download deve contar para o limite diário
    const existingDownload = await prisma.download.findUnique({ where: { userId_trackId: { userId: user.id, trackId } } });
    const shouldIncrementCount = !recentDownload; // Só incrementa se não for um re-download recente

    // Verifica o limite ANTES de prosseguir
    if (shouldIncrementCount && (user.dailyDownloadCount || 0) >= dailyLimit) {
      return NextResponse.json({ error: `Você atingiu seu limite de ${dailyLimit} downloads diários.` }, { status: 429 });
    }

    // Processa o download (cria/atualiza o registro)
    await prisma.download.upsert({
      where: { userId_trackId: { userId: user.id, trackId: trackId } },
      update: { downloadedAt: now },
      create: { userId: user.id, trackId: trackId, downloadedAt: now }
    });

    let updatedUser = user;
    if (shouldIncrementCount) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { dailyDownloadCount: { increment: 1 } },
      });
    }
    
    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      return NextResponse.json({ error: "Música não encontrada." }, { status: 404 });
    }

    // ALTERADO: A resposta de sucesso agora inclui tudo que o front-end precisa
    return NextResponse.json({
      success: true,
      message: 'Download autorizado!',
      downloadUrl: track.downloadUrl,
      dailyDownloadCount: updatedUser.dailyDownloadCount,
      dailyLimit: dailyLimit,
      remainingDownloads: dailyLimit - (updatedUser.dailyDownloadCount || 0),
      downloadedTrackIds: (await prisma.download.findMany({ where: { userId: user.id } })).map(d => d.trackId),
      downloadedTracksTime: {} // Será calculado no frontend
    }, { status: 200 });

  } catch (error) {
    console.error("[DOWNLOADS_POST_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}