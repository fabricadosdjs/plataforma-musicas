import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getPlanInfo, getVipPlan, VIP_PLANS_CONFIG, ADDONS_CONFIG, getDeemixPrice, isDeezerFree, getUploaderPrice } from '@/lib/plans-config';

// ========== 🏆 GET: OBTER INFORMAÇÕES DOS PLANOS ==========
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // ========== 📊 BUSCA DADOS DO USUÁRIO ==========
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                valor: true,
                is_vip: true,
                deemix: true,
                deezerPremium: true,
                isUploader: true,
                status: true,
                vencimento: true
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // ========== 🎯 DETECÇÃO DO PLANO ATUAL ==========
        const currentPlanInfo = getPlanInfo(user.valor);
        const currentPlanType = getVipPlan(user.valor);

        // ========== 📋 INFORMAÇÕES DOS PLANOS DISPONÍVEIS ==========
        const availablePlans = Object.values(VIP_PLANS_CONFIG).map(plan => ({
            ...plan,
            isCurrent: plan.id === currentPlanType,
            canUpgrade: !currentPlanType || plan.value > (user.valor || 0),
            canDowngrade: currentPlanType && plan.value < (user.valor || 0)
        }));

        // ========== 🎵 INFORMAÇÕES DOS ADD-ONS ==========
        const addons = {
            deemix: {
                ...ADDONS_CONFIG.DEEMIX,
                currentPrice: getDeemixPrice(currentPlanType),
                isActive: user.deemix || false
            },
            deezerPremium: {
                ...ADDONS_CONFIG.DEEZER_PREMIUM,
                isFree: isDeezerFree(currentPlanType),
                isActive: user.deezerPremium || false
            },
            uploader: {
                ...ADDONS_CONFIG.UPLOADER,
                prices: {
                    monthly: getUploaderPrice('monthly'),
                    quarterly: getUploaderPrice('quarterly'),
                    semiannual: getUploaderPrice('semiannual'),
                    annual: getUploaderPrice('annual')
                },
                isActive: user.isUploader || false
            }
        };

        // ========== 📈 RECOMENDAÇÕES DE UPGRADE/DOWNGRADE ==========
        const recommendations = {
            upgrade: availablePlans.find(plan => plan.canUpgrade),
            downgrade: availablePlans.reverse().find(plan => plan.canDowngrade)
        };

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                currentPlan: currentPlanInfo,
                isVip: user.is_vip,
                status: user.status,
                vencimento: user.vencimento
            },
            plans: {
                available: availablePlans,
                current: currentPlanInfo,
                recommendations
            },
            addons,
            pricing: {
                currency: 'BRL',
                period: 'monthly'
            }
        });

    } catch (error) {
        console.error("[PLANS_GET_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}
