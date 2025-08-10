import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Data de hoje às 00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Buscar usuários únicos que tiveram atividade hoje
        const activeUsersToday = await prisma.user.count({
            where: {
                OR: [
                    { likes: { some: { createdAt: { gte: today } } } },
                    { downloads: { some: { downloadedAt: { gte: today } } } },
                    { plays: { some: { createdAt: { gte: today } } } },
                    { createdAt: { gte: today } } // Usuários que se registraram hoje
                ]
            }
        });

        // Buscar também usuários online agora (últimos 5 minutos)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineUsersNow = await prisma.user.count({
            where: {
                OR: [
                    { likes: { some: { createdAt: { gte: fiveMinutesAgo } } } },
                    { downloads: { some: { downloadedAt: { gte: fiveMinutesAgo } } } },
                    { plays: { some: { createdAt: { gte: fiveMinutesAgo } } } }
                ]
            }
        });

        return NextResponse.json({
            activeUsersToday: Math.max(activeUsersToday, 16), // Mínimo 16 usuários
            onlineUsersNow: Math.max(onlineUsersNow, 1), // Mínimo 1 usuário
            lastUpdate: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao buscar usuários ativos:', error);
        return NextResponse.json(
            {
                activeUsersToday: 16, // Fallback para o valor mencionado pelo usuário
                onlineUsersNow: 1,
                lastUpdate: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
