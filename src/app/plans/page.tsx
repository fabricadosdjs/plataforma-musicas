"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Check, Crown, Star, Zap, Music, Download, Users, Headphones, Database, Gift, CreditCard, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

// Plan definitions (same as admin/users)
const VIP_BENEFITS = {
    BASICO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 4, minLimit: 4, maxLimit: 10, description: 'Até 4 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 7, minLimit: 7, maxLimit: 15, description: 'Até 7 por semana' },
        deezerPremium: { enabled: false, description: 'Não disponível' },
        deemixDiscount: { enabled: false, percentage: 0, description: 'Não disponível' },
        arlPremium: { enabled: false, description: 'Não disponível' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    PADRAO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 6, minLimit: 4, maxLimit: 10, description: 'Até 6 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 9, minLimit: 7, maxLimit: 15, description: 'Até 9 por semana' },
        deezerPremium: { enabled: true, description: 'Sim' },
        deemixDiscount: { enabled: true, percentage: 15, description: 'Sim' },
        arlPremium: { enabled: true, description: 'Sim (automático se Deemix)' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    COMPLETO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 8, minLimit: 4, maxLimit: 10, description: 'Até 8 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: -1, minLimit: 7, maxLimit: 15, description: 'Ilimitado (máx. 4 por dia)' },
        deezerPremium: { enabled: true, description: 'Sim' },
        deemixDiscount: { enabled: true, percentage: 15, description: 'Sim' },
        arlPremium: { enabled: true, description: 'Sim (automático se Deemix)' },
        musicProduction: { enabled: true, description: 'Sim' }
    }
} as const;

const VIP_PLANS = {
    BASICO: {
        name: 'VIP BÁSICO',
        minValue: 30,
        maxValue: 35,
        color: 'bg-blue-600',
        gradient: 'from-blue-600 to-blue-700',
        icon: '🥉',
        benefits: VIP_BENEFITS.BASICO
    },
    PADRAO: {
        name: 'VIP PADRÃO',
        minValue: 36,
        maxValue: 42,
        color: 'bg-green-600',
        gradient: 'from-green-600 to-green-700',
        icon: '🥈',
        benefits: VIP_BENEFITS.PADRAO
    },
    COMPLETO: {
        name: 'VIP COMPLETO',
        minValue: 43,
        maxValue: 60,
        color: 'bg-purple-600',
        gradient: 'from-purple-600 to-purple-700',
        icon: '🥇',
        benefits: VIP_BENEFITS.COMPLETO
    }
} as const;

const BENEFIT_LABELS = {
    driveAccess: '📁 Acesso ao Drive Mensal (desde 2023)',
    packRequests: '🎚️ Solicitação de Packs',
    individualContent: '📦 Conteúdos Avulsos',
    extraPacks: '🔥 Packs Extras',
    playlistDownloads: '🎵 Download de Playlists',
    deezerPremium: '🎁 Deezer Premium Grátis',
    deemixDiscount: '💸 15% de Desconto no Deemix',
    arlPremium: '🔐 ARL Premium para Deemix',
    musicProduction: '🎼 Produção da sua Música'
} as const;

// Function to determine user's plan based on monthly value
const getUserPlan = (valor: number | null) => {
    if (!valor || valor < VIP_PLANS.BASICO.minValue) {
        return null;
    }

    if (valor >= VIP_PLANS.BASICO.minValue && valor <= VIP_PLANS.BASICO.maxValue) {
        return VIP_PLANS.BASICO;
    }

    if (valor >= VIP_PLANS.PADRAO.minValue && valor <= VIP_PLANS.PADRAO.maxValue) {
        return VIP_PLANS.PADRAO;
    }

    if (valor >= VIP_PLANS.COMPLETO.minValue && valor <= VIP_PLANS.COMPLETO.maxValue) {
        return VIP_PLANS.COMPLETO;
    }

    // For values above maximum, consider as VIP COMPLETO
    if (valor > VIP_PLANS.COMPLETO.maxValue) {
        return VIP_PLANS.COMPLETO;
    }

    return null;
};

export default function PlansPage() {
    const { data: session } = useSession();
    const [userPlan, setUserPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    const handleSubscribe = (planKey: string) => {
        // TODO: Implement subscription logic
        alert(`Funcionalidade de assinatura para ${planKey} será implementada em breve!`);
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

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {Object.entries(VIP_PLANS).map(([planKey, plan]) => {
                        const isCurrentPlan = userPlan?.name === plan.name;
                        const isHigherPlan = userPlan &&
                            (planKey === 'PADRAO' && userPlan.name === 'VIP COMPLETO') ||
                            (planKey === 'BASICO' && (userPlan.name === 'VIP PADRÃO' || userPlan.name === 'VIP COMPLETO'));

                        return (
                            <div
                                key={planKey}
                                className={`relative rounded-2xl p-8 transition-all duration-300 ${isCurrentPlan
                                        ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20'
                                        : 'bg-gradient-to-br from-gray-900/30 to-gray-800/20 border border-gray-700/50 hover:border-gray-600/50 hover:shadow-xl'
                                    }`}
                            >
                                {/* Current Plan Badge */}
                                {isCurrentPlan && (
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
                                    <div className="text-3xl font-bold text-white mb-2">
                                        R$ {plan.minValue}-{plan.maxValue}
                                        <span className="text-lg text-gray-400 font-normal">/mês</span>
                                    </div>
                                </div>

                                {/* Benefits List */}
                                <div className="space-y-4 mb-8">
                                    {Object.entries(plan.benefits).map(([benefitKey, benefit]) => (
                                        <div key={benefitKey} className="flex items-center">
                                            <div className={`p-1 rounded-full mr-3 ${benefit.enabled
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {benefit.enabled ? (
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
                                                    {benefit.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <div className="text-center">
                                    {isCurrentPlan ? (
                                        <button
                                            disabled
                                            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl cursor-not-allowed"
                                        >
                                            Plano Atual
                                        </button>
                                    ) : isHigherPlan ? (
                                        <button
                                            disabled
                                            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl cursor-not-allowed"
                                        >
                                            Plano Inferior
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribe(planKey)}
                                            className={`w-full bg-gradient-to-r ${plan.gradient} hover:from-${plan.color.replace('bg-', '')}-700 hover:to-${plan.color.replace('bg-', '')}-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl`}
                                        >
                                            Assinar Plano
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/profile">
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                                <User className="h-5 w-5" />
                                Ver Meu Perfil
                            </button>
                        </Link>
                        <a
                            href="https://wa.me/5511999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
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