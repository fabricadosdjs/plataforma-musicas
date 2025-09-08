"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminAuth } from '@/components/admin/AdminAuth';
import {
    User,
    Crown,
    Music,
    Upload,
    Mail,
    MessageSquare,
    Save,
    ArrowLeft,
    Loader2,
    ChevronDown,
    CheckCircle,
    XCircle
} from 'lucide-react';

// Interface do usuário
interface User {
    id: string;
    name: string;
    email: string;
    whatsapp?: string;
    valor?: number;
    vencimento?: string;
    dataPagamento?: string;
    status: string;
    deemix: boolean;
    deezerPremium: boolean;
    deezerEmail?: string;
    deezerPassword?: string;
    is_vip: boolean;
    isUploader?: boolean;
    dailyDownloadCount: number | null;
    weeklyPackRequests?: number;
    weeklyPlaylistDownloads?: number;
    weeklyPackRequestsUsed?: number;
    weeklyPlaylistDownloadsUsed?: number;
    lastDownloadReset?: string | null;
    lastWeekReset?: string | null;
    downloadsCount?: number;
    likesCount?: number;
    password?: string;
    planName?: string;
    planType?: string;
    customBenefits?: any;
}

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

    // ========== PLANOS UPLOADER ==========
    'UPLOADER_BASIC': {
        name: '📤 UPLOADER BÁSICO',
        baseValue: 15,
        description: 'Upload de até 10 músicas/mês',
        category: 'UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 15 },
            trimestral: { multiplier: 3, discount: 0.05, total: 42.75 },
            semestral: { multiplier: 6, discount: 0.15, total: 76.50 },
            anual: { multiplier: 12, discount: 0.15, total: 153.00 }
        }
    },
    'UPLOADER_PRO': {
        name: '🚀 UPLOADER PRO',
        baseValue: 25,
        description: 'Upload de até 20 músicas/mês',
        category: 'UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 25 },
            trimestral: { multiplier: 3, discount: 0.05, total: 71.25 },
            semestral: { multiplier: 6, discount: 0.15, total: 127.50 },
            anual: { multiplier: 12, discount: 0.15, total: 255.00 }
        }
    },
    'UPLOADER_ELITE': {
        name: '🏆 UPLOADER ELITE',
        baseValue: 35,
        description: 'Upload de até 30 músicas/mês',
        category: 'UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 35 },
            trimestral: { multiplier: 3, discount: 0.05, total: 99.75 },
            semestral: { multiplier: 6, discount: 0.15, total: 178.50 },
            anual: { multiplier: 12, discount: 0.15, total: 357.00 }
        }
    },

    // ========== SERVIÇOS AVULSOS ==========
    'DEEMIX_AVULSO': {
        name: '🎵 DEEMIX AVULSO',
        baseValue: 38,
        description: 'Apenas Deemix (não-VIP)',
        category: 'STANDALONE',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 38 },
            trimestral: { multiplier: 3, discount: 0.05, total: 108.30 },
            semestral: { multiplier: 6, discount: 0.15, total: 193.80 },
            anual: { multiplier: 12, discount: 0.15, total: 387.60 }
        }
    },
    'DEEZER_PREMIUM_AVULSO': {
        name: '🎁 DEEZER PREMIUM AVULSO',
        baseValue: 9.75,
        description: 'Streaming premium sem anúncios',
        category: 'STANDALONE',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 9.75 },
            trimestral: { multiplier: 3, discount: 0.05, total: 27.79 },
            semestral: { multiplier: 6, discount: 0.15, total: 49.73 },
            anual: { multiplier: 12, discount: 0.15, total: 99.45 }
        }
    },

    // ========== COMBINAÇÕES ESPECIAIS ==========
    'VIP_BASICO_UPLOADER': {
        name: '🥉 VIP BÁSICO + UPLOADER',
        baseValue: 48,
        description: 'VIP Básico + Uploader (R$ 10,00)',
        category: 'VIP_UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 48 },
            trimestral: { multiplier: 3, discount: 0.05, total: 136.80 },
            semestral: { multiplier: 6, discount: 0.15, total: 244.80, uploaderFree: true },
            anual: { multiplier: 12, discount: 0.15, total: 489.60, uploaderFree: true }
        }
    },
    'VIP_PADRAO_UPLOADER': {
        name: '🥈 VIP PADRÃO + UPLOADER',
        baseValue: 52,
        description: 'VIP Padrão + Uploader (R$ 10,00)',
        category: 'VIP_UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 52 },
            trimestral: { multiplier: 3, discount: 0.05, total: 148.20 },
            semestral: { multiplier: 6, discount: 0.15, total: 265.20, uploaderFree: true },
            anual: { multiplier: 12, discount: 0.15, total: 530.40, uploaderFree: true }
        }
    },
    'VIP_COMPLETO_UPLOADER': {
        name: '🥇 VIP COMPLETO + UPLOADER',
        baseValue: 70,
        description: 'VIP Completo + Uploader (R$ 10,00)',
        category: 'VIP_UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 70 },
            trimestral: { multiplier: 3, discount: 0.05, total: 199.50 },
            semestral: { multiplier: 6, discount: 0.15, total: 357.00, uploaderFree: true },
            anual: { multiplier: 12, discount: 0.15, total: 714.00, uploaderFree: true }
        }
    },
    'VIP_BASICO_DEEMIX_UPLOADER': {
        name: '🥉 VIP BÁSICO + DEEMIX + UPLOADER',
        baseValue: 71.56,
        description: 'VIP Básico + Deemix + Uploader',
        category: 'VIP_DEEMIX_UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 71.56 },
            trimestral: { multiplier: 3, discount: 0.05, total: 203.95 },
            semestral: { multiplier: 6, discount: 0.15, total: 364.76, uploaderFree: true },
            anual: { multiplier: 12, discount: 0.15, total: 387.60, deemixFree: true, uploaderFree: true }
        }
    },
    'VIP_PADRAO_DEEMIX_UPLOADER': {
        name: '🥈 VIP PADRÃO + DEEMIX + UPLOADER',
        baseValue: 74.04,
        description: 'VIP Padrão + Deemix + Uploader',
        category: 'VIP_DEEMIX_UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 74.04 },
            trimestral: { multiplier: 3, discount: 0.05, total: 211.01 },
            semestral: { multiplier: 6, discount: 0.15, total: 377.34, uploaderFree: true },
            anual: { multiplier: 12, discount: 0.15, total: 428.40, deemixFree: true, uploaderFree: true }
        }
    },
    'VIP_COMPLETO_DEEMIX_UPLOADER': {
        name: '🥇 VIP COMPLETO + DEEMIX + UPLOADER',
        baseValue: 85.20,
        description: 'VIP Completo + Deemix + Uploader',
        category: 'VIP_DEEMIX_UPLOADER',
        periods: {
            mensal: { multiplier: 1, discount: 0, total: 85.20 },
            trimestral: { multiplier: 3, discount: 0.05, total: 242.82 },
            semestral: { multiplier: 6, discount: 0.15, total: 434.52, uploaderFree: true },
            anual: { multiplier: 12, discount: 0.15, total: 612.00, deemixFree: true, uploaderFree: true }
        }
    }
} as const;

// Mapeamento para compatibilidade com código existente
const VIP_PLANS = {
    BASICO: {
        name: 'VIP BÁSICO',
        minValue: 38,
        maxValue: 38,
        color: 'bg-blue-600',
        icon: '🥉',
        benefits: {
            driveAccess: { enabled: true, description: 'Acesso Mensal' },
            packRequests: { enabled: true, limit: 4, minLimit: 4, maxLimit: 10, description: 'Até 4 estilos por semana' },
            individualContent: { enabled: true, description: 'Sim' },
            extraPacks: { enabled: true, description: 'Sim' },
            playlistDownloads: { enabled: true, limit: 7, minLimit: 7, maxLimit: 15, description: 'Até 7 por semana' },
            deezerPremium: { enabled: false, description: 'Não disponível' },
            deemixDiscount: { enabled: false, percentage: 0, description: 'Não disponível' },
            arlPremium: { enabled: false, description: 'Não disponível' },
            musicProduction: { enabled: false, description: 'Não disponível' }
        }
    },
    PADRAO: {
        name: 'VIP PADRÃO',
        minValue: 42,
        maxValue: 42,
        color: 'bg-green-600',
        icon: '🥈',
        benefits: {
            driveAccess: { enabled: true, description: 'Acesso Mensal' },
            packRequests: { enabled: true, limit: 6, minLimit: 4, maxLimit: 10, description: 'Até 6 estilos por semana' },
            individualContent: { enabled: true, description: 'Sim' },
            extraPacks: { enabled: true, description: 'Sim' },
            playlistDownloads: { enabled: true, limit: 9, minLimit: 7, maxLimit: 15, description: 'Até 9 por semana' },
            deezerPremium: { enabled: true, description: 'Sim' },
            deemixDiscount: { enabled: true, percentage: 15, description: 'Sim' },
            arlPremium: { enabled: true, description: 'Sim (automático se Deemix)' },
            musicProduction: { enabled: false, description: 'Não disponível' }
        }
    },
    COMPLETO: {
        name: 'VIP COMPLETO',
        minValue: 60,
        maxValue: 60,
        color: 'bg-purple-600',
        icon: '🥇',
        benefits: {
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
    }
} as const;

const EditUserPage = () => {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        whatsapp: '',
        valor: 0,
        vencimento: '',
        dataPagamento: '',
        status: 'ativo',
        deemix: false,
        deezerPremium: false,
        deezerEmail: '',
        deezerPassword: '',
        is_vip: false,
        isUploader: false,
        password: '',
        planName: '',
        planType: '',
        period: 'mensal'
    });

    // Carregar dados do usuário
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/admin/users');
                if (response.ok) {
                    const data = await response.json();
                    const foundUser = data.users.find((u: User) => u.id === userId);

                    if (foundUser) {
                        setUser(foundUser);

                        // Determinar o tipo de plano baseado no valor e add-ons
                        let planType = '';
                        let period = 'mensal';
                        if (foundUser.valor) {
                            const valor = foundUser.valor;
                            const hasDeemix = foundUser.deemix || false;
                            const hasUploader = foundUser.isUploader || false;

                            // Mapear para o plano correto baseado no valor e add-ons
                            if (valor === 38 && !hasDeemix && !hasUploader) planType = 'VIP_BASICO';
                            else if (valor === 42 && !hasDeemix && !hasUploader) planType = 'VIP_PADRAO';
                            else if (valor === 60 && !hasDeemix && !hasUploader) planType = 'VIP_COMPLETO';
                            else if (valor === 61.56 && hasDeemix && !hasUploader) planType = 'VIP_BASICO_DEEMIX';
                            else if (valor === 64.04 && hasDeemix && !hasUploader) planType = 'VIP_PADRAO_DEEMIX';
                            else if (valor === 75.20 && hasDeemix && !hasUploader) planType = 'VIP_COMPLETO_DEEMIX';
                            else if (valor === 48 && !hasDeemix && hasUploader) planType = 'VIP_BASICO_UPLOADER';
                            else if (valor === 52 && !hasDeemix && hasUploader) planType = 'VIP_PADRAO_UPLOADER';
                            else if (valor === 70 && !hasDeemix && hasUploader) planType = 'VIP_COMPLETO_UPLOADER';
                            else if (valor === 71.56 && hasDeemix && hasUploader) planType = 'VIP_BASICO_DEEMIX_UPLOADER';
                            else if (valor === 74.04 && hasDeemix && hasUploader) planType = 'VIP_PADRAO_DEEMIX_UPLOADER';
                            else if (valor === 85.20 && hasDeemix && hasUploader) planType = 'VIP_COMPLETO_DEEMIX_UPLOADER';
                            else if (valor === 15) planType = 'UPLOADER_BASIC';
                            else if (valor === 25) planType = 'UPLOADER_PRO';
                            else if (valor === 35) planType = 'UPLOADER_ELITE';
                            else if (valor === 38 && !foundUser.is_vip) planType = 'DEEMIX_AVULSO';
                            else if (valor === 9.75) planType = 'DEEZER_PREMIUM_AVULSO';
                            else {
                                // Fallback para planos antigos
                                if (valor >= 38 && valor <= 41.99) planType = 'VIP_BASICO';
                                else if (valor >= 42 && valor <= 59.99) planType = 'VIP_PADRAO';
                                else if (valor >= 60) planType = 'VIP_COMPLETO';
                            }

                            // Tentar determinar o período baseado no valor
                            if (planType && ALL_PLANS[planType as keyof typeof ALL_PLANS]) {
                                const plan = ALL_PLANS[planType as keyof typeof ALL_PLANS];
                                for (const [periodKey, periodData] of Object.entries(plan.periods)) {
                                    if (Math.abs(periodData.total - valor) < 0.01) {
                                        period = periodKey;
                                        break;
                                    }
                                }
                            }
                        }

                        setEditForm({
                            name: foundUser.name || '',
                            email: foundUser.email || '',
                            whatsapp: foundUser.whatsapp || '',
                            valor: foundUser.valor || 0,
                            vencimento: foundUser.vencimento ? new Date(foundUser.vencimento).toISOString().split('T')[0] : '',
                            dataPagamento: foundUser.dataPagamento ? new Date(foundUser.dataPagamento).toISOString().split('T')[0] : '',
                            status: foundUser.status || 'ativo',
                            deemix: foundUser.deemix || false,
                            deezerPremium: foundUser.deezerPremium || false,
                            deezerEmail: foundUser.deezerEmail || '',
                            deezerPassword: foundUser.deezerPassword || '',
                            is_vip: foundUser.is_vip || false,
                            isUploader: foundUser.isUploader || false,
                            password: '',
                            planName: foundUser.planName || '',
                            planType: planType,
                            period: period
                        });
                    } else {
                        setMessage({ type: 'error', text: 'Usuário não encontrado' });
                    }
                } else {
                    setMessage({ type: 'error', text: 'Erro ao carregar usuário' });
                }
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                setMessage({ type: 'error', text: 'Erro ao carregar usuário' });
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    // Atualizar valor automaticamente quando as escolhas das 5 seções mudarem
    useEffect(() => {
        if (editForm.planType && ALL_PLANS[editForm.planType as keyof typeof ALL_PLANS]) {
            const plan = ALL_PLANS[editForm.planType as keyof typeof ALL_PLANS];
            const period = plan.periods[editForm.period as keyof typeof plan.periods];

            if (period) {
                let valorCalculado = period.total;

                // Adicionar Deezer Premium se selecionado
                if (editForm.deezerPremium) {
                    valorCalculado += 9.75 * period.multiplier;
                }

                setEditForm(prev => ({
                    ...prev,
                    valor: valorCalculado
                }));
            }
        }
    }, [editForm.planType, editForm.period, editForm.deemix, editForm.deezerPremium]);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            // Calcular valor e nome do plano baseado nas 5 seções
            let valorFinal = 0;
            let planName = '';
            let isUploader = !!editForm.isUploader;
            let deemix = editForm.deemix;
            let deezerPremium = editForm.deezerPremium;

            if (editForm.planType && ALL_PLANS[editForm.planType as keyof typeof ALL_PLANS]) {
                const plan = ALL_PLANS[editForm.planType as keyof typeof ALL_PLANS];
                const period = plan.periods[editForm.period as keyof typeof plan.periods];

                if (period) {
                    valorFinal = period.total;

                    // Construir nome do plano baseado nas escolhas
                    let planNameParts = [];

                    // 1ª Seção: Plano VIP Base
                    if (plan.name.includes('BÁSICO')) planNameParts.push('🥉 VIP BÁSICO');
                    else if (plan.name.includes('PADRÃO')) planNameParts.push('🥈 VIP PADRÃO');
                    else if (plan.name.includes('COMPLETO')) planNameParts.push('🥇 VIP COMPLETO');

                    // 2ª Seção: Período
                    planNameParts.push(editForm.period.charAt(0).toUpperCase() + editForm.period.slice(1));

                    // 3ª Seção: Deemix
                    if (deemix && !(period as any).deemixFree) {
                        planNameParts.push('+ DEEMIX');
                    } else if (deemix && (period as any).deemixFree) {
                        planNameParts.push('+ DEEMIX (GRÁTIS!)');
                    }

                    // Uploader (se aplicável) - R$ 0,00
                    if (editForm.isUploader) {
                        planNameParts.push('+ UPLOADER (GRÁTIS)');
                    }

                    // 4ª Seção: Deezer Premium
                    if (deezerPremium) {
                        planNameParts.push('+ DEEZER PREMIUM');
                        // Adicionar R$ 9,75 por mês ao valor total
                        valorFinal += 9.75 * period.multiplier;
                    }

                    planName = planNameParts.join(' - ');
                }
            }

            // Calcular data de vencimento automaticamente
            let vencimento = '';
            if (editForm.dataPagamento) {
                const dataPagamento = new Date(editForm.dataPagamento);
                const period = editForm.period;

                let meses = 1;
                if (period === 'trimestral') meses = 3;
                else if (period === 'semestral') meses = 6;
                else if (period === 'anual') meses = 12;

                const vencimentoDate = new Date(dataPagamento);
                vencimentoDate.setMonth(vencimentoDate.getMonth() + meses);
                vencimento = vencimentoDate.toISOString().split('T')[0];
            }

            const requestBody = {
                userId: user.id,
                ...editForm,
                valor: valorFinal,
                planName: planName,
                vencimento: vencimento,
                isUploader: isUploader,
                deemix: deemix,
                deezerPremium: deezerPremium,
                deezerEmail: editForm.deezerEmail,
                deezerPassword: editForm.deezerPassword
            };

            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: data.message });

                // Aguardar um pouco antes de redirecionar
                setTimeout(() => {
                    router.push('/admin/users');
                }, 1500);
            } else {
                const errorText = await response.text();
                throw new Error(`Falha ao atualizar usuário: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            setMessage({ type: 'error', text: `Erro ao atualizar usuário: ${error instanceof Error ? (error as Error).message : 'Erro desconhecido'}` });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1B1C1D] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
                <div className="text-white text-lg">Carregando usuário...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#1B1C1D] flex flex-col items-center justify-center text-white">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Usuário não encontrado</h1>
                <p className="text-gray-400 mb-6">O usuário solicitado não foi encontrado no sistema.</p>
                <button
                    onClick={() => router.push('/admin/users')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Voltar para Usuários
                </button>
            </div>
        );
    }

    return (
        <AdminAuth>
            <div className="min-h-screen bg-[#1B1C1D] text-white">
                <div className="container mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Editar Usuário</h1>
                                <p className="text-gray-400 mt-1">Modifique as informações do usuário</p>
                            </div>
                        </div>
                    </div>

                    {/* Mensagens de Feedback */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-green-500/20 border-green-500/30 text-green-300'
                            : 'bg-red-500/20 border-red-500/30 text-red-300'
                            }`}>
                            <div className="flex items-center gap-3">
                                {message.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <XCircle className="w-5 h-5" />
                                )}
                                <span>{message.text}</span>
                            </div>
                        </div>
                    )}

                    {/* Formulário de Edição */}
                    <div className="bg-gradient-to-br from-[#0F0F23] via-[#1A1A2E] to-[#16213E] border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
                        {/* Decoração de fundo */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-t-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                        Editar Usuário
                                    </h3>
                                    <p className="text-gray-400 mt-1">
                                        Modifique as informações do usuário
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nome */}
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-purple-400" />
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-gray-500"
                                        placeholder="Nome completo"
                                    />
                                </div>

                                {/* WhatsApp */}
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-green-400" />
                                        WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.whatsapp}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                                        className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 placeholder-gray-500"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>

                                {/* Email */}
                                <div className="md:col-span-2 group">
                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-500"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>

                                {/* Senha */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Senha (deixe em branco para não alterar)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editForm.password}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                            placeholder="Nova senha (opcional)"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="px-4 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl"
                                            onClick={() => {
                                                const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
                                                let password = "";
                                                for (let i = 0, n = charset.length; i < 14; ++i) {
                                                    password += charset.charAt(Math.floor(Math.random() * n));
                                                }
                                                setEditForm(prev => ({ ...prev, password }));
                                            }}
                                        >
                                            Gerar senha forte
                                        </button>
                                    </div>
                                </div>

                                {/* ========== 1ª SEÇÃO: PLANO VIP BASE ========== */}
                                <div className="md:col-span-2 group">
                                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
                                        <label className="block text-lg font-bold text-yellow-400 mb-4 flex items-center gap-3">
                                            <Crown className="w-6 h-6" />
                                            1ª SEÇÃO: PLANO VIP BASE
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* VIP BÁSICO */}
                                            <div
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.planType === 'VIP_BASICO' || editForm.planType === 'VIP_BASICO_DEEMIX' || editForm.planType === 'VIP_BASICO_UPLOADER' || editForm.planType === 'VIP_BASICO_DEEMIX_UPLOADER'
                                                    ? 'border-yellow-500 bg-yellow-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-yellow-400/50'
                                                    }`}
                                                onClick={() => {
                                                    const hasDeemix = editForm.deemix;
                                                    const hasUploader = editForm.isUploader;
                                                    let newPlanType = 'VIP_BASICO';

                                                    if (hasDeemix && hasUploader) newPlanType = 'VIP_BASICO_DEEMIX_UPLOADER';
                                                    else if (hasDeemix) newPlanType = 'VIP_BASICO_DEEMIX';
                                                    else if (hasUploader) newPlanType = 'VIP_BASICO_UPLOADER';

                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        planType: newPlanType,
                                                        planName: ALL_PLANS[newPlanType as keyof typeof ALL_PLANS]?.name || 'VIP BÁSICO'
                                                    }));
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl mb-2">🥉</div>
                                                    <div className="font-bold text-white">VIP BÁSICO</div>
                                                    <div className="text-sm text-gray-400">R$ 38,00</div>
                                                </div>
                                            </div>

                                            {/* VIP PADRÃO */}
                                            <div
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.planType === 'VIP_PADRAO' || editForm.planType === 'VIP_PADRAO_DEEMIX' || editForm.planType === 'VIP_PADRAO_UPLOADER' || editForm.planType === 'VIP_PADRAO_DEEMIX_UPLOADER'
                                                    ? 'border-yellow-500 bg-yellow-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-yellow-400/50'
                                                    }`}
                                                onClick={() => {
                                                    const hasDeemix = editForm.deemix;
                                                    const hasUploader = editForm.isUploader;
                                                    let newPlanType = 'VIP_PADRAO';

                                                    if (hasDeemix && hasUploader) newPlanType = 'VIP_PADRAO_DEEMIX_UPLOADER';
                                                    else if (hasDeemix) newPlanType = 'VIP_PADRAO_DEEMIX';
                                                    else if (hasUploader) newPlanType = 'VIP_PADRAO_UPLOADER';

                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        planType: newPlanType,
                                                        planName: ALL_PLANS[newPlanType as keyof typeof ALL_PLANS]?.name || 'VIP PADRÃO'
                                                    }));
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl mb-2">🥈</div>
                                                    <div className="font-bold text-white">VIP PADRÃO</div>
                                                    <div className="text-sm text-gray-400">R$ 42,00</div>
                                                </div>
                                            </div>

                                            {/* VIP COMPLETO */}
                                            <div
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.planType === 'VIP_COMPLETO' || editForm.planType === 'VIP_COMPLETO_DEEMIX' || editForm.planType === 'VIP_COMPLETO_UPLOADER' || editForm.planType === 'VIP_COMPLETO_DEEMIX_UPLOADER'
                                                    ? 'border-yellow-500 bg-yellow-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-yellow-400/50'
                                                    }`}
                                                onClick={() => {
                                                    const hasDeemix = editForm.deemix;
                                                    const hasUploader = editForm.isUploader;
                                                    let newPlanType = 'VIP_COMPLETO';

                                                    if (hasDeemix && hasUploader) newPlanType = 'VIP_COMPLETO_DEEMIX_UPLOADER';
                                                    else if (hasDeemix) newPlanType = 'VIP_COMPLETO_DEEMIX';
                                                    else if (hasUploader) newPlanType = 'VIP_COMPLETO_UPLOADER';

                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        planType: newPlanType,
                                                        planName: ALL_PLANS[newPlanType as keyof typeof ALL_PLANS]?.name || 'VIP COMPLETO'
                                                    }));
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl mb-2">🥇</div>
                                                    <div className="font-bold text-white">VIP COMPLETO</div>
                                                    <div className="text-sm text-gray-400">R$ 60,00</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ========== 2ª SEÇÃO: PERÍODO ========== */}
                                <div className="md:col-span-2 group">
                                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                                        <label className="block text-lg font-bold text-blue-400 mb-4 flex items-center gap-3">
                                            <span className="text-2xl">📅</span>
                                            2ª SEÇÃO: PERÍODO
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            {/* Mensal */}
                                            <div
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.period === 'mensal'
                                                    ? 'border-blue-500 bg-blue-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-blue-400/50'
                                                    }`}
                                                onClick={() => setEditForm(prev => ({ ...prev, period: 'mensal' }))}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">📅</div>
                                                    <div className="font-bold text-white">Mensal</div>
                                                    <div className="text-sm text-gray-400">Sem desconto</div>
                                                </div>
                                            </div>

                                            {/* Trimestral */}
                                            <div
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.period === 'trimestral'
                                                    ? 'border-blue-500 bg-blue-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-blue-400/50'
                                                    }`}
                                                onClick={() => setEditForm(prev => ({ ...prev, period: 'trimestral' }))}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">📅</div>
                                                    <div className="font-bold text-white">Trimestral</div>
                                                    <div className="text-sm text-green-400">5% OFF</div>
                                                </div>
                                            </div>

                                            {/* Semestral */}
                                            <div
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.period === 'semestral'
                                                    ? 'border-blue-500 bg-blue-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-blue-400/50'
                                                    }`}
                                                onClick={() => setEditForm(prev => ({ ...prev, period: 'semestral' }))}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">📅</div>
                                                    <div className="font-bold text-white">Semestral</div>
                                                    <div className="text-sm text-green-400">15% OFF</div>
                                                </div>
                                            </div>

                                            {/* Anual */}
                                            <div
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.period === 'anual'
                                                    ? 'border-blue-500 bg-blue-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-blue-400/50'
                                                    }`}
                                                onClick={() => setEditForm(prev => ({ ...prev, period: 'anual' }))}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">📅</div>
                                                    <div className="font-bold text-white">Anual</div>
                                                    <div className="text-sm text-green-400">15% OFF</div>
                                                    <div className="text-xs text-yellow-400 mt-1">🎵 Deemix Grátis!</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ========== 3ª SEÇÃO: DEEMIX ========== */}
                                <div className="md:col-span-2 group">
                                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                                        <label className="block text-lg font-bold text-purple-400 mb-4 flex items-center gap-3">
                                            <Music className="w-6 h-6" />
                                            3ª SEÇÃO: DEEMIX
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Sem Deemix */}
                                            <div
                                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${!editForm.deemix
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-purple-400/50'
                                                    }`}
                                                onClick={() => {
                                                    setEditForm(prev => {
                                                        const hasUploader = prev.isUploader;
                                                        let newPlanType = prev.planType;

                                                        // Remover Deemix do tipo de plano
                                                        if (newPlanType.includes('DEEMIX')) {
                                                            if (newPlanType.includes('UPLOADER')) {
                                                                newPlanType = newPlanType.replace('_DEEMIX', '') as any;
                                                            } else {
                                                                newPlanType = newPlanType.replace('_DEEMIX', '') as any;
                                                            }
                                                        }

                                                        return {
                                                            ...prev,
                                                            deemix: false,
                                                            planType: newPlanType,
                                                            planName: ALL_PLANS[newPlanType as keyof typeof ALL_PLANS]?.name || prev.planName
                                                        };
                                                    });
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl mb-3">❌</div>
                                                    <div className="font-bold text-white text-lg">SEM DEEMIX</div>
                                                    <div className="text-sm text-gray-400 mt-2">Apenas o plano VIP selecionado</div>
                                                </div>
                                            </div>

                                            {/* Com Deemix */}
                                            <div
                                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.deemix
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-purple-400/50'
                                                    }`}
                                                onClick={() => {
                                                    setEditForm(prev => {
                                                        const hasUploader = prev.isUploader;
                                                        let newPlanType = prev.planType;

                                                        // Adicionar Deemix ao tipo de plano
                                                        if (!newPlanType.includes('DEEMIX')) {
                                                            if (newPlanType.includes('UPLOADER')) {
                                                                newPlanType = (newPlanType.replace('_UPLOADER', '_DEEMIX_UPLOADER') as any);
                                                            } else {
                                                                newPlanType = (newPlanType + '_DEEMIX') as any;
                                                            }
                                                        }

                                                        return {
                                                            ...prev,
                                                            deemix: true,
                                                            planType: newPlanType,
                                                            planName: ALL_PLANS[newPlanType as keyof typeof ALL_PLANS]?.name || prev.planName
                                                        };
                                                    });
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl mb-3">🎵</div>
                                                    <div className="font-bold text-white text-lg">COM DEEMIX</div>
                                                    <div className="text-sm text-gray-400 mt-2">+ Download de músicas</div>
                                                    {editForm.period === 'anual' && (
                                                        <div className="text-xs text-green-400 mt-2">🎉 GRÁTIS no anual!</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ========== 4ª SEÇÃO: DEEZER PREMIUM ========== */}
                                <div className="md:col-span-2 group">
                                    <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-2xl p-6">
                                        <label className="block text-lg font-bold text-green-400 mb-4 flex items-center gap-3">
                                            <span className="text-2xl">🎁</span>
                                            4ª SEÇÃO: DEEZER PREMIUM
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Sem Deezer Premium */}
                                            <div
                                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${!editForm.deezerPremium
                                                    ? 'border-green-500 bg-green-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-green-400/50'
                                                    }`}
                                                onClick={() => {
                                                    setEditForm(prev => ({ ...prev, deezerPremium: false }));
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl mb-3">❌</div>
                                                    <div className="font-bold text-white text-lg">SEM DEEZER PREMIUM</div>
                                                    <div className="text-sm text-gray-400 mt-2">Streaming com anúncios</div>
                                                </div>
                                            </div>

                                            {/* Com Deezer Premium */}
                                            <div
                                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${editForm.deezerPremium
                                                    ? 'border-green-500 bg-green-500/20'
                                                    : 'border-gray-600 bg-gray-800/50 hover:border-green-400/50'
                                                    }`}
                                                onClick={() => {
                                                    setEditForm(prev => ({ ...prev, deezerPremium: true }));
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl mb-3">🎁</div>
                                                    <div className="font-bold text-white text-lg">COM DEEZER PREMIUM</div>
                                                    <div className="text-sm text-gray-400 mt-2">+ R$ 9,75/mês</div>
                                                    <div className="text-xs text-yellow-400 mt-2">Streaming sem anúncios</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ========== CREDENCIAIS DEEZER PREMIUM ========== */}
                                {editForm.deezerPremium && (
                                    <div className="md:col-span-2 group">
                                        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-2xl p-6">
                                            <label className="block text-lg font-bold text-green-400 mb-4 flex items-center gap-3">
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
                                                        value={editForm.deezerEmail || ''}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, deezerEmail: e.target.value }))}
                                                        placeholder="email@deezer.com"
                                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Email para acesso ao Deezer Premium
                                                    </p>
                                                </div>

                                                {/* Senha Deezer Premium */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                                        Senha Deezer Premium
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={editForm.deezerPassword || ''}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, deezerPassword: e.target.value }))}
                                                        placeholder="••••••••"
                                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Senha para acesso ao Deezer Premium
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                <p className="text-sm text-green-400 text-center">
                                                    💡 As credenciais serão salvas de forma segura e estarão disponíveis para o usuário em /profile
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ========== 5ª SEÇÃO: PERSONALIZAR BENEFÍCIOS PLANO VIP ========== */}
                    <div className="md:col-span-2 group">
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                            <label className="block text-lg font-bold text-purple-400 mb-4 flex items-center gap-3">
                                <Crown className="w-6 h-6" />
                                5ª SEÇÃO: PERSONALIZAR BENEFÍCIOS PLANO VIP
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* VIP Status */}
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-yellow-400" />
                                        Usuário VIP
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={editForm.is_vip ? 'sim' : 'nao'}
                                            onChange={(e) => setEditForm(prev => ({
                                                ...prev,
                                                is_vip: e.target.value === 'sim'
                                            }))}
                                            className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 appearance-none cursor-pointer relative z-10"
                                        >
                                            <option value="sim" className="bg-gray-900 text-gray-100">👑 Sim</option>
                                            <option value="nao" className="bg-gray-900 text-gray-100">❌ Não</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-20">
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="mt-2 p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                                        <p className="text-xs text-gray-300">
                                            {editForm.is_vip ? '👑 Usuário tem acesso VIP às músicas' : '🚫 Usuário sem acesso às músicas'}
                                        </p>
                                    </div>
                                </div>

                                {/* Uploader Status */}
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-orange-400" />
                                        Uploader
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={editForm.isUploader ? 'sim' : 'nao'}
                                            onChange={(e) => setEditForm(prev => ({
                                                ...prev,
                                                isUploader: e.target.value === 'sim'
                                            }))}
                                            className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-2xl text-gray-100 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 appearance-none cursor-pointer relative z-10"
                                        >
                                            <option value="sim" className="bg-gray-900 text-gray-100">📤 Sim</option>
                                            <option value="nao" className="bg-gray-900 text-gray-100">❌ Não</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-20">
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="mt-2 p-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
                                        <p className="text-xs text-gray-300">
                                            {editForm.isUploader ? '📤 Pode fazer upload de até 10 músicas/mês (GRÁTIS)' : '🚫 Sem permissão para upload'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== STATUS AUTOMÁTICOS ========== */}
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
                                        <Music className="w-4 h-4 text-purple-400" />
                                        Deemix Ativo (Automático)
                                    </label>
                                    <div className="px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-gray-100">
                                        <div className="flex items-center gap-3">
                                            {editForm.deemix ? (
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
                                            {editForm.deemix
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
                                                    if (!editForm.dataPagamento) return 'Não definida';

                                                    const dataPagamento = new Date(editForm.dataPagamento);
                                                    const period = editForm.period;

                                                    let meses = 1;
                                                    if (period === 'trimestral') meses = 3;
                                                    else if (period === 'semestral') meses = 6;
                                                    else if (period === 'anual') meses = 12;

                                                    const vencimento = new Date(dataPagamento);
                                                    vencimento.setMonth(vencimento.getMonth() + meses);

                                                    return vencimento.toLocaleDateString('pt-BR');
                                                })()}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Calculada automaticamente: {editForm.dataPagamento ? 'Data Pagamento + ' + editForm.period : 'Defina data de pagamento'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== RESUMO DO PLANO ========== */}
                    {editForm.planType && (
                        <div className="md:col-span-2 group">
                            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                                <label className="block text-lg font-bold text-green-400 mb-4 flex items-center gap-3">
                                    <span className="text-2xl">💰</span>
                                    RESUMO DO PLANO
                                </label>

                                {(() => {
                                    const plan = ALL_PLANS[editForm.planType as keyof typeof ALL_PLANS];
                                    const period = plan?.periods[editForm.period as keyof typeof plan.periods];

                                    if (!plan || !period) return null;

                                    return (
                                        <div className="space-y-4">
                                            {/* Nome do Plano */}
                                            <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                                                <div className="text-xl font-bold text-white mb-2">
                                                    {plan.name} - {editForm.period.charAt(0).toUpperCase() + editForm.period.slice(1)}
                                                </div>
                                                {(period as any).deemixFree && (
                                                    <div className="text-green-400 text-sm">🎵 Deemix GRÁTIS!</div>
                                                )}
                                                {(period as any).uploaderFree && (
                                                    <div className="text-green-400 text-sm">📤 Uploader GRÁTIS!</div>
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
                                                        {editForm.period.charAt(0).toUpperCase() + editForm.period.slice(1)}
                                                    </div>
                                                    {period.discount > 0 && (
                                                        <div className="text-green-400 text-sm">{(period.discount * 100)}% OFF</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Valor Total */}
                                            <div className="text-center p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
                                                <div className="text-sm text-gray-400 mb-2">VALOR TOTAL</div>
                                                <div className="text-4xl font-bold text-green-400">R$ {period.total.toFixed(2)}</div>
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

                    {/* ========== CAMPOS BÁSICOS ========== */}
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
                                        value={editForm.status}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
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
                                        value={editForm.dataPagamento || ''}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, dataPagamento: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botões */}
            <div className="mt-10 pt-8 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/admin/users')}
                        className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </div>
        </AdminAuth>
    );
}

export default EditUserPage;
