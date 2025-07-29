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

        // Resetar contadores diários
        await prisma.user.update({
            where: { id: userId },
            data: {
                dailyDownloadCount: 0,
                lastDownloadReset: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Contadores diários resetados com sucesso'
        });

    } catch (error) {
        console.error('Erro ao resetar contadores diários:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
