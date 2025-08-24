import { authOptions } from '@/lib/authOptions';
import prisma, { safeQuery } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;

        // Buscar usuário pelo email
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        // Buscar likes do usuário com detalhes das músicas
        const likes = await safeQuery(
            () => prisma.like.findMany({
                where: {
                    userId: user.id,
                },
                include: {
                    track: {
                        select: {
                            id: true,
                            songName: true,
                            artist: true,
                            style: true,
                            imageUrl: true,
                            pool: true,
                            folder: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            []
        );

        // Calcular estatísticas
        const totalLikes = likes.length;
        const uniqueStyles = [...new Set(likes.map(like => like.track.style).filter(Boolean))];
        const stylesCount = uniqueStyles.length;

        // Formatar dados para o frontend
        const formattedLikes = likes.map(like => ({
            id: like.id,
            likedAt: like.createdAt,
            track: {
                id: like.track.id.toString(),
                songName: like.track.songName,
                artist: like.track.artist,
                style: like.track.style,
                imageUrl: like.track.imageUrl,
                pool: like.track.pool,
                folder: like.track.folder
            }
        }));

        return NextResponse.json({
            likes: formattedLikes,
            stats: {
                totalLikes,
                stylesCount,
                uniqueStyles
            }
        });

    } catch (error) {
        console.error("[PROFILE_LIKES_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Erro Interno do Servidor" },
            { status: 500 }
        );
    }
}
