// src/app/api/user-data/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = getAuth(req);

    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Se o usuário não existe, cria-o e inicializa dailyDownloadCount e lastDownloadReset
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: sessionClaims?.email,
          name: sessionClaims?.fullName,
          dailyDownloadCount: 0, // Inicializa com 0 downloads
          lastDownloadReset: new Date(), // Inicializa com a data e hora atuais
        },
      });
    }

    // Lógica para verificar e resetar o contador de downloads diário
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 horas em milissegundos

    // Se lastDownloadReset é nulo OU já se passaram 24 horas desde o último reset
    if (!user.lastDownloadReset || user.lastDownloadReset < twentyFourHoursAgo) {
      // Apenas atualiza se realmente houver necessidade de reset
      if (user.dailyDownloadCount > 0 || !user.lastDownloadReset) { // Resetar se houver downloads ou se for o primeiro acesso
         user = await prisma.user.update({
            where: { id: userId },
            data: {
                dailyDownloadCount: 0,
                lastDownloadReset: now,
            },
         });
      }
    }

    const likes = await prisma.like.findMany({ where: { userId } });
    const downloads = await prisma.download.findMany({ where: { userId } });
    const uniqueDownloadedIds = [...new Set(downloads.map(d => d.trackId))];

    return NextResponse.json({
      likedTrackIds: likes.map(like => like.trackId),
      downloadedTrackIds: uniqueDownloadedIds,
      dailyDownloadCount: user.dailyDownloadCount,
      // Converte a data para string ISO para garantir a compatibilidade JSON
      lastDownloadReset: user.lastDownloadReset?.toISOString() || null, 
    });

  } catch (error) {
    console.error("[USER_DATA_GET_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}