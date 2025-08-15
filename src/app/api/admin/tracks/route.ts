import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Verificar se o usuário é VIP
        if (!session.user.is_vip) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        // Buscar todas as músicas do banco de dados
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                imageUrl: true,
                style: true,
                createdAt: true,
                pool: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`🎵 Retornando ${tracks.length} músicas reais para o usuário ${session.user.email}`);

        return NextResponse.json(tracks);

    } catch (error) {
        console.error('❌ Erro ao buscar músicas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        if (!session.user.is_vip) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { searchTerm, genre, limit = 50 } = await request.json();

        // Construir filtros para busca
        const where: any = {};

        if (genre) {
            where.style = {
                contains: genre,
                mode: 'insensitive'
            };
        }

        if (searchTerm) {
            where.OR = [
                {
                    songName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    artist: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        // Buscar músicas com filtros
        const tracks = await prisma.track.findMany({
            where,
            select: {
                id: true,
                songName: true,
                artist: true,
                imageUrl: true,
                style: true,
                createdAt: true,
                pool: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        // Contar total de músicas que correspondem aos filtros
        const total = await prisma.track.count({ where });

        console.log(`🎵 Busca realizada: ${tracks.length} músicas encontradas de ${total} total`);

        return NextResponse.json({
            tracks,
            total,
            filters: { searchTerm, genre, limit }
        });

    } catch (error) {
        console.error('❌ Erro na busca de músicas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
