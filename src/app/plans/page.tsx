"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Check, Crown, Star, Zap, Music, Download, Users, Headphones, Database, Gift, CreditCard, User, MessageSquare, Hand } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

// Plan definitions (updated with new pricing and benefits)
const VIP_BENEFITS = {
    BASICO: {
        dailyDownloads: { enabled: true, limit: 50, description: '50 músicas/dia' },
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 4, description: 'Até 4 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 7, description: 'Até 7 por semana' },
        deezerPremium: { enabled: false, description: '(Avulso: R$ 9,75)' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 22,75/mês' },
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
        deezerPremium: { enabled: false, description: '(Avulso: R$ 9,75)' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 20,30/mês' },
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
        deezerPremium: { enabled: true, description: 'Sim' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 14,00/mês' },
        arlPremium: { enabled: true, description: 'Sim (automático se Deemix)' },
        musicProduction: { enabled: true, description: 'Sim' }
    }
} as const;

const VIP_PLANS = {
    BASICO: {
        name: 'VIP BÁSICO',
        price: 35,
        color: 'bg-blue-600',
        gradient: 'from-blue-600 to-blue-700',
        icon: '🥉',
        paymentLink: 'https://mpago.la/28HWukZ',
        benefits: VIP_BENEFITS.BASICO
    },
    PADRAO: {
        name: 'VIP PADRÃO',
        price: 42,
        color: 'bg-green-600',
        gradient: 'from-green-600 to-green-700',
        icon: '🥈',
        paymentLink: 'https://mpago.la/1aFWE4k',
        benefits: VIP_BENEFITS.PADRAO
    },
    COMPLETO: {
        name: 'VIP COMPLETO',
        price: 50,
        color: 'bg-purple-600',
        gradient: 'from-purple-600 to-purple-700',
        icon: '🥇',
        paymentLink: 'https://mpago.la/2XTWvVS',
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

    const handleSubscribe = (plan: any) => {
        if (plan.paymentLink) {
            // Abrir link de pagamento do Mercado Pago
            window.open(plan.paymentLink, '_blank');

            // Mostrar mensagem sobre envio do comprovante
            setTimeout(() => {
                const whatsappMessage = `Olá! Acabei de realizar o pagamento do plano ${plan.name} (R$ ${plan.price.toFixed(2).replace('.', ',')}) e gostaria de enviar o comprovante para iniciar o cadastro e liberação da plataforma.`;
                const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(whatsappMessage)}`;

                const confirmed = confirm(
                    `Pagamento iniciado!\n\nApós realizar o pagamento, envie o comprovante para nosso WhatsApp +55 51 9 3505-2274 para iniciarmos o cadastro e liberação da plataforma.\n\nDeseja abrir o WhatsApp agora?`
                );

                if (confirmed) {
                    window.open(whatsappUrl, '_blank');
                }
            }, 1000);
        } else {
            // Para planos personalizados, direcionar direto ao WhatsApp
            const whatsappMessage = `Olá! Tenho interesse no plano ${plan.name}. Podem me ajudar?`;
            const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
        }
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
                        const isHigherPlan =
                            (planKey === 'PADRAO' && userPlan?.name === 'VIP COMPLETO') ||
                            (planKey === 'BASICO' && (userPlan?.name === 'VIP PADRÃO' || userPlan?.name === 'VIP COMPLETO'));

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
                                        R$ {plan.price.toFixed(2).replace('.', ',')}
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
                                            onClick={() => handleSubscribe(plan)}
                                            className={`group w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer`}
                                        >
                                            Assinar Plano
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