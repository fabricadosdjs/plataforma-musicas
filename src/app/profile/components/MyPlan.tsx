"use client";

import { useSession } from "next-auth/react";
import {
    Crown,
    CheckCircle,
    XCircle,
    Star,
    Zap,
    Shield,
    Gift,
    Calendar,
    DollarSign,
    Award,
    TrendingUp,
    Users,
    Music,
    Download,
    Headphones,
    Globe,
    Lock,
    Unlock
} from 'lucide-react';

export default function MyPlan() {
    const { data: session } = useSession();

    const getVipStatus = () => {
        if (!session?.user) return { isVip: false, plan: 'Free', hasValidVencimento: false };

        const isVipByField = session.user.is_vip;
        const vencimento = (session.user as any).vencimento;
        const hasValidVencimento = vencimento && new Date(vencimento) > new Date();
        const isVipReal = isVipByField || hasValidVencimento;

        let plan = 'Free';
        if (isVipReal) {
            if ((session.user as any).plan) {
                plan = (session.user as any).plan;
            } else if (hasValidVencimento) {
                plan = 'BÁSICO';
            } else {
                plan = 'VIP';
            }
        }

        return { isVip: isVipReal, plan, hasValidVencimento, vencimento };
    };

    const vipStatus = getVipStatus();

    const getPlanFeatures = (plan: string) => {
        switch (plan) {
            case 'VIP FULL':
                return [
                    { feature: 'Downloads ilimitados', included: true, highlight: true },
                    { feature: 'Qualidade máxima (320kbps)', included: true, highlight: true },
                    { feature: 'Acesso a todas as ferramentas', included: true, highlight: true },
                    { feature: 'Suporte prioritário', included: true, highlight: true },
                    { feature: 'Sem anúncios', included: true, highlight: true },
                    { feature: 'Playlists personalizadas', included: true, highlight: true },
                    { feature: 'Sincronização entre dispositivos', included: true, highlight: true },
                    { feature: 'Acesso antecipado a novos recursos', included: true, highlight: true }
                ];
            case 'VIP STANDARD':
                return [
                    { feature: 'Downloads ilimitados', included: true, highlight: false },
                    { feature: 'Qualidade alta (256kbps)', included: true, highlight: false },
                    { feature: 'Acesso a ferramentas básicas', included: true, highlight: false },
                    { feature: 'Suporte por email', included: true, highlight: false },
                    { feature: 'Sem anúncios', included: true, highlight: false },
                    { feature: 'Playlists básicas', included: true, highlight: false },
                    { feature: 'Sincronização básica', included: false, highlight: false },
                    { feature: 'Acesso antecipado', included: false, highlight: false }
                ];
            case 'VIP BÁSICO':
                return [
                    { feature: 'Downloads limitados (100/mês)', included: true, highlight: false },
                    { feature: 'Qualidade padrão (192kbps)', included: true, highlight: false },
                    { feature: 'Acesso a ferramentas básicas', included: true, highlight: false },
                    { feature: 'Suporte por email', included: false, highlight: false },
                    { feature: 'Anúncios reduzidos', included: true, highlight: false },
                    { feature: 'Playlists básicas', included: false, highlight: false },
                    { feature: 'Sincronização', included: false, highlight: false },
                    { feature: 'Acesso antecipado', included: false, highlight: false }
                ];
            default:
                return [
                    { feature: 'Downloads limitados (10/mês)', included: false, highlight: false },
                    { feature: 'Qualidade baixa (128kbps)', included: true, highlight: false },
                    { feature: 'Acesso limitado às ferramentas', included: false, highlight: false },
                    { feature: 'Suporte por email', included: false, highlight: false },
                    { feature: 'Anúncios', included: true, highlight: false },
                    { feature: 'Playlists', included: false, highlight: false },
                    { feature: 'Sincronização', included: false, highlight: false },
                    { feature: 'Acesso antecipado', included: false, highlight: false }
                ];
        }
    };

    const features = getPlanFeatures(vipStatus.plan);

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-8 w-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
                    <p className="text-gray-400">Você precisa estar logado para acessar esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header da Página */}
            <div className="bg-gradient-to-r from-yellow-900/20 via-orange-900/20 to-red-900/20 border-b border-gray-800/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Meu Plano
                        </h1>
                        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl">
                            Gerencie seu plano VIP, veja benefícios e faça upgrade
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Status Atual do Plano */}
                <div className="mb-8">
                    <div className={`rounded-2xl p-6 border-2 ${vipStatus.isVip
                            ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                            : 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-500/30'
                        }`}>
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${vipStatus.isVip
                                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                                        : 'bg-gradient-to-br from-gray-500 to-slate-600'
                                    }`}>
                                    <Crown className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{vipStatus.plan}</h2>
                                    <p className="text-gray-400">
                                        {vipStatus.isVip ? 'Plano ativo' : 'Plano gratuito'}
                                    </p>
                                </div>
                            </div>

                            {vipStatus.hasValidVencimento && (
                                <div className="text-center lg:text-right">
                                    <p className="text-gray-400 text-sm">Vencimento</p>
                                    <p className="text-white font-bold text-lg">
                                        {new Date((session.user as any).vencimento).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comparação de Planos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Plano Atual */}
                    <div className="bg-black rounded-2xl p-6 border border-gray-800/50">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400" />
                            Seu Plano Atual
                        </h3>

                        <div className="space-y-3">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    {feature.included ? (
                                        <CheckCircle className={`h-5 w-5 ${feature.highlight ? 'text-green-400' : 'text-green-500'}`} />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <span className={`text-sm ${feature.included ? 'text-white' : 'text-gray-500'} ${feature.highlight ? 'font-semibold' : ''}`}>
                                        {feature.feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Próximo Nível */}
                    <div className="bg-black rounded-2xl p-6 border border-gray-800/50">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                            Próximo Nível
                        </h3>

                        {vipStatus.plan === 'VIP FULL' ? (
                            <div className="text-center py-8">
                                <Award className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                                <p className="text-white font-semibold">Você já tem o melhor plano!</p>
                                <p className="text-gray-400 text-sm">Aproveite todos os benefícios</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
                                    <h4 className="font-semibold text-white mb-2">VIP STANDARD</h4>
                                    <p className="text-gray-400 text-sm mb-3">Downloads ilimitados e qualidade alta</p>
                                    <button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
                                        Upgrade por R$ 19,90/mês
                                    </button>
                                </div>

                                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                                    <h4 className="font-semibold text-white mb-2">VIP FULL</h4>
                                    <p className="text-gray-400 text-sm mb-3">Máximo de benefícios e suporte prioritário</p>
                                    <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-700 transition-all duration-300">
                                        Upgrade por R$ 29,90/mês
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Benefícios Detalhados */}
                <div className="bg-black rounded-2xl p-6 border border-gray-800/50 mb-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-green-400" />
                        Benefícios do Seu Plano
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Download className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Downloads</h4>
                                <p className="text-gray-400 text-sm">
                                    {vipStatus.plan === 'VIP FULL' || vipStatus.plan === 'VIP STANDARD'
                                        ? 'Downloads ilimitados em alta qualidade'
                                        : vipStatus.plan === 'VIP BÁSICO'
                                            ? '100 downloads por mês'
                                            : '10 downloads por mês'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Music className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Qualidade</h4>
                                <p className="text-gray-400 text-sm">
                                    {vipStatus.plan === 'VIP FULL'
                                        ? 'Qualidade máxima (320kbps)'
                                        : vipStatus.plan === 'VIP STANDARD'
                                            ? 'Qualidade alta (256kbps)'
                                            : vipStatus.plan === 'VIP BÁSICO'
                                                ? 'Qualidade padrão (192kbps)'
                                                : 'Qualidade baixa (128kbps)'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Shield className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Segurança</h4>
                                <p className="text-gray-400 text-sm">
                                    {vipStatus.isVip
                                        ? 'Acesso seguro a todas as ferramentas'
                                        : 'Acesso limitado às ferramentas'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Headphones className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Suporte</h4>
                                <p className="text-gray-400 text-sm">
                                    {vipStatus.plan === 'VIP FULL'
                                        ? 'Suporte prioritário 24/7'
                                        : vipStatus.plan === 'VIP STANDARD'
                                            ? 'Suporte por email'
                                            : 'Suporte básico'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Globe className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Anúncios</h4>
                                <p className="text-gray-400 text-sm">
                                    {vipStatus.plan === 'VIP FULL' || vipStatus.plan === 'VIP STANDARD'
                                        ? 'Experiência sem anúncios'
                                        : vipStatus.plan === 'VIP BÁSICO'
                                            ? 'Anúncios reduzidos'
                                            : 'Anúncios normais'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Users className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Comunidade</h4>
                                <p className="text-gray-400 text-sm">
                                    {vipStatus.isVip
                                        ? 'Acesso à comunidade VIP exclusiva'
                                        : 'Acesso à comunidade básica'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {vipStatus.plan !== 'VIP FULL' && (
                        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 px-8 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105">
                            <Crown className="h-5 w-5" />
                            Fazer Upgrade
                        </button>
                    )}

                    <button className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-8 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300">
                        <Calendar className="h-5 w-5" />
                        Ver Histórico de Pagamentos
                    </button>
                </div>
            </div>
        </div>
    );
}
