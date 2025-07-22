import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

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
        await prisma.user.update({
            where: { id: userId },
            data: {
                weeklyPackRequests: 0,
                weeklyPlaylistDownloads: 0,
                lastWeekReset: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Contadores semanais resetados com sucesso'
        });

    } catch (error) {
        console.error('Erro ao resetar contadores semanais:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
