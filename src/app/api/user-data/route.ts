// src/app/api/user-data/route.ts
import prisma from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = user.id;

    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Se o usuário não existe, cria-o e inicializa dailyDownloadCount e lastDownloadReset
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email: user.email || '',
          name: user.user_metadata?.name || user.email || '',
          dailyDownloadCount: 0,
          lastDownloadReset: new Date(),
        },
      });
    }

    // Lógica para verificar e resetar o contador de downloads diário
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Se lastDownloadReset é nulo OU já se passaram 24 horas desde o último reset
    if (!dbUser.lastDownloadReset || dbUser.lastDownloadReset < twentyFourHoursAgo) {
      // Apenas atualiza se realmente houver necessidade de reset
      if ((dbUser.dailyDownloadCount || 0) > 0 || !dbUser.lastDownloadReset) {
        dbUser = await prisma.user.update({
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
    const uniqueDownloadedIds = [...new Set(downloads.map((d: { trackId: any; }) => d.trackId))];

    return NextResponse.json({
      likedTrackIds: likes.map((like: { trackId: any; }) => like.trackId),
      downloadedTrackIds: uniqueDownloadedIds,
      dailyDownloadCount: dbUser.dailyDownloadCount,
      // Converte a data para string ISO para garantir a compatibilidade JSON
      lastDownloadReset: dbUser.lastDownloadReset?.toISOString() || null,
    });

  } catch (error) {
    console.error("[USER_DATA_GET_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Excluir registros relacionados primeiro (devido às foreign keys)
    await prisma.like.deleteMany({
      where: { userId },
    });

    await prisma.download.deleteMany({
      where: { userId },
    });

    // Excluir o usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: `Usuário "${user.name}" excluído com sucesso`
    });

  } catch (error) {
    console.error("[USER_DELETE_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}