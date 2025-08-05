"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Check, Crown, Star, Zap, Music, Download, Users, Headphones, Database, Gift, CreditCard, User, MessageSquare, Hand, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

// Plan definitions with Deemix pricing
const VIP_BENEFITS = {
    BASICO: {
        dailyDownloads: { enabled: true, limit: 50, description: '50 músicas/dia' },
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 4, description: 'Até 4 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 7, description: 'Até 7 por semana' },
        deezerPremium: { enabled: false, description: 'Avulso: R$ 9,75/mês' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 35,00/mês' },
        arlPremium: { enabled: false, description: 'Disponível se tiver deemix' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    PADRAO: {
        dailyDownloads: { enabled: true, limit: 75, description: '75 músicas/dia' },
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 6, description: 'Até 6 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 9, description: 'Até 9 por semana' },
        deezerPremium: { enabled: false, description: 'Avulso: R$ 9,75/mês' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 35,00/mês' },
        arlPremium: { enabled: false, description: 'Disponível se tiver deemix' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    COMPLETO: {
        dailyDownloads: { enabled: true, limit: 150, description: '150 músicas/dia' },
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 10, description: 'Até 10 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: -1, description: 'Ilimitado (máx. 4 por dia)' },
        deezerPremium: { enabled: true, description: 'Incluído' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 35,00/mês' },
        arlPremium: { enabled: true, description: 'Sim (automático se Deemix)' },
        musicProduction: { enabled: true, description: 'Sim' }
    }
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
    STANDALONE: 35, // Preço avulso para não-VIP (R$ 35,00)
    BASICO: {
        basePrice: 35,
        deemixPrice: 35,
        discount: 0.35, // 35% de desconto
        finalPrice: 35 - (35 * 0.35) // R$ 22,75
    },
    PADRAO: {
        basePrice: 42,
        deemixPrice: 35,
        discount: 0.42, // 42% de desconto (proporcional ao valor)
        finalPrice: 35 - (35 * 0.42) // R$ 20,30
    },
    COMPLETO: {
        basePrice: 50,
        deemixPrice: 35,
        discount: 0.60, // 60% de desconto (proporcional ao valor)
        finalPrice: 35 - (35 * 0.60) // R$ 14,00
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
        basePrice: 35,
        color: 'bg-blue-600',
        gradient: 'from-blue-600 to-blue-700',
        icon: '🥉',
        paymentLinks: {
            MONTHLY: {
                withoutDeemix: 'https://mpago.la/2ogrkmW',
                withDeemix: 'https://mpago.la/1bHcknE'
            },
            QUARTERLY: {
                withoutDeemix: 'https://mpago.la/2e1Mvfg',
                withDeemix: 'https://mpago.la/1dQ5KH2'
            },
            SEMIANNUAL: {
                withoutDeemix: '', // Será fornecido
                withDeemix: '' // Será fornecido
            },
            ANNUAL: {
                withoutDeemix: '', // Será fornecido
                withDeemix: '' // Será fornecido
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
                withoutDeemix: 'https://mpago.la/1aFWE4k',
                withDeemix: 'https://mpago.la/1XYr85n'
            },
            QUARTERLY: {
                withoutDeemix: 'https://mpago.la/2rUP8ZE',
                withDeemix: 'https://mpago.la/1AHuSkb'
            },
            SEMIANNUAL: {
                withoutDeemix: '', // Será fornecido
                withDeemix: '' // Será fornecido
            },
            ANNUAL: {
                withoutDeemix: '', // Será fornecido
                withDeemix: '' // Será fornecido
            }
        },
        benefits: VIP_BENEFITS.PADRAO
    },
    COMPLETO: {
        name: 'VIP COMPLETO',
        basePrice: 50,
        color: 'bg-purple-600',
        gradient: 'from-purple-600 to-purple-700',
        icon: '🥇',
        paymentLinks: {
            MONTHLY: {
                withoutDeemix: 'https://mpago.la/2XTWvVS',
                withDeemix: 'https://mpago.la/1mirRbP'
            },
            QUARTERLY: {
                withoutDeemix: 'https://mpago.la/1ve8zvF',
                withDeemix: 'https://mpago.la/25WFCs9'
            },
            SEMIANNUAL: {
                withoutDeemix: '', // Será fornecido
                withDeemix: '' // Será fornecido
            },
            ANNUAL: {
                withoutDeemix: '', // Será fornecido
                withDeemix: '' // Será fornecido
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

// Function to determine user's plan based on monthly value
const getUserPlan = (valor: number | null) => {
    if (!valor || valor < 35) {
        return null;
    }

    if (valor === 35) {
        return VIP_PLANS.BASICO;
    }

    if (valor === 42) {
        return VIP_PLANS.PADRAO;
    }

    if (valor === 50) {
        return VIP_PLANS.COMPLETO;
    }

    // For values above 50, consider as VIP COMPLETO
    if (valor > 50) {
        return VIP_PLANS.COMPLETO;
    }

    return null;
};

export default function PlansPage() {
    const { data: session } = useSession();
    const [userPlan, setUserPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<keyof typeof SUBSCRIPTION_PERIODS>('MONTHLY');
    const [includeDeemix, setIncludeDeemix] = useState(false);

    useEffect(() => {
        if (session?.user) {
            // Determine user's current plan
            const valor = session.user.valor;
            const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
            const currentPlan = getUserPlan(valorNumerico || null);
            setUserPlan(currentPlan);
        }
        setLoading(false);
    }, [session]);

    const getPlanPrice = (planKey: string, period: keyof typeof SUBSCRIPTION_PERIODS, includeDeemix: boolean) => {
        const plan = VIP_PLANS[planKey as keyof typeof VIP_PLANS];
        const periodConfig = SUBSCRIPTION_PERIODS[period];

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
        const plan = VIP_PLANS[planKey as keyof typeof VIP_PLANS];
        const periodLinks = plan.paymentLinks[period];

        if (!periodLinks) {
            return ''; // Link não disponível para este período
        }

        return includeDeemix ? periodLinks.withDeemix : periodLinks.withoutDeemix;
    };

    const handleSubscribe = (planKey: string, period: keyof typeof SUBSCRIPTION_PERIODS, includeDeemix: boolean) => {
        // Verificar se é o plano atual do usuário
        const currentPlan = getUserPlan(session?.user?.valor || null);
        const selectedPlan = VIP_PLANS[planKey as keyof typeof VIP_PLANS];

        // Calcular o valor total do plano selecionado (incluindo Deemix se aplicável)
        const selectedPlanTotalPrice = getPlanPrice(planKey, period, includeDeemix);
        const currentPlanTotalPrice = session?.user?.valor || 0;

        // Se for o mesmo plano do usuário E o valor total for igual
        if (currentPlan?.name === selectedPlan.name && Math.abs(selectedPlanTotalPrice - currentPlanTotalPrice) < 0.01) {
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
            const currentPlan = getUserPlan(session?.user?.valor || null);

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
            const currentPlan = getUserPlan(session?.user?.valor || null);

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

        // Para todos os outros planos, redirecionar para a calculadora
        window.location.href = '/planstoogle';
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#1B1C1D' }}>
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#1B1C1D' }}>
            <Header />
            <main className="container mx-auto px-4 py-8 pt-20">

                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="mb-8">
                        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                            Escolha Seu Plano VIP
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                            Acesso completo ao maior acervo de música eletrônica do Brasil.
                            Escolha o plano ideal para suas necessidades e comece a baixar hoje mesmo.
                        </p>
                    </div>
                </div>

                {/* Period Selection */}
                <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/20 rounded-2xl p-6 border border-gray-700/50 mb-8">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Período de Assinatura</h3>
                        <p className="text-gray-400">Escolha o período que melhor se adapta às suas necessidades</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(SUBSCRIPTION_PERIODS).map(([periodKey, period]) => (
                            <button
                                key={periodKey}
                                onClick={() => setSelectedPeriod(periodKey as keyof typeof SUBSCRIPTION_PERIODS)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${selectedPeriod === periodKey
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                    : 'border-gray-600 bg-gray-700/20 text-gray-300 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-semibold">{period.name}</span>
                                </div>
                                <div className="text-sm">
                                    {period.months} {period.months === 1 ? 'mês' : 'meses'}
                                </div>
                                {period.discount > 0 && (
                                    <div className="text-xs text-green-400 mt-1">
                                        {period.discount * 100}% OFF
                                    </div>
                                )}
                                {period.deemixFree && (
                                    <div className="text-xs text-purple-400 mt-1">
                                        Deemix Grátis
                                    </div>
                                )}
                                {period.deemixDiscount > 0 && !period.deemixFree && (
                                    <div className="text-xs text-purple-400 mt-1">
                                        Deemix {period.deemixDiscount * 100}% OFF
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Deemix Toggle */}
                <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-2xl p-6 border border-purple-500/30 mb-8">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">Incluir Deemix</h3>
                        <p className="text-gray-400">Download direto do Deezer em alta qualidade</p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <span className="text-sm text-gray-400">Sem Deemix</span>
                        <button
                            onClick={() => setIncludeDeemix(!includeDeemix)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${includeDeemix ? 'bg-purple-600' : 'bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${includeDeemix ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className="text-sm text-gray-400">Com Deemix</span>
                    </div>

                    {/* Deemix Info */}
                    {includeDeemix && (
                        <div className="mt-4 p-4 bg-purple-500/10 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                                <Music className="w-4 h-4" />
                                <span className="font-semibold">Deemix Incluído</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                Download direto do Deezer em FLAC/MP3 com ARL Premium incluído
                            </p>
                        </div>
                    )}
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {Object.entries(VIP_PLANS).map(([planKey, plan]) => {
                        const isCurrentPlan = userPlan?.name === plan.name;
                        const isHigherPlan =
                            (planKey === 'PADRAO' && userPlan?.name === 'VIP COMPLETO') ||
                            (planKey === 'BASICO' && (userPlan?.name === 'VIP PADRÃO' || userPlan?.name === 'VIP COMPLETO'));

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

                        // Calcular se é realmente o plano atual (considerando valor total)
                        const currentPlanTotalPrice = session?.user?.valor || 0;
                        const selectedPlanTotalPrice = getPlanPrice(planKey, selectedPeriod, includeDeemix);
                        const isActuallyCurrentPlan = userPlan?.name === plan.name && Math.abs(selectedPlanTotalPrice - currentPlanTotalPrice) < 0.01;

                        return (
                            <div
                                key={planKey}
                                className={`relative rounded-2xl p-8 transition-all duration-300 ${isActuallyCurrentPlan
                                    ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20'
                                    : 'bg-gradient-to-br from-gray-900/30 to-gray-800/20 border border-gray-700/50 hover:border-gray-600/50 hover:shadow-xl'
                                    }`}
                            >
                                {/* Current Plan Badge */}
                                {isActuallyCurrentPlan && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                                            PLANO ATUAL
                                        </div>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="text-center mb-8">
                                    <div className="text-4xl mb-4">{plan.icon}</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                                    {/* Period Badge */}
                                    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                                        <Clock className="w-4 h-4" />
                                        {periodConfig.name}
                                    </div>

                                    {/* Price Display */}
                                    <div className="mb-4">
                                        <div className="text-3xl font-bold text-white mb-1">
                                            R$ {currentPrice.toFixed(2).replace('.', ',')}
                                            <span className="text-lg text-gray-400 font-normal">/{periodConfig.name.toLowerCase()}</span>
                                        </div>

                                        {/* Price Breakdown */}
                                        {includeDeemix && !deemixFree && (
                                            <div className="text-xs text-gray-400 space-y-1">
                                                <div>Plano: R$ {(basePrice * periodConfig.months).toFixed(2).replace('.', ',')}</div>
                                                <div>Deemix: R$ {(deemixPrice * periodConfig.months).toFixed(2).replace('.', ',')}</div>
                                                <div className="text-blue-400">Deezer Premium: GRÁTIS</div>
                                                {periodConfig.deemixDiscount > 0 && (
                                                    <div className="text-green-400 font-semibold">
                                                        Desconto Deemix: {periodConfig.deemixDiscount * 100}%
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!includeDeemix && (
                                            <div className="text-xs text-gray-400 space-y-1">
                                                <div>Plano: R$ {(basePrice * periodConfig.months).toFixed(2).replace('.', ',')}</div>
                                                <div className="text-blue-400">Deezer Premium: R$ {(DEEZER_PREMIUM_PRICING.STANDALONE * periodConfig.months).toFixed(2).replace('.', ',')}</div>
                                            </div>
                                        )}

                                        {deemixFree && includeDeemix && (
                                            <div className="text-xs text-purple-400 font-semibold">
                                                🎁 Deemix + Deezer Premium Grátis no período!
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Benefits List */}
                                <div className="space-y-4 mb-8">
                                    {Object.entries(plan.benefits).map(([benefitKey, benefit]) => {
                                        // Highlight Deemix benefit when selected
                                        const isDeemixBenefit = benefitKey === 'deemixAccess';
                                        const isHighlighted = includeDeemix && isDeemixBenefit;
                                        const isFree = deemixFree && isDeemixBenefit;

                                        return (
                                            <div key={benefitKey} className={`flex items-center ${isHighlighted ? 'bg-purple-500/10 rounded-lg p-2' : ''}`}>
                                                <div className={`p-1 rounded-full mr-3 ${benefit.enabled || isHighlighted
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {benefit.enabled || isHighlighted ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <span className="text-xs">✕</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-300">
                                                        {BENEFIT_LABELS[benefitKey as keyof typeof BENEFIT_LABELS]}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {isFree ? 'Grátis no período' : isHighlighted ? 'Incluído no plano' : benefit.description}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Action Button */}
                                <div className="text-center">
                                    {isActuallyCurrentPlan ? (
                                        <button
                                            disabled
                                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold py-3 px-6 rounded-xl cursor-not-allowed"
                                        >
                                            PLANO ATUAL
                                        </button>
                                    ) : isHigherPlan ? (
                                        <button
                                            disabled
                                            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl cursor-not-allowed"
                                        >
                                            PLANO INFERIOR
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribe(planKey, selectedPeriod, includeDeemix)}
                                            className={`group w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer`}
                                        >
                                            {(() => {
                                                const currentPlan = getUserPlan(session?.user?.valor || null);
                                                const selectedPlan = VIP_PLANS[planKey as keyof typeof VIP_PLANS];

                                                // Calcular o valor total do plano selecionado (incluindo Deemix se aplicável)
                                                const selectedPlanTotalPrice = getPlanPrice(planKey, selectedPeriod, includeDeemix);
                                                const currentPlanTotalPrice = session?.user?.valor || 0;

                                                // Se for o mesmo plano do usuário E o valor total for igual
                                                if (currentPlan?.name === selectedPlan.name && Math.abs(selectedPlanTotalPrice - currentPlanTotalPrice) < 0.01) {
                                                    return 'PLANO ATUAL';
                                                }

                                                // Se for um plano inferior
                                                const planHierarchy = {
                                                    'BASICO': 1,
                                                    'PADRAO': 2,
                                                    'COMPLETO': 3
                                                };

                                                const currentPlanLevel = currentPlan ? planHierarchy[currentPlan.name.replace('VIP ', '') as keyof typeof planHierarchy] : 0;
                                                const selectedPlanLevel = planHierarchy[planKey as keyof typeof planHierarchy];

                                                if (selectedPlanLevel < currentPlanLevel) {
                                                    return 'DOWNGRADE';
                                                }

                                                // Se for um plano superior
                                                return 'UPGRADE';
                                            })()}
                                            <span className="hidden group-hover:inline-flex transition-all duration-200">
                                                <Hand className="w-5 h-5 ml-2" />
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Deemix Standalone Section */}
                <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-2xl p-8 border border-purple-500/30 mb-8">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Music className="w-8 h-8 text-purple-400" />
                            <h3 className="text-2xl font-bold text-white">Deemix Avulso</h3>
                        </div>
                        <p className="text-gray-300 text-lg">
                            Apenas o Deemix para download direto do Deezer
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-500/20">
                            <h4 className="text-xl font-bold text-white mb-4">Para Não-VIP</h4>
                            <div className="text-3xl font-bold text-white mb-2">
                                R$ {DEEMIX_PRICING.STANDALONE.toFixed(2).replace('.', ',')}
                                <span className="text-lg text-gray-400 font-normal">/mês</span>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300 mb-6">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Download direto do Deezer
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Qualidade FLAC/MP3
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Interface web moderna
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    ARL Premium incluído
                                </li>
                            </ul>
                            <button
                                onClick={() => window.location.href = '/planstoogle'}
                                className={`w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 ${(() => {
                                    const currentPlan = getUserPlan(session?.user?.valor || null);
                                    if (currentPlan?.name === 'VIP COMPLETO') {
                                        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed';
                                    }
                                    return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white';
                                })()
                                    }`}
                                disabled={(() => {
                                    const currentPlan = getUserPlan(session?.user?.valor || null);
                                    return currentPlan?.name === 'VIP COMPLETO';
                                })()}
                            >
                                {(() => {
                                    const currentPlan = getUserPlan(session?.user?.valor || null);
                                    const deemixPrice = DEEMIX_PRICING.STANDALONE;

                                    // Se o usuário não tem plano ou tem plano básico/padrão
                                    if (!currentPlan || currentPlan.name === 'VIP BÁSICO' || currentPlan.name === 'VIP PADRÃO') {
                                        return 'Calcular Deemix';
                                    }

                                    // Se o usuário tem plano completo, mostrar que já tem acesso
                                    if (currentPlan.name === 'VIP COMPLETO') {
                                        return 'ACESSO INCLUÍDO';
                                    }

                                    // Para outros casos, mostrar upgrade
                                    return 'Calcular Upgrade';
                                })()}
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                            <h4 className="text-xl font-bold text-white mb-4">Descontos VIP</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">VIP Básico:</span>
                                    <span className="text-green-400 font-semibold">35% OFF</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">VIP Padrão:</span>
                                    <span className="text-green-400 font-semibold">42% OFF</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">VIP Completo:</span>
                                    <span className="text-green-400 font-semibold">60% OFF</span>
                                </div>
                                <div className="border-t border-gray-600 pt-2 mt-2">
                                    <div className="text-xs text-gray-400 mb-2">Descontos Especiais:</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-xs">Semestral:</span>
                                        <span className="text-purple-400 font-semibold text-xs">50% OFF</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-xs">Anual:</span>
                                        <span className="text-purple-400 font-semibold text-xs">GRÁTIS</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                                <p className="text-sm text-green-300">
                                    <strong>💡 Dica:</strong> Seja VIP e aproveite descontos proporcionais ao valor do seu plano!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deemix Infrastructure Info Box */}
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-2xl p-8 border border-amber-500/30 mb-8">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Database className="w-8 h-8 text-amber-400" />
                            <h3 className="text-2xl font-bold text-white">Por que os preços do Deemix?</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20">
                            <h4 className="text-xl font-bold text-white mb-4">🏗️ Infraestrutura Robusta</h4>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <strong className="text-amber-400">Servidores Contabo:</strong> Hospedados na Alemanha com alta performance
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <strong className="text-amber-400">Pagamento em Euro:</strong> Custos elevados devido à cotação da moeda
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <strong className="text-amber-400">Processamento Remoto:</strong> Downloads processados no servidor, não na sua máquina
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <strong className="text-amber-400">Disponibilidade 24/7:</strong> Sistema sempre online e funcionando
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20">
                            <h4 className="text-xl font-bold text-white mb-4">💡 Por que não mais descontos?</h4>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <strong className="text-orange-400">Custos Fixos:</strong> Servidores potentes têm custos elevados e fixos
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <strong className="text-orange-400">Qualidade Garantida:</strong> Não comprometemos a performance por preços baixos
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <strong className="text-orange-400">Investimento Contínuo:</strong> Manutenção e atualizações constantes
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <strong className="text-orange-400">Experiência Premium:</strong> Você paga pela qualidade e confiabilidade
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                        <div className="text-center">
                            <p className="text-amber-300 font-semibold mb-2">🎯 Nossa Promessa</p>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                <strong>Não economizamos na qualidade!</strong> Nossos servidores robustos garantem que você tenha a melhor experiência possível.
                                O processamento pesado fica no nosso servidor, não na sua máquina, proporcionando downloads rápidos e confiáveis.
                                Os custos em Euro e a infraestrutura de ponta justificam o investimento em um serviço premium.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Allavsoft Section */}
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-500/30 mb-8">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Download className="w-8 h-8 text-green-400" />
                            <h3 className="text-2xl font-bold text-white">Allavsoft - Download Universal</h3>
                        </div>
                        <p className="text-gray-300 text-lg">
                            Download de vídeos e áudios de mais de 1000 sites
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                            <h4 className="text-xl font-bold text-white mb-4">Em Breve</h4>
                            <div className="text-3xl font-bold text-white mb-2">
                                <span className="text-yellow-400">AGOSTO 2025</span>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300 mb-6">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Download de vídeos/áudios
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    +1000 sites suportados
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Downloads em lote
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Interface intuitiva
                                </li>
                            </ul>
                            <Link href="/allavsoft" className="w-full">
                                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300">
                                    Saber Mais
                                </button>
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
                            <h4 className="text-xl font-bold text-white mb-4">Benefícios VIP</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">VIP Completo:</span>
                                    <span className="text-green-400 font-semibold">INCLUÍDO</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Outros Planos:</span>
                                    <span className="text-blue-400 font-semibold">EM BREVE</span>
                                </div>
                                <div className="border-t border-gray-600 pt-2 mt-2">
                                    <div className="text-xs text-gray-400 mb-2">Disponibilidade:</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-xs">Lançamento:</span>
                                        <span className="text-yellow-400 font-semibold text-xs">AGOSTO 2025</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                                <p className="text-sm text-blue-300">
                                    <strong>💡 Dica:</strong> Será incluído gratuitamente no plano VIP Completo!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deezer Premium Standalone Section */}
                <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-500/30 mb-16">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Headphones className="w-8 h-8 text-blue-400" />
                            <h3 className="text-2xl font-bold text-white">Deezer Premium Avulso</h3>
                        </div>
                        <p className="text-gray-300 text-lg">
                            Acesso premium ao Deezer para streaming de alta qualidade
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
                            <h4 className="text-xl font-bold text-white mb-4">Para Não-VIP</h4>
                            <div className="text-3xl font-bold text-white mb-2">
                                R$ {DEEZER_PREMIUM_PRICING.STANDALONE.toFixed(2).replace('.', ',')}
                                <span className="text-lg text-gray-400 font-normal">/mês</span>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300 mb-6">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Streaming sem anúncios
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Qualidade FLAC/320kbps
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Downloads offline
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-400" />
                                    Playlists personalizadas
                                </li>
                            </ul>
                            <button
                                onClick={() => window.location.href = '/planstoogle'}
                                className={`w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 ${(() => {
                                    const currentPlan = getUserPlan(session?.user?.valor || null);
                                    if (currentPlan?.name === 'VIP COMPLETO') {
                                        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed';
                                    }
                                    return 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white';
                                })()
                                    }`}
                                disabled={(() => {
                                    const currentPlan = getUserPlan(session?.user?.valor || null);
                                    return currentPlan?.name === 'VIP COMPLETO';
                                })()}
                            >
                                {(() => {
                                    const currentPlan = getUserPlan(session?.user?.valor || null);
                                    const deezerPrice = DEEZER_PREMIUM_PRICING.STANDALONE;

                                    // Se o usuário não tem plano
                                    if (!currentPlan) {
                                        return 'Calcular Deezer';
                                    }

                                    // Se o usuário tem plano completo, mostrar que já tem acesso
                                    if (currentPlan.name === 'VIP COMPLETO') {
                                        return 'ACESSO INCLUÍDO';
                                    }

                                    // Para outros casos, mostrar upgrade
                                    return 'Calcular Upgrade';
                                })()}
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                            <h4 className="text-xl font-bold text-white mb-4">Benefícios VIP</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Com Deemix:</span>
                                    <span className="text-green-400 font-semibold">GRÁTIS</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">VIP Completo:</span>
                                    <span className="text-green-400 font-semibold">INCLUÍDO</span>
                                </div>
                                <div className="border-t border-gray-600 pt-2 mt-2">
                                    <div className="text-xs text-gray-400 mb-2">Disponibilidade:</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-xs">Todos os planos:</span>
                                        <span className="text-blue-400 font-semibold text-xs">R$ 9,75/mês</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                                <p className="text-sm text-blue-300">
                                    <strong>💡 Dica:</strong> Incluído gratuitamente em todos os planos com Deemix!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/20 rounded-2xl p-8 border border-gray-700/50">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-4">Por que escolher nossos planos?</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-600/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                <Database className="h-6 w-6 text-blue-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Acervo Completo</h4>
                            <p className="text-gray-300 text-sm">Acesso a milhares de músicas eletrônicas de alta qualidade</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-600/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                <Download className="h-6 w-6 text-green-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Downloads Ilimitados</h4>
                            <p className="text-gray-300 text-sm">Baixe quantas músicas quiser, quando quiser</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-600/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-6 w-6 text-purple-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Comunidade Ativa</h4>
                            <p className="text-gray-300 text-sm">Conecte-se com DJs de todo o Brasil</p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="text-center mt-12">
                    <p className="text-gray-400 mb-4">
                        Precisa de ajuda para escolher o plano ideal?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/profile" className="w-full sm:w-auto flex justify-center">
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                                <User className="h-5 w-5" />
                                Meu Perfil
                            </button>
                        </Link>
                        <a
                            href="https://wa.me/5551935052274"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="h-5 w-5" />
                            Falar com Suporte
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
} 