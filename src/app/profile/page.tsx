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
    X,
    RefreshCw
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { EditableField } from '@/components/ui/EditableField';
import ActivityChart from '@/components/ui/ActivityChart';

// Tipos para os dados da API
interface Track {
    id: string;
    songName: string;
    artist: string;
    imageUrl: string;
    style: string;
    pool?: string;
    folder?: string;
}

interface RecentActivity {
    id: number;
    downloadedAt?: string;
    likedAt?: string;
    track: Track;
}

const ProfilePage = () => {
    const { data: session, update: updateSession, status } = useSession();
    const downloadsCache = useDownloadsCache();
    const userEdit = useUserEdit();

    // Debug: Log do status da sessão
    console.log('🔍 SESSION STATUS:', status);
    console.log('🔍 SESSION DATA:', session);
    const [recentDownloads, setRecentDownloads] = useState<RecentActivity[]>([]);
    const [recentLikes, setRecentLikes] = useState<RecentActivity[]>([]);
    const [downloadStats, setDownloadStats] = useState<any>(null);
    const [activityStats, setActivityStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [likesLoading, setLikesLoading] = useState(false);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Estado para dados da sessão atualizados
    const [sessionData, setSessionData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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

    // Função para verificar se o botão de renovação deve estar habilitado
    const isRenewalButtonEnabled = () => {
        if (!vipStatus.vencimento) return false;

        const vencimento = new Date(vipStatus.vencimento);
        const hoje = new Date();
        const diffTime = vencimento.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Botão habilitado apenas quando está a 5 dias ou menos do vencimento OU já venceu
        return diffDays <= 5 || diffDays < 0;
    };

    // Função para formatar data
    const formatDate = (dateString: string | Date): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Função para construir o nome do plano (apenas o tipo)
    const buildPlanDisplayName = () => {
        if (!session?.user) return 'Free';

        // Usar dados locais se disponíveis, senão usar a sessão
        const userData = sessionData || session.user;
        const planType = (userData as any)?.planType;

        // Debug: Log dos valores para diagnóstico
        console.log('🔍 BUILD PLAN DEBUG:', {
            planType,
            sessionUser: session.user
        });

        // Apenas os 3 planos principais
        const planNames: { [key: string]: string } = {
            'BÁSICO': 'Básico',
            'PADRÃO': 'Padrão',
            'COMPLETO': 'Completo'
        };

        const planName = planNames[planType] || 'Básico';

        console.log('🔍 PLAN NAME RESULT:', planName);
        return planName;
    };

    // Função para calcular o valor correto do plano
    const calculateCorrectValue = () => {
        if (!session?.user) return 0;

        // Usar dados locais se disponíveis, senão usar a sessão
        const userData = sessionData || session.user;

        // Debug: Log dos valores para diagnóstico
        console.log('🔍 CALCULATE VALUE DEBUG:', {
            valor: (userData as any)?.valor,
            planType: (userData as any)?.planType,
            period: (userData as any)?.period,
            deemix: (userData as any)?.deemix,
            deezerPremium: (userData as any)?.deezerPremium,
            isUploader: (userData as any)?.isUploader
        });

        // Se o usuário tem um valor salvo no banco, usar esse valor
        const savedValue = (userData as any)?.valor;
        if (savedValue && savedValue > 0) {
            console.log('🔍 USANDO VALOR SALVO:', savedValue);
            return parseFloat(savedValue);
        }

        // Caso contrário, calcular baseado nos campos
        const planType = (session.user as any).planType;
        const period = (session.user as any).period;
        const deemix = (session.user as any).deemix;
        const deezerPremium = (session.user as any).deezerPremium;
        const isUploader = (session.user as any).isUploader;

        // Valores base dos planos VIP
        const baseValues = {
            'BÁSICO': 35,
            'PADRÃO': 38,
            'COMPLETO': 42
        };

        let baseValue = 0;
        if (planType && baseValues[planType as keyof typeof baseValues]) {
            baseValue = baseValues[planType as keyof typeof baseValues];
        }

        // Aplicar multiplicador do período
        let periodMultiplier = 1;
        if (period === 'trimestral') periodMultiplier = 3;
        else if (period === 'semestral') periodMultiplier = 6;
        else if (period === 'anual') periodMultiplier = 12;

        let totalValue = baseValue * periodMultiplier;

        // Adicionar add-ons
        if (deemix === true) totalValue += 0; // Deemix não altera preço
        if (deezerPremium === true) totalValue += 9.75 * periodMultiplier; // R$ 9,75 por período
        if (isUploader === true) totalValue += 10 * periodMultiplier; // R$ 10,00 por período

        console.log('🔍 VALOR CALCULADO:', totalValue);
        return totalValue;
    };

    // Função para verificar status do Deemix
    const getDeemixStatus = () => {
        if (!session?.user) return { hasAccess: false, reason: 'Usuário não logado' };

        // Usar dados locais se disponíveis, senão usar a sessão
        const userData = sessionData || session.user;
        const plan = vipStatus.plan;
        const deemix = (userData as any).deemix;

        // Debug: Log dos valores
        console.log('🔍 DEEMIX STATUS DEBUG:', {
            plan,
            deemix,
            planType: (userData as any)?.planType,
            sessionUser: userData,
            deemixType: typeof deemix,
            deemixValue: deemix
        });

        // Verificar se tem acesso ao Deemix
        // deemix pode ser boolean true/false ou string "true"/"false"
        const deemixActive = deemix === true || deemix === 'true' || deemix === 1;
        const hasAccess = plan === 'COMPLETO' || deemixActive;

        let reason = '';
        if (plan === 'COMPLETO') {
            reason = 'Incluso no plano COMPLETO';
        } else if (deemixActive) {
            reason = 'Ativado manualmente';
        } else {
            reason = 'Não incluído no plano atual';
        }

        console.log('🔍 DEEMIX RESULT:', { hasAccess, reason, deemixActive });
        return { hasAccess, reason };
    };

    // Função para determinar status VIP real
    const getVipStatus = () => {
        if (!session?.user) return { isVip: false, plan: 'Free', hasValidVencimento: false };

        // Usar dados locais se disponíveis, senão usar a sessão
        const userData = sessionData || session.user;
        const isVipByField = session.user.is_vip;
        const vencimento = (userData as any).vencimento;
        const hasValidVencimento = vencimento && new Date(vencimento) > new Date();
        const isVipReal = isVipByField || hasValidVencimento;

        // Debug: Log dos campos da sessão
        console.log('🔍 GET VIP STATUS DEBUG:', {
            isVipByField,
            vencimento,
            hasValidVencimento,
            isVipReal,
            planName: (userData as any)?.planName,
            planType: (userData as any)?.planType,
            period: (userData as any)?.period,
            deemix: (userData as any)?.deemix,
            valor: (userData as any)?.valor
        });

        let plan = 'Free';
        let planName = '';
        let planType = '';

        if (isVipReal) {
            // Construir nome completo do plano
            plan = buildPlanDisplayName();
            planName = plan;
            planType = (userData as any)?.planType || '';
        }

        return {
            isVip: isVipReal,
            plan,
            planName,
            planType,
            hasValidVencimento,
            vencimento
        };
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

    // Função para carregar dados de likes
    const loadLikesData = async () => {
        if (!session?.user?.email) return;

        setLikesLoading(true);
        try {
            const response = await fetch('/api/profile/likes');
            if (response.ok) {
                const data = await response.json();
                setRecentLikes(data.likes.map((like: any) => ({
                    id: like.id,
                    likedAt: like.likedAt,
                    track: {
                        id: like.track.id,
                        songName: like.track.songName,
                        artist: like.track.artist,
                        imageUrl: like.track.imageUrl,
                        style: like.track.style,
                        pool: like.track.pool,
                        folder: like.track.folder
                    }
                })));
            }
        } catch (error) {
            console.error('Erro ao carregar dados de likes:', error);
        } finally {
            setLikesLoading(false);
        }
    };

    // Função para carregar dados de atividade
    const loadActivityData = async () => {
        if (!session?.user?.email) return;

        setActivityLoading(true);
        try {
            const response = await fetch('/api/profile/activity');
            if (response.ok) {
                const data = await response.json();
                setActivityStats(data);
            }
        } catch (error) {
            console.error('Erro ao carregar dados de atividade:', error);
        } finally {
            setActivityLoading(false);
        }
    };

    // Função para atualizar a sessão em tempo real

    const refreshUserSession = async () => {
        console.log('🔄 REFRESH USER SESSION INICIADA');
        if (!session?.user?.email) return;

        setRefreshing(true);
        try {
            console.log('🔄 FAZENDO REQUISIÇÃO PARA /api/profile/user');
            // Buscar dados atualizados do usuário
            const response = await fetch('/api/profile/user');
            console.log('🔄 RESPOSTA DA API:', response.status, response.statusText);
            if (response.ok) {
                const userData = await response.json();

                // Debug: Verificar dados recebidos
                console.log('🔍 DADOS RECEBIDOS DA API:', userData);
                console.log('🔍 CAMPOS CRÍTICOS:', {
                    planName: userData.planName,
                    planType: userData.planType,
                    period: userData.period,
                    deemix: userData.deemix,
                    deezerPremium: userData.deezerPremium,
                    isUploader: userData.isUploader,
                    valor: userData.valor
                });
                console.log('🔍 DEEMIX ANTES:', (session?.user as any)?.deemix);

                // Atualizar a sessão com os novos dados
                console.log('🔍 ATUALIZANDO SESSÃO COM:', userData);

                // Atualizar estado local com os novos dados
                setSessionData(userData);

                // Atualizar a sessão do NextAuth
                const updatedSession = {
                    ...session,
                    user: {
                        ...session.user,
                        planName: userData.planName,
                        planType: userData.planType,
                        period: userData.period,
                        deemix: userData.deemix,
                        deezerPremium: userData.deezerPremium,
                        isUploader: userData.isUploader,
                        valor: userData.valor,
                        updatedAt: userData.updatedAt
                    }
                };

                console.log('🔄 CHAMANDO updateSession COM:', updatedSession);

                const updateResult = await updateSession(updatedSession);

                console.log('✅ Sessão atualizada com sucesso');
                console.log('🔍 RESULTADO UPDATE:', updateResult);

                // Atualizar timestamp da última atualização
                setLastRefresh(new Date());

                // Atualizar timestamp da última atualização
                setLastRefresh(new Date());

                // Mostrar feedback visual
                setTimeout(() => setRefreshing(false), 1000);
            }
        } catch (error) {
            console.error('Erro ao atualizar sessão:', error);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        console.log('🔄 USE EFFECT TRIGGERED - SESSION:', session?.user?.email);

        const loadData = async () => {
            try {
                console.log('🔄 USE EFFECT EXECUTADO');
                if (session?.user?.email) {
                    console.log('🔄 CARREGANDO DADOS PARA:', session.user.email);
                    await loadDownloadsData();
                    await loadLikesData(); // Carregar dados de likes
                    await loadActivityData(); // Carregar dados de atividade
                    console.log('🔄 CHAMANDO refreshUserSession');
                    await refreshUserSession(); // Atualizar sessão em tempo real
                } else {
                    console.log('❌ SESSION OU EMAIL NÃO DISPONÍVEL:', { session, email: session?.user?.email });
                }
                setLoading(false);
            } catch (error) {
                console.error('❌ ERRO NO USE EFFECT:', error);
                setLoading(false);
            }
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
                        {/* Header da Seção com Design Melhorado */}
                        <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                            <BarChart3 className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                                Visão Geral da Conta
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 font-medium">
                                                    Dashboard
                                                </span>
                                            </h2>
                                            <p className="text-gray-300 text-lg">Resumo completo das suas atividades e estatísticas</p>
                                        </div>
                                    </div>

                                    {/* Botão de Atualização */}
                                    <div className="flex items-center gap-3">
                                        {lastRefresh && (
                                            <div className="text-sm text-gray-400">
                                                Última verificação: {lastRefresh.toLocaleDateString('pt-BR')}, {lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        <button
                                            onClick={refreshUserSession}
                                            disabled={refreshing}
                                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-300 ${refreshing
                                                ? 'bg-green-500/30 text-green-200 border-green-500/50 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-green-500/30 hover:border-green-500/50 shadow-lg hover:shadow-xl'
                                                }`}
                                            title="Atualizar dados do perfil em tempo real"
                                        >
                                            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                                            {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
                                        </button>
                                    </div>
                                </div>

                                {/* Status Rápido */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Status VIP</p>
                                                <p className={`font-bold ${vipStatus.isVip ? 'text-green-400' : 'text-red-400'}`}>
                                                    {vipStatus.isVip ? 'ATIVO' : 'INATIVO'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <Package className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Plano</p>
                                                <p className="text-blue-400 font-bold">{vipStatus.plan}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Download className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Downloads</p>
                                                <p className="text-purple-400 font-bold">{downloadStats?.totalDownloads || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                                <Heart className="h-5 w-5 text-pink-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Curtidas</p>
                                                <p className="text-pink-400 font-bold">{recentLikes.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status do Plano com Design Premium */}
                        {vipStatus.vencimento && (
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-all duration-300">
                                                <CreditCard className="h-8 w-8 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Status do Plano</h3>
                                                <p className="text-gray-300">Gerencie sua assinatura e renovações</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30 font-medium">
                                            Assinatura
                                        </div>
                                    </div>

                                    {(() => {
                                        const vencimento = new Date(vipStatus.vencimento);
                                        const hoje = new Date();
                                        const diffTime = vencimento.getTime() - hoje.getTime();
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        const isPrestesAVencer = diffDays <= 5 && diffDays > 0;
                                        const isVencido = diffDays < 0;

                                        return (
                                            <div className="space-y-4">
                                                {/* Botão de Renovação */}
                                                <div className="flex items-center justify-between p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                                            <CreditCard className="h-6 w-6 text-green-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white font-semibold text-lg">Renovação do Plano</h4>
                                                            <p className="text-gray-300 text-sm">
                                                                {isVencido ? 'Plano vencido - Renovação necessária' :
                                                                    isPrestesAVencer ? 'Plano vence em breve' : 'Plano em dia'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={getRenewalLink(vipStatus.plan)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${isRenewalButtonEnabled()
                                                            ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 hover:border-green-500/50'
                                                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                                                            }`}
                                                        onClick={(e) => {
                                                            if (!isRenewalButtonEnabled()) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    >
                                                        <CreditCard className="h-4 w-4" />
                                                        {isVencido ? 'Renovar Agora' : 'Renovar Plano'}
                                                    </a>
                                                </div>

                                                {/* Status Detalhado */}
                                                <div className="space-y-4">
                                                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                            <Calendar className="h-6 w-6 text-blue-400" />
                                                        </div>
                                                        <h4 className="text-white font-semibold mb-2">Vencimento</h4>
                                                        <p className="text-blue-400 text-lg font-bold">{formatDate(vipStatus.vencimento)}</p>
                                                    </div>

                                                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                            <Clock className="h-6 w-6 text-yellow-400" />
                                                        </div>
                                                        <h4 className="text-white font-semibold mb-2">Dias Restantes</h4>
                                                        <p className={`text-2xl font-bold ${isVencido ? 'text-red-400' : isPrestesAVencer ? 'text-yellow-400' : 'text-green-400'}`}>
                                                            {isVencido ? Math.abs(diffDays) : diffDays}
                                                        </p>
                                                        <p className={`text-sm ${isVencido ? 'text-red-400' : isPrestesAVencer ? 'text-yellow-400' : 'text-green-400'}`}>
                                                            {isVencido ? 'dias vencidos' : isPrestesAVencer ? 'dias restantes' : 'dias restantes'}
                                                        </p>
                                                    </div>

                                                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                            <ShieldCheck className="h-6 w-6 text-green-400" />
                                                        </div>
                                                        <h4 className="text-white font-semibold mb-2">Status</h4>
                                                        <p className={`text-lg font-bold ${isVencido ? 'text-red-400' : isPrestesAVencer ? 'text-yellow-400' : 'text-green-400'}`}>
                                                            {isVencido ? 'VENCIDO' : isPrestesAVencer ? 'ATENÇÃO' : 'ATIVO'}
                                                        </p>
                                                        <p className={`text-sm ${isVencido ? 'text-red-400' : isPrestesAVencer ? 'text-yellow-400' : 'text-green-400'}`}>
                                                            {isVencido ? 'Renovação necessária' : isPrestesAVencer ? 'Vence em breve' : 'Plano em dia'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Cards de Ações Rápidas com Design Moderno */}
                        <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-500">
                            {/* Background Effects */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.15),transparent_50%)] transition-all duration-500"></div>
                            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-all duration-300">
                                        <Zap className="h-8 w-8 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Ações Rápidas</h3>
                                        <p className="text-gray-300">Acesse rapidamente as principais funcionalidades</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Renovar Plano */}
                                    <a
                                        href={isRenewalButtonEnabled() ? "/plans" : "#"}
                                        onClick={(e) => {
                                            if (!isRenewalButtonEnabled()) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`group/action text-center p-6 rounded-2xl transition-all duration-300 border ${isRenewalButtonEnabled()
                                            ? 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700/50 hover:border-green-500/30 hover:scale-105'
                                            : 'bg-gray-700/50 border-gray-600/50 cursor-not-allowed opacity-60'
                                            }`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${isRenewalButtonEnabled()
                                            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover/action:scale-110'
                                            : 'bg-gray-600/20'
                                            }`}>
                                            <CreditCard className={`h-8 w-8 ${isRenewalButtonEnabled() ? 'text-green-400' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <h4 className={`font-semibold text-lg mb-2 ${isRenewalButtonEnabled() ? 'text-white' : 'text-gray-400'
                                            }`}>
                                            Renovar Plano
                                        </h4>
                                        <p className={`text-sm ${isRenewalButtonEnabled() ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                            {isRenewalButtonEnabled() ? 'Estenda sua assinatura VIP' : 'Disponível em até 5 dias do vencimento'}
                                        </p>
                                        {isRenewalButtonEnabled() && (
                                            <div className="mt-3 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform origin-left scale-x-0 group-hover/action:scale-x-100 transition-transform duration-500"></div>
                                            </div>
                                        )}
                                    </a>

                                    {/* Nova Música */}
                                    <a href="/new" className="group/action text-center p-6 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50 hover:border-blue-500/30 hover:scale-105">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-all duration-300">
                                            <Music className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <h4 className="text-white font-semibold text-lg mb-2">Nova Música</h4>
                                        <p className="text-gray-300 text-sm">Explore nosso catálogo</p>
                                        <div className="mt-3 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform origin-left scale-x-0 group-hover/action:scale-x-100 transition-transform duration-500"></div>
                                        </div>
                                    </a>

                                    {/* Deemix */}
                                    <a href="/profile/deemix" className="group/action text-center p-6 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/30 hover:scale-105">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-all duration-300">
                                            <Disc className="h-8 w-8 text-purple-400" />
                                        </div>
                                        <h4 className="text-white font-semibold text-lg mb-2">Deemix</h4>
                                        <p className="text-gray-300 text-sm">Downloads em alta qualidade</p>
                                        <div className="mt-3 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transform origin-left scale-x-0 group-hover/action:scale-x-100 transition-transform duration-500"></div>
                                        </div>
                                    </a>

                                    {/* Suporte */}
                                    <a href="https://wa.me/5551935052274" target="_blank" rel="noopener noreferrer" className="group/action text-center p-6 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50 hover:border-pink-500/30 hover:scale-105">
                                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-all duration-300">
                                            <MessageCircle className="h-8 w-8 text-pink-400" />
                                        </div>
                                        <h4 className="text-white font-semibold text-lg mb-2">Suporte VIP</h4>
                                        <p className="text-gray-300 text-sm">Fale conosco pelo WhatsApp</p>
                                        <div className="mt-3 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transform origin-left scale-x-0 group-hover/action:scale-x-100 transition-transform duration-500"></div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção com Design Melhorado */}
                        <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-green-500/30">
                                        <User className="h-8 w-8 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                            Informações do Cliente
                                            <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30 font-medium">
                                                Perfil Ativo
                                            </span>
                                        </h2>
                                        <p className="text-gray-300 text-lg">Gerencie seus dados pessoais e informações da conta</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Última verificação: {lastRefresh ? formatDateTime(lastRefresh.toISOString()) : 'Nunca'}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Rápido */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Status</p>
                                                <p className="text-green-400 font-bold">Verificado</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Membro desde</p>
                                                <p className="text-blue-400 font-bold">2024</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <ShieldCheck className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Segurança</p>
                                                <p className="text-purple-400 font-bold">Alta</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mensagens de Feedback com Design Melhorado */}
                        {(userEdit.error || userEdit.success) && (
                            <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 rounded-2xl p-6 border border-gray-600/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

                                {userEdit.error && (
                                    <div className="flex items-center gap-4 text-red-400 relative z-10">
                                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                                            <AlertCircle className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg mb-1">Erro ao Salvar</h4>
                                            <p className="text-red-300">{userEdit.error}</p>
                                        </div>
                                        <button
                                            onClick={userEdit.resetMessages}
                                            className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500/30 transition-all duration-200 border border-red-500/30"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                                {userEdit.success && (
                                    <div className="flex items-center gap-4 text-green-400 relative z-10">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg mb-1">Sucesso!</h4>
                                            <p className="text-green-300">{userEdit.success}</p>
                                        </div>
                                        <button
                                            onClick={userEdit.resetMessages}
                                            className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 hover:text-white hover:bg-green-500/30 transition-all duration-200 border border-green-500/30"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cards de Informações com Design Moderno */}
                        <div className="space-y-6">
                            {/* Nome Completo */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.05),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-all duration-300">
                                                <User className="h-8 w-8 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Nome Completo</h3>
                                                <p className="text-gray-300">Identificação principal da sua conta</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30 font-medium">
                                            Obrigatório
                                        </div>
                                    </div>

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

                                    <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Campo obrigatório</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Máximo 100 caracteres</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.05),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Mail className="h-8 w-8 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Email</h3>
                                                <p className="text-gray-300">Endereço de acesso e comunicação</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 font-medium">
                                            Primário
                                        </div>
                                    </div>

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

                                    <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Formato: usuario@dominio.com</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>Usado para login</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.05),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.1),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Phone className="h-8 w-8 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">WhatsApp</h3>
                                                <p className="text-gray-300">Contato para suporte e atendimento</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30 font-medium">
                                            Suporte
                                        </div>
                                    </div>

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

                                    <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Formato: (51) 99999-9999</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                            <span>Suporte prioritário</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informações de Segurança - Cloudflare */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-all duration-300">
                                                <ShieldCheck className="h-8 w-8 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Segurança da Conta</h3>
                                                <p className="text-gray-300">Proteção avançada para seus dados pessoais</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 font-medium">
                                            🔒 Protegido
                                        </div>
                                    </div>

                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <h4 className="text-white font-semibold">Proteção Cloudflare</h4>
                                        </div>
                                        <div className="space-y-3 text-blue-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                <span>Seu perfil está protegido pelo Cloudflare</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                <span>Proteção contra ataques DDoS e bots maliciosos</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                <span>Dados criptografados e seguros</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                <span>Monitoramento 24/7 da segurança</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                            <p className="text-blue-200 text-sm">
                                                💡 <strong>Informação:</strong> O Cloudflare é uma das maiores redes de segurança da internet,
                                                protegendo milhões de sites e aplicações em todo o mundo.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status VIP com Design Premium */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(234,179,8,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_70%_30%,rgba(234,179,8,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Crown className="h-8 w-8 text-yellow-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Status VIP</h3>
                                                <p className="text-gray-300">Informações do seu plano premium</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 text-sm rounded-full border font-medium ${vipStatus.isVip
                                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                            : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                            {vipStatus.isVip ? 'ATIVO' : 'INATIVO'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                                    <ShieldCheck className="h-5 w-5 text-yellow-400" />
                                                </div>
                                                <h4 className="text-white font-semibold">Status do Plano</h4>
                                            </div>
                                            <p className={`text-3xl font-black mb-2 ${vipStatus.isVip ? 'text-green-400' : 'text-red-400'}`}>
                                                {vipStatus.isVip ? 'ATIVO' : 'INATIVO'}
                                            </p>
                                            <p className={`text-sm font-medium ${vipStatus.isVip ? 'text-green-400' : 'text-red-400'}`}>
                                                {vipStatus.isVip ? 'Plano ativo e funcionando' : 'Plano inativo ou vencido'}
                                            </p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-blue-400" />
                                                </div>
                                                <h4 className="text-white font-semibold">Tipo de Plano</h4>
                                            </div>
                                            <p className="text-3xl font-black mb-2 text-blue-400">{vipStatus.plan}</p>
                                            <p className="text-sm font-medium text-blue-400">Seu plano atual</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Credenciais Deezer Premium */}
                            {session?.user?.deezerPremium && (
                                <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                    {/* Background Effects */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.15),transparent_50%)] transition-all duration-500"></div>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-all duration-300">
                                                    <Headphones className="h-8 w-8 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">Credenciais Deezer Premium</h3>
                                                    <p className="text-gray-300">Suas credenciais para acesso ao streaming premium</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-500/30 font-medium">
                                                🎧 Premium
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                        <Mail className="h-5 w-5 text-emerald-400" />
                                                    </div>
                                                    <h4 className="text-white font-semibold">Email</h4>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-emerald-400 text-lg font-mono bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-600/50 flex-1">
                                                        {session.user.deezerEmail || 'Não configurado'}
                                                    </p>
                                                    {session.user.deezerEmail && (
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(session.user.deezerEmail || '')}
                                                            className="px-3 py-2 bg-emerald-500/20 text-emerald-300 text-sm rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-200"
                                                            title="Copiar email"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                        <Key className="h-5 w-5 text-emerald-400" />
                                                    </div>
                                                    <h4 className="text-white font-semibold">Senha</h4>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-emerald-400 text-lg font-mono bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-600/50 flex-1">
                                                        {session.user.deezerPassword ? '••••••••' : 'Não configurada'}
                                                    </p>
                                                    {session.user.deezerPassword && (
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(session.user.deezerPassword || '')}
                                                            className="px-3 py-2 bg-emerald-500/20 text-emerald-300 text-sm rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-200"
                                                            title="Copiar senha"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                                            <div className="flex items-center gap-3 text-emerald-400">
                                                <Info className="h-5 w-5" />
                                                <p className="text-sm">
                                                    💡 Use essas credenciais para acessar o Deezer Premium em qualquer dispositivo.
                                                    Suas informações estão seguras e criptografadas.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Detalhes do Plano */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(147,51,234,0.05),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_50%,rgba(147,51,234,0.1),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Package className="h-8 w-8 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Detalhes do Plano</h3>
                                                <p className="text-gray-300">Informações completas sobre sua assinatura</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30 font-medium">
                                            Assinatura
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <Package className="h-6 w-6 text-purple-400" />
                                            </div>
                                            <h4 className="text-white font-semibold mb-2">Plano</h4>
                                            <p className="text-purple-400 text-2xl font-bold">{vipStatus.plan}</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <DollarSign className="h-6 w-6 text-green-400" />
                                            </div>
                                            <h4 className="text-white font-semibold mb-2">Valor Mensal</h4>
                                            <p className="text-green-400 text-2xl font-bold">
                                                R$ {calculateCorrectValue().toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <Calendar className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <h4 className="text-white font-semibold mb-2">Vencimento</h4>
                                            <p className="text-blue-400 text-lg font-bold">
                                                {vipStatus.vencimento ? formatDate(vipStatus.vencimento) : 'Não definido'}
                                            </p>
                                        </div>
                                    </div>

                                    {vipStatus.vencimento && (
                                        <div className="mt-6 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <Clock className="h-5 w-5 text-blue-400" />
                                                </div>
                                                <h4 className="text-white font-semibold">Próximo Vencimento</h4>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-300">Data: <span className="text-white font-semibold">{formatDate(vipStatus.vencimento)}</span></p>
                                                <a
                                                    href={getRenewalLink(vipStatus.plan)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${isRenewalButtonEnabled()
                                                        ? 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'
                                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed'}`}
                                                    onClick={(e) => {
                                                        if (!isRenewalButtonEnabled()) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    Renovar Plano
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'downloads':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção com Design Melhorado */}
                        <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                                        <Download className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                            Histórico de Downloads
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30 font-medium">
                                                Downloads
                                            </span>
                                        </h2>
                                        <p className="text-gray-300 text-lg">Acompanhe todas as suas músicas baixadas</p>
                                    </div>
                                </div>

                                {/* Status Rápido */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Download className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Total</p>
                                                <p className="text-purple-400 font-bold">{downloadStats?.totalDownloads || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Hoje</p>
                                                <p className="text-green-400 font-bold">{downloadStats?.downloadsToday || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Último</p>
                                                <p className="text-blue-400 font-bold">
                                                    {downloadStats?.lastDownload ? formatDate(downloadStats.lastDownload) : 'Nenhum'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                                <ShieldCheck className="h-5 w-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Limite</p>
                                                <p className="text-yellow-400 font-bold">{downloadStats?.dailyLimit || 'Ilimitado'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cards de Estatísticas de Download com Design Moderno */}
                        <div className="space-y-6">
                            {/* Total de Downloads */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(147,51,234,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_80%,rgba(147,51,234,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Download className="h-8 w-8 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Total de Downloads</h3>
                                                <p className="text-gray-300">Estatísticas completas dos seus downloads</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30 font-medium">
                                            Estatísticas
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Download className="h-8 w-8 text-purple-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Total Geral</h4>
                                            <p className="text-purple-400 text-3xl font-black mb-2">{downloadStats?.totalDownloads || 0}</p>
                                            <p className="text-gray-300 text-sm">Músicas baixadas</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Clock className="h-8 w-8 text-green-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Downloads Hoje</h4>
                                            <p className="text-green-400 text-3xl font-black mb-2">{downloadStats?.downloadsToday || 0}</p>
                                            <p className="text-gray-300 text-sm">
                                                Limite: {downloadStats?.dailyLimit || 'Ilimitado'}
                                            </p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Calendar className="h-8 w-8 text-blue-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Último Download</h4>
                                            <p className="text-blue-400 text-lg font-bold mb-2">
                                                {downloadStats?.lastDownload ? formatDate(downloadStats.lastDownload) : 'Nenhum'}
                                            </p>
                                            <p className="text-gray-300 text-sm">Data do último download</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Downloads Recentes com Design Premium */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-pink-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-all duration-300">
                                            <ListMusic className="h-8 w-8 text-pink-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Downloads Recentes</h3>
                                            <p className="text-gray-300">Suas músicas baixadas mais recentemente</p>
                                        </div>
                                    </div>

                                    {recentDownloads.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentDownloads.map((download) => (
                                                <div key={download.id} className="group/item bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-pink-500/30 transition-all duration-300 hover:scale-[1.02]">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-600/50 group-hover/item:border-pink-500/30 transition-all duration-300">
                                                            {download.track.imageUrl ? (
                                                                <img
                                                                    src={download.track.imageUrl}
                                                                    alt={download.track.songName}
                                                                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        target.parentElement!.innerHTML = '<Music className="h-8 w-8 text-gray-400" />';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Music className="h-8 w-8 text-gray-400" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-bold text-xl mb-2 group-hover/item:text-pink-300 transition-colors duration-300">
                                                                {download.track.songName}
                                                            </h4>
                                                            <p className="text-gray-300 text-lg mb-3">{download.track.artist}</p>

                                                            <div className="flex items-center gap-3 mb-3">
                                                                {download.track.style && download.track.style.trim() !== '' && (
                                                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-500/30 font-medium">
                                                                        {download.track.style}
                                                                    </span>
                                                                )}
                                                                {download.track.pool && download.track.pool.trim() !== '' && (
                                                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 font-medium">
                                                                        {download.track.pool}
                                                                    </span>
                                                                )}
                                                                {download.track.folder && download.track.folder.trim() !== '' && (
                                                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30 font-medium">
                                                                        {download.track.folder}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                <div className="flex items-center gap-2">
                                                                    <Download className="h-4 w-4 text-purple-400" />
                                                                    <span>Baixado em {download.downloadedAt ? formatDateTime(download.downloadedAt) : 'Data não disponível'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 group-hover/item:scale-110 transition-all duration-300">
                                                                <Download className="h-6 w-6 text-purple-400" />
                                                            </div>
                                                            <p className="text-purple-400 text-xs mt-2 font-medium">Baixado</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
                                                <Download className="h-12 w-12 text-gray-600" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-3">Nenhum download recente</h4>
                                            <p className="text-gray-400 mb-4">Suas músicas baixadas aparecerão aqui</p>
                                            <a
                                                href="/new"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-300"
                                            >
                                                <Music className="h-4 w-4" />
                                                Explorar Músicas
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'likes':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção com Design Melhorado */}
                        <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30">
                                        <Heart className="h-8 w-8 text-pink-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                            Músicas Curtidas
                                            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-sm rounded-full border border-pink-500/30 font-medium">
                                                Favoritos
                                            </span>
                                        </h2>
                                        <p className="text-gray-300 text-lg">Acompanhe todas as suas músicas favoritas</p>
                                    </div>
                                </div>

                                {/* Status Rápido */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                                <Heart className="h-5 w-5 text-pink-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Total</p>
                                                <p className="text-pink-400 font-bold">{recentLikes.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Music className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Estilos</p>
                                                <p className="text-purple-400 font-bold">
                                                    {[...new Set(recentLikes.map(like => like.track.style).filter(Boolean))].length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Última</p>
                                                <p className="text-blue-400 font-bold">
                                                    {recentLikes.length > 0 && recentLikes[0].likedAt ? formatDate(recentLikes[0].likedAt) : 'Nenhuma'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Status</p>
                                                <p className="text-emerald-400 font-bold">Ativo</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cards de Estatísticas de Likes com Design Moderno */}
                        <div className="space-y-6">
                            {/* Estatísticas Gerais */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-pink-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Heart className="h-8 w-8 text-pink-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Estatísticas de Curtidas</h3>
                                                <p className="text-gray-300">Resumo completo dos seus favoritos</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-pink-500/20 text-pink-300 text-sm rounded-full border border-pink-500/30 font-medium">
                                            Favoritos
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Heart className="h-8 w-8 text-pink-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Total de Curtidas</h4>
                                            <p className="text-pink-400 text-3xl font-black mb-2">{recentLikes.length}</p>
                                            <p className="text-gray-300 text-sm">Músicas favoritas</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Music className="h-8 w-8 text-purple-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Estilos Favoritos</h4>
                                            <p className="text-purple-400 text-3xl font-black mb-2">
                                                {[...new Set(recentLikes.map(like => like.track.style).filter(Boolean))].length}
                                            </p>
                                            <p className="text-gray-300 text-sm">Gêneros musicais</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Calendar className="h-8 w-8 text-blue-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Última Curtida</h4>
                                            <p className="text-blue-400 text-lg font-bold mb-2">
                                                {recentLikes.length > 0 && recentLikes[0].likedAt ? formatDate(recentLikes[0].likedAt) : 'Nenhuma'}
                                            </p>
                                            <p className="text-gray-300 text-sm">Data da última curtida</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Curtidas com Design Premium */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-all duration-300">
                                            <ListMusic className="h-8 w-8 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Músicas Curtidas</h3>
                                            <p className="text-gray-300">Suas músicas favoritas organizadas</p>
                                        </div>
                                    </div>

                                    {recentLikes.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentLikes.map((like) => (
                                                <div key={like.id} className="group/item bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-600/50 group-hover/item:border-purple-500/30 transition-all duration-300">
                                                            {like.track.imageUrl ? (
                                                                <img
                                                                    src={like.track.imageUrl}
                                                                    alt={like.track.songName}
                                                                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        target.parentElement!.innerHTML = '<Music className="h-8 w-8 text-gray-400" />';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Music className="h-8 w-8 text-gray-400" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-bold text-xl mb-2 group-hover/item:text-purple-300 transition-colors duration-300">
                                                                {like.track.songName}
                                                            </h4>
                                                            <p className="text-gray-300 text-lg mb-3">{like.track.artist}</p>

                                                            <div className="flex items-center gap-3 mb-3">
                                                                {like.track.style && like.track.style.trim() !== '' && (
                                                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-500/30 font-medium">
                                                                        {like.track.style}
                                                                    </span>
                                                                )}
                                                                {like.track.pool && like.track.pool.trim() !== '' && (
                                                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 font-medium">
                                                                        {like.track.pool}
                                                                    </span>
                                                                )}
                                                                {like.track.folder && like.track.folder.trim() !== '' && (
                                                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30 font-medium">
                                                                        {like.track.folder}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                <div className="flex items-center gap-2">
                                                                    <Heart className="h-4 w-4 text-pink-400" />
                                                                    <span>Curtido em {like.likedAt ? formatDateTime(like.likedAt) : 'Data não disponível'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center border border-pink-500/30 group-hover/item:scale-110 transition-all duration-300">
                                                                <Heart className="h-6 w-6 text-pink-400" />
                                                            </div>
                                                            <p className="text-pink-400 text-xs mt-2 font-medium">Favorito</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : likesLoading ? (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
                                                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-3">Carregando curtidas...</h4>
                                            <p className="text-gray-400 mb-4">Buscando suas músicas favoritas</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
                                                <Heart className="h-12 w-12 text-gray-600" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-3">Nenhuma música curtida</h4>
                                            <p className="text-gray-400 mb-4">Suas músicas favoritas aparecerão aqui</p>
                                            <a
                                                href="/new"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/30 hover:bg-pink-500/30 transition-all duration-300"
                                            >
                                                <Music className="h-4 w-4" />
                                                Explorar Músicas
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'allavsoft':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção com Design Melhorado */}
                        <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,146,60,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-all duration-300">
                                        <Disc className="h-8 w-8 text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                            Allavsoft - Download Universal
                                            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30 font-medium">
                                                Download
                                            </span>
                                        </h2>
                                        <p className="text-gray-300 text-lg">Ferramenta completa para download de vídeos e áudios de qualquer plataforma</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo Principal */}
                        <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-500">
                            {/* Background Effects */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.15),transparent_50%)] transition-all duration-500"></div>
                            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                            <div className="relative z-10">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Disc className="h-12 w-12 text-orange-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Allavsoft Premium</h3>
                                    <p className="text-orange-400 text-lg font-semibold mb-6">A ferramenta mais completa para downloads universais!</p>
                                </div>

                                {/* Características Principais */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Download className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <h4 className="text-white font-semibold text-lg mb-2">🌐 Download Universal</h4>
                                        <p className="text-blue-400 text-sm">YouTube, Vimeo, Facebook, Instagram e muito mais</p>
                                    </div>

                                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                        <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Monitor className="h-8 w-8 text-purple-400" />
                                        </div>
                                        <h4 className="text-white font-semibold text-lg mb-2">📱 Interface Intuitiva</h4>
                                        <p className="text-purple-400 text-sm">Fácil de usar e configurar</p>
                                    </div>

                                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Zap className="h-8 w-8 text-emerald-400" />
                                        </div>
                                        <h4 className="text-white font-semibold text-lg mb-2">⚡ Downloads Rápidos</h4>
                                        <p className="text-emerald-400 text-sm">Performance otimizada e estável</p>
                                    </div>

                                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                        <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Diamond className="h-8 w-8 text-yellow-400" />
                                        </div>
                                        <h4 className="text-white font-semibold text-lg mb-2">💎 Qualidade Premium</h4>
                                        <p className="text-yellow-400 text-sm">Suporte a múltiplas qualidades</p>
                                    </div>
                                </div>

                                {/* Botão de Acesso */}
                                <div className="text-center">
                                    <a
                                        href="/allavsoft"
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        <ExternalLink className="h-5 w-5" />
                                        ACESSAR ALLAVSOFT
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'activity':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção com Design Melhorado */}
                        <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                                        <Activity className="h-8 w-8 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                            Atividade
                                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full border border-cyan-500/30 font-medium">
                                                Dashboard
                                            </span>
                                        </h2>
                                        <p className="text-gray-300 text-lg">Resumo completo das suas atividades e estatísticas</p>
                                    </div>
                                </div>

                                {/* Status Rápido */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                <Download className="h-5 w-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Downloads</p>
                                                <p className="text-green-400 font-bold">{activityStats?.downloads?.total || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                                <Heart className="h-5 w-5 text-pink-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Likes</p>
                                                <p className="text-pink-400 font-bold">{activityStats?.likes?.total || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                                <Play className="h-5 w-5 text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Plays</p>
                                                <p className="text-orange-400 font-bold">{activityStats?.plays?.total || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                <Database className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Armazenamento</p>
                                                <p className="text-emerald-400 font-bold">{activityStats?.storage?.estimatedGB || 0} GB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cards de Estatísticas de Downloads com Design Moderno */}
                        <div className="space-y-6">
                            {/* Estatísticas de Downloads */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Download className="h-8 w-8 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Estatísticas de Downloads</h3>
                                                <p className="text-gray-300">Resumo completo dos seus downloads por período</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30 font-medium">
                                            Downloads
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Download className="h-8 w-8 text-green-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Downloads Hoje</h4>
                                            <p className="text-green-400 text-3xl font-black mb-2">{activityStats?.downloads?.today || 0}</p>
                                            <p className="text-gray-300 text-sm">Músicas baixadas hoje</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Calendar className="h-8 w-8 text-blue-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Esta Semana</h4>
                                            <p className="text-blue-400 text-3xl font-black mb-2">{activityStats?.downloads?.thisWeek || 0}</p>
                                            <p className="text-gray-300 text-sm">Últimos 7 dias</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <TrendingUp className="h-8 w-8 text-purple-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Este Mês</h4>
                                            <p className="text-purple-400 text-3xl font-black mb-2">{activityStats?.downloads?.thisMonth || 0}</p>
                                            <p className="text-gray-300 text-sm">Últimos 30 dias</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <BarChart3 className="h-8 w-8 text-yellow-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Este Ano</h4>
                                            <p className="text-yellow-400 text-3xl font-black mb-2">{activityStats?.downloads?.thisYear || 0}</p>
                                            <p className="text-gray-300 text-sm">Últimos 365 dias</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cards de Estatísticas de Likes com Design Moderno */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-pink-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Heart className="h-8 w-8 text-pink-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Estatísticas de Likes</h3>
                                                <p className="text-gray-300">Resumo completo dos seus favoritos por período</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-pink-500/20 text-pink-300 text-sm rounded-full border border-pink-500/30 font-medium">
                                            Favoritos
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Heart className="h-8 w-8 text-pink-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Likes Hoje</h4>
                                            <p className="text-pink-400 text-3xl font-black mb-2">{activityStats?.likes?.today || 0}</p>
                                            <p className="text-gray-300 text-sm">Músicas curtidas hoje</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Heart className="h-8 w-8 text-rose-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Esta Semana</h4>
                                            <p className="text-rose-400 text-3xl font-black mb-2">{activityStats?.likes?.thisWeek || 0}</p>
                                            <p className="text-gray-300 text-sm">Últimos 7 dias</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Heart className="h-8 w-8 text-violet-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Este Mês</h4>
                                            <p className="text-violet-400 text-3xl font-black mb-2">{activityStats?.likes?.thisMonth || 0}</p>
                                            <p className="text-gray-300 text-sm">Últimos 30 dias</p>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Heart className="h-8 w-8 text-indigo-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Este Ano</h4>
                                            <p className="text-indigo-400 text-3xl font-black mb-2">{activityStats?.likes?.thisYear || 0}</p>
                                            <p className="text-gray-300 text-sm">Últimos 365 dias</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas de Armazenamento e Plays com Design Moderno */}
                            <div className="space-y-6">
                                {/* Armazenamento */}
                                <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                    {/* Background Effects */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.15),transparent_50%)] transition-all duration-500"></div>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-all duration-300">
                                                    <Database className="h-8 w-8 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">Armazenamento</h3>
                                                    <p className="text-gray-300">Estimativa de dados baixados e utilizados</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-500/30 font-medium">
                                                Dados
                                            </div>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Database className="h-12 w-12 text-emerald-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-2xl mb-3">Armazenamento</h4>
                                            <p className="text-emerald-400 text-4xl font-black mb-3">{activityStats?.storage?.estimatedGB || 0} GB</p>
                                            <p className="text-gray-300 text-lg">Estimativa de dados baixados</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total de Plays */}
                                <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-500">
                                    {/* Background Effects */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(249,115,22,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_50%,rgba(249,115,22,0.15),transparent_50%)] transition-all duration-500"></div>
                                    <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-all duration-300">
                                                    <Play className="h-8 w-8 text-orange-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">Total de Plays</h3>
                                                    <p className="text-gray-300">Músicas reproduzidas e estatísticas de reprodução</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30 font-medium">
                                                Reproduções
                                            </div>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                            <div className="w-24 h-24 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Play className="h-12 w-12 text-orange-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-2xl mb-3">Total de Plays</h4>
                                            <p className="text-orange-400 text-4xl font-black mb-3">{activityStats?.plays?.total || 0}</p>
                                            <p className="text-gray-300 text-lg">Músicas reproduzidas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gráficos em Tempo Real com Design Moderno */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-all duration-300">
                                            <BarChart3 className="h-8 w-8 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Gráficos em Tempo Real</h3>
                                            <p className="text-gray-300">Visualize suas atividades em gráficos interativos</p>
                                        </div>
                                    </div>

                                    {activityLoading ? (
                                        <div className="text-center py-16">
                                            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                            <h4 className="text-xl font-bold text-white mb-3">Carregando estatísticas...</h4>
                                            <p className="text-gray-400 mb-4">Buscando dados de atividade</p>
                                            <div className="w-32 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    ) : activityStats?.dailyStats ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                                <ActivityChart
                                                    data={activityStats.dailyStats}
                                                    title="Downloads (Últimos 7 dias)"
                                                    type="downloads"
                                                />
                                            </div>
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                                <ActivityChart
                                                    data={activityStats.dailyStats}
                                                    title="Likes (Últimos 7 dias)"
                                                    type="likes"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
                                                <BarChart3 className="h-12 w-12 text-gray-600" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-3">Nenhum dado disponível</h4>
                                            <p className="text-gray-400 mb-4">As estatísticas aparecerão aqui</p>
                                            <div className="w-32 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Resumo Geral com Design Moderno */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-all duration-300">
                                            <TrendingUp className="h-8 w-8 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Resumo Geral</h3>
                                            <p className="text-gray-300">Visão consolidada de todas as suas atividades</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Total de Downloads */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center hover:border-green-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Download className="h-8 w-8 text-green-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Total Downloads</h4>
                                            <p className="text-green-400 text-3xl font-black mb-2">{activityStats?.downloads?.total || 0}</p>
                                            <p className="text-gray-300 text-sm">Músicas baixadas</p>
                                        </div>

                                        {/* Total de Likes */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center hover:border-pink-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Heart className="h-8 w-8 text-pink-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Total Likes</h4>
                                            <p className="text-pink-400 text-3xl font-black mb-2">{activityStats?.likes?.total || 0}</p>
                                            <p className="text-gray-300 text-sm">Músicas curtidas</p>
                                        </div>

                                        {/* Total de Plays */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center hover:border-orange-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Play className="h-8 w-8 text-orange-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Total Plays</h4>
                                            <p className="text-orange-400 text-3xl font-black mb-2">{activityStats?.plays?.total || 0}</p>
                                            <p className="text-gray-300 text-sm">Músicas reproduzidas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'benefits':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção com Design Melhorado */}
                        <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                                        <Gift className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                            Meus Benefícios
                                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-500/30 font-medium">
                                                VIP
                                            </span>
                                        </h2>
                                        <p className="text-gray-300 text-lg">Benefícios disponíveis no seu plano atual</p>
                                    </div>
                                </div>

                                {/* Status Rápido */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                <Crown className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Plano</p>
                                                <p className="text-emerald-400 font-bold">{vipStatus.plan}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                <ShieldCheck className="h-5 w-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Status</p>
                                                <p className={`font-bold ${vipStatus.isVip ? 'text-green-400' : 'text-red-400'}`}>
                                                    {vipStatus.isVip ? 'ATIVO' : 'INATIVO'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <Download className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Downloads</p>
                                                <p className="text-blue-400 font-bold">Ilimitado</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Package className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Packs</p>
                                                <p className="text-purple-400 font-bold">
                                                    {vipStatus.plan === 'Completo' ? '8/semana' :
                                                        vipStatus.plan === 'Padrão' ? '6/semana' :
                                                            vipStatus.plan === 'Básico' ? '4/semana' : 'Não disponível'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box de Benefícios Principais com Design Moderno */}
                        <div className="space-y-6">
                            {/* Benefícios Principais */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Star className="h-8 w-8 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Benefícios Principais</h3>
                                                <p className="text-gray-300">Funcionalidades essenciais incluídas em todos os planos</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-500/30 font-medium">
                                            Essenciais
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Downloads Diários */}
                                        <div>
                                            <h4 className="text-white font-semibold text-lg mb-3">Downloads Diários</h4>
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:scale-105">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 flex-shrink-0">
                                                        <Download className="h-8 w-8 text-green-400" />
                                                    </div>
                                                    <div className="flex-1 text-center">
                                                        <p className="text-green-400 text-2xl font-black mb-2">Ilimitado</p>
                                                        <div className="mt-4">
                                                            <a href="/new" className="w-full block text-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                                                                VER NOVIDADES
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acesso ao Drive Mensal */}
                                        <div>
                                            <h4 className="text-white font-semibold text-lg mb-3">Acesso ao Drive Mensal</h4>
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:scale-105">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                                                        <Database className="h-8 w-8 text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 text-center">
                                                        <p className="text-blue-400 text-2xl font-black mb-2">Ilimitado</p>
                                                        <div className="mt-4">
                                                            <a href="https://plataformavip.nexorrecords.com.br/atualizacoes" target="_blank" rel="noopener noreferrer" className="w-full block text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                                                                ACESSAR DRIVE
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Solicitação de Packs */}
                                        <div>
                                            <h4 className="text-white font-semibold text-lg mb-3">Solicitação de Packs</h4>
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 flex-shrink-0">
                                                        <Package className="h-8 w-8 text-purple-400" />
                                                    </div>
                                                    <div className="flex-1 text-center">
                                                        <p className="text-purple-400 text-2xl font-black mb-2">
                                                            {vipStatus.plan === 'Completo' ? '8 por semana' :
                                                                vipStatus.plan === 'Padrão' ? '6 por semana' :
                                                                    vipStatus.plan === 'Básico' ? '4 por semana' : 'Não disponível'}
                                                        </p>
                                                        <div className="mt-4">
                                                            <a href="/pedidos" className="w-full block text-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                                                                SOLICITAR
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Conteúdos Avulsos */}
                                        <div>
                                            <h4 className="text-white font-semibold text-lg mb-3">Conteúdos Avulsos</h4>
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 hover:scale-105">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30 flex-shrink-0">
                                                        <Music className="h-8 w-8 text-yellow-400" />
                                                    </div>
                                                    <div className="flex-1 text-center">
                                                        <p className="text-yellow-400 text-2xl font-black mb-2">Disponível</p>
                                                        <div className="mt-4">
                                                            <a href="/new" className="w-full block text-center px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                                                                VER CONTEÚDOS
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Box de Benefícios Extras com Design Moderno */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-pink-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Gift className="h-8 w-8 text-pink-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Benefícios Extras</h3>
                                                <p className="text-gray-300">Funcionalidades adicionais e exclusivas</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-pink-500/20 text-pink-300 text-sm rounded-full border border-pink-500/30 font-medium">
                                            Extras
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Packs Extras */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                                                    <Package className="h-8 w-8 text-orange-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-white font-semibold text-lg">Packs Extras</h4>
                                                        <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30 font-medium">🔥</span>
                                                    </div>
                                                    <p className="text-orange-400 text-2xl font-black mb-2">Disponível</p>
                                                    <p className="text-gray-300 text-sm">Downloads ilimitados para qualquer plano</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Solicitação de Playlists */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                                                    <ListMusic className="h-8 w-8 text-indigo-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-white font-semibold text-lg">Solicitação de Playlists</h4>
                                                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30 font-medium">🎵</span>
                                                    </div>
                                                    <p className="text-indigo-400 text-2xl font-black mb-2">
                                                        {vipStatus.plan === 'Completo' ? 'Ilimitado' :
                                                            vipStatus.plan === 'Padrão' ? '9 por semana' :
                                                                vipStatus.plan === 'Básico' ? '7 por semana' : 'Não disponível'}
                                                    </p>
                                                    <p className="text-gray-300 text-sm">
                                                        {vipStatus.plan === 'Completo' ? 'Plano Completo - Ilimitado (máx. 4 por dia)' :
                                                            vipStatus.plan === 'Padrão' ? 'Plano Padrão - Máximo 9 por semana' :
                                                                vipStatus.plan === 'Básico' ? 'Plano Básico - Máximo 7 por semana' : 'Sem plano'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deezer Premium */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                                                    <Headphones className="h-8 w-8 text-emerald-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-white font-semibold text-lg">Deezer Premium</h4>
                                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30 font-medium">🎧</span>
                                                    </div>
                                                    <p className="text-emerald-400 text-2xl font-black mb-2">
                                                        {vipStatus.plan === 'Completo' ? 'Grátis' : 'R$ 9,75'}
                                                    </p>
                                                    <p className="text-gray-300 text-sm">
                                                        {vipStatus.plan === 'Completo' ? 'Incluído no plano Completo' : 'Disponível para qualquer plano'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acesso Deemix */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-violet-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30">
                                                    <Music className="h-8 w-8 text-violet-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-white font-semibold text-lg">Acesso Deemix</h4>
                                                        <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-full border border-violet-500/30 font-medium">🎼</span>
                                                    </div>
                                                    <p className="text-violet-400 text-2xl font-black mb-2">Disponível</p>
                                                    <p className="text-gray-300 text-sm">
                                                        {vipStatus.plan === 'Completo' ? 'R$ 15,20 (60% desconto)' :
                                                            vipStatus.plan === 'Padrão' ? 'R$ 22,04 (42% desconto)' :
                                                                vipStatus.plan === 'Básico' ? 'R$ 23,56 (38% desconto)' : 'R$ 38,00 (sem desconto)'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Box de Benefícios Especiais com Design Moderno */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(234,179,8,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_50%,rgba(234,179,8,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Crown className="h-8 w-8 text-yellow-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Benefícios Especiais</h3>
                                                <p className="text-gray-300">Funcionalidades exclusivas e premium</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-yellow-500/20 text-yellow-300 text-sm rounded-full border border-yellow-500/30 font-medium">
                                            Exclusivos
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* ARL Premium para Deemix */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                                    <Lock className="h-8 w-8 text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-white font-semibold text-lg">ARL Premium para Deemix</h4>
                                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 font-medium">🔐</span>
                                                    </div>
                                                    <p className="text-blue-400 text-2xl font-black mb-2">
                                                        {vipStatus.plan === 'Completo' ? 'Sim' : 'Não'}
                                                    </p>
                                                    <p className="text-gray-300 text-sm">
                                                        {vipStatus.plan === 'Completo' ? 'Plano Completo - Automático se Deemix ativo' : '❌ Não disponível'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Produção da sua Música */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30">
                                                    <Upload className="h-8 w-8 text-green-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-white font-semibold text-lg">Produção da sua Música</h4>
                                                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 font-medium">🎹</span>
                                                    </div>
                                                    <p className="text-green-400 text-2xl font-black mb-2">
                                                        {vipStatus.plan === 'Completo' ? 'Disponível' : 'Não'}
                                                    </p>
                                                    <p className="text-gray-300 text-sm">
                                                        {vipStatus.plan === 'Completo' ? 'Plano Completo - Acesso completo' : '❌ Não disponível'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Uploader (se disponível) */}
                                        {(session?.user as any)?.isUploader && (
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                                                        <Upload className="h-8 w-8 text-purple-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="text-white font-semibold text-lg">Uploader</h4>
                                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30 font-medium">📤</span>
                                                        </div>
                                                        <p className="text-purple-400 text-2xl font-black mb-2">Ativo</p>
                                                        <p className="text-gray-300 text-sm">Upload de até 10 músicas por mês</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Resumo dos Benefícios com Design Moderno */}
                            <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
                                {/* Background Effects */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_50%)] transition-all duration-500"></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Info className="h-8 w-8 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Resumo dos Benefícios</h3>
                                                <p className="text-gray-300">Visão consolidada do seu plano e benefícios</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-full border border-cyan-500/30 font-medium">
                                            Resumo
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Plano Atual */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center hover:border-yellow-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Crown className="h-8 w-8 text-yellow-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Plano Atual</h4>
                                            <p className="text-yellow-400 text-2xl font-black mb-2">{vipStatus.plan}</p>
                                            <p className="text-gray-300 text-sm">Seu plano VIP</p>
                                        </div>

                                        {/* Status VIP */}
                                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center hover:border-green-500/30 transition-all duration-300 hover:scale-105">
                                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <ShieldCheck className="h-8 w-8 text-green-400" />
                                            </div>
                                            <h4 className="text-white font-semibold text-lg mb-2">Status VIP</h4>
                                            <p className={`text-2xl font-black mb-2 ${vipStatus.isVip ? 'text-green-400' : 'text-red-400'}`}>
                                                {vipStatus.isVip ? 'ATIVO' : 'INATIVO'}
                                            </p>
                                            <p className="text-gray-300 text-sm">
                                                {vipStatus.isVip ? 'Benefícios ativos' : 'Benefícios inativos'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Link para ver todos os planos */}
                                    <div className="text-center">
                                        <a
                                            href="/plans"
                                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-lg rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            <Info className="h-5 w-5" />
                                            Ver Todos os Planos e Benefícios
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'deemix':
                return (
                    <div className="space-y-8">
                        {/* Header da Seção com Design Melhorado */}
                        <div className="bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30">
                                        <Music2 className="h-8 w-8 text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                            Deemix - Download de Músicas
                                            <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-sm rounded-full border border-violet-500/30 font-medium">
                                                Deemix
                                            </span>
                                        </h2>
                                        <p className="text-gray-300 text-lg">Plataforma para download de músicas em alta qualidade</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Última verificação: {lastRefresh ? formatDateTime(lastRefresh.toISOString()) : 'Nunca'}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Rápido */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                                                <Music2 className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Status</p>
                                                <p className={`font-bold ${getDeemixStatus().hasAccess ? 'text-green-400' : 'text-red-400'}`}>
                                                    {getDeemixStatus().hasAccess ? 'ATIVO' : 'INATIVO'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <Download className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Downloads</p>
                                                <p className="text-blue-400 font-bold">
                                                    {getDeemixStatus().hasAccess ? 'Ilimitados' : 'Não disponível'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                                <Lock className="h-5 w-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">ARL Premium</p>
                                                <p className="text-emerald-400 font-bold">
                                                    {getDeemixStatus().hasAccess ? 'Incluso' : 'Não disponível'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Package className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm">Plano</p>
                                                <p className="text-purple-400 font-bold">{vipStatus.plan}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo Condicional baseado no Plano */}
                        {getDeemixStatus().hasAccess ? (
                            // Conteúdo para usuários com Deemix ativo
                            <div className="space-y-6">
                                {/* Status de Acesso */}
                                <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500">
                                    {/* Background Effects */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.15),transparent_50%)] transition-all duration-500"></div>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-all duration-300">
                                                    <CheckCircle className="h-8 w-8 text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">Acesso Liberado</h3>
                                                    <p className="text-gray-300">Você tem acesso completo à plataforma Deemix para download de músicas em alta qualidade.</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30 font-medium">
                                                Ativo
                                            </div>
                                        </div>

                                        {/* Informação adicional sobre o acesso */}
                                        <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                            <div className="flex items-center gap-2 text-blue-300 text-sm">
                                                <Info className="h-4 w-4" />
                                                <span><strong>Motivo do acesso:</strong> {getDeemixStatus().reason}</span>
                                            </div>
                                        </div>

                                        {/* Status de sincronização */}
                                        <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                            <div className="flex items-center gap-2 text-green-300 text-xs">
                                                <CheckCircle className="h-3 w-3" />
                                                <span>Dados sincronizados em tempo real com /admin/users</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Download className="h-8 w-8 text-green-400" />
                                                </div>
                                                <h4 className="text-white font-semibold text-lg mb-2">Downloads ilimitados</h4>
                                                <p className="text-green-400 text-sm">Acesso sem restrições</p>
                                            </div>

                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Music className="h-8 w-8 text-blue-400" />
                                                </div>
                                                <h4 className="text-white font-semibold text-lg mb-2">Qualidade FLAC/MP3 320kbps</h4>
                                                <p className="text-blue-400 text-sm">Alta qualidade de áudio</p>
                                            </div>

                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Lock className="h-8 w-8 text-emerald-400" />
                                                </div>
                                                <h4 className="text-white font-semibold text-lg mb-2">ARL Premium incluso</h4>
                                                <p className="text-emerald-400 text-sm">Chaves atualizadas</p>
                                            </div>

                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <MessageCircle className="h-8 w-8 text-purple-400" />
                                                </div>
                                                <h4 className="text-white font-semibold text-lg mb-2">Suporte técnico</h4>
                                                <p className="text-purple-400 text-sm">Assistência especializada</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Credenciais de Acesso */}
                                <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-500">
                                    {/* Background Effects */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)] transition-all duration-500"></div>
                                    <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30 group-hover:scale-110 transition-all duration-300">
                                                <Key className="h-8 w-8 text-violet-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">🔑 Credenciais de Acesso</h3>
                                                <p className="text-gray-300">Use as credenciais abaixo para acessar o gerenciamento do Deemix:</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Senha de Acesso */}
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="text-white font-semibold text-lg mb-2">Senha de Acesso:</h4>
                                                        <p className="text-violet-400 text-xl font-mono font-bold">JMgQuuKI1LDiXBm</p>
                                                    </div>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText('JMgQuuKI1LDiXBm')}
                                                        className="px-4 py-2 bg-violet-500/20 text-violet-300 text-sm rounded-xl border border-violet-500/30 hover:bg-violet-500/30 transition-all duration-200 font-medium flex items-center gap-2"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        Copiar
                                                    </button>
                                                </div>
                                                <div className="text-center">
                                                    <a
                                                        href="https://plataformavip.nexorrecords.com.br/deemix-gerenciar"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold text-base rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                        GERENCIAR DEEMIX
                                                    </a>
                                                </div>
                                            </div>

                                            {/* ARL Premium */}
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                                <div className="mb-4">
                                                    <h4 className="text-white font-semibold text-lg mb-2">ARL Premium (Atualizada em 22.08.2025):</h4>
                                                    <p className="text-gray-400 text-sm">Chave de acesso para funcionalidades premium</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 mr-4">
                                                        <p className="text-emerald-400 text-sm font-mono break-all">
                                                            018d5a398d3ecc5421d089a638b5ef8dd90cb3c9c52a52f0d080c48f6805c5b37955a20cdd5ad0965cd1a7cb1fea0aa018db93114d773ed5f9e57857c82dc71b75088accdff5afb0b3376e2002d53e30cac7bb9de8d6d8ca227083c632cfd777
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText('018d5a398d3ecc5421d089a638b5ef8dd90cb3c9c52a52f0d080c48f6805c5b37955a20cdd5ad0965cd1a7cb1fea0aa018db93114d773ed5f9e57857c82dc71b75088accdff5afb0b3376e2002d53e30cac7bb9de8d6d8ca227083c632cfd777')}
                                                        className="px-4 py-2 bg-emerald-500/20 text-emerald-300 text-sm rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-all duration-200 font-medium flex items-center gap-2 flex-shrink-0"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        Copiar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Configurações do Spotify */}
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                                <h4 className="text-white font-semibold text-lg mb-4">🎵 Configurações do Spotify (se necessário):</h4>
                                                <div className="space-y-4">
                                                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                                                        <label className="text-gray-300 text-sm mb-2 block font-medium">Client ID:</label>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-blue-400 text-base font-mono font-bold">JMgQuuKI1LDiXBm</p>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText('JMgQuuKI1LDiXBm')}
                                                                className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                                                        <label className="text-gray-300 text-sm mb-2 block font-medium">Client Secret:</label>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-purple-400 text-base font-mono font-bold">d8db5aeefe6e439a951e5da66f392889</p>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText('d8db5aeefe6e439a951e5da66f392889')}
                                                                className="p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all duration-200"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                                                        <label className="text-gray-300 text-sm mb-2 block font-medium">User:</label>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-green-400 text-base font-mono font-bold">31psvp6pv6rhvjz7zfkcn4bv2ksm</p>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText('31psvp6pv6rhvjz7zfkcn4bv2ksm')}
                                                                className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="text-center pt-2">
                                                        <a
                                                            href="https://workupload.com/file/AvaE2nLGqhn"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-base rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            BAIXAR DEEMIX
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões de Ação */}
                                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                                    <div className="text-center mb-4">
                                        <h4 className="text-white font-semibold text-lg mb-2">Ações do Deemix</h4>
                                        <p className="text-gray-300 text-sm">Gerencie e baixe o Deemix</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400 text-sm">Todas as ações estão organizadas nas seções acima</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Conteúdo para usuários sem Deemix ativo
                            <div className="space-y-6">
                                {/* Status de Acesso Negado */}
                                <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-red-500/30 transition-all duration-500">
                                    {/* Background Effects */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.15),transparent_50%)] transition-all duration-500"></div>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-all duration-300">
                                                    <XCircle className="h-8 w-8 text-red-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">Acesso Não Disponível</h3>
                                                    <p className="text-gray-300">O Deemix não está incluído no seu plano atual. Faça upgrade ou assine separadamente com desconto exclusivo!</p>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-red-500/20 text-red-300 text-sm rounded-full border border-red-500/30 font-medium">
                                                Bloqueado
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Music className="h-8 w-8 text-blue-400" />
                                                </div>
                                                <h4 className="text-white font-semibold text-lg mb-2">🎵 Download de músicas em FLAC/MP3</h4>
                                                <p className="text-blue-400 text-sm">Alta qualidade de áudio</p>
                                            </div>

                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Monitor className="h-8 w-8 text-purple-400" />
                                                </div>
                                                <h4 className="text-white font-semibold text-lg mb-2">📱 Interface web moderna</h4>
                                                <p className="text-purple-400 text-sm">Fácil de usar</p>
                                            </div>

                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Zap className="h-8 w-8 text-emerald-400" />
                                                </div>
                                                <h4 className="text-white font-semibold text-lg mb-2">⚡ Downloads rápidos e estáveis</h4>
                                                <p className="text-emerald-400 text-sm">Performance otimizada</p>
                                            </div>

                                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                                                <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Diamond className="h-8 w-8 text-yellow-400" />
                                                </div>
                                                <h4 className="text-white font-semibold text-lg mb-2">💎 ARL Premium disponível</h4>
                                                <p className="text-yellow-400 text-sm">Funcionalidades exclusivas</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Oferta Especial VIP */}
                                <div className="bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-500">
                                    {/* Background Effects */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.1),transparent_50%)] group-hover:bg-[radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.15),transparent_50%)] transition-all duration-500"></div>
                                    <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Gift className="h-12 w-12 text-yellow-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-4">Oferta Especial VIP</h3>
                                            <p className="text-yellow-400 text-xl font-semibold mb-6">Como cliente VIP, você tem 15% de desconto na assinatura do Deemix!</p>

                                            <div className="flex justify-center">
                                                <a
                                                    href="/plans"
                                                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold text-lg rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                                >
                                                    <Crown className="h-5 w-5" />
                                                    Fazer Upgrade do Plano
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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