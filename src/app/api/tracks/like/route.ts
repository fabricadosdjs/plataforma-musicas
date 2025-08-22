// src/app/api/tracks/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 API /tracks/like: Iniciando requisição');

        const session = await getServerSession(authOptions);
        console.log('🔍 API /tracks/like: Session:', session?.user?.email);

        if (!session?.user?.email) {
            console.log('❌ API /tracks/like: Usuário não autenticado');
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const body = await request.json();
        console.log('🔍 API /tracks/like: Body recebido:', body);

        const { trackId, action } = body;

        if (!trackId || !action) {
            console.log('❌ API /tracks/like: Dados inválidos:', { trackId, action });
            return NextResponse.json({ error: 'trackId e action são obrigatórios' }, { status: 400 });
        }

        // Verificar se o usuário existe
        console.log('🔍 API /tracks/like: Buscando usuário:', session.user.email);
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            console.log('❌ API /tracks/like: Usuário não encontrado');
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        console.log('✅ API /tracks/like: Usuário encontrado:', user.id);

        // Verificar se a track existe
        console.log('🔍 API /tracks/like: Buscando track:', trackId);
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) }
        });

        if (!track) {
            console.log('❌ API /tracks/like: Track não encontrada');
            return NextResponse.json({ error: 'Música não encontrada' }, { status: 404 });
        }

        console.log('✅ API /tracks/like: Track encontrada:', track.id);

        if (action === 'like') {
            console.log('🔍 API /tracks/like: Ação LIKE para track:', trackId);
            console.log('🔍 API /tracks/like: User ID:', user.id);

            // Verificar se já curtiu
            const existingLike = await prisma.like.findFirst({
                where: {
                    userId: user.id,
                    trackId: parseInt(trackId)
                }
            });

            console.log('🔍 API /tracks/like: Like existente:', existingLike);

            if (existingLike) {
                console.log('❌ API /tracks/like: Música já curtida');
                return NextResponse.json({ error: 'Música já curtida' }, { status: 400 });
            }

            // Criar like
            console.log('✅ API /tracks/like: Criando like...');
            const newLike = await prisma.like.create({
                data: {
                    userId: user.id,
                    trackId: parseInt(trackId)
                }
            });

            console.log('✅ API /tracks/like: Like criado com sucesso:', newLike);
            return NextResponse.json({ success: true, action: 'liked' });

        } else if (action === 'unlike') {
            console.log('🔍 API /tracks/like: Ação UNLIKE para track:', trackId);
            console.log('🔍 API /tracks/like: User ID:', user.id);

            // Remover like
            const existingLike = await prisma.like.findFirst({
                where: {
                    userId: user.id,
                    trackId: parseInt(trackId)
                }
            });

            console.log('🔍 API /tracks/like: Like existente para remoção:', existingLike);

            if (!existingLike) {
                console.log('❌ API /tracks/like: Like não encontrado');
                return NextResponse.json({ error: 'Like não encontrado' }, { status: 400 });
            }

            console.log('✅ API /tracks/like: Removendo like...');
            const deletedLike = await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            });

            console.log('✅ API /tracks/like: Like removido com sucesso:', deletedLike);
            return NextResponse.json({ success: true, action: 'unliked' });

        } else {
            console.log('❌ API /tracks/like: Ação inválida:', action);
            return NextResponse.json({ error: 'Ação inválida. Use "like" ou "unlike"' }, { status: 400 });
        }

    } catch (error) {
        console.error('❌ Erro na API de likes:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
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
