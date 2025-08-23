import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, email, whatsapp } = body;

        // Log dos dados recebidos
        console.log('📥 Dados recebidos na API:', { name, email, whatsapp });
        console.log('🔍 Session user ID:', session.user.id);

        // Validações básicas
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Nome e email são obrigatórios' },
                { status: 400 }
            );
        }

        if (name.length < 2) {
            return NextResponse.json(
                { error: 'Nome deve ter pelo menos 2 caracteres' },
                { status: 400 }
            );
        }

        if (!email.includes('@')) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        // Verificar se o email já existe em outro usuário
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
                id: { not: session.user.id }
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este email já está sendo usado por outro usuário' },
                { status: 400 }
            );
        }

        // Log dos dados que serão atualizados
        console.log('🔄 Dados que serão atualizados:', {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            whatsapp: whatsapp?.trim() || null
        });

        // Atualizar usuário
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                whatsapp: whatsapp?.trim() || null,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                email: true,
                whatsapp: true,
                updatedAt: true
            }
        });

        console.log('✅ Resultado da atualização:', updatedUser);

        // Log da atualização
        console.log(`✅ Usuário ${session.user.id} atualizou seus dados:`, {
            name: updatedUser.name,
            email: updatedUser.email,
            whatsapp: updatedUser.whatsapp
        });

        return NextResponse.json({
            success: true,
            message: 'Dados atualizados com sucesso!',
            user: updatedUser
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
