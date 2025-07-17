// src/app/api/user-data/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = getAuth(req);

    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        likes: true,
        downloads: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: sessionClaims?.email,
          name: sessionClaims?.fullName,
        },
        include: {
          likes: true,
          downloads: true,
        },
      });
    }

    return NextResponse.json({
      likedTrackIds: user.likes.map(like => like.trackId),
      downloadedTrackIds: user.downloads.map(d => d.trackId),
      downloadCount: user.downloads.length,
    });
  } catch (error) {
    console.error("[USER_DATA_GET_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new NextResponse(`Erro Interno do Servidor: ${errorMessage}`, { status: 500 });
  }
}
