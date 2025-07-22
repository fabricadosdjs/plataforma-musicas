import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { userId, customBenefits } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        // Atualizar benefícios customizados
        await prisma.user.update({
            where: { id: userId },
            data: {
                customBenefits: customBenefits as any
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Benefícios customizados atualizados com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar benefícios customizados:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
