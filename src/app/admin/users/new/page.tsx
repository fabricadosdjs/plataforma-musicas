"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, User, Settings, Shield, Mail, Smartphone, Lock, Calendar, DollarSign, Check, AlertCircle, Loader2 } from 'lucide-react';
import { AdminAuth } from '@/components/admin/AdminAuth';

// Definição completa dos planos e variações disponíveis
const ALL_PLANS = {
    // ========== PLANOS VIP PRINCIPAIS ==========
    'VIP_BASICO': {
        name: '🥉 VIP BÁSICO',
        baseValue: 38,
        description: 'Plano básico com downloads ilimitados',
        category: 'VIP',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 38 },
            trimestral: { multiplier: 3, discount: 0.05, total: 108.30 },
            semestral: { multiplier: 6, discount: 0.15, total: 193.80 },
            anual: { multiplier: 12, discount: 0.15, total: 387.60 }
        }
    },
    'VIP_PADRAO': {
        name: '🥈 VIP PADRÃO',
        baseValue: 42,
        description: 'Plano intermediário com recursos avançados',
        category: 'VIP',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 42 },
            trimestral: { multiplier: 3, discount: 0.05, total: 119.70 },
            semestral: { multiplier: 6, discount: 0.15, total: 214.20 },
            anual: { multiplier: 12, discount: 0.15, total: 428.40 }
        }
    },
    'VIP_COMPLETO': {
        name: '🥇 VIP COMPLETO',
        baseValue: 60,
        description: 'Plano completo com todos os recursos',
        category: 'VIP',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 60 },
            trimestral: { multiplier: 3, discount: 0.05, total: 171.00 },
            semestral: { multiplier: 6, discount: 0.15, total: 306.00 },
            anual: { multiplier: 12, discount: 0.15, total: 612.00 }
        }
    },

    // ========== PLANOS VIP + DEEMIX ==========
    'VIP_BASICO_DEEMIX': {
        name: '🥉 VIP BÁSICO + DEEMIX',
        baseValue: 61.56,
        description: 'VIP Básico + Deemix (R$ 23,56)',
        category: 'VIP_DEEMIX',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 61.56 },
            trimestral: { multiplier: 3, discount: 0.05, total: 168.47 },
            semestral: { multiplier: 6, discount: 0.15, total: 232.68 },
            anual: { multiplier: 12, discount: 0.15, total: 387.60, deemixFree: true }
        }
    },
    'VIP_PADRAO_DEEMIX': {
        name: '🥈 VIP PADRÃO + DEEMIX',
        baseValue: 64.04,
        description: 'VIP Padrão + Deemix (R$ 22,04)',
        category: 'VIP_DEEMIX',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 64.04 },
            trimestral: { multiplier: 3, discount: 0.05, total: 175.31 },
            semestral: { multiplier: 6, discount: 0.15, total: 253.32 },
            anual: { multiplier: 12, discount: 0.15, total: 428.40, deemixFree: true }
        }
    },
    'VIP_COMPLETO_DEEMIX': {
        name: '🥇 VIP COMPLETO + DEEMIX',
        baseValue: 75.20,
        description: 'VIP Completo + Deemix (R$ 15,20)',
        category: 'VIP_DEEMIX',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 75.20 },
            trimestral: { multiplier: 3, discount: 0.05, total: 204.19 },
            semestral: { multiplier: 6, discount: 0.15, total: 327.60 },
            anual: { multiplier: 12, discount: 0.15, total: 612.00, deemixFree: true }
        }
    },

    // ========== SERVIÇOS AVULSOS ==========
    'DEEMIX_AVULSO': {
        name: '🎵 DEEMIX AVULSO',
        baseValue: 38,
        description: 'Deemix avulso (não-VIP)',
        category: 'AVULSO',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 38 }
        }
    },
    'DEEZER_PREMIUM_AVULSO': {
        name: '🎧 DEEZER PREMIUM AVULSO',
        baseValue: 9.75,
        description: 'Deezer Premium avulso',
        category: 'AVULSO',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 9.75 }
        }
    }
};

interface NewUserData {
    // Dados básicos
    name: string;
    whatsapp: string;
    email: string;
    password: string;

    // Plano e pagamento
    planType: string;
    period: string;
    planName: string;
    valor: number;
    status: string;
    dataPagamento: string;
    vencimento: string;

    // Add-ons e benefícios
    deemix: boolean;
    is_vip: boolean;
    isUploader: boolean;

    // Deezer Premium
    deezerPremium: boolean;
    deezerEmail: string;
    deezerPassword: string;
}

const INITIAL_USER_DATA: NewUserData = {
    name: '',
    whatsapp: '',
    email: '',
    password: '',
    planType: '',
    period: '',
    planName: '',
    valor: 0,
    status: 'ativo',
    dataPagamento: new Date().toISOString().split('T')[0],
    vencimento: '',
    deemix: false,
    is_vip: false,
    isUploader: false,
    deezerPremium: false,
    deezerEmail: '',
    deezerPassword: ''
};

export default function NewUserPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [userData, setUserData] = useState<NewUserData>(INITIAL_USER_DATA);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = [
        { id: 1, title: 'Dados Básicos', icon: User },
        { id: 2, title: 'Plano & Pagamento', icon: DollarSign },
        { id: 3, title: 'Add-ons & Benefícios', icon: Settings },
        { id: 4, title: 'Deezer Premium', icon: Shield }
    ];

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!userData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!userData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp é obrigatório';
        if (!userData.email.trim()) newErrors.email = 'Email é obrigatório';
        if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = 'Email inválido';
        if (!userData.password.trim()) newErrors.password = 'Senha é obrigatória';
        if (userData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!userData.planType) newErrors.planType = 'Selecione um plano VIP';
        if (!userData.period) newErrors.period = 'Selecione um período';
        if (!userData.dataPagamento) newErrors.dataPagamento = 'Data do pagamento é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = true;

        if (currentStep === 1) {
            isValid = validateStep1();
        } else if (currentStep === 2) {
            isValid = validateStep2();
            // Calcular valor e vencimento automaticamente
            if (isValid && userData.planType && userData.period && userData.dataPagamento) {
                const plan = ALL_PLANS[userData.planType as keyof typeof ALL_PLANS];
                const period = plan?.periods[userData.period as keyof typeof plan.periods];

                if (plan && period) {
                    let valorFinal = period.total;

                    // Adicionar Deezer Premium se selecionado
                    if (userData.deezerPremium) {
                        valorFinal += 9.75 * period.multiplier;
                    }

                    // Calcular vencimento automaticamente
                    const dataPagamento = new Date(userData.dataPagamento);
                    let meses = 1;
                    if (userData.period === 'trimestral') meses = 3;
                    else if (userData.period === 'semestral') meses = 6;
                    else if (userData.period === 'anual') meses = 12;

                    const vencimento = new Date(dataPagamento);
                    vencimento.setMonth(vencimento.getMonth() + meses);

                    // Construir nome do plano
                    let planNameParts = [];
                    if (plan.name.includes('BÁSICO')) planNameParts.push('🥉 VIP BÁSICO');
                    else if (plan.name.includes('PADRÃO')) planNameParts.push('🥈 VIP PADRÃO');
                    else if (plan.name.includes('COMPLETO')) planNameParts.push('🥇 VIP COMPLETO');

                    planNameParts.push(userData.period.charAt(0).toUpperCase() + userData.period.slice(1));

                    if (userData.deemix && !(period as any).deemixFree) {
                        planNameParts.push('+ DEEMIX');
                    } else if (userData.deemix && (period as any).deemixFree) {
                        planNameParts.push('+ DEEMIX (GRÁTIS!)');
                    }

                    if (userData.isUploader) {
                        planNameParts.push('+ UPLOADER (GRÁTIS)');
                    }

                    if (userData.deezerPremium) {
                        planNameParts.push('+ DEEZER PREMIUM');
                    }

                    const planName = planNameParts.join(' - ');

                    setUserData(prev => ({
                        ...prev,
                        valor: valorFinal,
                        planName: planName,
                        vencimento: vencimento.toISOString().split('T')[0]
                    }));
                }
            }
        }

        if (isValid && currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...userData,
                    planName: userData.planName,
                    planType: userData.planType,
                    vencimento: userData.vencimento,
                    deemix: userData.deemix,
                    isUploader: userData.isUploader,
                    deezerPremium: userData.deezerPremium,
                    deezerEmail: userData.deezerEmail,
                    deezerPassword: userData.deezerPassword
                }),
            });

            if (response.ok) {
                router.push('/admin/users?message=user-created');
            } else {
                const error = await response.json();
                setErrors({ submit: (error as Error).message || 'Erro ao criar usuário' });
            }
        } catch (error) {
            setErrors({ submit: 'Erro de conexão' });
        } finally {
            setLoading(false);
        }
    };

    const updateUserData = (field: keyof NewUserData, value: any) => {
        setUserData(prev => ({ ...prev, [field]: value }));
        // Limpar erro do campo quando ele for editado
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <AdminAuth>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => router.push('/admin/users')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Voltar para Usuários
                        </button>

                        <h1 className="text-3xl font-bold text-white">Criar Novo Usuário</h1>
                        <div className="w-32"></div> {/* Spacer */}
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-12">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= step.id
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-600 text-gray-400'
                                        }`}>
                                        {currentStep > step.id ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            <step.icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <span className={`mt-2 text-sm ${currentStep >= step.id ? 'text-white' : 'text-gray-400'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-600'
                                        }`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
                        {/* Step 1: Dados Básicos */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">Dados Básicos</h2>
                                    <p className="text-gray-400">Informações pessoais do usuário</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome *
                                        </label>
                                        <input
                                            type="text"
                                            value={userData.name}
                                            onChange={(e) => updateUserData('name', e.target.value)}
                                            className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                            placeholder="Nome completo do usuário"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            WhatsApp *
                                        </label>
                                        <input
                                            type="text"
                                            value={userData.whatsapp}
                                            onChange={(e) => updateUserData('whatsapp', e.target.value)}
                                            className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.whatsapp ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                            placeholder="(11) 99999-9999"
                                        />
                                        {errors.whatsapp && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.whatsapp}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={userData.email}
                                            onChange={(e) => updateUserData('email', e.target.value)}
                                            className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                            placeholder="usuario@exemplo.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Senha *
                                        </label>
                                        <input
                                            type="password"
                                            value={userData.password}
                                            onChange={(e) => updateUserData('password', e.target.value)}
                                            className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Plano & Pagamento */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <DollarSign className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">Plano & Pagamento</h2>
                                    <p className="text-gray-400">Configure o plano VIP e período de cobrança</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 1ª SEÇÃO: DEFINIR O PLANO VIP */}
                                    <div className="md:col-span-2 group">
                                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                                            <label className="block text-lg font-bold text-green-400 mb-4 flex items-center gap-3">
                                                <span className="text-2xl">🎯</span>
                                                1ª SEÇÃO: DEFINIR O PLANO VIP
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* VIP BÁSICO */}
                                                <div
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.planType === 'VIP_BASICO' || userData.planType === 'VIP_BASICO_DEEMIX'
                                                        ? 'border-green-500 bg-green-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-green-400/50'
                                                        }`}
                                                    onClick={() => {
                                                        if (userData.planType === 'VIP_BASICO_DEEMIX') {
                                                            updateUserData('planType', 'VIP_BASICO_DEEMIX');
                                                        } else {
                                                            updateUserData('planType', 'VIP_BASICO');
                                                        }
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">🥉</div>
                                                        <div className="font-bold text-white">VIP BÁSICO</div>
                                                        <div className="text-sm text-gray-400">R$ 38,00/mês</div>
                                                    </div>
                                                </div>

                                                {/* VIP PADRÃO */}
                                                <div
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.planType === 'VIP_PADRAO' || userData.planType === 'VIP_PADRAO_DEEMIX'
                                                        ? 'border-green-500 bg-green-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-green-400/50'
                                                        }`}
                                                    onClick={() => {
                                                        if (userData.planType === 'VIP_PADRAO_DEEMIX') {
                                                            updateUserData('planType', 'VIP_PADRAO_DEEMIX');
                                                        } else {
                                                            updateUserData('planType', 'VIP_PADRAO');
                                                        }
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">🥈</div>
                                                        <div className="font-bold text-white">VIP PADRÃO</div>
                                                        <div className="text-sm text-gray-400">R$ 42,00/mês</div>
                                                    </div>
                                                </div>

                                                {/* VIP COMPLETO */}
                                                <div
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.planType === 'VIP_COMPLETO' || userData.planType === 'VIP_COMPLETO_DEEMIX'
                                                        ? 'border-green-500 bg-green-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-green-400/50'
                                                        }`}
                                                    onClick={() => {
                                                        if (userData.planType === 'VIP_COMPLETO_DEEMIX') {
                                                            updateUserData('planType', 'VIP_COMPLETO_DEEMIX');
                                                        } else {
                                                            updateUserData('planType', 'VIP_COMPLETO');
                                                        }
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">🥇</div>
                                                        <div className="font-bold text-white">VIP COMPLETO</div>
                                                        <div className="text-sm text-gray-400">R$ 60,00/mês</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2ª SEÇÃO: ESCOLHER O PERÍODO */}
                                    <div className="md:col-span-2 group">
                                        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
                                            <label className="block text-lg font-bold text-blue-400 mb-4 flex items-center gap-3">
                                                <span className="text-2xl">📅</span>
                                                2ª SEÇÃO: ESCOLHER O PERÍODO
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {/* Mensal */}
                                                <div
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.period === 'mensal'
                                                        ? 'border-blue-500 bg-blue-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-blue-400/50'
                                                        }`}
                                                    onClick={() => updateUserData('period', 'mensal')}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">📆</div>
                                                        <div className="font-bold text-white">MENSAL</div>
                                                        <div className="text-sm text-gray-400">1 mês</div>
                                                    </div>
                                                </div>

                                                {/* Trimestral */}
                                                <div
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.period === 'trimestral'
                                                        ? 'border-blue-500 bg-blue-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-blue-400/50'
                                                        }`}
                                                    onClick={() => updateUserData('period', 'trimestral')}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">📅</div>
                                                        <div className="font-bold text-white">TRIMESTRAL</div>
                                                        <div className="text-sm text-gray-400">3 meses</div>
                                                        <div className="text-xs text-green-400">5% OFF</div>
                                                    </div>
                                                </div>

                                                {/* Semestral */}
                                                <div
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.period === 'semestral'
                                                        ? 'border-blue-500 bg-blue-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-blue-400/50'
                                                        }`}
                                                    onClick={() => updateUserData('period', 'semestral')}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">📊</div>
                                                        <div className="font-bold text-white">SEMESTRAL</div>
                                                        <div className="text-sm text-gray-400">6 meses</div>
                                                        <div className="text-xs text-green-400">15% OFF</div>
                                                    </div>
                                                </div>

                                                {/* Anual */}
                                                <div
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.period === 'anual'
                                                        ? 'border-blue-500 bg-blue-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-blue-400/50'
                                                        }`}
                                                    onClick={() => updateUserData('period', 'anual')}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">🎯</div>
                                                        <div className="font-bold text-white">ANUAL</div>
                                                        <div className="text-sm text-gray-400">12 meses</div>
                                                        <div className="text-xs text-green-400">15% OFF</div>
                                                        <div className="text-xs text-purple-400">Deemix GRÁTIS!</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3ª SEÇÃO: DEEMIX */}
                                    <div className="md:col-span-2 group">
                                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                                            <label className="block text-lg font-bold text-purple-400 mb-4 flex items-center gap-3">
                                                <span className="text-2xl">🎵</span>
                                                3ª SEÇÃO: DEEMIX
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Sem Deemix */}
                                                <div
                                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${!userData.deemix
                                                        ? 'border-purple-500 bg-purple-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-purple-400/50'
                                                        }`}
                                                    onClick={() => {
                                                        updateUserData('deemix', false);
                                                        // Se não tem Deemix, remover o sufixo _DEEMIX do plano
                                                        if (userData.planType && userData.planType.includes('_DEEMIX')) {
                                                            const basePlan = userData.planType.replace('_DEEMIX', '');
                                                            updateUserData('planType', basePlan);
                                                        }
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">❌</div>
                                                        <div className="font-bold text-white">SEM DEEMIX</div>
                                                        <div className="text-sm text-gray-400">Apenas o plano VIP</div>
                                                    </div>
                                                </div>

                                                {/* Com Deemix */}
                                                <div
                                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.deemix
                                                        ? 'border-purple-500 bg-purple-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-purple-400/50'
                                                        }`}
                                                    onClick={() => {
                                                        updateUserData('deemix', true);
                                                        // Se tem Deemix, adicionar o sufixo _DEEMIX ao plano
                                                        if (userData.planType && !userData.planType.includes('_DEEMIX')) {
                                                            updateUserData('planType', userData.planType + '_DEEMIX');
                                                        }
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">🎵</div>
                                                        <div className="font-bold text-white">COM DEEMIX</div>
                                                        <div className="text-sm text-gray-400">+ Sistema Deemix</div>
                                                        {userData.period === 'anual' && (
                                                            <div className="text-xs text-green-400 mt-1">GRÁTIS no anual!</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4ª SEÇÃO: DEEZER PREMIUM */}
                                    <div className="md:col-span-2 group">
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
                                            <label className="block text-lg font-bold text-orange-400 mb-4 flex items-center gap-3">
                                                <span className="text-2xl">🎧</span>
                                                4ª SEÇÃO: DEEZER PREMIUM
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Sem Deezer Premium */}
                                                <div
                                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${!userData.deezerPremium
                                                        ? 'border-orange-500 bg-orange-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-orange-400/50'
                                                        }`}
                                                    onClick={() => updateUserData('deezerPremium', false)}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">❌</div>
                                                        <div className="font-bold text-white">SEM DEEZER PREMIUM</div>
                                                        <div className="text-sm text-gray-400">Apenas o plano base</div>
                                                    </div>
                                                </div>

                                                {/* Com Deezer Premium */}
                                                <div
                                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${userData.deezerPremium
                                                        ? 'border-orange-500 bg-orange-500/20'
                                                        : 'border-gray-600 bg-gray-800/50 hover:border-orange-400/50'
                                                        }`}
                                                    onClick={() => updateUserData('deezerPremium', true)}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">🎧</div>
                                                        <div className="font-bold text-white">COM DEEZER PREMIUM</div>
                                                        <div className="text-sm text-gray-400">+ R$ 9,75/mês</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Credenciais Deezer Premium (condicional) */}
                                            {userData.deezerPremium && (
                                                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                                    <label className="block text-lg font-bold text-orange-400 mb-4 flex items-center gap-3">
                                                        <span className="text-2xl">🔐</span>
                                                        CREDENCIAIS DEEZER PREMIUM
                                                    </label>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Email Deezer Premium */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                                                Email Deezer Premium
                                                            </label>
                                                            <input
                                                                type="email"
                                                                value={userData.deezerEmail}
                                                                onChange={(e) => updateUserData('deezerEmail', e.target.value)}
                                                                className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 placeholder-gray-500"
                                                                placeholder="email@deezer.com"
                                                            />
                                                        </div>

                                                        {/* Senha Deezer Premium */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                                                Senha Deezer Premium
                                                            </label>
                                                            <input
                                                                type="password"
                                                                value={userData.deezerPassword}
                                                                onChange={(e) => updateUserData('deezerPassword', e.target.value)}
                                                                className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 placeholder-gray-500"
                                                                placeholder="senha123"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                                        <p className="text-sm text-orange-400 text-center">
                                                            💡 <strong>Dica:</strong> Estas credenciais permitirão ao usuário acessar o Deezer Premium
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 5ª SEÇÃO: PERSONALIZAR BENEFÍCIOS PLANO VIP */}
                                    <div className="md:col-span-2 group">
                                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                                            <label className="block text-lg font-bold text-purple-400 mb-4 flex items-center gap-3">
                                                <span className="text-2xl">👑</span>
                                                5ª SEÇÃO: PERSONALIZAR BENEFÍCIOS PLANO VIP
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* VIP Status */}
                                                <div className="group">
                                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                                        <span className="text-2xl">👑</span>
                                                        Usuário VIP
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            value={userData.is_vip ? 'sim' : 'nao'}
                                                            onChange={(e) => updateUserData('is_vip', e.target.value === 'sim')}
                                                            className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 appearance-none cursor-pointer relative z-10"
                                                        >
                                                            <option value="sim" className="bg-gray-900 text-gray-100">👑 Sim</option>
                                                            <option value="nao" className="bg-gray-900 text-gray-100">❌ Não</option>
                                                        </select>
                                                    </div>
                                                    <div className="mt-2 p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                                                        <p className="text-xs text-gray-300">
                                                            {userData.is_vip ? '👑 Usuário tem acesso VIP às músicas' : '🚫 Usuário sem acesso às músicas'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Uploader Status */}
                                                <div className="group">
                                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                                        <span className="text-2xl">📤</span>
                                                        Uploader
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            value={userData.isUploader ? 'sim' : 'nao'}
                                                            onChange={(e) => updateUserData('isUploader', e.target.value === 'sim')}
                                                            className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 appearance-none cursor-pointer relative z-10"
                                                        >
                                                            <option value="sim" className="bg-gray-900 text-gray-100">📤 Sim</option>
                                                            <option value="nao" className="bg-gray-900 text-gray-100">❌ Não</option>
                                                        </select>
                                                    </div>
                                                    <div className="mt-2 p-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
                                                        <p className="text-xs text-gray-300">
                                                            {userData.isUploader ? '📤 Pode fazer upload de até 10 músicas/mês (GRÁTIS)' : '🚫 Sem permissão para upload'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATUS AUTOMÁTICOS */}
                                    <div className="md:col-span-2 group">
                                        <div className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 border border-gray-500/20 rounded-2xl p-6">
                                            <label className="block text-lg font-bold text-gray-400 mb-4 flex items-center gap-3">
                                                <span className="text-2xl">⚙️</span>
                                                STATUS AUTOMÁTICOS
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Deemix Status (Automático) */}
                                                <div className="group">
                                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                                        <span className="text-2xl">🎵</span>
                                                        Deemix Ativo (Automático)
                                                    </label>
                                                    <div className="px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-gray-100">
                                                        <div className="flex items-center gap-3">
                                                            {userData.deemix ? (
                                                                <>
                                                                    <span className="text-2xl">✅</span>
                                                                    <span className="font-semibold text-green-400">ATIVO</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="text-2xl">❌</span>
                                                                    <span className="font-semibold text-red-400">INATIVO</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {userData.deemix
                                                                ? '🎵 Usuário pode acessar o sistema Deemix e gerenciar credenciais'
                                                                : '🚫 Usuário não tem acesso ao Deemix'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Data de Vencimento (Automática) */}
                                                <div className="group">
                                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                                        <span className="text-2xl">📅</span>
                                                        Data de Vencimento (Automática)
                                                    </label>
                                                    <div className="px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-gray-100">
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-white">
                                                                {(() => {
                                                                    if (!userData.dataPagamento || !userData.period) return 'Não definida';

                                                                    const dataPagamento = new Date(userData.dataPagamento);
                                                                    let meses = 1;
                                                                    if (userData.period === 'trimestral') meses = 3;
                                                                    else if (userData.period === 'semestral') meses = 6;
                                                                    else if (userData.period === 'anual') meses = 12;

                                                                    const vencimento = new Date(dataPagamento);
                                                                    vencimento.setMonth(vencimento.getMonth() + meses);

                                                                    return vencimento.toLocaleDateString('pt-BR');
                                                                })()}
                                                            </div>
                                                            <p className="text-xs text-gray-400 mt-2">
                                                                Calculada automaticamente: {userData.dataPagamento ? 'Data Pagamento + ' + userData.period : 'Defina data de pagamento'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RESUMO DO PLANO */}
                                    {userData.planType && userData.period && (
                                        <div className="md:col-span-2 group">
                                            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                                                <label className="block text-lg font-bold text-green-400 mb-4 flex items-center gap-3">
                                                    <span className="text-2xl">💰</span>
                                                    RESUMO DO PLANO
                                                </label>

                                                {(() => {
                                                    const plan = ALL_PLANS[userData.planType as keyof typeof ALL_PLANS];
                                                    const period = plan?.periods[userData.period as keyof typeof plan.periods];

                                                    if (!plan || !period) return null;

                                                    return (
                                                        <div className="space-y-4">
                                                            {/* Nome do Plano */}
                                                            <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                                                                <div className="text-xl font-bold text-white mb-2">
                                                                    {plan.name} - {userData.period.charAt(0).toUpperCase() + userData.period.slice(1)}
                                                                </div>
                                                                {(period as any).deemixFree && (
                                                                    <div className="text-green-400 text-sm">🎵 Deemix GRÁTIS!</div>
                                                                )}
                                                            </div>

                                                            {/* Detalhes do Cálculo */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="p-4 bg-gray-800/50 rounded-xl">
                                                                    <div className="text-sm text-gray-400 mb-2">Valor Base</div>
                                                                    <div className="text-2xl font-bold text-white">R$ {plan.baseValue.toFixed(2)}</div>
                                                                </div>

                                                                <div className="p-4 bg-gray-800/50 rounded-xl">
                                                                    <div className="text-sm text-gray-400 mb-2">Período</div>
                                                                    <div className="text-lg font-bold text-white">
                                                                        {userData.period.charAt(0).toUpperCase() + userData.period.slice(1)}
                                                                    </div>
                                                                    {period.discount > 0 && (
                                                                        <div className="text-green-400 text-sm">{(period.discount * 100)}% OFF</div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Valor Total */}
                                                            <div className="text-center p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
                                                                <div className="text-sm text-gray-400 mb-2">VALOR TOTAL</div>
                                                                <div className="text-4xl font-bold text-green-400">
                                                                    R$ {(() => {
                                                                        let valorCalculado = period.total;
                                                                        if (userData.deezerPremium) {
                                                                            valorCalculado += 9.75 * period.multiplier;
                                                                        }
                                                                        return valorCalculado.toFixed(2);
                                                                    })()}
                                                                </div>
                                                                <div className="text-sm text-gray-400 mt-2">
                                                                    {period.multiplier > 1 ? `${period.multiplier} meses` : '1 mês'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* CAMPOS BÁSICOS */}
                                    <div className="md:col-span-2 group">
                                        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
                                            <label className="block text-lg font-bold text-blue-400 mb-4 flex items-center gap-3">
                                                <span className="text-2xl">📋</span>
                                                CAMPOS BÁSICOS
                                            </label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Status */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                                        Status
                                                    </label>
                                                    <select
                                                        value={userData.status}
                                                        onChange={(e) => updateUserData('status', e.target.value)}
                                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                                    >
                                                        <option value="ativo" className="bg-gray-900">Ativo</option>
                                                        <option value="inativo" className="bg-gray-900">Inativo</option>
                                                    </select>
                                                </div>

                                                {/* Data do Pagamento */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                                        Data do Pagamento
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={userData.dataPagamento || ''}
                                                        onChange={(e) => updateUserData('dataPagamento', e.target.value)}
                                                        className={`w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200 ${errors.dataPagamento ? 'border-red-500' : ''}`}
                                                    />
                                                    {errors.dataPagamento && (
                                                        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {errors.dataPagamento}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Add-ons & Benefícios */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <Settings className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">Add-ons & Benefícios</h2>
                                    <p className="text-gray-400">Configurações de recursos especiais</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Resumo das Configurações */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Resumo das Configurações</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-400">Plano:</span>
                                                <span className="text-white ml-2">{userData.planType || 'Não selecionado'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Período:</span>
                                                <span className="text-white ml-2">{userData.period || 'Não selecionado'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Deemix:</span>
                                                <span className="text-white ml-2">{userData.deemix ? 'Sim' : 'Não'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Deezer Premium:</span>
                                                <span className="text-white ml-2">{userData.deezerPremium ? 'Sim' : 'Não'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">VIP:</span>
                                                <span className="text-white ml-2">{userData.is_vip ? 'Sim' : 'Não'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Uploader:</span>
                                                <span className="text-white ml-2">{userData.isUploader ? 'Sim' : 'Não'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Valor Total:</span>
                                                <span className="text-white ml-2">R$ {userData.valor?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Vencimento:</span>
                                                <span className="text-white ml-2">{userData.vencimento || 'Não calculado'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">✅ Configuração Completa</h3>
                                        <p className="text-gray-300">
                                            Todas as configurações do plano foram definidas no passo anterior.
                                            Aqui você pode revisar o resumo antes de prosseguir para o Deezer Premium.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Deezer Premium */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">Deezer Premium</h2>
                                    <p className="text-gray-400">Configurações finais do Deezer Premium</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Informação sobre Deezer Premium */}
                                    <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">ℹ️ Informação</h3>
                                        <p className="text-gray-300">
                                            A seleção do Deezer Premium já foi feita no passo anterior.
                                            Aqui você pode revisar e ajustar as credenciais se necessário.
                                        </p>
                                    </div>

                                    {/* Status do Deezer Premium */}
                                    <div className="bg-gray-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Status do Deezer Premium</h3>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`px-4 py-2 rounded-lg ${userData.deezerPremium ? 'bg-green-600' : 'bg-red-600'}`}>
                                                <span className="text-white font-semibold">
                                                    {userData.deezerPremium ? '✅ ATIVO' : '❌ INATIVO'}
                                                </span>
                                            </div>
                                            <span className="text-gray-300">
                                                {userData.deezerPremium ? 'Usuário terá acesso ao Deezer Premium' : 'Usuário não terá acesso ao Deezer Premium'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Resumo Final */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Resumo Final do Usuário</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-400">Nome:</span>
                                                <span className="text-white ml-2">{userData.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Email:</span>
                                                <span className="text-white ml-2">{userData.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">WhatsApp:</span>
                                                <span className="text-white ml-2">{userData.whatsapp}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Status:</span>
                                                <span className="text-white ml-2">{userData.status}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Plano:</span>
                                                <span className="text-white ml-2">{userData.planType || 'Não selecionado'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Período:</span>
                                                <span className="text-white ml-2">{userData.period || 'Não selecionado'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Nome do Plano:</span>
                                                <span className="text-white ml-2">{userData.planName || 'Não gerado'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Valor Total:</span>
                                                <span className="text-white ml-2">R$ {userData.valor?.toFixed(2) || '0.00'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Data Pagamento:</span>
                                                <span className="text-white ml-2">{userData.dataPagamento || 'Não definida'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Vencimento:</span>
                                                <span className="text-white ml-2">{userData.vencimento || 'Não calculado'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">VIP:</span>
                                                <span className="text-white ml-2">{userData.is_vip ? 'Sim' : 'Não'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Deemix:</span>
                                                <span className="text-white ml-2">{userData.deemix ? 'Sim' : 'Não'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Uploader:</span>
                                                <span className="text-white ml-2">{userData.isUploader ? 'Sim' : 'Não'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Deezer Premium:</span>
                                                <span className="text-white ml-2">{userData.deezerPremium ? 'Sim' : 'Não'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {errors.submit && (
                                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                            <p className="text-red-400 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" />
                                                {errors.submit}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
                            <button
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Anterior
                            </button>

                            <div className="flex items-center gap-2 text-gray-400">
                                <span>{currentStep}</span>
                                <span>de</span>
                                <span>{steps.length}</span>
                            </div>

                            {currentStep < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                >
                                    Próximo
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Criando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Criar Usuário
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminAuth>
    );
}
