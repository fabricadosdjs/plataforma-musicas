"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, User, Settings, Shield, Mail, Smartphone, Lock, Calendar, DollarSign, Check, AlertCircle, Loader2 } from 'lucide-react';
import AdminAuth from '@/components/AdminAuth';

interface NewUserData {
    // Dados básicos
    name: string;
    whatsapp: string;
    email: string;
    password: string;

    // Plano e pagamento
    planName: string;
    valor: number;
    status: string;
    dataPrimeiroPagamento: string;
    vencimento: string;
    dataPagamento: string;

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
    planName: '',
    valor: 0,
    status: 'ATIVO',
    dataPrimeiroPagamento: new Date().toISOString().split('T')[0],
    vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
    dataPagamento: new Date().toISOString().split('T')[0],
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

        if (!userData.planName.trim()) newErrors.planName = 'Nome do plano é obrigatório';
        if (!userData.valor || userData.valor <= 0) newErrors.valor = 'Valor deve ser maior que zero';
        if (!userData.dataPrimeiroPagamento) newErrors.dataPrimeiroPagamento = 'Data do primeiro pagamento é obrigatória';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = true;

        if (currentStep === 1) {
            isValid = validateStep1();
        } else if (currentStep === 2) {
            isValid = validateStep2();
            // Calcular vencimento automaticamente
            if (isValid && userData.dataPrimeiroPagamento) {
                const primeiroPagamento = new Date(userData.dataPrimeiroPagamento);
                const vencimento = new Date(primeiroPagamento.getTime() + 30 * 24 * 60 * 60 * 1000);
                setUserData(prev => ({
                    ...prev,
                    vencimento: vencimento.toISOString().split('T')[0]
                }));
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
                    planName: userData.planName // Garantir que o planName seja enviado
                }),
            });

            if (response.ok) {
                router.push('/admin/users?message=user-created');
            } else {
                const error = await response.json();
                setErrors({ submit: error.message || 'Erro ao criar usuário' });
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
                                    <p className="text-gray-400">Configurações de plano e cobrança</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome do Plano *
                                        </label>
                                        <input
                                            type="text"
                                            value={userData.planName}
                                            onChange={(e) => updateUserData('planName', e.target.value)}
                                            className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.planName ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                            placeholder="Ex: VIP BÁSICO, VIP PADRÃO, VIP COMPLETO, etc."
                                        />
                                        {errors.planName && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.planName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Valor Mensal (R$) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={userData.valor || ''}
                                            onChange={(e) => updateUserData('valor', parseFloat(e.target.value) || 0)}
                                            className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.valor ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                            placeholder="0.00"
                                        />
                                        {errors.valor && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.valor}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={userData.status}
                                            onChange={(e) => updateUserData('status', e.target.value)}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="ATIVO">ATIVO</option>
                                            <option value="INATIVO">INATIVO</option>
                                            <option value="SUSPENSO">SUSPENSO</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Data Primeiro Pagamento *
                                        </label>
                                        <input
                                            type="date"
                                            value={userData.dataPrimeiroPagamento}
                                            onChange={(e) => updateUserData('dataPrimeiroPagamento', e.target.value)}
                                            className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.dataPrimeiroPagamento ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                        />
                                        {errors.dataPrimeiroPagamento && (
                                            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.dataPrimeiroPagamento}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Data de Vencimento
                                        </label>
                                        <input
                                            type="date"
                                            value={userData.vencimento}
                                            readOnly
                                            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 cursor-not-allowed"
                                            title="Calculado automaticamente: 30 dias após o primeiro pagamento"
                                        />
                                        <p className="mt-1 text-xs text-gray-400">
                                            Calculado automaticamente: 30 dias após o primeiro pagamento
                                        </p>
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
                                    {/* Possui Deemix */}
                                    <div className="bg-gray-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Possui Deemix</h3>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="deemix"
                                                    checked={userData.deemix === true}
                                                    onChange={() => updateUserData('deemix', true)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                                />
                                                <span className="text-white">Sim</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="deemix"
                                                    checked={userData.deemix === false}
                                                    onChange={() => updateUserData('deemix', false)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                                />
                                                <span className="text-white">Não</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Usuário Baixará Músicas */}
                                    <div className="bg-gray-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Usuário Baixará Músicas? (VIP)</h3>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="is_vip"
                                                    checked={userData.is_vip === true}
                                                    onChange={() => updateUserData('is_vip', true)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                                />
                                                <span className="text-white">Sim</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="is_vip"
                                                    checked={userData.is_vip === false}
                                                    onChange={() => updateUserData('is_vip', false)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                                />
                                                <span className="text-white">Não</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Usuário Irá Fazer Upload */}
                                    <div className="bg-gray-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Usuário Irá Fazer Upload? (Uploader)</h3>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="isUploader"
                                                    checked={userData.isUploader === true}
                                                    onChange={() => updateUserData('isUploader', true)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                                />
                                                <span className="text-white">Sim</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="isUploader"
                                                    checked={userData.isUploader === false}
                                                    onChange={() => updateUserData('isUploader', false)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                                />
                                                <span className="text-white">Não</span>
                                            </label>
                                        </div>
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
                                    <p className="text-gray-400">Configurações do Deezer Premium</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Possui Deezer Premium */}
                                    <div className="bg-gray-700 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Possui Deezer Premium</h3>
                                        <div className="flex gap-4 mb-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="deezerPremium"
                                                    checked={userData.deezerPremium === true}
                                                    onChange={() => updateUserData('deezerPremium', true)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                                />
                                                <span className="text-white">Sim</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="deezerPremium"
                                                    checked={userData.deezerPremium === false}
                                                    onChange={() => updateUserData('deezerPremium', false)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                                                />
                                                <span className="text-white">Não</span>
                                            </label>
                                        </div>

                                        {/* Campos condicionais do Deezer */}
                                        {userData.deezerPremium && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Email do Deezer
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={userData.deezerEmail}
                                                        onChange={(e) => updateUserData('deezerEmail', e.target.value)}
                                                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        placeholder="email@deezer.com"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Senha do Deezer
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={userData.deezerPassword}
                                                        onChange={(e) => updateUserData('deezerPassword', e.target.value)}
                                                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        placeholder="senha123"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Resumo Final */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Resumo do Usuário</h3>
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
                                                <span className="text-gray-400">Plano:</span>
                                                <span className="text-white ml-2">{userData.planName}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Valor:</span>
                                                <span className="text-white ml-2">R$ {userData.valor?.toFixed(2)}</span>
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
