import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// Tipos para os planos
type PlanType = 'BASICO' | 'PADRAO' | 'COMPLETO';

// PATCH: Toggle específico para Deemix e Deezer Premium com recálculo automático de preços
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { userId, field, value } = body;

        if (!userId || !field) {
            return new NextResponse("UserId e field são obrigatórios", { status: 400 });
        }

        if (field !== 'deemix' && field !== 'deezerPremium') {
            return new NextResponse("Campo deve ser 'deemix' ou 'deezerPremium'", { status: 400 });
        }

        // Busca o usuário atual
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { valor: true, deemix: true, deezerPremium: true }
        });

        if (!currentUser) {
            return new NextResponse("Usuário não encontrado", { status: 404 });
        }

        if (!currentUser.valor) {
            return new NextResponse("Usuário deve ter um plano VIP para alterar add-ons", { status: 400 });
        }

        // Calcula o novo valor baseado na alteração do add-on
        const newDeemix = field === 'deemix' ? value : (currentUser.deemix || false);
        const newDeezerPremium = field === 'deezerPremium' ? value : (currentUser.deezerPremium || false);

        const newValor = calculateNewValue(
            currentUser.valor,
            currentUser.deemix || false,
            currentUser.deezerPremium || false,
            newDeemix,
            newDeezerPremium
        );

        // Atualiza o usuário com o novo valor calculado
        await prisma.user.update({
            where: { id: userId },
            data: {
                [field]: value,
                valor: newValor,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            message: `${field} atualizado com sucesso`,
            newValue: newValor,
            field,
            value
        });

    } catch (error) {
        console.error("[USERS_TOGGLE_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}

// Função auxiliar para recalcular o valor quando add-ons são alterados
function calculateNewValue(currentTotal: number, oldDeemix: boolean, oldDeezerPremium: boolean, newDeemix: boolean, newDeezerPremium: boolean): number {
    // Definições de preços dos planos e add-ons
    const DEEMIX_PRICING: Record<PlanType, { value: number; discount: number }> = {
        BASICO: { value: 14.99, discount: 0.35 },
        PADRAO: { value: 14.99, discount: 0.42 },
        COMPLETO: { value: 14.99, discount: 0.60 }
    };

    const DEEZER_PREMIUM_PRICING = 9.75;

    // Primeiro, calcula o preço base removendo os add-ons antigos
    let basePrice = currentTotal;

    if (oldDeemix) {
        // Remove o preço do Deemix antigo
        const plan = getBasePlan(currentTotal);
        if (plan && DEEMIX_PRICING[plan]) {
            const deemixPrice = DEEMIX_PRICING[plan].value * (1 - DEEMIX_PRICING[plan].discount);
            basePrice -= deemixPrice;
        }
    }

    if (oldDeezerPremium) {
        // Remove o preço do Deezer Premium antigo (se não era gratuito)
        const plan = getBasePlan(currentTotal);
        if (plan === 'BASICO') {
            basePrice -= DEEZER_PREMIUM_PRICING;
        }
    }

    // Agora adiciona os novos add-ons
    let newTotal = basePrice;

    if (newDeemix) {
        const plan = getBasePlan(basePrice);
        if (plan && DEEMIX_PRICING[plan]) {
            const deemixPrice = DEEMIX_PRICING[plan].value * (1 - DEEMIX_PRICING[plan].discount);
            newTotal += deemixPrice;
        }
    }

    if (newDeezerPremium) {
        const plan = getBasePlan(basePrice);
        if (plan === 'BASICO') {
            newTotal += DEEZER_PREMIUM_PRICING;
        }
    }

    return Math.round(newTotal * 100) / 100; // Arredonda para 2 casas decimais
}

// Função auxiliar para determinar o plano base pelo valor
function getBasePlan(valor: number): PlanType | null {
    if (valor >= 50) return 'COMPLETO';
    if (valor >= 42) return 'PADRAO';
    if (valor >= 35) return 'BASICO';
    return null;
}
