// src/app/api/downloads/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API /downloads/user: Iniciando requisição');

        const session = await getServerSession(authOptions);
        console.log('🔍 API /downloads/user: Session:', session?.user?.email);

        if (!session?.user?.email) {
            console.log('❌ API /downloads/user: Usuário não autenticado');
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            console.log('❌ API /downloads/user: Usuário não encontrado');
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        console.log('✅ API /downloads/user: Usuário encontrado:', user.id);

        // Buscar downloads do usuário
        const downloads = await prisma.download.findMany({
            where: {
                userId: user.id
            },
            select: {
                id: true,
                trackId: true,
                downloadedAt: true,
                createdAt: true
            },
            orderBy: {
                downloadedAt: 'desc'
            }
        });

        console.log('✅ API /downloads/user: Downloads encontrados:', downloads.length);

        return NextResponse.json(downloads);

    } catch (error) {
        console.error('❌ Erro na API de downloads do usuário:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
        }, { status: 500 });
    }
}



