import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        // Verificar se o usuário atual é admin - apenas edersonleonardo@nexorrecords.com.br
        const currentUserIsAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';

        if (!currentUserIsAdmin) {
            return NextResponse.json({
                success: false,
                error: 'Acesso negado. Apenas administradores podem verificar status de admin.'
            }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email é obrigatório'
            }, { status: 400 });
        }

        // Buscar usuário no banco
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                isAdmin: true,
                is_vip: true,
                valor: true,
                status: true
            }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Usuário não encontrado'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                is_vip: user.is_vip,
                valor: user.valor,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        // Verificar se o usuário atual é admin - apenas edersonleonardo@nexorrecords.com.br
        const currentUserIsAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';

        if (!currentUserIsAdmin) {
            return NextResponse.json({
                success: false,
                error: 'Acesso negado. Apenas administradores podem atualizar status de admin.'
            }, { status: 403 });
        }

        const { email, isAdmin } = await request.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email é obrigatório'
            }, { status: 400 });
        }

        // Atualizar status de admin
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { isAdmin: Boolean(isAdmin) },
            select: {
                id: true,
                email: true,
                name: true,
                isAdmin: true,
                is_vip: true,
                valor: true,
                status: true
            }
        });

        return NextResponse.json({
            success: true,
            message: `Status de admin atualizado para ${updatedUser.email}`,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                isAdmin: updatedUser.isAdmin,
                is_vip: updatedUser.is_vip,
                valor: updatedUser.valor,
                status: updatedUser.status
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar status de admin:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
} 