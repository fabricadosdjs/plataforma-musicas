"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Check, Crown, Star, Zap, Music, Download, Users, Headphones, Database, Gift, CreditCard, User, MessageSquare, Hand, Calendar, Clock, Calculator, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

// Plan definitions (mesmo da página plans)
const VIP_PLANS = {
    BASICO: {
        name: 'VIP BÁSICO',
        basePrice: 35,
        color: 'bg-blue-600',
        gradient: 'from-blue-600 to-blue-700',
        icon: '🥉'
    },
    PADRAO: {
        name: 'VIP PADRÃO',
        basePrice: 42,
        color: 'bg-green-600',
        gradient: 'from-green-600 to-green-700',
        icon: '🥈'
    },
    COMPLETO: {
        name: 'VIP COMPLETO',
        basePrice: 50,
        color: 'bg-purple-600',
        gradient: 'from-purple-600 to-purple-700',
        icon: '🥇'
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

const DEEMIX_PRICING = {
    STANDALONE: 35,
    BASICO: {
        finalPrice: 22.75 // R$ 35 - 35% desconto
    },
    PADRAO: {
        finalPrice: 20.30 // R$ 35 - 42% desconto
    },
    COMPLETO: {
        finalPrice: 14.00 // R$ 35 - 60% desconto
    }
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

// Function to calculate pro-rata
const calculateProRata = (currentValue: number, newValue: number, daysUsed: number, totalDays: number = 30) => {
    const remainingDays = totalDays - daysUsed;
    const currentPlanRemainingValue = (currentValue / totalDays) * remainingDays;
    const newPlanValue = (newValue / totalDays) * remainingDays;

    return {
        currentPlanRemainingValue,
        newPlanValue,
        difference: newPlanValue - currentPlanRemainingValue,
        daysUsed,
        remainingDays
    };
};

export default function PlansTogglePage() {
    const { data: session } = useSession();
    const [userPlan, setUserPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<keyof typeof SUBSCRIPTION_PERIODS>('MONTHLY');
    const [includeDeemix, setIncludeDeemix] = useState(false);
    const [daysUsed, setDaysUsed] = useState(0);
    const [calculation, setCalculation] = useState<any>(null);

    useEffect(() => {
        if (session?.user) {
            const valor = session.user.valor;
            const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
            const currentPlan = getUserPlan(valorNumerico || null);
            setUserPlan(currentPlan);

            // Calcular dias usados baseado no vencimento
            if (session.user.vencimento) {
                const vencimento = new Date(session.user.vencimento);
                const hoje = new Date();
                const diffTime = vencimento.getTime() - hoje.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const daysUsed = Math.max(0, 30 - diffDays);
                setDaysUsed(daysUsed);
            }
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

        return (basePrice + deemixPrice) * periodConfig.months;
    };

    const calculateUpgrade = () => {
        if (!selectedPlan || !session?.user?.valor) return;

        const currentValue = session.user.valor as number;
        const newValue = getPlanPrice(selectedPlan, selectedPeriod, includeDeemix);

        const result = calculateProRata(currentValue, newValue, daysUsed);
        setCalculation({
            type: 'upgrade',
            currentPlan: userPlan,
            newPlan: VIP_PLANS[selectedPlan as keyof typeof VIP_PLANS],
            ...result
        });
    };

    const calculateDowngrade = () => {
        if (!selectedPlan || !session?.user?.valor) return;

        const currentValue = session.user.valor as number;
        const newValue = getPlanPrice(selectedPlan, selectedPeriod, includeDeemix);

        const result = calculateProRata(currentValue, newValue, daysUsed);
        setCalculation({
            type: 'downgrade',
            currentPlan: userPlan,
            newPlan: VIP_PLANS[selectedPlan as keyof typeof VIP_PLANS],
            ...result
        });
    };

    const handleCalculate = () => {
        if (!selectedPlan) return;

        const currentValue = session?.user?.valor || 0;
        const newValue = getPlanPrice(selectedPlan, selectedPeriod, includeDeemix);

        if (newValue > currentValue) {
            calculateUpgrade();
        } else if (newValue < currentValue) {
            calculateDowngrade();
        } else {
            setCalculation({
                type: 'same',
                message: 'Este é o mesmo plano que você já possui.'
            });
        }
    };

    const handleWhatsApp = () => {
        if (!calculation) return;

        let message = '';
        const periodConfig = SUBSCRIPTION_PERIODS[selectedPeriod];
        const plan = VIP_PLANS[selectedPlan as keyof typeof VIP_PLANS];

        if (calculation.type === 'upgrade') {
            message = `Olá! Gostaria de fazer upgrade do meu plano atual (${calculation.currentPlan.name} - R$ ${session?.user?.valor}) para ${calculation.newPlan.name}${includeDeemix ? ' + Deemix' : ''} ${periodConfig.name}.\n\n`;
            message += `📊 Cálculo Pro-Rata:\n`;
            message += `• Dias usados: ${calculation.daysUsed}\n`;
            message += `• Dias restantes: ${calculation.remainingDays}\n`;
            message += `• Valor a pagar: R$ ${calculation.difference.toFixed(2).replace('.', ',')}\n\n`;

            // Adicionar detalhamento completo
            message += `📋 Detalhamento do Novo Plano:\n`;
            message += `• Plano ${plan.name}: R$ ${plan.basePrice.toFixed(2).replace('.', ',')}/mês\n`;

            if (periodConfig.discount > 0) {
                message += `• Desconto ${periodConfig.discount * 100}%: -R$ ${(plan.basePrice * periodConfig.discount).toFixed(2).replace('.', ',')}/mês\n`;
            }

            if (includeDeemix) {
                message += `• Deemix: R$ 35,00/mês\n`;
                if (periodConfig.deemixFree) {
                    message += `• Deemix Grátis: -R$ 35,00/mês\n`;
                } else if (periodConfig.deemixDiscount > 0) {
                    message += `• Desconto Deemix ${periodConfig.deemixDiscount * 100}%: -R$ ${(35 * periodConfig.deemixDiscount).toFixed(2).replace('.', ',')}/mês\n`;
                }
                message += `• Deezer Premium: GRÁTIS (incluído com Deemix)\n`;
            } else {
                message += `• Deezer Premium: R$ 9,75/mês\n`;
            }

            message += `• Total ${periodConfig.name}: R$ ${getPlanPrice(selectedPlan, selectedPeriod, includeDeemix).toFixed(2).replace('.', ',')}\n\n`;
            message += `Por favor, me envie a chave PIX para este valor.`;
        } else if (calculation.type === 'downgrade') {
            message = `Olá! Gostaria de fazer downgrade do meu plano atual (${calculation.currentPlan.name} - R$ ${session?.user?.valor}) para ${calculation.newPlan.name}${includeDeemix ? ' + Deemix' : ''} ${periodConfig.name}.\n\n`;
            message += `📊 Cálculo Pro-Rata:\n`;
            message += `• Dias usados: ${calculation.daysUsed}\n`;
            message += `• Dias restantes: ${calculation.remainingDays}\n`;
            message += `• Crédito disponível: R$ ${Math.abs(calculation.difference).toFixed(2).replace('.', ',')}\n\n`;

            // Adicionar detalhamento completo
            message += `📋 Detalhamento do Novo Plano:\n`;
            message += `• Plano ${plan.name}: R$ ${plan.basePrice.toFixed(2).replace('.', ',')}/mês\n`;

            if (periodConfig.discount > 0) {
                message += `• Desconto ${periodConfig.discount * 100}%: -R$ ${(plan.basePrice * periodConfig.discount).toFixed(2).replace('.', ',')}/mês\n`;
            }

            if (includeDeemix) {
                message += `• Deemix: R$ 35,00/mês\n`;
                if (periodConfig.deemixFree) {
                    message += `• Deemix Grátis: -R$ 35,00/mês\n`;
                } else if (periodConfig.deemixDiscount > 0) {
                    message += `• Desconto Deemix ${periodConfig.deemixDiscount * 100}%: -R$ ${(35 * periodConfig.deemixDiscount).toFixed(2).replace('.', ',')}/mês\n`;
                }
                message += `• Deezer Premium: GRÁTIS (incluído com Deemix)\n`;
            } else {
                message += `• Deezer Premium: R$ 9,75/mês\n`;
            }

            message += `• Total ${periodConfig.name}: R$ ${getPlanPrice(selectedPlan, selectedPeriod, includeDeemix).toFixed(2).replace('.', ',')}\n\n`;
            message += `O novo plano entrará em vigor após o vencimento atual.`;
        }

        const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
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
                            Calculadora de Planos
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                            Calcule o valor exato para upgrade ou downgrade do seu plano com desconto pro-rata.
                        </p>
                    </div>
                </div>

                {/* Current Plan Info */}
                {userPlan && (
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/30 mb-8">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-white mb-4">Seu Plano Atual</h2>
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="text-4xl">{userPlan.icon}</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{userPlan.name}</h3>
                                    <p className="text-gray-400">R$ {session?.user?.valor}/mês</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-500/10 rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-400">{daysUsed}</div>
                                <div className="text-sm text-gray-400">Dias Usados</div>
                            </div>
                            <div className="bg-green-500/10 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-400">{30 - daysUsed}</div>
                                <div className="text-sm text-gray-400">Dias Restantes</div>
                            </div>
                            <div className="bg-purple-500/10 rounded-lg p-4">
                                <div className="text-2xl font-bold text-purple-400">
                                    R$ {((session?.user?.valor / 30) * (30 - daysUsed)).toFixed(2).replace('.', ',')}
                                </div>
                                <div className="text-sm text-gray-400">Valor Restante</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan Selection */}
                <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/20 rounded-2xl p-8 border border-gray-700/50 mb-8">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Selecione o Novo Plano</h3>
                        <p className="text-gray-400">Escolha para qual plano deseja migrar</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {Object.entries(VIP_PLANS).map(([planKey, plan]) => (
                            <button
                                key={planKey}
                                onClick={() => setSelectedPlan(planKey)}
                                className={`p-6 rounded-xl border-2 transition-all duration-300 ${selectedPlan === planKey
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                    : 'border-gray-600 bg-gray-700/20 text-gray-300 hover:border-gray-500'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{plan.icon}</div>
                                <div className="font-semibold">{plan.name}</div>
                                <div className="text-sm text-gray-400">R$ {plan.basePrice}/mês</div>
                            </button>
                        ))}
                    </div>

                    {/* Deemix Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-6">
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

                    {/* Period Selection */}
                    <div className="mb-6">
                        <h4 className="text-lg font-bold text-white mb-4 text-center">Período de Assinatura</h4>
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
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-semibold text-sm">{period.name}</span>
                                    </div>
                                    <div className="text-xs">
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

                    <div className="text-center">
                        <button
                            onClick={handleCalculate}
                            disabled={!selectedPlan}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                        >
                            <Calculator className="w-5 h-5" />
                            Calcular Valor
                        </button>
                    </div>
                </div>

                {/* Calculation Result */}
                {calculation && (
                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-500/30 mb-8">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {calculation.type === 'upgrade' ? '📈 Upgrade' : calculation.type === 'downgrade' ? '📉 Downgrade' : 'ℹ️ Mesmo Plano'}
                            </h3>
                        </div>

                        {calculation.type === 'same' ? (
                            <div className="text-center">
                                <p className="text-gray-300 text-lg">{calculation.message}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Plan Comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <ArrowDown className="w-5 h-5 text-blue-400" />
                                            Plano Atual
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Plano:</span>
                                                <span className="text-white font-semibold">{calculation.currentPlan.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Valor:</span>
                                                <span className="text-white font-semibold">R$ {session?.user?.valor}/mês</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Dias restantes:</span>
                                                <span className="text-white font-semibold">{calculation.remainingDays}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Valor restante:</span>
                                                <span className="text-white font-semibold">R$ {calculation.currentPlanRemainingValue.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <ArrowUp className="w-5 h-5 text-green-400" />
                                            Novo Plano
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Plano:</span>
                                                <span className="text-white font-semibold">{calculation.newPlan.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Valor:</span>
                                                <span className="text-white font-semibold">
                                                    R$ {getPlanPrice(selectedPlan, selectedPeriod, includeDeemix).toFixed(2).replace('.', ',')} / {SUBSCRIPTION_PERIODS[selectedPeriod].name.toLowerCase()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Dias restantes:</span>
                                                <span className="text-white font-semibold">{calculation.remainingDays}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Valor restante:</span>
                                                <span className="text-white font-semibold">R$ {calculation.newPlanValue.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Final Calculation */}
                                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-yellow-400" />
                                        {calculation.type === 'upgrade' ? 'Valor a Pagar' : 'Crédito Disponível'}
                                    </h4>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white mb-2">
                                            R$ {Math.abs(calculation.difference).toFixed(2).replace('.', ',')}
                                        </div>
                                        <p className="text-gray-300 mb-4">
                                            {calculation.type === 'upgrade'
                                                ? 'Este é o valor que você precisa pagar para fazer o upgrade'
                                                : 'Este valor será descontado do próximo pagamento'
                                            }
                                        </p>

                                        {/* Detailed Breakdown */}
                                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20 mb-4">
                                            <h5 className="text-sm font-bold text-blue-400 mb-3">📊 Detalhamento Completo</h5>
                                            <div className="space-y-2 text-xs text-gray-300">
                                                {(() => {
                                                    const periodConfig = SUBSCRIPTION_PERIODS[selectedPeriod];
                                                    const plan = VIP_PLANS[selectedPlan as keyof typeof VIP_PLANS];
                                                    const basePrice = plan.basePrice;
                                                    const discountedBasePrice = basePrice * (1 - periodConfig.discount);
                                                    const totalBasePrice = discountedBasePrice * periodConfig.months;

                                                    const deemixPricing = DEEMIX_PRICING[selectedPlan as keyof typeof DEEMIX_PRICING];
                                                    let deemixPrice = 0;
                                                    let deemixDays = 0;

                                                    if (includeDeemix && !periodConfig.deemixFree) {
                                                        if (typeof deemixPricing === 'object' && 'finalPrice' in deemixPricing) {
                                                            deemixPrice = deemixPricing.finalPrice * (1 - periodConfig.deemixDiscount);
                                                        } else if (typeof deemixPricing === 'number') {
                                                            deemixPrice = deemixPricing * (1 - periodConfig.deemixDiscount);
                                                        }
                                                        deemixDays = periodConfig.months * 30;
                                                    }

                                                    const deezerPrice = includeDeemix ? 0 : 9.75 * periodConfig.months;
                                                    const totalValue = totalBasePrice + (deemixPrice * periodConfig.months) + deezerPrice;

                                                    return (
                                                        <>
                                                            {/* Plano Base */}
                                                            <div className="flex justify-between">
                                                                <span>Plano {plan.name}:</span>
                                                                <span className="text-white font-semibold">R$ {basePrice.toFixed(2).replace('.', ',')}/mês</span>
                                                            </div>
                                                            {periodConfig.discount > 0 && (
                                                                <div className="flex justify-between text-green-400">
                                                                    <span>→ Desconto {periodConfig.discount * 100}%:</span>
                                                                    <span>-R$ {(basePrice * periodConfig.discount).toFixed(2).replace('.', ',')}/mês</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between">
                                                                <span>→ Valor com desconto:</span>
                                                                <span className="text-white font-semibold">R$ {discountedBasePrice.toFixed(2).replace('.', ',')}/mês</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>→ Total {periodConfig.months} {periodConfig.months === 1 ? 'mês' : 'meses'}:</span>
                                                                <span className="text-white font-semibold">R$ {totalBasePrice.toFixed(2).replace('.', ',')}</span>
                                                            </div>

                                                            {/* Deemix */}
                                                            {includeDeemix && (
                                                                <>
                                                                    <div className="border-t border-gray-600 pt-2 mt-2">
                                                                        <div className="flex justify-between">
                                                                            <span>Deemix:</span>
                                                                            <span className="text-white font-semibold">R$ 35,00/mês</span>
                                                                        </div>
                                                                        {periodConfig.deemixFree ? (
                                                                            <div className="flex justify-between text-purple-400">
                                                                                <span>→ Deemix Grátis:</span>
                                                                                <span>-R$ 35,00/mês</span>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <div className="flex justify-between text-purple-400">
                                                                                    <span>→ Desconto {periodConfig.deemixDiscount * 100}%:</span>
                                                                                    <span>-R$ {(35 * periodConfig.deemixDiscount).toFixed(2).replace('.', ',')}/mês</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>→ Valor com desconto:</span>
                                                                                    <span className="text-white font-semibold">R$ {deemixPrice.toFixed(2).replace('.', ',')}/mês</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>→ Total {periodConfig.months} {periodConfig.months === 1 ? 'mês' : 'meses'}:</span>
                                                                                    <span className="text-white font-semibold">R$ {(deemixPrice * periodConfig.months).toFixed(2).replace('.', ',')}</span>
                                                                                </div>
                                                                                <div className="flex justify-between text-purple-400">
                                                                                    <span>→ Dias Deemix:</span>
                                                                                    <span>{deemixDays} dias</span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* Deezer Premium */}
                                                            <div className="border-t border-gray-600 pt-2 mt-2">
                                                                <div className="flex justify-between">
                                                                    <span>Deezer Premium:</span>
                                                                    <span className="text-white font-semibold">R$ 9,75/mês</span>
                                                                </div>
                                                                {includeDeemix ? (
                                                                    <div className="flex justify-between text-blue-400">
                                                                        <span>→ Incluído com Deemix:</span>
                                                                        <span>GRÁTIS</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex justify-between">
                                                                        <span>→ Total {periodConfig.months} {periodConfig.months === 1 ? 'mês' : 'meses'}:</span>
                                                                        <span className="text-white font-semibold">R$ {deezerPrice.toFixed(2).replace('.', ',')}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Total */}
                                                            <div className="border-t border-gray-600 pt-2 mt-2">
                                                                <div className="flex justify-between text-lg font-bold text-white">
                                                                    <span>TOTAL {periodConfig.name}:</span>
                                                                    <span>R$ {totalValue.toFixed(2).replace('.', ',')}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Discount Info */}
                                        {(() => {
                                            const periodConfig = SUBSCRIPTION_PERIODS[selectedPeriod];
                                            const hasDiscount = periodConfig.discount > 0;
                                            const hasDeemixDiscount = periodConfig.deemixDiscount > 0;
                                            const hasDeemixFree = periodConfig.deemixFree;

                                            if (hasDiscount || hasDeemixDiscount || hasDeemixFree) {
                                                return (
                                                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                                                        <h5 className="text-sm font-bold text-green-400 mb-2">🎁 Benefícios do Período</h5>
                                                        <div className="space-y-1 text-xs text-gray-300">
                                                            {hasDiscount && (
                                                                <div className="flex justify-between">
                                                                    <span>Desconto no plano:</span>
                                                                    <span className="text-green-400 font-semibold">{periodConfig.discount * 100}% OFF</span>
                                                                </div>
                                                            )}
                                                            {hasDeemixDiscount && !hasDeemixFree && (
                                                                <div className="flex justify-between">
                                                                    <span>Desconto Deemix:</span>
                                                                    <span className="text-purple-400 font-semibold">{periodConfig.deemixDiscount * 100}% OFF</span>
                                                                </div>
                                                            )}
                                                            {hasDeemixFree && (
                                                                <div className="flex justify-between">
                                                                    <span>Deemix:</span>
                                                                    <span className="text-purple-400 font-semibold">GRÁTIS</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>

                                {/* WhatsApp Button */}
                                <div className="text-center">
                                    <button
                                        onClick={handleWhatsApp}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Solicitar Chave PIX via WhatsApp
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Back to Plans */}
                <div className="text-center">
                    <Link href="/plans" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300">
                        <ArrowDown className="w-5 h-5" />
                        Voltar para Planos
                    </Link>
                </div>
            </main>
        </div>
    );
} 