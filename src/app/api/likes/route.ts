// src/app/api/likes/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma, { safeQuery } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verificar se é um usuário admin especial (usar comportamento especial se necessário)
    const isAdmin = userId === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess;

    // Verificar se o userId é válido (UUID ou CUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const cuidRegex = /^[a-z0-9]{25}$/i; // CUID format: 25 caracteres alfanuméricos

    // Permitir qualquer ID de usuário válido (não vazio)
    if (!isAdmin && (!userId || userId.trim() === '')) {
      console.error('ID de usuário vazio detectado na API de likes:', userId);
      return NextResponse.json(
        { error: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    const { trackId } = await req.json();
    if (!trackId) {
      return NextResponse.json(
        { error: "ID da música é obrigatório" },
        { status: 400 }
      );
    }

    // Converter trackId para número se necessário
    const numericTrackId = parseInt(trackId.toString());

    // Se for admin, retornar comportamento simulado sem acessar banco
    if (isAdmin) {
      return NextResponse.json({
        message: 'Like processado (Admin)',
        liked: true,
        trackId: numericTrackId
      });
    }

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
    return NextResponse.json(
      { error: "Erro Interno do Servidor" },
      { status: 500 }
    );
  }
}

// GET: Buscar likes do usuário
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verificar se é um usuário admin especial
    const isAdmin = userId === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess;

    // Se for admin, retornar array vazio ou comportamento especial
    if (isAdmin) {
      return NextResponse.json({ likes: [] });
    }

    // Verificar se o userId é válido (UUID ou CUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const cuidRegex = /^[a-z0-9]{25}$/i; // CUID format: 25 caracteres alfanuméricos

    // Permitir qualquer ID de usuário válido (não vazio)
    if (!userId || userId.trim() === '') {
      console.error('ID de usuário vazio detectado na API de likes GET:', userId);
      return NextResponse.json(
        { error: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    const likes = await safeQuery(
      () => prisma.like.findMany({
        where: {
          userId: userId,
        },
        select: {
          trackId: true,
        },
      }),
      []
    );

    const likedTrackIds = likes.map(like => like.trackId);

    return NextResponse.json({ likedTracks: likedTrackIds });
  } catch (error) {
    console.error("[LIKES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erro Interno do Servidor" },
      { status: 500 }
    );
  }
}