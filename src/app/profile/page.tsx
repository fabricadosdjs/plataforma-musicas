"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";
import { useDownloadsCache } from "@/hooks/useDownloadsCache";
import { useUserEdit } from "@/hooks/useUserEdit";
import {
    User,
    Mail,
    Download,
    Music,
    Star,
    Crown,
    Calendar,
    Phone,
    TrendingUp,
    ShieldCheck,
    DollarSign,
    Package,
    ListMusic,
    Activity,
    CheckCircle,
    XCircle,
    BarChart3,
    Gift,
    Headphones,
    Key,
    Copy,
    ExternalLink,
    Upload,
    Heart,
    ArrowUpRight,
    CreditCard,
    Zap,
    Disc,
    Settings,
    Smartphone,
    Hand,
    Play,
    Info,
    Monitor,
    Diamond,
    Database,
    MessageCircle,
    Ban,
    Lock,
    Search,
    AlertCircle,
    Edit,
    Clock,
    Globe,
    Award,
    Users,
    Music2,
    Disc2,
    Volume2,
    MessageCircle as MessageCircleIcon,
    Mail as MailIcon,
    ExternalLink as ExternalLinkIcon,
    Home,
    Bell,
    UserCircle,
    ChevronRight,
    X
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { EditableField } from '@/components/ui/EditableField';

// Tipos para os dados da API
interface Track {
    id: string;
    songName: string;
    artist: string;
    imageUrl: string;
    style: string;
}

interface RecentActivity {
    id: number;
    downloadedAt?: string;
    createdAt?: string;
    track: Track;
}

const ProfilePage = () => {
    const { data: session } = useSession();
    const downloadsCache = useDownloadsCache();
    const userEdit = useUserEdit();
    const [recentDownloads, setRecentDownloads] = useState<RecentActivity[]>([]);
    const [recentLikes, setRecentLikes] = useState<RecentActivity[]>([]);
    const [downloadStats, setDownloadStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Função para obter o link de renovação baseado no plano
    const getRenewalLink = (plan: string): string => {
        const planLower = plan.toLowerCase();

        if (planLower.includes('básico')) {
            return 'https://mpago.la/28HWukZ'; // Mensal R$ 38,00
        } else if (planLower.includes('padrão')) {
            return 'https://mpago.la/1aFWE4k'; // Mensal R$ 42,00
        } else if (planLower.includes('completo')) {
            return 'https://mpago.la/2XTWvVS'; // Mensal R$ 60,00
        }

        // Link padrão para planos não identificados
        return 'https://mpago.la/28HWukZ';
    };

    // Função para formatar data
    const formatDate = (dateString: string | Date): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Função para determinar status VIP real
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

    // Função para formatar data e hora
    const formatDateTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Função para carregar dados de downloads
    const loadDownloadsData = async () => {
        if (!session?.user?.email) return;

        try {
            const response = await fetch('/api/profile/downloads');
            if (response.ok) {
                const data = await response.json();
                setDownloadStats(data.stats);
                setRecentDownloads(data.recentDownloads.map((download: any) => ({
                    id: download.id,
                    downloadedAt: download.downloadedAt,
                    track: {
                        id: download.track.id.toString(),
                        songName: download.track.songName,
                        artist: download.track.artist,
                        imageUrl: download.track.imageUrl,
                        style: download.track.style
                    }
                })));
            }
        } catch (error) {
            console.error('Erro ao carregar dados de downloads:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (session?.user?.email) {
                await loadDownloadsData();
            }
            setLoading(false);
        };

        loadData();
    }, [session?.user?.email]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] relative overflow-hidden">
                <Header />
                <div className="pt-12 lg:pt-16 min-h-screen bg-[#121212] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                        <p className="text-white text-xl">Carregando perfil...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-[#121212] relative overflow-hidden">
                <Header />
                <div className="pt-12 lg:pt-16 min-h-screen bg-[#121212] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-8 w-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
                        <p className="text-gray-400">Você precisa estar logado para acessar esta página.</p>
                    </div>
                </div>
            </div>
        );
    }

    const sidebarItems = [
        { id: 'overview', label: 'Visão Geral', icon: BarChart3, color: 'text-blue-400' },
        { id: 'profile', label: 'Informações', icon: User, color: 'text-green-400' },
        { id: 'downloads', label: 'Downloads', icon: Download, color: 'text-purple-400' },
        { id: 'likes', label: 'Curtidas', icon: Heart, color: 'text-pink-400' },
        { id: 'plan', label: 'Meu Plano', icon: Crown, color: 'text-yellow-400' },
        { id: 'activity', label: 'Atividade', icon: Activity, color: 'text-cyan-400' },
        { id: 'benefits', label: 'Benefícios', icon: Gift, color: 'text-emerald-400' },
        { id: 'deemix', label: 'Deemix', icon: Music2, color: 'text-violet-400' },
        { id: 'allavsoft', label: 'Allavsoft', icon: Disc, color: 'text-orange-400' },
        { id: 'settings', label: 'Configurações', icon: Settings, color: 'text-gray-400' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção */}
                        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <BarChart3 className="h-6 w-6 text-blue-400" />
                                Visão Geral da Conta
                            </h2>
                            <p className="text-gray-400">Resumo completo das suas atividades e estatísticas</p>
                        </div>

                        {/* Cards de Estatísticas */}
                        <div className="space-y-4">
                            {/* Downloads Hoje */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center">
                                    <Download className="h-10 w-10 text-purple-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Downloads Hoje</h3>
                                    <p className="text-white font-bold text-3xl mb-2">{downloadStats?.downloadsToday || downloadsCache?.dailyDownloadCount || 0}</p>
                                    <p className="text-gray-300 text-sm font-medium">Downloads realizados hoje</p>
                                </div>
                            </div>

                            {/* Total de Curtidas */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <Heart className="h-10 w-10 text-gray-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Total de Curtidas</h3>
                                    <p className="text-white font-bold text-3xl mb-2">6</p>
                                    <p className="text-gray-300 text-sm font-medium">Músicas favoritas</p>
                                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                                        <span className="text-gray-300 text-xs">Status: Ativo</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total de Downloads */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <Music className="h-10 w-10 text-gray-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Total de Downloads</h3>
                                    <p className="text-white font-bold text-3xl mb-2">1.870</p>
                                    <p className="text-gray-300 text-sm font-medium">Músicas baixadas</p>
                                </div>
                            </div>

                            {/* Status do Plano */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <Crown className="h-10 w-10 text-gray-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Plano Atual</h3>
                                    <p className="text-white font-bold text-3xl mb-2">{vipStatus.plan}</p>
                                    <p className={`text-sm font-medium ${vipStatus.isVip ? 'text-gray-200' : 'text-red-300'}`}>
                                        {vipStatus.isVip ? 'Status: Ativo' : 'Status: Inativo'}
                                    </p>
                                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                                        <span className="text-gray-300 text-xs">{vipStatus.isVip ? 'VIP ATIVO' : 'PLANO INATIVO'}</span>
                                    </div>
                                    {vipStatus.isVip && (
                                        <div className="mt-4 space-y-3">
                                            {/* Verificar se o plano está prestes a vencer (5 dias) */}
                                            {(() => {
                                                if (!vipStatus.vencimento) return null;

                                                const vencimento = new Date(vipStatus.vencimento);
                                                const hoje = new Date();
                                                const diffTime = vencimento.getTime() - hoje.getTime();
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                const isPrestesAVencer = diffDays <= 5 && diffDays > 0;
                                                const isVencido = diffDays < 0;

                                                return (
                                                    <>
                                                        {/* Botão de Renovação */}
                                                        <a
                                                            href={getRenewalLink(vipStatus.plan)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isPrestesAVencer || isVencido
                                                                ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                                                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                                                }`}
                                                            onClick={(e) => {
                                                                if (!isPrestesAVencer && !isVencido) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            <CreditCard className="h-4 w-4" />
                                                            {isVencido ? 'Plano Vencido - Renovar' : 'Renovar Plano'}
                                                        </a>

                                                        {/* Status do Plano */}
                                                        <div className="text-xs text-gray-400">
                                                            {isVencido ? (
                                                                <span className="text-red-400">Plano vencido há {Math.abs(diffDays)} dias</span>
                                                            ) : isPrestesAVencer ? (
                                                                <span className="text-yellow-400">Vence em {diffDays} dias</span>
                                                            ) : (
                                                                <span className="text-green-400">Plano em dia - vence em {diffDays} dias</span>
                                                            )}
                                                        </div>

                                                        {/* Botão WhatsApp */}
                                                        <div className="space-y-2">
                                                            <p className="text-xs text-gray-400">
                                                                Se você já pagou o plano ou precisa de suporte, chame no WhatsApp da administração:
                                                            </p>
                                                            <div className="flex items-center gap-3">
                                                                <a
                                                                    href={`https://wa.me/5551935052274?text=Olá! Sou ${session.user.name} e preciso de ajuda com meu plano ${vipStatus.plan}.`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                                >
                                                                    <MessageCircle className="h-4 w-4" />
                                                                    CHAMAR NO WHATSAPP
                                                                </a>
                                                                <span className="text-xs text-gray-400">
                                                                    Número: +55 51 9305-2274
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cards de Ações Rápidas */}
                        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-8 border border-gray-700/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Ações Rápidas</h3>
                                    <p className="text-gray-400 text-sm">Acesse rapidamente as principais funcionalidades</p>
                                </div>
                            </div>

                            <div className="bg-gray-800/90 rounded-2xl p-8 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-6 right-6 w-24 h-24 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <Zap className="h-12 w-12 text-gray-400/60" />
                                </div>

                                <div className="relative z-10">
                                    <div className="text-center mb-8">
                                        <h3 className="text-white font-bold text-2xl mb-2">Ações Rápidas</h3>
                                        <p className="text-gray-300 text-lg">Acesse rapidamente as principais funcionalidades</p>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Renovar Plano */}
                                        <a href="/plans" className="text-center p-4 rounded-xl bg-gray-700/30">
                                            <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <CreditCard className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <h4 className="text-white font-semibold mb-1">Renovar Plano</h4>
                                            <p className="text-gray-300 text-xs">Estenda sua assinatura VIP</p>
                                        </a>

                                        {/* Nova Música */}
                                        <a href="/new" className="text-center p-4 rounded-xl bg-gray-700/30">
                                            <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <Music className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <h4 className="text-white font-semibold mb-1">Nova Música</h4>
                                            <p className="text-gray-300 text-xs">Explore nosso catálogo</p>
                                        </a>

                                        {/* Deemix */}
                                        <a href="/profile/deemix" className="text-center p-4 rounded-xl bg-gray-700/30">
                                            <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <Disc className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <h4 className="text-white font-semibold mb-1">Deemix</h4>
                                            <p className="text-gray-300 text-xs">Downloads em alta qualidade</p>
                                        </a>

                                        {/* Suporte */}
                                        <a href="https://wa.me/5551935052274" target="_blank" rel="noopener noreferrer" className="text-center p-4 rounded-xl bg-gray-700/30">
                                            <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <MessageCircle className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <h4 className="text-white font-semibold mb-1">Suporte VIP</h4>
                                            <p className="text-gray-300 text-xs">Fale conosco pelo WhatsApp</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção */}
                        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <User className="h-6 w-6 text-green-400" />
                                Informações do Cliente
                            </h2>
                            <p className="text-gray-400">Dados pessoais e informações da sua conta</p>
                        </div>

                        {/* Mensagens de Feedback */}
                        {(userEdit.error || userEdit.success) && (
                            <div className="bg-gray-800/90 rounded-2xl p-4 border border-gray-700/50">
                                {userEdit.error && (
                                    <div className="flex items-center gap-2 text-red-400">
                                        <AlertCircle className="h-5 w-5" />
                                        <span>{userEdit.error}</span>
                                        <button
                                            onClick={userEdit.resetMessages}
                                            className="ml-auto text-gray-400 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                {userEdit.success && (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <CheckCircle className="h-5 w-5" />
                                        <span>{userEdit.success}</span>
                                        <button
                                            onClick={userEdit.resetMessages}
                                            className="ml-auto text-gray-400 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cards de Informações - Um por Linha */}
                        <div className="space-y-4">
                            {/* Nome Completo */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <User className="h-10 w-10 text-gray-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Nome Completo</h3>
                                    <EditableField
                                        value={userEdit.editedData.name || ''}
                                        onSave={async (value) => {
                                            console.log('💾 Salvando Nome:', value);
                                            userEdit.updateField('name', value);
                                            await userEdit.saveChanges();
                                        }}
                                        onCancel={userEdit.cancelEditing}
                                        onStartEdit={() => userEdit.startEditing('name')}
                                        isEditing={userEdit.isEditing && userEdit.editingField === 'name'}
                                        isLoading={userEdit.isLoading}
                                        placeholder="Digite seu nome completo"
                                        maxLength={100}
                                        validation={(value) => {
                                            if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
                                            if (value.length > 100) return 'Nome muito longo';
                                            return null;
                                        }}
                                    />
                                    <p className="text-gray-300 text-sm font-medium">Nome registrado na conta</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <Mail className="h-10 w-10 text-gray-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Email</h3>
                                    <EditableField
                                        value={userEdit.editedData.email || ''}
                                        onSave={async (value) => {
                                            console.log('💾 Salvando Email:', value);
                                            userEdit.updateField('email', value);
                                            await userEdit.saveChanges();
                                        }}
                                        onCancel={userEdit.cancelEditing}
                                        onStartEdit={() => userEdit.startEditing('email')}
                                        isEditing={userEdit.isEditing && userEdit.editingField === 'email'}
                                        isLoading={userEdit.isLoading}
                                        placeholder="Digite seu email"
                                        maxLength={100}
                                        validation={(value) => {
                                            if (!value.includes('@')) return 'Email inválido';
                                            if (value.length < 5) return 'Email muito curto';
                                            return null;
                                        }}
                                    />
                                    <p className="text-gray-300 text-sm font-medium">Email de acesso à conta</p>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <Phone className="h-10 w-10 text-gray-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">WhatsApp</h3>
                                    <EditableField
                                        value={userEdit.editedData.whatsapp || '(51) 98108 - 6784'}
                                        onSave={async (value) => {
                                            console.log('💾 Salvando WhatsApp:', value);
                                            userEdit.updateField('whatsapp', value);
                                            await userEdit.saveChanges();
                                        }}
                                        onCancel={userEdit.cancelEditing}
                                        onStartEdit={() => userEdit.startEditing('whatsapp')}
                                        isEditing={userEdit.isEditing && userEdit.editingField === 'whatsapp'}
                                        isLoading={userEdit.isLoading}
                                        placeholder="Digite seu WhatsApp"
                                        maxLength={20}
                                        validation={(value) => {
                                            if (value.length < 10) return 'WhatsApp deve ter pelo menos 10 caracteres';
                                            return null;
                                        }}
                                    />
                                    <p className="text-gray-300 text-sm font-medium">Contato para suporte</p>
                                </div>
                            </div>

                            {/* Status VIP */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <Crown className="h-10 w-10 text-gray-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Status VIP</h3>
                                    <p className="text-white font-bold text-3xl mb-2">{vipStatus.isVip ? 'ATIVO' : 'INATIVO'}</p>
                                    <p className={`text-sm font-medium ${vipStatus.isVip ? 'text-green-400' : 'text-red-400'}`}>
                                        {vipStatus.isVip ? 'Plano ativo e funcionando' : 'Plano inativo ou vencido'}
                                    </p>
                                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                                        <span className="text-gray-300 text-xs">Plano: {vipStatus.plan}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Plano e Vencimento */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-gray-600/30 rounded-full flex items-center justify-center">
                                    <Package className="h-10 w-10 text-gray-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Detalhes do Plano</h3>
                                    <p className="text-white font-bold text-3xl mb-2">{vipStatus.plan}</p>
                                    <p className="text-gray-300 text-sm font-medium">Valor: R$ 38,00/mês</p>
                                    {vipStatus.vencimento && (
                                        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                                            <span className="text-gray-300 text-xs">Vence em: {formatDate(vipStatus.vencimento)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'downloads':

                return (
                    <div className="space-y-6">
                        {/* Header da Seção */}
                        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <Download className="h-6 w-6 text-purple-400" />
                                Histórico de Downloads
                            </h2>
                            <p className="text-gray-400">Acompanhe todas as suas músicas baixadas</p>
                        </div>

                        {/* Cards de Estatísticas de Download */}
                        <div className="space-y-4">
                            {/* Total de Downloads */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center">
                                    <Download className="h-10 w-10 text-purple-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Total Downloads</h3>
                                    <p className="text-white font-bold text-3xl mb-2">{downloadStats?.totalDownloads || 0}</p>
                                    <p className="text-gray-300 text-sm font-medium">Músicas baixadas</p>
                                </div>
                            </div>

                            {/* Downloads Hoje */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
                                    <Clock className="h-10 w-10 text-green-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Downloads Hoje</h3>
                                    <p className="text-white font-bold text-3xl mb-2">{downloadStats?.downloadsToday || 0}</p>
                                    <p className="text-gray-300 text-sm font-medium">
                                        Limite: {downloadStats?.dailyLimit || 'Carregando...'}
                                    </p>
                                </div>
                            </div>

                            {/* Último Download */}
                            <div className="bg-gray-800/90 rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center">
                                    <Calendar className="h-10 w-10 text-blue-400/60" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-white font-bold text-xl mb-2">Último Download</h3>
                                    <p className="text-white font-bold text-lg mb-2">
                                        {downloadStats?.lastDownload ? formatDate(downloadStats.lastDownload) : 'Nenhum'}
                                    </p>
                                    <p className="text-gray-300 text-sm font-medium">Data do último download</p>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Downloads Recentes */}
                        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-6 border border-gray-700/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                                    <ListMusic className="h-5 w-5 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Downloads Recentes</h3>
                            </div>

                            {recentDownloads.length > 0 ? (
                                <div className="space-y-4">
                                    {recentDownloads.map((download) => (
                                        <div key={download.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                                            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                                                {download.track.imageUrl ? (
                                                    <img
                                                        src={download.track.imageUrl}
                                                        alt={download.track.songName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            target.parentElement!.innerHTML = '<Music className="h-6 w-6 text-gray-400" />';
                                                        }}
                                                    />
                                                ) : (
                                                    <Music className="h-6 w-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-semibold truncate">{download.track.songName}</h4>
                                                <p className="text-gray-400 text-sm truncate">{download.track.artist}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {download.track.style && download.track.style.trim() !== '' && (
                                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                                                            {download.track.style}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-400 text-sm">{download.downloadedAt ? formatDateTime(download.downloadedAt) : 'Data não disponível'}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Download className="h-4 w-4 text-purple-400" />
                                                    <span className="text-purple-400 text-xs">Baixado</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Download className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-2">Nenhum download recente</p>
                                    <p className="text-gray-500 text-sm">Suas músicas baixadas aparecerão aqui</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'likes':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção */}
                        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <Heart className="h-6 w-6 text-pink-400" />
                                Músicas Curtidas
                            </h2>
                            <p className="text-gray-400">Suas músicas favoritas e preferências</p>
                        </div>

                        {/* Cards de Estatísticas de Likes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Total de Curtidas */}
                            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-6 border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300 group hover:scale-[1.02]">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl flex items-center justify-center group-hover:from-pink-500/30 group-hover:to-rose-500/30 transition-all duration-300">
                                        <Heart className="h-6 w-6 text-pink-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-400 text-sm font-medium">Total de Curtidas</h3>
                                        <p className="text-white font-bold text-3xl">6</p>
                                    </div>
                                </div>
                                <p className="text-pink-400 text-xs font-medium">Músicas favoritas</p>
                            </div>

                            {/* Gêneros Favoritos */}
                            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group hover:scale-[1.02]">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all duration-300">
                                        <Music className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-400 text-sm font-medium">Gêneros Favoritos</h3>
                                        <p className="text-white font-bold text-3xl">3</p>
                                    </div>
                                </div>
                                <p className="text-purple-400 text-xs font-medium">Estilos preferidos</p>
                            </div>
                        </div>

                        {/* Lista de Curtidas */}
                        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-6 border border-gray-700/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
                                    <ListMusic className="h-5 w-5 text-pink-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Músicas Curtidas</h3>
                            </div>

                            <div className="text-center py-12">
                                <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 mb-2">Nenhuma música curtida</p>
                                <p className="text-gray-500 text-sm">Suas músicas favoritas aparecerão aqui</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Selecione uma Opção</h3>
                        <p className="text-gray-400">Escolha uma das opções no menu lateral para ver as informações</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] relative overflow-hidden">
            <Header />

            <div className="pt-12 lg:pt-16 min-h-screen bg-[#121212]">
                <div className="max-w-[95%] mx-auto px-4 py-4 sm:py-8">
                    {/* Header da Página */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Meu Perfil
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-none lg:max-w-4xl">
                            Gerencie suas informações, veja suas estatísticas e acompanhe seu plano VIP
                        </p>
                    </div>

                    {/* Layout Principal */}
                    <div className="flex gap-6">
                        {/* Sidebar */}
                        <div className="w-64 flex-shrink-0">
                            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
                                <nav className="space-y-2">
                                    {sidebarItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${activeTab === item.id
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                                    }`}
                                            >
                                                <Icon className={`h-5 w-5 ${activeTab === item.id ? 'text-green-400' : item.color}`} />
                                                <span className="font-medium">{item.label}</span>
                                                {activeTab === item.id && (
                                                    <ChevronRight className="h-4 w-4 ml-auto text-green-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Conteúdo Principal */}
                        <div className="flex-1">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black border-t border-gray-800/50 py-8 mt-16">
                <div className="max-w-[95%] mx-auto px-4">
                    <div className="text-center">
                        {/* Logo e Nome */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <Music className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Nexor Records Pools</h3>
                        </div>

                        {/* Links de Navegação */}
                        <div className="flex flex-wrap justify-center gap-6 mb-6">
                            <a href="/new" className="text-gray-400 hover:text-white transition-colors">Novidades</a>
                            <a href="/trending" className="text-gray-400 hover:text-white transition-colors">Trending</a>
                            <a href="/plans" className="text-gray-400 hover:text-white transition-colors">Planos</a>
                            <a href="/debridlink" className="text-gray-400 hover:text-white transition-colors">Debrid-Link</a>
                            <a href="/allavsoft" className="text-gray-400 hover:text-white transition-colors">Allavsoft</a>
                            <a href="/deemix" className="text-gray-400 hover:text-white transition-colors">Deemix</a>
                            <a href="/privacidade" className="text-gray-400 hover:text-white transition-colors">Privacidade</a>
                            <a href="/termos" className="text-gray-400 hover:text-white transition-colors">Termos</a>
                        </div>

                        {/* Redes Sociais */}
                        <div className="flex justify-center gap-4 mb-6">
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                                <span className="text-sm font-bold">F</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                                <span className="text-sm font-bold">T</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                                <span className="text-sm font-bold">I</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                                <span className="text-sm font-bold">Y</span>
                            </a>
                        </div>

                        {/* Copyright */}
                        <div className="text-gray-500 text-sm">
                            © 2025 Nexor Records Pools. Todos os direitos reservados.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProfilePage;