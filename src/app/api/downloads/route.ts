// src/app/api/downloads/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { trackId, confirmReDownload } = await req.json(); // <-- Adicionado confirmReDownload
    if (!trackId) {
      return new NextResponse("ID da música é obrigatório", { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return new NextResponse("Utilizador não encontrado", { status: 404 });
    }

    const DOWNLOAD_LIMIT = 15;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Verificar se esta música JÁ foi baixada por este usuário ANTES (em qualquer momento)
    const existingDownload = await prisma.download.findFirst({
      where: {
        userId: userId,
        trackId: trackId,
      },
    });

    // 2. Verificar se esta música foi baixada RECENTEMENTE (nas últimas 24 horas)
    const recentDownload = await prisma.download.findFirst({
      where: {
        userId: userId,
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
        downloadedTrackIds: (await prisma.download.findMany({ where: { userId } })).map(d => d.trackId),
        needsConfirmation: true, // <-- NOVO: Indica que o frontend precisa de confirmação
        trackIdToConfirm: trackId, // Opcional, para o frontend saber qual música confirmar
      }, { status: 202 }); // 202 Accepted: Requisição aceita, mas processamento pendente (confirmação)
    }

    // Se é um download novo (nunca baixado antes) OU um re-download confirmado
    if (!existingDownload) { // Se esta música NUNCA foi baixada por este usuário (primeiro download dela)
        shouldIncrementDailyCount = true;

        // Lógica para verificar e resetar o contador diário ANTES de verificar o limite
        if (!user.lastDownloadReset || user.lastDownloadReset < twentyFourHoursAgo) {
            user = await prisma.user.update({
                where: { id: userId },
                data: {
                    dailyDownloadCount: 0,
                    lastDownloadReset: now,
                },
            });
        }

        // Verificar se o limite de downloads diários foi atingido
        if (user.dailyDownloadCount >= DOWNLOAD_LIMIT) {
            const resetTime = new Date(user.lastDownloadReset!.getTime() + 24 * 60 * 60 * 1000);
            return NextResponse.json({
                message: `Você atingiu seu limite de ${DOWNLOAD_LIMIT} downloads diários para músicas novas. Tente novamente após ${resetTime.toLocaleString('pt-BR')}.`,
                dailyDownloadCount: user.dailyDownloadCount,
                lastDownloadReset: user.lastDownloadReset.toISOString(),
                isExistingDownload: false,
                needsConfirmation: false, // Não precisa de confirmação aqui
            }, { status: 429 }); // 429 Too Many Requests
        }
    }

    // Se a música nunca foi baixada, cria o registro de download
    // Se já foi baixada (existingDownload é true), não cria um novo registro, apenas atualiza o `downloadedAt` se quiser um log de re-downloads.
    // Para este caso, vamos apenas garantir que o registro exista.
    if (!existingDownload) {
      await prisma.download.create({
        data: {
          userId,
          trackId,
          downloadedAt: now, // Registra a data do download
        },
      });
    } else {
        // Opcional: Atualizar 'downloadedAt' para o registro existente para marcar a última vez que foi baixado
        await prisma.download.updateMany({
            where: {
                userId: userId,
                trackId: trackId,
            },
            data: {
                downloadedAt: now,
            },
        });
    }


    let updatedUser = user;
    if (shouldIncrementDailyCount) {
        // Incrementa o contador diário apenas se for a primeira vez que o usuário baixa esta música
        updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                dailyDownloadCount: {
                    increment: 1,
                },
                lastDownloadReset: user.lastDownloadReset || now,
            }
        });
    } else {
        // Se a música já foi baixada, apenas garante que o 'user' no retorno esteja atualizado
        updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    }

    const allDownloadedTracks = await prisma.download.findMany({ where: { userId } });
    const uniqueDownloadedTrackIds = [...new Set(allDownloadedTracks.map(d => d.trackId))];

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