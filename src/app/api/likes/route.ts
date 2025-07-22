// src/app/api/likes/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const { trackId } = await req.json();
    if (!trackId) {
      return new NextResponse("ID da música é obrigatório", { status: 400 });
    }

    // Converter trackId para número se necessário
    const numericTrackId = parseInt(trackId.toString());

    const existingLike = await prisma.like.findFirst({
      where: {
        userId: userId,
        trackId: numericTrackId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({
        message: 'Like removido',
        liked: false,
        trackId: numericTrackId
      });
    } else {
      await prisma.like.create({
        data: {
          userId: userId,
          trackId: numericTrackId
        }
      });
      return NextResponse.json({
        message: 'Like adicionado',
        liked: true,
        trackId: numericTrackId
      });
    }
  } catch (error) {
    console.error("[LIKES_POST_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}

// GET: Buscar likes do usuário
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const likes = await prisma.like.findMany({
      where: {
        userId: userId,
      },
      select: {
        trackId: true,
      },
    });

    const likedTrackIds = likes.map(like => like.trackId);

    return NextResponse.json({ likedTracks: likedTrackIds });
  } catch (error) {
    console.error("[LIKES_GET_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}