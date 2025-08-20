import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

// PATCH - Atualizar status da solicitação
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        const { status, notes, estimatedCompletion } = body;

        if (!status) {
            return NextResponse.json(
                { error: 'Status é obrigatório' },
                { status: 400 }
            );
        }

        const updatedRequest = await prisma.request.update({
            where: { id },
            data: {
                status,
                notes: notes || undefined,
                estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : undefined
            }
        });

        return NextResponse.json({
            message: 'Solicitação atualizada com sucesso',
            request: updatedRequest
        });

    } catch (error) {
        console.error('Erro ao atualizar solicitação:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// DELETE - Deletar solicitação
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        await prisma.request.delete({
            where: { id }
        });

        return NextResponse.json({
            message: 'Solicitação deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar solicitação:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}



