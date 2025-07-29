import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        // Resetar contadores semanais
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                weeklyPackRequests: 0,
                weeklyPlaylistDownloads: 0,
                lastWeekReset: new Date()
            }
        });

        console.log(`✅ Contadores semanais resetados para usuário ${userId}`);

        return NextResponse.json({
            success: true,
            message: 'Contadores semanais resetados com sucesso',
            user: {
                id: updatedUser.id,
                weeklyPackRequests: updatedUser.weeklyPackRequests,
                weeklyPlaylistDownloads: updatedUser.weeklyPlaylistDownloads,
                lastWeekReset: updatedUser.lastWeekReset
            }
        });

    } catch (error) {
        console.error('❌ Erro ao resetar contadores semanais:', error);
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
