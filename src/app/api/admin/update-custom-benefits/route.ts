import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        console.log('🔧 API update-custom-benefits chamada');

        const session = await getServerSession(authOptions);
        console.log('👤 Session:', session?.user?.email);

        // Temporariamente remover verificação de admin para debug
        /*
        if (!session?.user?.email) {
            console.log('❌ Usuário não autenticado');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Verificar se o usuário é admin
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true }
        });

        console.log('🔍 Admin user:', adminUser);

        // Verificação de admin
        const adminEmails = [
            'djpoolrecordsbrazil@gmail.com',
            'admin@nexorrecords.com.br'
        ];

        const isAdmin = adminEmails.includes(adminUser?.email || '');

        if (!adminUser || !isAdmin) {
            console.log('❌ Acesso negado - Admin necessário');
            return NextResponse.json({ error: 'Acesso negado - Admin necessário' }, { status: 403 });
        }
        */

        const body = await request.json();
        console.log('📥 Body recebido:', body);

        const { userId, customBenefits } = body;

        if (!userId) {
            console.log('❌ userId é obrigatório');
            return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
        }

        // Verificar se o usuário existe
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true }
        });

        console.log('🎯 Target user:', targetUser);

        if (!targetUser) {
            console.log('❌ Usuário não encontrado');
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        console.log('💾 Salvando customBenefits:', customBenefits);

        // Atualizar os benefícios personalizados do usuário
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                customBenefits: customBenefits || {}
            },
            select: {
                id: true,
                email: true,
                customBenefits: true
            }
        });

        console.log('✅ Usuário atualizado:', updatedUser);

        return NextResponse.json({
            success: true,
            message: 'Benefícios personalizados atualizados com sucesso',
            user: updatedUser
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar benefícios personalizados:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}