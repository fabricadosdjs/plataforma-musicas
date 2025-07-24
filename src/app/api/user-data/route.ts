// src/app/api/user-data/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma, { safeQuery } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Updated to use NextAuth instead of Supabase
export async function GET(req: Request) {
  let session: any = null;

  try {
    session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar usuário usando safeQuery
    let dbUser = await safeQuery(
      async () => {
        return await prisma.profile.findUnique({
          where: { id: userId },
        });
      },
      null // fallback value
    );

    // Se o usuário não existe, cria-o e inicializa dailyDownloadCount e lastDownloadReset
    if (!dbUser) {
      dbUser = await safeQuery(
        async () => {
          return await prisma.profile.create({
            data: {
              id: userId,
              name: session.user.name || session.user.email || '',
              dailyDownloadCount: 0,
              lastDownloadReset: new Date(),
            },
          });
        },
        null // usar null como fallback, vai para o catch geral
      );
    }

    // Se ainda não temos dbUser (falha total), retornar dados básicos
    if (!dbUser) {
      return NextResponse.json({
        user: {
          id: userId,
          email: session.user.email || '',
          name: session.user.name || session.user.email || '',
          dailyDownloadCount: 0,
          is_vip: false,
          is_admin: false,
        },
        likedTracks: [],
        downloadedTracks: []
      });
    }

    // Lógica para verificar e resetar o contador de downloads diário
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Se lastDownloadReset é nulo OU já se passaram 24 horas desde o último reset
    if (!dbUser.lastDownloadReset || dbUser.lastDownloadReset < twentyFourHoursAgo) {
      // Apenas atualiza se realmente houver necessidade de reset
      if ((dbUser.dailyDownloadCount || 0) > 0 || !dbUser.lastDownloadReset) {
        dbUser = await prisma.profile.update({
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

    // Retornar dados básicos em caso de erro para não quebrar a aplicação
    return NextResponse.json({
      user: {
        id: session?.user?.id || '',
        email: session?.user?.email || '',
        name: session?.user?.name || session?.user?.email || '',
        dailyDownloadCount: 0,
        is_vip: false,
        is_admin: false,
      },
      likedTracks: [],
      downloadedTracks: []
    }, { status: 200 }); // Usar status 200 para não quebrar o frontend
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
    const profile = await safeQuery(
      () => prisma.profile.findUnique({
        where: { id: userId },
      }),
      null
    );

    if (!profile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Excluir registros relacionados primeiro (devido às foreign keys)
    await safeQuery(
      () => prisma.like.deleteMany({ where: { userId } }),
      null
    );

    await safeQuery(
      () => prisma.download.deleteMany({ where: { userId } }),
      null
    );

    // Excluir o usuário
    await prisma.profile.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: `Usuário "${profile.name}" excluído com sucesso`
    });

  } catch (error) {
    console.error("[USER_DELETE_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}