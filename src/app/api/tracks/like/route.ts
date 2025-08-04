// src/app/api/tracks/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const { trackId, action } = await request.json();

        if (!trackId || !action) {
            return NextResponse.json({ error: 'trackId e action são obrigatórios' }, { status: 400 });
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verificar se a track existe
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) }
        });

        if (!track) {
            return NextResponse.json({ error: 'Música não encontrada' }, { status: 404 });
        }

        if (action === 'like') {
            // Verificar se já curtiu
            const existingLike = await prisma.like.findFirst({
                where: {
                    userId: user.id,
                    trackId: parseInt(trackId)
                }
            });

            if (existingLike) {
                return NextResponse.json({ error: 'Música já curtida' }, { status: 400 });
            }

            // Criar like
            await prisma.like.create({
                data: {
                    userId: user.id,
                    trackId: parseInt(trackId)
                }
            });

            return NextResponse.json({ success: true, action: 'liked' });

        } else if (action === 'unlike') {
            // Remover like
            const existingLike = await prisma.like.findFirst({
                where: {
                    userId: user.id,
                    trackId: parseInt(trackId)
                }
            });

            if (!existingLike) {
                return NextResponse.json({ error: 'Like não encontrado' }, { status: 400 });
            }

            await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            });

            return NextResponse.json({ success: true, action: 'unliked' });

        } else {
            return NextResponse.json({ error: 'Ação inválida. Use "like" ou "unlike"' }, { status: 400 });
        }

    } catch (error) {
        console.error('Erro na API de likes:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const url = new URL(request.url);
        const trackId = url.searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verificar se o usuário curtiu a música
        const like = await prisma.like.findFirst({
            where: {
                userId: user.id,
                trackId: parseInt(trackId)
            }
        });

        return NextResponse.json({
            liked: !!like,
            trackId: trackId
        });

    } catch (error) {
        console.error('Erro ao verificar like:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
