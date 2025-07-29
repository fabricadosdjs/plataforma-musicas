// src/app/api/admin/reset-daily-counter/route.ts
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

        // Resetar o contador diário do usuário
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                dailyDownloadCount: 0,
                lastDownloadReset: new Date()
            }
        });

        console.log(`✅ Contador diário resetado para usuário ${userId}`);

        return NextResponse.json({
            success: true,
            message: 'Contador diário resetado com sucesso',
            user: {
                id: updatedUser.id,
                dailyDownloadCount: updatedUser.dailyDownloadCount,
                lastDownloadReset: updatedUser.lastDownloadReset
            }
        });

    } catch (error) {
        console.error('❌ Erro ao resetar contador diário:', error);

        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
