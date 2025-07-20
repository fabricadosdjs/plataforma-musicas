// src/app/api/likes/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Adiciona esta linha

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { trackId } = await req.json();
    if (!trackId) {
      return new NextResponse("ID da música é obrigatório", { status: 400 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ message: 'Like removido' });
    } else {
      await prisma.like.create({ data: { userId, trackId } });
      return NextResponse.json({ message: 'Like adicionado' });
    }
  } catch (error) {
    console.error("[LIKES_POST_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}