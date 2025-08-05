import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET - Buscar todos os recados ativos
export async function GET() {
    try {
        const messages = await prisma.adminMessage.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
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

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching admin messages:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar recados da administração' },
            { status: 500 }
        );
    }
}

// POST - Criar novo recado (apenas admin)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log('Session in admin-messages API:', {
            user: session?.user,
            isAdmin: session?.user?.isAdmin,
            email: session?.user?.email
        });

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
                { error: 'Acesso negado. Apenas administradores podem criar recados.' },
                { status: 403 }
            );
        }

        const { title, message } = await request.json();

        if (!title || !message) {
            return NextResponse.json(
                { error: 'Título e mensagem são obrigatórios' },
                { status: 400 }
            );
        }

        const newMessage = await prisma.adminMessage.create({
            data: {
                title,
                message,
                createdBy: adminUser.id
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

        return NextResponse.json({ message: newMessage });
    } catch (error) {
        console.error('Error creating admin message:', error);
        return NextResponse.json(
            { error: 'Erro ao criar recado da administração' },
            { status: 500 }
        );
    }
} 