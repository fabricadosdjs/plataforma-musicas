import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Verificar se é admin
        if (!session?.user?.id || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Calcular status VIP baseado no valor E vencimento
        const valor = user.valor || 0;
        const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
        const hasValidVencimento = user.vencimento && new Date(user.vencimento) > new Date();

        let plan = 'GRATUITO';
        if (valorNumerico >= 43) plan = 'COMPLETO';
        else if (valorNumerico >= 36) plan = 'PADRÃO';
        else if (valorNumerico >= 30) plan = 'BÁSICO';

        // Se tem vencimento válido mas não tem valor, definir plano padrão
        if (hasValidVencimento && plan === 'GRATUITO') {
            plan = 'BÁSICO';
        }

        const isVip = plan !== 'GRATUITO' || hasValidVencimento;

        // Atualizar usuário
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                is_vip: isVip
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                email: updatedUser.email,
                name: updatedUser.name,
                valor: updatedUser.valor,
                vencimento: updatedUser.vencimento,
                hasValidVencimento,
                planByValue: plan,
                is_vip: updatedUser.is_vip,
                plan: plan,
                isVip: isVip
            },
            message: `Status VIP atualizado: ${isVip ? plan : 'GRATUITO'}`
        });

    } catch (error) {
        console.error('❌ Erro ao forçar atualização VIP:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}
