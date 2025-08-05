import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// PUT - Atualizar recado (apenas admin)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Verificar se é admin
        const adminUser = await prisma.user.findFirst({
            where: {
                email: session.user.email,
                isAdmin: true
            }
        });

        if (!adminUser) {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas administradores podem editar recados.' },
                { status: 403 }
            );
        }

        const { title, message, isActive } = await request.json();
        const resolvedParams = await params;
        const messageId = parseInt(resolvedParams.id);

        if (!messageId) {
            return NextResponse.json(
                { error: 'ID do recado é obrigatório' },
                { status: 400 }
            );
        }

        const updatedMessage = await prisma.adminMessage.update({
            where: {
                id: messageId
            },
            data: {
                title,
                message,
                isActive,
                updatedAt: new Date()
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({ message: updatedMessage });
    } catch (error) {
        console.error('Error updating admin message:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar recado da administração' },
            { status: 500 }
        );
    }
}

// DELETE - Deletar recado (apenas admin)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Verificar se é admin
        const adminUser = await prisma.user.findFirst({
            where: {
                email: session.user.email,
                isAdmin: true
            }
        });

        if (!adminUser) {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas administradores podem deletar recados.' },
                { status: 403 }
            );
        }

        const resolvedParams = await params;
        const messageId = parseInt(resolvedParams.id);

        if (!messageId) {
            return NextResponse.json(
                { error: 'ID do recado é obrigatório' },
                { status: 400 }
            );
        }

        await prisma.adminMessage.delete({
            where: {
                id: messageId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting admin message:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar recado da administração' },
            { status: 500 }
        );
    }
} 