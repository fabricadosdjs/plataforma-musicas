"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useDownloadsCache } from "@/hooks/useDownloadsCache";
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
    ExternalLink as ExternalLinkIcon
} from 'lucide-react';

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
    const [recentDownloads, setRecentDownloads] = useState<RecentActivity[]>([]);
    const [recentLikes, setRecentLikes] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        // Simular carregamento de dados
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                        <p className="text-white text-xl">Carregando perfil...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!session?.user) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-8 w-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
                        <p className="text-gray-400">Você precisa estar logado para acessar esta página.</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-black text-white">
                {/* Header da Página */}
                <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20 border-b border-gray-800/50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                                Meu Perfil
                            </h1>
                            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl">
                                Gerencie suas informações, veja suas estatísticas e acompanhe seu plano VIP
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Sistema de Abas */}
                    <div className="mb-8 sm:mb-12">
                        <div className="border-b border-gray-800/50">
                            <nav className="flex flex-wrap -mb-px gap-2 sm:gap-4 overflow-x-auto">
                                {[
                                    { id: 'visao-geral', label: 'Visão Geral', icon: BarChart3, href: '/profile/visao-geral' },
                                    { id: 'meu-plano', label: 'Meu Plano', icon: Crown, href: '/profile/meu-plano' },
                                    { id: 'dados', label: 'Dados', icon: User, href: '/profile/dados' },
                                    { id: 'atividade', label: 'Atividade', icon: Activity, href: '/profile/atividade' },
                                    { id: 'beneficios', label: 'Benefícios', icon: Gift, href: '/profile/beneficios' },
                                    { id: 'deemix', label: 'Deemix', icon: Music2, href: '/profile/deemix' },
                                    { id: 'allavsoft', label: 'Allavsoft', icon: Download, href: '/profile/allavsoft' }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = window.location.pathname === tab.href;

                                    return (
                                        <a
                                            key={tab.id}
                                            href={tab.href}
                                            className={`
                                                flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 whitespace-nowrap
                                                ${isActive
                                                    ? 'text-red-400 border-b-2 border-red-400 bg-red-400/10'
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                                }
                                            `}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                        </a>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        {/* Status VIP */}
                        <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-gray-800/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                    <Crown className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm text-gray-400 font-medium">Status VIP</p>
                                    <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{vipStatus.plan}</p>
                                </div>
                            </div>
                        </div>

                        {/* Downloads */}
                        <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-gray-800/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                    <Download className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm text-gray-400 font-medium">Downloads</p>
                                    <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{downloadsCache.downloadedTrackIds.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Likes */}
                        <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-gray-800/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                    <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm text-gray-400 font-medium">Likes</p>
                                    <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{downloadsCache.likedTrackIds.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Vencimento */}
                        <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-gray-800/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                    <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm text-gray-400 font-medium">Vencimento</p>
                                    <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                        {vipStatus.hasValidVencimento ? formatDate(vipStatus.vencimento) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Informações VIP */}
                    {vipStatus.isVip && (
                        <div className="mb-8 sm:mb-12">
                            <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                <Crown className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">👑 Plano {vipStatus.plan}</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                {/* Status do Sistema */}
                                <div className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative">
                                        <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                                            <Database className="h-6 w-6 text-blue-400" />
                                            Status do Sistema
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                                <span className="text-gray-300 text-sm">Cache:</span>
                                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${downloadsCache.isLoading
                                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                    : downloadsCache.error
                                                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                    }`}>
                                                    {downloadsCache.isLoading ? 'Sincronizando...' : downloadsCache.error ? 'Erro' : 'Sincronizado'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                                <span className="text-gray-300 text-sm">Downloads:</span>
                                                <span className="text-white font-semibold">
                                                    {downloadsCache.downloadedTrackIds.length} músicas
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                                <span className="text-gray-300 text-sm">Likes:</span>
                                                <span className="text-white font-semibold">
                                                    {downloadsCache.likedTrackIds.length} músicas
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Benefícios VIP */}
                                <div className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative">
                                        <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                                            <Gift className="h-6 w-6 text-yellow-400" />
                                            Benefícios VIP
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                                <span className="text-gray-300 text-sm">Downloads Diários:</span>
                                                <span className="text-yellow-300 font-semibold">
                                                    {downloadsCache.downloadsLeft === 'Ilimitado' ? '∞ Ilimitado' : `${downloadsCache.downloadsLeft} restantes`}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                                <span className="text-gray-300 text-sm">Usados Hoje:</span>
                                                <span className="text-white font-semibold">
                                                    {downloadsCache.dailyDownloadCount}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                                <span className="text-gray-300 text-sm">Status:</span>
                                                <span className="text-green-400 font-semibold flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Ativo
                                                </span>
                                            </div>

                                            {vipStatus.hasValidVencimento && (
                                                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                                    <span className="text-gray-300 text-sm">Vencimento:</span>
                                                    <span className="text-white font-semibold">
                                                        {formatDate(vipStatus.vencimento)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seção de Informações Pessoais */}
                    <div className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <User className="h-6 w-6 sm:h-7 sm:w-7 text-purple-400" />
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Informações Pessoais</h2>
                        </div>

                        <div className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <User className="h-5 w-5 text-purple-400" />
                                            <div>
                                                <p className="text-gray-400 text-xs">Nome</p>
                                                <p className="text-white font-semibold">{session.user.name || 'Não informado'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <Mail className="h-5 w-5 text-blue-400" />
                                            <div>
                                                <p className="text-gray-400 text-xs">Email</p>
                                                <p className="text-white font-semibold">{session.user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <Phone className="h-5 w-5 text-green-400" />
                                            <div>
                                                <p className="text-gray-400 text-xs">WhatsApp</p>
                                                <p className="text-white font-semibold">
                                                    {(session.user as any).whatsapp || 'Não informado'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <DollarSign className="h-5 w-5 text-yellow-400" />
                                            <div>
                                                <p className="text-gray-400 text-xs">Valor Mensal</p>
                                                <p className="text-white font-semibold">
                                                    {(session.user as any).valor ? `R$ ${(session.user as any).valor}` : 'Não informado'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Downloads e Limites */}
                    <div className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <Download className="h-6 w-6 sm:h-7 sm:w-7 text-green-400" />
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Downloads e Limites</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            {/* Downloads Hoje */}
                            <div className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                                        <Download className="h-6 w-6 text-green-400" />
                                        Downloads Hoje
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Usados:</span>
                                            <span className="text-white font-semibold text-2xl">
                                                {downloadsCache.dailyDownloadCount}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Limite:</span>
                                            <span className="text-green-400 font-semibold">
                                                {downloadsCache.downloadsLeft === 'Ilimitado' ? '∞ Ilimitado' : downloadsCache.downloadsLeft}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Último Reset:</span>
                                            <span className="text-white font-semibold">
                                                {(session.user as any).lastDownloadReset ? formatDate((session.user as any).lastDownloadReset) : 'Nunca'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pack Requests Semanais */}
                            <div className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                                        <Package className="h-6 w-6 text-orange-400" />
                                        Pack Requests
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Usados:</span>
                                            <span className="text-white font-semibold text-2xl">
                                                {(session.user as any).weeklyPackRequestsUsed || 0}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Limite:</span>
                                            <span className="text-orange-400 font-semibold">
                                                {(session.user as any).weeklyPackRequests || 0} por semana
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Último Reset:</span>
                                            <span className="text-white font-semibold">
                                                {(session.user as any).lastWeekReset ? formatDate((session.user as any).lastWeekReset) : 'Nunca'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Ferramentas Premium */}
                    <div className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <Settings className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Ferramentas Premium</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                            {/* Deemix Premium */}
                            <div className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                                        <Disc className="h-6 w-6 text-purple-400" />
                                        Deemix Premium
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Status:</span>
                                            <span className={`font-semibold flex items-center gap-2 ${(session.user as any).deemix ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                <div className={`h-3 w-3 rounded-full ${(session.user as any).deemix ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                {(session.user as any).deemix ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>

                                        {(session.user as any).deemix && (
                                            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                                                <p className="text-green-400 text-sm text-center">
                                                    ✓ Acesso liberado ao Deemix
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Deezer Premium */}
                            <div className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                                        <Headphones className="h-6 w-6 text-blue-400" />
                                        Deezer Premium
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Status:</span>
                                            <span className={`font-semibold flex items-center gap-2 ${(session.user as any).deezerPremium ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                <div className={`h-3 w-3 rounded-full ${(session.user as any).deezerPremium ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                {(session.user as any).deezerPremium ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>

                                        {(session.user as any).deezerPremium && (
                                            <div className="space-y-2">
                                                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                                                    <p className="text-green-400 text-sm text-center">
                                                        ✓ Deezer Premium incluído
                                                    </p>
                                                </div>
                                                {(session.user as any).deezerEmail && (
                                                    <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                                        <p className="text-gray-300 text-xs text-center">
                                                            Email: {(session.user as any).deezerEmail}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Uploader */}
                            <div className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                                        <Upload className="h-6 w-6 text-orange-400" />
                                        Uploader
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                                            <span className="text-gray-300 text-sm">Status:</span>
                                            <span className={`font-semibold flex items-center gap-2 ${(session.user as any).isUploader ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                <div className={`h-3 w-3 rounded-full ${(session.user as any).isUploader ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                {(session.user as any).isUploader ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>

                                        {(session.user as any).isUploader && (
                                            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                                                <p className="text-green-400 text-sm text-center">
                                                    ✓ Pode fazer upload de músicas
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Ações Rápidas */}
                    <div className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Ações Rápidas</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {/* Renovar Plano */}
                            <a href="/plans" className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                                        <CreditCard className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Renovar Plano</h3>
                                    <p className="text-gray-400 text-sm">Estenda sua assinatura VIP</p>
                                </div>
                            </a>

                            {/* Deemix */}
                            <a href="/profile/deemix" className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                                        <Disc className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Deemix</h3>
                                    <p className="text-gray-400 text-sm">Acesse o Deemix agora</p>
                                </div>
                            </a>

                            {/* Suporte VIP */}
                            <a href="https://wa.me/5551935052274" target="_blank" rel="noopener noreferrer" className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                                        <MessageCircle className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Suporte VIP</h3>
                                    <p className="text-gray-400 text-sm">Fale conosco pelo WhatsApp</p>
                                </div>
                            </a>

                            {/* Nova Música */}
                            <a href="/new" className="bg-black border border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                                        <Music className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Nova Música</h3>
                                    <p className="text-gray-400 text-sm">Explore nosso catálogo</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Botão para atualizar cache */}
                    <div className="text-center">
                        <button
                            onClick={() => downloadsCache.refreshCache()}
                            disabled={downloadsCache.isLoading}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.02] border border-blue-500/30 hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <CheckCircle className="h-5 w-5" />
                            {downloadsCache.isLoading ? 'Sincronizando...' : 'Atualizar Cache'}
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfilePage;