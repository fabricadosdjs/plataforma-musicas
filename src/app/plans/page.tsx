"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Check, Crown, Star, Zap, Music, Download, Users, Headphones, Database, Gift, CreditCard, User, MessageSquare, Hand, Calendar, Clock, Calculator, ArrowUp, ArrowDown, DollarSign, Upload, Info } from 'lucide-react';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useNotificationContext } from '@/context/NotificationContext';

// Estilos CSS personalizados para animações
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

// VIP Benefits
const VIP_BENEFITS = {
    BASICO: {
        dailyDownloads: { enabled: true, limit: -1, description: 'Ilimitado' },
        driveAccess: { enabled: true, description: 'Disponível' },
        packRequests: { enabled: true, description: 'Disponível' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 2, description: '2 por dia' },
        deezerPremium: { enabled: true, description: 'R$ 9,75/mês' },
        deemixAccess: { enabled: true, description: 'Disponível (R$ 23,56)' },
        arlPremium: { enabled: false, description: '❌ Não disponível' },
        musicProduction: { enabled: false, description: '❌ Não disponível' }
    },
    PADRAO: {
        dailyDownloads: { enabled: true, limit: -1, description: 'Ilimitado' },
        driveAccess: { enabled: true, description: 'Disponível' },
        packRequests: { enabled: true, description: 'Disponível' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 5, description: '5 por dia' },
        deezerPremium: { enabled: true, description: 'R$ 9,75/mês' },
        deemixAccess: { enabled: true, description: 'Disponível (R$ 22,04)' },
        arlPremium: { enabled: false, description: '❌ Não disponível' },
        musicProduction: { enabled: false, description: '❌ Não disponível' }
    },
    COMPLETO: {
        dailyDownloads: { enabled: true, limit: -1, description: 'Ilimitado' },
        driveAccess: { enabled: true, description: 'Disponível' },
        packRequests: { enabled: true, description: 'Disponível' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: -1, description: 'Ilimitado' },
        deezerPremium: { enabled: true, description: 'Grátis' },
        deemixAccess: { enabled: true, description: 'Disponível (R$ 15,20)' },
        arlPremium: { enabled: false, description: '❌ Não disponível' },
        musicProduction: { enabled: true, description: 'Disponível' }
    }
} as const;

// Uploader é uma opção adicional aos planos VIP
const UPLOADER_OPTION = {
    name: 'UPLOADER',
    description: 'Opção adicional para fazer upload de músicas',
    monthlyPrice: 10.00, // R$ 10,00 a mais por mês
    features: [
        'Upload de até 10 músicas por mês',
        'Badge de Uploader',
        'Acesso à comunidade de uploaders'
    ]
} as const;

// Subscription periods
const SUBSCRIPTION_PERIODS = {
    MONTHLY: {
        name: 'Mensal',
        months: 1,
        discount: 0,
        deemixDiscount: 0,
        deemixFree: false
    },
    QUARTERLY: {
        name: 'Trimestral',
        months: 3,
        discount: 0.05, // 5% desconto no plano
        deemixDiscount: 0.08, // 8% desconto no Deemix
        deemixFree: false
    },
    SEMIANNUAL: {
        name: 'Semestral',
        months: 6,
        discount: 0.15, // 15% desconto no plano
        deemixDiscount: 0.50, // 50% desconto no Deemix
        deemixFree: false
    },
    ANNUAL: {
        name: 'Anual',
        months: 12,
        discount: 0.15, // 15% desconto no plano
        deemixDiscount: 0,
        deemixFree: true // Deemix grátis
    }
} as const;

// Deemix pricing for different plans
const DEEMIX_PRICING = {
    STANDALONE: 38, // Preço avulso para não-VIP (R$ 38,00)
    BASICO: {
        basePrice: 38,
        deemixPrice: 38,
        discount: 0.38, // 38% de desconto
        finalPrice: 38 - (38 * 0.38) // R$ 23,56
    },
    PADRAO: {
        basePrice: 42,
        deemixPrice: 38,
        discount: 0.42, // 42% de desconto (proporcional ao valor)
        finalPrice: 38 - (38 * 0.42) // R$ 22,04
    },
    COMPLETO: {
        basePrice: 60, // Restaurado para 60
        deemixPrice: 38,
        discount: 0.60, // 60% de desconto (proporcional ao valor)
        finalPrice: 38 - (38 * 0.60) // R$ 15,20
    }
} as const;

// Deezer Premium pricing
const DEEZER_PREMIUM_PRICING = {
    STANDALONE: 9.75, // Preço avulso mensal
    INCLUDED_WITH_DEEMIX: 0 // Grátis quando Deemix está incluído
} as const;

const VIP_PLANS = {
    BASICO: {
        name: 'VIP BÁSICO',
        basePrice: 38,
        color: 'bg-blue-600',
        gradient: 'from-blue-600 to-blue-700',
        icon: '🥉',
        paymentLinks: {
            MONTHLY: {
                withoutDeemix: '/planstoogle?plan=vip-basico&period=monthly',
                withDeemix: '/planstoogle?plan=vip-basico&period=monthly&deemix=true'
            },
            QUARTERLY: {
                withoutDeemix: '/planstoogle?plan=vip-basico&period=quarterly',
                withDeemix: '/planstoogle?plan=vip-basico&period=quarterly&deemix=true'
            },
            SEMIANNUAL: {
                withoutDeemix: '/planstoogle?plan=vip-basico&period=semiannual',
                withDeemix: '/planstoogle?plan=vip-basico&period=semiannual&deemix=true'
            },
            ANNUAL: {
                withoutDeemix: '/planstoogle?plan=vip-basico&period=annual',
                withDeemix: '/planstoogle?plan=vip-basico&period=annual&deemix=true'
            }
        },
        benefits: VIP_BENEFITS.BASICO
    },
    PADRAO: {
        name: 'VIP PADRÃO',
        basePrice: 42,
        color: 'bg-green-600',
        gradient: 'from-green-600 to-green-700',
        icon: '🥈',
        paymentLinks: {
            MONTHLY: {
                withoutDeemix: '/planstoogle?plan=vip-padrao&period=monthly',
                withDeemix: '/planstoogle?plan=vip-padrao&period=monthly&deemix=true'
            },
            QUARTERLY: {
                withoutDeemix: '/planstoogle?plan=vip-padrao&period=quarterly',
                withDeemix: '/planstoogle?plan=vip-padrao&period=quarterly&deemix=true'
            },
            SEMIANNUAL: {
                withoutDeemix: '/planstoogle?plan=vip-padrao&period=semiannual',
                withDeemix: '/planstoogle?plan=vip-padrao&period=semiannual&deemix=true'
            },
            ANNUAL: {
                withoutDeemix: '/planstoogle?plan=vip-padrao&period=annual',
                withDeemix: '/planstoogle?plan=vip-padrao&period=annual&deemix=true'
            }
        },
        benefits: VIP_BENEFITS.PADRAO
    },
    COMPLETO: {
        name: 'VIP COMPLETO',
        basePrice: 60, // Restaurado para 60 para manter consistência
        color: 'bg-purple-600',
        gradient: 'from-purple-600 to-purple-700',
        icon: '🥇',
        paymentLinks: {
            MONTHLY: {
                withoutDeemix: '/planstoogle?plan=vip-completo&period=monthly',
                withDeemix: '/planstoogle?plan=vip-completo&period=monthly&deemix=true'
            },
            QUARTERLY: {
                withoutDeemix: '/planstoogle?plan=vip-completo&period=quarterly',
                withDeemix: '/planstoogle?plan=vip-completo&period=quarterly&deemix=true'
            },
            SEMIANNUAL: {
                withoutDeemix: '/planstoogle?plan=vip-completo&period=semiannual',
                withDeemix: '/planstoogle?plan=vip-completo&period=semiannual&deemix=true'
            },
            ANNUAL: {
                withoutDeemix: '/planstoogle?plan=vip-completo&period=annual',
                withDeemix: '/planstoogle?plan=vip-completo&period=annual&deemix=true'
            }
        },
        benefits: VIP_BENEFITS.COMPLETO
    }
} as const;

const BENEFIT_LABELS = {
    dailyDownloads: '🎵 Downloads Diários (tracks)',
    driveAccess: '📁 Acesso ao Drive Mensal',
    packRequests: '🎚️ Solicitação de Packs',
    individualContent: '📦 Conteúdos Avulsos',
    extraPacks: '🔥 Packs Extras',
    playlistDownloads: '🎵 Solicitação de Playlists',
    deezerPremium: '🎁 Deezer Premium Grátis',
    deemixAccess: 'Acesso Deemix',
    arlPremium: '🔐 ARL Premium para Deemix',
    musicProduction: '🎼 Produção da sua Música'
} as const;

// Function to calculate real price based on plan + add-ons
const calculateUserRealPrice = (basePrice: number, hasDeemix: boolean, hasDeezerPremium: boolean) => {
    let totalPrice = basePrice;

    // Se não é VIP, não pode ter add-ons
    if (basePrice < 38) {
        return basePrice;
    }

    // Determinar plano VIP baseado no preço base
    let planKey: keyof typeof DEEMIX_PRICING = 'BASICO';
    if (basePrice >= 60 || basePrice === 50) { // Exceção para R$ 50
        planKey = 'COMPLETO';
    } else if (basePrice >= 42) {
        planKey = 'PADRAO';
    }

    // Adicionar Deemix se ativo
    if (hasDeemix && planKey in DEEMIX_PRICING) {
        const deemixPricing = DEEMIX_PRICING[planKey];
        if (typeof deemixPricing === 'object' && 'finalPrice' in deemixPricing) {
            totalPrice += deemixPricing.finalPrice;
        }
    }

    // Adicionar Deezer Premium se ativo (e se não já incluído no plano)
    if (hasDeezerPremium) {
        // VIP Completo já inclui Deezer Premium grátis
        if (planKey !== 'COMPLETO') {
            // Se tem Deemix, Deezer Premium é grátis, senão paga
            if (!hasDeemix) {
                totalPrice += DEEZER_PREMIUM_PRICING.STANDALONE;
            }
        }
    }

    return Math.round(totalPrice * 100) / 100; // Arredondar para 2 casas decimais
};

// Function to get base price from total price (reverse calculation)
const getBasePriceFromTotal = (totalPrice: number, hasDeemix: boolean, hasDeezerPremium: boolean) => {
    // Se é valor baixo, provavelmente é só o plano base
    if (totalPrice < 35) {
        return totalPrice;
    }

    // Tentar diferentes planos base para ver qual bate
    const basePrices = [38, 42, 60, 50]; // BASICO, PADRAO, COMPLETO, COMPLETO-especial

    for (const basePrice of basePrices) {
        const calculatedTotal = calculateUserRealPrice(basePrice, hasDeemix, hasDeezerPremium);
        if (Math.abs(calculatedTotal - totalPrice) < 0.01) {
            return basePrice;
        }
    }

    // Se não encontrou correspondência exata, retornar o valor total mesmo
    return totalPrice;
};

// Function to determine user's plan based on monthly value
const getUserPlan = (valor: number | null, hasDeemix?: boolean, hasDeezerPremium?: boolean) => {
    if (!valor || valor < 35) {
        return null;
    }

    // Se temos informações sobre add-ons, calcular o preço base
    const basePrice = (hasDeemix !== undefined && hasDeezerPremium !== undefined)
        ? getBasePriceFromTotal(valor, hasDeemix, hasDeezerPremium)
        : valor;

    // VIP Plans baseados nos thresholds corretos (>=60, >=42, >=38)
    // EXCEÇÃO: Se valor é exatamente R$ 50, considerar VIP COMPLETO (caso específico)
    if (basePrice >= 60 || basePrice === 50) {
        return { ...VIP_PLANS.COMPLETO, type: 'VIP' };
    }

    if (basePrice >= 42) {
        return { ...VIP_PLANS.PADRAO, type: 'VIP' };
    }

    if (basePrice >= 38) {
        return { ...VIP_PLANS.BASICO, type: 'VIP' };
    }

    return null;
};

export default function PlansPage() {
    const { data: session } = useSession();
    const { addFeatureNotification, addPlanNotification } = useNotificationContext();
    const [userPlan, setUserPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<keyof typeof SUBSCRIPTION_PERIODS>('MONTHLY');
    const [includeDeemix, setIncludeDeemix] = useState(false);

    useEffect(() => {
        if (session?.user) {
            // Determine user's current plan
            const valor = session.user.valor;
            const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
            const hasDeemix = (session.user as any).deemix || false;
            const hasDeezerPremium = (session.user as any).deezerPremium || false;

            const currentPlan = getUserPlan(valorNumerico || null, hasDeemix, hasDeezerPremium);
            setUserPlan(currentPlan);

            // Automaticamente ativar o toggle de Deemix se o usuário já tem
            setIncludeDeemix(hasDeemix);

            // Mostrar notificações relevantes baseadas no plano atual
            if (!session.user.is_vip) {
                // Usuário não VIP - mostrar notificação sobre recursos premium
                setTimeout(() => {
                    addFeatureNotification(
                        'Recursos Premium Disponíveis',
                        'Descubra downloads ilimitados, qualidade FLAC e muito mais com nossos planos VIP!',
                        '/plans',
                        'Ver Planos'
                    );
                }, 2000);
            } else {
                // Usuário VIP - verificar se tem Deemix
                if (!hasDeemix) {
                    setTimeout(() => {
                        addFeatureNotification(
                            'Deemix Premium Disponível',
                            'Adicione o Deemix Premium ao seu plano para downloads ilimitados do Deezer!',
                            '/deemix',
                            'Ver Deemix'
                        );
                    }, 2000);
                }
            }
        }
        setLoading(false);
    }, [session, addFeatureNotification]);

    const getPlanPrice = (planKey: string, period: keyof typeof SUBSCRIPTION_PERIODS, includeDeemix: boolean) => {
        // Verificar se é um plano VIP
        if (planKey.startsWith('vip-')) {
            const vipKey = planKey.replace('vip-', '').toUpperCase() as keyof typeof VIP_PLANS;
            const plan = VIP_PLANS[vipKey];
            const periodConfig = SUBSCRIPTION_PERIODS[period];

            if (!plan || !periodConfig) {
                console.warn(`Plano ou período não encontrado: ${planKey}, ${period}`);
                return 0;
            }

            // Calcular preço base do plano com desconto do período
            let basePrice = plan.basePrice * (1 - periodConfig.discount);

            if (!includeDeemix || periodConfig.deemixFree) {
                return basePrice * periodConfig.months;
            }

            // Calcular preço do Deemix com desconto do período
            const deemixPricing = DEEMIX_PRICING[vipKey as keyof typeof DEEMIX_PRICING];
            let deemixPrice = 0;

            if (typeof deemixPricing === 'object' && 'finalPrice' in deemixPricing) {
                deemixPrice = deemixPricing.finalPrice * (1 - periodConfig.deemixDiscount);
            } else if (typeof deemixPricing === 'number') {
                deemixPrice = deemixPricing * (1 - periodConfig.deemixDiscount);
            }

            return (basePrice + deemixPrice) * periodConfig.months;
        }

        // Fallback para planos antigos
        const plan = VIP_PLANS[planKey as keyof typeof VIP_PLANS];
        const periodConfig = SUBSCRIPTION_PERIODS[period];

        if (!plan || !periodConfig) {
            console.warn(`Plano ou período não encontrado: ${planKey}, ${period}`);
            return 0;
        }

        // Calcular preço base do plano com desconto do período
        let basePrice = plan.basePrice * (1 - periodConfig.discount);

        if (!includeDeemix || periodConfig.deemixFree) {
            return basePrice * periodConfig.months;
        }

        // Calcular preço do Deemix com desconto do período
        const deemixPricing = DEEMIX_PRICING[planKey as keyof typeof DEEMIX_PRICING];
        let deemixPrice = 0;

        if (typeof deemixPricing === 'object' && 'finalPrice' in deemixPricing) {
            deemixPrice = deemixPricing.finalPrice * (1 - periodConfig.deemixDiscount);
        } else if (typeof deemixPricing === 'number') {
            deemixPrice = deemixPricing * (1 - periodConfig.deemixDiscount);
        }

        // Deezer Premium é grátis quando Deemix está incluído
        const deezerPremiumPrice = includeDeemix ? 0 : DEEZER_PREMIUM_PRICING.STANDALONE;

        return (basePrice + deemixPrice + deezerPremiumPrice) * periodConfig.months;
    };

    const getPlanPaymentLink = (planKey: string, period: keyof typeof SUBSCRIPTION_PERIODS, includeDeemix: boolean) => {
        // Verificar se é um plano VIP
        if (planKey.startsWith('vip-')) {
            const vipKey = planKey.replace('vip-', '').toUpperCase() as keyof typeof VIP_PLANS;
            const plan = VIP_PLANS[vipKey];
            const periodLinks = plan.paymentLinks[period];

            if (!periodLinks) {
                return ''; // Link não disponível para este período
            }

            return includeDeemix ? periodLinks.withDeemix : periodLinks.withoutDeemix;
        }

        // Fallback para planos antigos
        const plan = VIP_PLANS[planKey as keyof typeof VIP_PLANS];
        const periodLinks = plan.paymentLinks[period];

        if (!periodLinks) {
            return ''; // Link não disponível para este período
        }

        return includeDeemix ? periodLinks.withDeemix : periodLinks.withoutDeemix;
    };

    const handleSubscribe = (planKey: string, period: keyof typeof SUBSCRIPTION_PERIODS, includeDeemix: boolean) => {
        // Verificar se é o plano atual do usuário
        const hasDeemix = (session?.user as any)?.deemix || false;
        const hasDeezerPremium = (session?.user as any)?.deezerPremium || false;
        const currentPlan = getUserPlan(session?.user?.valor || null, hasDeemix, hasDeezerPremium);
        const selectedPlan = VIP_PLANS[planKey as keyof typeof VIP_PLANS];

        // Calcular o valor total do plano selecionado (incluindo Deemix se aplicável)
        const selectedPlanTotalPrice = getPlanPrice(planKey, period, includeDeemix);
        const currentPlanTotalPrice = session?.user?.valor || 0;

        // Se for o mesmo plano do usuário E o valor total for igual E os add-ons forem iguais
        if (currentPlan?.name === selectedPlan.name &&
            Math.abs(selectedPlanTotalPrice - currentPlanTotalPrice) < 0.01 &&
            includeDeemix === hasDeemix) {
            alert('Este é seu plano atual!');
            return;
        }

        // Se for um plano inferior, mostrar mensagem de downgrade
        const planHierarchy = {
            'BASICO': 1,
            'PADRAO': 2,
            'COMPLETO': 3
        };

        const currentPlanLevel = currentPlan ? planHierarchy[currentPlan.name.replace('VIP ', '') as keyof typeof planHierarchy] : 0;
        const selectedPlanLevel = planHierarchy[planKey as keyof typeof planHierarchy];

        if (selectedPlanLevel < currentPlanLevel) {
            alert('Para fazer downgrade do seu plano, entre em contato conosco via WhatsApp.');
            const whatsappMessage = `Olá! Gostaria de fazer downgrade do meu plano atual (${currentPlan?.name}) para ${selectedPlan.name}. Podem me ajudar?`;
            const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
            return;
        }

        // Tratar Deezer Premium standalone
        if (planKey === 'DEEZER_PREMIUM') {
            const price = DEEZER_PREMIUM_PRICING.STANDALONE;
            const hasDeemix = (session?.user as any)?.deemix || false;
            const hasDeezerPremium = (session?.user as any)?.deezerPremium || false;
            const currentPlan = getUserPlan(session?.user?.valor || null, hasDeemix, hasDeezerPremium);

            // Se o usuário tem plano completo, mostrar que já tem acesso
            if (currentPlan?.name === 'VIP COMPLETO') {
                alert('Você já tem acesso ao Deezer Premium através do seu plano VIP COMPLETO!');
                return;
            }

            const whatsappMessage = `Olá! Tenho interesse no Deezer Premium avulso por R$ ${price.toFixed(2).replace('.', ',')}/mês. Podem me ajudar?`;
            const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
            return;
        }

        // Tratar Deemix standalone
        if (planKey === 'STANDALONE') {
            const price = DEEMIX_PRICING.STANDALONE;
            const hasDeemix = (session?.user as any)?.deemix || false;
            const hasDeezerPremium = (session?.user as any)?.deezerPremium || false;
            const currentPlan = getUserPlan(session?.user?.valor || null, hasDeemix, hasDeezerPremium);

            // Se o usuário tem plano completo, mostrar que já tem acesso
            if (currentPlan?.name === 'VIP COMPLETO') {
                alert('Você já tem acesso ao Deemix através do seu plano VIP COMPLETO!');
                return;
            }

            // Abrir link de pagamento do Mercado Pago
            window.open('https://mpago.la/1CW9WQK', '_blank');

            // Mostrar mensagem sobre envio do comprovante
            setTimeout(() => {
                const whatsappMessage = `Olá! Acabei de realizar o pagamento do Deemix avulso por R$ ${price.toFixed(2).replace('.', ',')}/mês e gostaria de enviar o comprovante para iniciar o cadastro e liberação da plataforma.`;
                const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(whatsappMessage)}`;

                const confirmed = confirm(
                    `Pagamento iniciado!\n\nApós realizar o pagamento, envie o comprovante para nosso WhatsApp +55 51 9 3505-2274 para iniciarmos o cadastro e liberação da plataforma.\n\nDeseja abrir o WhatsApp agora?`
                );

                if (confirmed) {
                    window.open(whatsappUrl, '_blank');
                }
            }, 1000);

            return;
        }

        // Para planos normais, abrir a calculadora PIX
        const paymentLink = getPlanPaymentLink(planKey, period, includeDeemix);
        if (paymentLink) {
            window.open(paymentLink, '_blank');
        } else {
            alert('Link de pagamento não disponível para este plano/período.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] relative overflow-hidden">
                <Header />
                <div className="pt-12 lg:pt-16">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1db954]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                <main className="max-w-[95%] mx-auto px-4 py-4 sm:py-8">

                    {/* Hero Section */}
                    <div className="text-center mb-8 sm:mb-16">
                        <div className="mb-6 sm:mb-8">
                            {/* Animated background particles */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#1db954]/10 rounded-full blur-3xl animate-pulse"></div>
                                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#1ed760]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#1db954]/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className="relative animate-float">
                                        <div className="w-20 h-20 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-2xl flex items-center justify-center shadow-2xl animate-glow">
                                            <Crown className="h-10 w-10 text-white" />
                                        </div>
                                        <div className="absolute -inset-2 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-2xl blur opacity-30 animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#1db954] via-[#1ed760] to-[#1db954] bg-clip-text text-transparent drop-shadow-lg mb-4">
                                            PLANOS VIP
                                        </h1>
                                        <p className="text-lg sm:text-xl md:text-2xl text-[#b3b3b3] max-w-4xl mx-auto leading-relaxed px-4">
                                            Escolha o plano ideal para suas necessidades. Todos os planos incluem acesso completo à plataforma.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Plan Info */}
                    {userPlan && (
                        <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#282828] mb-6 sm:mb-8">
                            <div className="text-center mb-4 sm:mb-6">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Seu Plano Atual</h2>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div className="text-3xl sm:text-4xl">{userPlan.icon}</div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white">{userPlan.name}</h3>
                                        <p className="text-[#b3b3b3]">R$ {userPlan.basePrice}/mês</p>

                                        {/* Mostrar add-ons ativos */}
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                                            {(session?.user as any)?.deemix && (
                                                <span className="bg-[#1db954]/20 border border-[#1db954]/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-[#1db954]">
                                                    🎵 Deemix Ativo
                                                </span>
                                            )}
                                            {(session?.user as any)?.deezerPremium && (
                                                <span className="bg-[#1ed760]/20 border border-[#1ed760]/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-[#1ed760]">
                                                    🎁 Deezer Premium
                                                </span>
                                            )}
                                            {(session?.user as any)?.isUploader && (
                                                <span className="bg-[#1db954]/20 border border-[#1db954]/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-[#1db954]">
                                                    📤 Uploader
                                                </span>
                                            )}
                                        </div>

                                        {/* Mostrar valor total se diferente do base */}
                                        {session?.user?.valor && Number(session.user.valor) !== userPlan.basePrice && (
                                            <p className="text-xs text-[#535353] mt-1">
                                                Total com add-ons: R$ {session.user.valor}/mês
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Period Selection */}
                    <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#282828] mb-6 sm:mb-8">
                        <div className="text-center mb-4 sm:mb-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="p-3 bg-gradient-to-r from-[#1db954] to-[#1ed760] rounded-full">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Período de Assinatura</h3>
                                    <p className="text-[#b3b3b3] text-sm sm:text-base">Escolha o período que melhor se adapta a você</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {Object.entries(SUBSCRIPTION_PERIODS).map(([periodKey, period]) => (
                                <button
                                    key={periodKey}
                                    onClick={() => setSelectedPeriod(periodKey as keyof typeof SUBSCRIPTION_PERIODS)}
                                    className={`group p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-xs sm:text-sm hover:scale-105 ${selectedPeriod === periodKey
                                        ? 'border-[#1db954] bg-[#1db954]/20 text-[#1db954] shadow-lg shadow-[#1db954]/25'
                                        : 'border-[#282828] bg-[#282828]/20 text-[#b3b3b3] hover:border-[#535353] hover:bg-[#535353]/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                        <Calendar className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:scale-110 ${selectedPeriod === periodKey ? 'text-[#1db954]' : 'text-[#535353]'}`} />
                                        <span className="font-semibold">{period.name}</span>
                                    </div>
                                    <div className="text-xs">
                                        {period.months} {period.months === 1 ? 'mês' : 'meses'}
                                    </div>
                                    {period.discount > 0 && (
                                        <div className="text-xs text-[#1db954] mt-1 font-semibold">
                                            🎉 {period.discount * 100}% OFF
                                        </div>
                                    )}
                                    {period.deemixFree && (
                                        <div className="text-xs text-[#1ed760] mt-1 font-semibold">
                                            🎁 Deemix Grátis
                                        </div>
                                    )}
                                    {period.deemixDiscount > 0 && !period.deemixFree && (
                                        <div className="text-xs text-[#1ed760] mt-1 font-semibold">
                                            💰 Deemix {period.deemixDiscount * 100}% OFF
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Deemix Toggle */}
                        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="flex items-center gap-2">
                                <Music className="w-4 h-4 text-[#535353]" />
                                <span className="text-xs sm:text-sm text-[#535353]">Sem Deemix</span>
                            </div>
                            <button
                                onClick={() => setIncludeDeemix(!includeDeemix)}
                                className={`relative inline-flex h-8 w-16 sm:h-10 sm:w-20 items-center rounded-full transition-all duration-300 shadow-lg ${includeDeemix
                                    ? 'bg-gradient-to-r from-[#1db954] to-[#1ed760] shadow-[#1db954]/25'
                                    : 'bg-gradient-to-r from-[#535353] to-[#282828] shadow-[#535353]/25'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 sm:h-7 sm:w-7 transform rounded-full bg-white transition-all duration-300 shadow-md ${includeDeemix
                                        ? 'translate-x-10 sm:translate-x-12'
                                        : 'translate-x-1'
                                        }`}
                                />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm text-[#535353]">Com Deemix</span>
                                <div className="w-4 h-4 bg-gradient-to-r from-[#1db954] to-[#1ed760] rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* VIP Plans Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
                        {Object.entries(VIP_PLANS).map(([planKey, plan]) => {
                            const isCurrentPlan = userPlan?.name === plan.name;
                            const isHigherPlan =
                                (planKey === 'PADRAO' && userPlan?.name === 'COMPLETO') ||
                                (planKey === 'BASICO' && (userPlan?.name === 'PADRAO' || userPlan?.name === 'COMPLETO'));

                            const periodConfig = SUBSCRIPTION_PERIODS[selectedPeriod];
                            const currentPrice = getPlanPrice(planKey, selectedPeriod, includeDeemix);
                            const basePrice = plan.basePrice * (1 - periodConfig.discount);
                            const deemixPricing = DEEMIX_PRICING[planKey as keyof typeof DEEMIX_PRICING];
                            const deemixPrice = typeof deemixPricing === 'object' && 'finalPrice' in deemixPricing
                                ? deemixPricing.finalPrice
                                : typeof deemixPricing === 'number'
                                    ? deemixPricing
                                    : 0;
                            const deemixFree = periodConfig.deemixFree;

                            // Verificar se é realmente o plano atual considerando add-ons
                            const hasDeemix = (session?.user as any)?.deemix || false;
                            const hasDeezerPremium = (session?.user as any)?.deezerPremium || false;
                            const currentPlanTotalPrice = session?.user?.valor || 0;
                            const selectedPlanTotalPrice = getPlanPrice(planKey, selectedPeriod, includeDeemix);
                            const isActuallyCurrentPlan = userPlan?.name === plan.name &&
                                Math.abs(selectedPlanTotalPrice - currentPlanTotalPrice) < 0.01 &&
                                includeDeemix === hasDeemix;

                            return (
                                <div
                                    key={planKey}
                                    className={`group relative rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-500 hover:scale-105 hover-lift ${isActuallyCurrentPlan
                                        ? 'bg-[#1db954]/10 border-2 border-[#1db954]/50 shadow-2xl shadow-[#1db954]/20'
                                        : 'bg-[#181818] border border-[#282828] hover:border-[#535353] hover:shadow-xl'
                                        }`}
                                >
                                    {/* Current Plan Badge */}
                                    {isActuallyCurrentPlan && (
                                        <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                                            <div className="bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg">
                                                PLANO ATUAL
                                            </div>
                                        </div>
                                    )}

                                    {/* Plan Header */}
                                    <div className="text-center mb-6 sm:mb-8">
                                        <div className="relative mb-4">
                                            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{plan.icon}</div>
                                            <div className="absolute inset-0 text-4xl sm:text-5xl opacity-20 blur-sm group-hover:blur-md transition-all duration-300">{plan.icon}</div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-[#1db954] to-[#1ed760] transition-all duration-300">{plan.name}</h3>

                                        {/* Period Badge */}
                                        <div className="inline-flex items-center gap-1 sm:gap-2 bg-[#1db954]/20 text-[#1db954] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 border border-[#1db954]/30 shadow-lg shadow-[#1db954]/10 group-hover:shadow-[#1db954]/20 transition-all duration-300">
                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                                            {periodConfig.name}
                                        </div>

                                        {/* Price Display */}
                                        <div className="mb-3 sm:mb-4">
                                            <div className="relative">
                                                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-[#1db954] to-[#1ed760] transition-all duration-300">
                                                    R$ {currentPrice.toFixed(2).replace('.', ',')}
                                                    <span className="text-sm sm:text-lg text-[#b3b3b3] font-normal">/{periodConfig.name.toLowerCase()}</span>
                                                </div>
                                                <div className="absolute inset-0 text-2xl sm:text-3xl font-bold opacity-20 blur-sm group-hover:blur-md transition-all duration-300">
                                                    R$ {currentPrice.toFixed(2).replace('.', ',')}
                                                </div>
                                            </div>

                                            {/* Price Breakdown */}
                                            {includeDeemix && !deemixFree && (
                                                <div className="text-xs text-[#b3b3b3] space-y-1">
                                                    <div>Plano: R$ {(basePrice * periodConfig.months).toFixed(2).replace('.', ',')}</div>
                                                    <div>Deemix: R$ {(deemixPrice * periodConfig.months).toFixed(2).replace('.', ',')}</div>
                                                    <div className="text-[#1db954]">Deezer Premium: GRÁTIS</div>
                                                    {periodConfig.deemixDiscount > 0 && (
                                                        <div className="text-[#1db954] font-semibold">
                                                            Desconto Deemix: {periodConfig.deemixDiscount * 100}%
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!includeDeemix && (
                                                <div className="text-xs text-[#b3b3b3] space-y-1">
                                                    <div>Plano: R$ {(basePrice * periodConfig.months).toFixed(2).replace('.', ',')}</div>
                                                    <div className="text-[#1db954]">Deezer Premium: R$ {(DEEZER_PREMIUM_PRICING.STANDALONE * periodConfig.months).toFixed(2).replace('.', ',')}</div>
                                                </div>
                                            )}

                                            {deemixFree && includeDeemix && (
                                                <div className="text-xs text-[#1ed760] font-semibold">
                                                    🎁 Deemix + Deezer Premium Grátis no período!
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Benefits List */}
                                    <div className="space-y-2 sm:space-y-4 mb-6 sm:mb-8">
                                        {Object.entries(plan.benefits).map(([benefitKey, benefit], index) => {
                                            // Highlight Deemix benefit when selected
                                            const isDeemixBenefit = benefitKey === 'deemixAccess';
                                            const isHighlighted = includeDeemix && isDeemixBenefit;
                                            const isFree = deemixFree && isDeemixBenefit;

                                            return (
                                                <div
                                                    key={benefitKey}
                                                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 group/benefit ${isHighlighted
                                                        ? 'bg-[#1db954]/20 border border-[#1db954]/30 shadow-lg shadow-[#1db954]/10'
                                                        : 'bg-[#282828] border border-[#282828] hover:border-[#535353] hover:bg-[#535353]'
                                                        }`}
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-300 group-hover/benefit:scale-110 ${isHighlighted
                                                        ? 'bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white shadow-lg shadow-[#1db954]/25'
                                                        : 'bg-[#535353] text-[#b3b3b3] group-hover/benefit:bg-[#1db954]'
                                                        }`}
                                                    >
                                                        {isFree ? (
                                                            <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        ) : (
                                                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs sm:text-sm font-medium text-white truncate group-hover/benefit:text-transparent group-hover/benefit:bg-clip-text group-hover/benefit:bg-gradient-to-r group-hover/benefit:from-[#1db954] group-hover/benefit:to-[#1ed760] transition-all duration-300">
                                                            {BENEFIT_LABELS[benefitKey as keyof typeof BENEFIT_LABELS]}
                                                        </div>
                                                        <div className="text-xs text-[#b3b3b3] truncate group-hover/benefit:text-white transition-all duration-300">
                                                            {benefit.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Subscribe Button */}
                                    <button
                                        onClick={() => handleSubscribe(planKey, selectedPeriod, includeDeemix)}
                                        disabled={isActuallyCurrentPlan || isHigherPlan}
                                        className={`group/btn w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-lg transition-all duration-500 relative overflow-hidden ${isActuallyCurrentPlan
                                            ? 'bg-[#535353] text-[#b3b3b3] cursor-not-allowed'
                                            : isHigherPlan
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
                                                : 'bg-gradient-to-r from-[#1db954] to-[#1ed760] hover:from-[#1db954]/80 hover:to-[#1ed760]/80 text-white shadow-lg shadow-[#1db954]/25 hover:shadow-[#1db954]/40 hover:scale-105'
                                            }`}
                                    >
                                        {/* Animated background */}
                                        {!isActuallyCurrentPlan && !isHigherPlan && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#1db954] to-[#1ed760] opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500"></div>
                                        )}

                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {isActuallyCurrentPlan ? (
                                                <Check className="w-4 h-4" />
                                            ) : isHigherPlan ? (
                                                <MessageSquare className="w-4 h-4" />
                                            ) : (
                                                <Zap className="w-4 h-4 group-hover/btn:animate-pulse" />
                                            )}
                                            {isActuallyCurrentPlan
                                                ? 'Plano Atual'
                                                : isHigherPlan
                                                    ? 'Downgrade via WhatsApp'
                                                    : 'Assinar Agora'
                                            }
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Deemix Avulso Section */}
                    <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#282828] mb-6 sm:mb-8">
                        <div className="text-center mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">🎵 Deemix Avulso</h3>
                            <p className="text-[#b3b3b3] text-sm sm:text-base">Apenas o Deemix para download direto do Deezer</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                            {/* Box Esquerda - Para Não-VIP */}
                            <div className="bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1db954]/20">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#1db954]" />
                                    Para Não-VIP
                                </h4>
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-3 sm:mb-4">
                                    R$ 38,00<span className="text-sm sm:text-lg text-[#b3b3b3] font-normal">/mês</span>
                                </div>

                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#b3b3b3] mb-4 sm:mb-6">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Download direto do Deezer</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Qualidade FLAC/MP3</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Interface web moderna</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>ARL Premium incluído</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const message = "Olá! Tenho interesse no Deemix Avulso por R$ 38,00/mês. Podem me ajudar?";
                                        const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(message)}`;
                                        window.open(whatsappUrl, '_blank');
                                    }}
                                    className="w-full bg-gradient-to-r from-[#1db954] to-[#1ed760] hover:from-[#1db954]/80 hover:to-[#1ed760]/80 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 text-sm sm:text-base"
                                >
                                    Assinar Deemix Avulso
                                </button>
                            </div>

                            {/* Box Direita - Descontos VIP */}
                            <div className="bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1ed760]/20">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#1ed760]" />
                                    Descontos VIP
                                </h4>

                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#b3b3b3] mb-3 sm:mb-4">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span><strong className="text-[#1db954]">VIP Básico:</strong> 38% OFF</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span><strong className="text-[#1ed760]">VIP Padrão:</strong> 42% OFF</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span><strong className="text-[#1db954]">VIP Completo:</strong> 60% OFF</span>
                                    </div>
                                </div>

                                <div className="bg-[#1db954]/10 border border-[#1db954]/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                                    <h5 className="text-xs sm:text-sm font-bold text-[#1db954] mb-1 sm:mb-2">💰 Descontos Especiais</h5>
                                    <div className="text-xs text-[#b3b3b3] space-y-1">
                                        <div>• <strong>Trimestral:</strong> Deemix 8% OFF</div>
                                        <div>• <strong>Semestral:</strong> Deemix 50% OFF</div>
                                        <div>• <strong>Anual:</strong> Deemix GRÁTIS</div>
                                    </div>
                                </div>

                                <div className="bg-[#1ed760]/10 border border-[#1ed760]/20 rounded-lg p-2 sm:p-3">
                                    <div className="text-xs text-[#b3b3b3]">
                                        <strong className="text-[#1ed760]">💡 Dica:</strong> Seja VIP e aproveite descontos proporcionais ao valor do seu plano!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Allavsoft Section */}
                    <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#282828] mb-6 sm:mb-8">
                        <div className="text-center mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">🌐 Allavsoft - Download Universal</h3>
                            <p className="text-[#b3b3b3] text-sm sm:text-base">Baixe de qualquer plataforma de música e vídeo</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                            <div className="bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1db954]/20">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#1db954]" />
                                    Recursos Principais
                                </h4>

                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#b3b3b3]">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>YouTube, Spotify, Apple Music</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>SoundCloud, Bandcamp, Beatport</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Qualidade original preservada</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Download em lote</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Conversão automática</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Interface intuitiva</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#535353]">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#535353]" />
                                    Informações
                                </h4>

                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#b3b3b3] mb-4 sm:mb-6">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#535353] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Software desktop para Windows/Mac</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#535353] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Suporte para centenas de sites</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#535353] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Atualizações regulares</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const message = "Olá! Tenho interesse no Allavsoft - Download Universal. Podem me ajudar com mais informações?";
                                        const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(message)}`;
                                        window.open(whatsappUrl, '_blank');
                                    }}
                                    className="w-full bg-gradient-to-r from-[#1db954] to-[#1ed760] hover:from-[#1db954]/80 hover:to-[#1ed760]/80 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 text-sm sm:text-base"
                                >
                                    Saiba Mais
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Deezer Premium Avulso Section */}
                    <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#282828] mb-6 sm:mb-8">
                        <div className="text-center mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">🎁 Deezer Premium Avulso</h3>
                            <p className="text-[#b3b3b3] text-sm sm:text-base">Streaming premium sem anúncios</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                            <div className="bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1ed760]/20">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-[#1ed760]" />
                                    Recursos Premium
                                </h4>
                                <div className="text-2xl sm:text-3xl font-bold text-[#1ed760] mb-3 sm:mb-4">
                                    R$ 9,75<span className="text-sm sm:text-lg text-[#b3b3b3] font-normal">/mês</span>
                                </div>

                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#b3b3b3]">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Sem anúncios</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Qualidade HiFi</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Download offline</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Pulos ilimitados</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>90 milhões de músicas</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Playlists personalizadas</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#535353]">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#535353]" />
                                    Informações
                                </h4>

                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#b3b3b3] mb-4 sm:mb-6">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#535353] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Conta premium compartilhada</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#535353] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Acesso via app ou web</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#535353] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Renovação automática</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSubscribe('DEEZER_PREMIUM', 'MONTHLY', false)}
                                    className="w-full bg-gradient-to-r from-[#1db954] to-[#1ed760] hover:from-[#1db954]/80 hover:to-[#1ed760]/80 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 text-sm sm:text-base"
                                >
                                    Assinar Deezer Premium
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Por que escolher nossos planos? */}
                    <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#282828] mb-6 sm:mb-8">
                        <div className="text-center mb-4 sm:mb-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="p-3 bg-gradient-to-r from-[#1db954] to-[#1ed760] rounded-full">
                                    <Star className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">❓ Por que escolher nossos planos?</h3>
                                    <p className="text-[#b3b3b3] text-sm sm:text-base">Os melhores benefícios para DJs e amantes da música eletrônica</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                            <div className="group bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1db954]/20 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-[#1db954]/20 hover-lift">
                                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">🎵</div>
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1db954] group-hover:to-[#1ed760] transition-all duration-300">Acervo Completo</h4>
                                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-[#b3b3b3]">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>Milhares de músicas eletrônicas</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>Qualidade profissional</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>Atualizações semanais</span>
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1ed760]/20 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-[#1ed760]/20">
                                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">⬇️</div>
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1ed760] group-hover:to-[#1db954] transition-all duration-300">Downloads Ilimitados</h4>
                                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-[#b3b3b3]">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>Sem limite de downloads</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>Download instantâneo</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>Múltiplos formatos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1db954]/20 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-[#1db954]/20">
                                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">👥</div>
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1db954] group-hover:to-[#1ed760] transition-all duration-300">Comunidade Ativa</h4>
                                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-[#b3b3b3]">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>DJs de todo o Brasil</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>Troca de experiências</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300"></div>
                                        <span>Suporte especializado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Uploader Option Section */}
                    <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#282828] mb-6 sm:mb-8">
                        <div className="text-center mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">📤 Opção Uploader</h3>
                            <p className="text-[#b3b3b3] text-sm sm:text-base">Adicione a funcionalidade de upload de músicas ao seu plano</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                            <div className="bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1db954]/20">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#1db954]" />
                                    {UPLOADER_OPTION.name}
                                </h4>
                                <p className="text-[#b3b3b3] text-sm sm:text-base mb-3 sm:mb-4">{UPLOADER_OPTION.description}</p>

                                <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                    {UPLOADER_OPTION.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#1db954]" />
                                            <span className="text-xs sm:text-sm text-[#b3b3b3]">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                                        R$ {UPLOADER_OPTION.monthlyPrice.toFixed(2).replace('.', ',')}/mês
                                    </div>
                                    <p className="text-xs text-[#535353] mb-3 sm:mb-4">
                                        Adicionado ao valor do seu plano VIP
                                    </p>
                                    <button className="bg-gradient-to-r from-[#1db954] to-[#1ed760] hover:from-[#1db954]/80 hover:to-[#1ed760]/80 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 text-sm sm:text-base">
                                        Adicionar Uploader
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#282828] rounded-xl p-4 sm:p-6 border border-[#1ed760]/20">
                                <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#1ed760]" />
                                    Como Funciona
                                </h4>

                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-[#b3b3b3]">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Você mantém todos os benefícios do seu plano VIP</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Adiciona a capacidade de fazer upload de até 10 músicas por mês</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Recebe um badge especial de Uploader</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-[#1ed760] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                                        <span>Acesso à comunidade exclusiva de uploaders</span>
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#1db954]/10 border border-[#1db954]/20 rounded-lg">
                                    <h5 className="text-xs sm:text-sm font-bold text-[#1db954] mb-1 sm:mb-2">💡 Descontos Especiais</h5>
                                    <div className="text-xs text-[#b3b3b3] space-y-1">
                                        <div>• <strong>Trimestral:</strong> 5% de desconto no uploader</div>
                                        <div>• <strong>Semestral/Anual:</strong> Uploader de graça!</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center">
                        <Link href="/" className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#1db954] to-[#1ed760] hover:from-[#1db954]/80 hover:to-[#1ed760]/80 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-500 text-sm sm:text-base shadow-lg shadow-[#1db954]/25 hover:shadow-[#1db954]/40 hover:scale-105 relative overflow-hidden">
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1db954] to-[#1ed760] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                            <span className="relative z-10 flex items-center gap-2">
                                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce transition-all duration-300" />
                                Voltar para Home
                            </span>
                        </Link>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
} 