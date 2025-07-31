"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert as ShadAlert, AlertDescription, AlertTitle } from "@/components/ui/AlertShadcn"; // Renomeando para evitar conflito
import MusicUploadForm from "@/components/music/MusicUploadForm";
import Header from "@/components/layout/Header";
import {
    User,
    Mail,
    Loader2,
    Download,
    Music,
    Star,
    Crown,
    Calendar,
    Phone,
    TrendingUp,
    ShieldCheck,
    BadgePercent,
    DollarSign,
    Package,
    ListMusic,
    AlertTriangle,
    MessageSquare,
    Clock,
    Activity,
    CheckCircle,
    XCircle,
    BarChart3,
    Gift,
    Zap,
    Users,
    Heart,
    PlayCircle,
    ArrowUpRight,
    Headphones,
    Award,
    Timer,
    Disc,
    Copy,
    Key,
    CreditCard,
    ExternalLink,
    QrCode,
    Settings,
    Upload
} from "lucide-react";

// Tipos expandidos para os dados da API

interface Track {
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

interface PlanBenefit {
    enabled: boolean;
    description: string;
    limit?: number;
    percentage?: number;
}

interface PlanBenefits {
    name: string;
    driveAccess: PlanBenefit;
    packRequests: PlanBenefit;
    playlistDownloads: PlanBenefit;
    dailyDownloadLimit: number;
    deezerPremium: PlanBenefit;
    deemixDiscount: PlanBenefit;
}

interface VencimentoInfo {
    status: 'active' | 'expiring_soon' | 'expired' | 'cancelled' | 'no_expiry';
    daysRemaining: number | null;
    isExpired: boolean;
    isExpiringSoon: boolean;
}

interface UserProfile {
    id: string;
    email: string;
    name: string;
    whatsapp: string | null;
    createdAt: string;
    is_vip: boolean | null;
    status: string | null;
    valor: number | null;
    vencimento: string | null;
    dailyDownloadCount: number | null;
    dailyDownloadLimit: number;
    weeklyPackRequests: number | null;
    weeklyPlaylistDownloads: number | null;
    deemix: boolean | null;
    downloadsCount: number;
    likesCount: number;
    playsCount: number;
    // Novos campos expandidos
    vipPlan: 'BASICO' | 'PADRAO' | 'COMPLETO' | null;
    planBenefits: PlanBenefits | null;
    vencimentoInfo: VencimentoInfo;
    recentDownloads: RecentActivity[];
    recentLikes: RecentActivity[];
}

export default function ProfilePage() {
    const { data: session, status: sessionStatus } = useSession();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [pixModalOpen, setPixModalOpen] = useState(false);
    const [planModalOpen, setPlanModalOpen] = useState(false);

    useEffect(() => {
        async function fetchUserDetails() {
            if (sessionStatus === 'authenticated') {
                try {
                    const res = await fetch("/api/user-data");
                    if (res.ok) {
                        const data = await res.json();
                        setUserData(data);
                    } else {
                        console.error("Falha ao buscar dados do usuário");
                        setUserData(null);
                    }
                } catch (err) {
                    console.error("Erro de rede ao buscar dados do usuário:", err);
                    setUserData(null);
                } finally {
                    setLoading(false);
                }
            } else if (sessionStatus === 'unauthenticated') {
                setLoading(false);
            }
        }
        fetchUserDetails();
    }, [sessionStatus]);

    // Funções utilitárias
    const formatCurrency = (value: number | null) => {
        if (value === null || isNaN(value)) return "N/D";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Não definido";
        return new Date(dateString).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatRelativeTime = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) return "Há poucos minutos";
        if (diffInHours < 24) return `Há ${Math.floor(diffInHours)} horas`;
        if (diffInDays < 7) return `Há ${Math.floor(diffInDays)} dias`;
        return formatDate(dateString);
    };

    const getVencimentoStatusDisplay = (vencimentoInfo: VencimentoInfo) => {
        switch (vencimentoInfo.status) {
            case 'expired':
                return {
                    text: "Vencido",
                    color: "text-red-500",
                    bgColor: "bg-red-500/10",
                    icon: <XCircle className="w-4 h-4" />
                };
            case 'expiring_soon':
                return {
                    text: `Vence em ${vencimentoInfo.daysRemaining} dias`,
                    color: "text-yellow-500",
                    bgColor: "bg-yellow-500/10",
                    icon: <AlertTriangle className="w-4 h-4" />
                };
            case 'active':
                return {
                    text: "Ativo",
                    color: "text-green-500",
                    bgColor: "bg-green-500/10",
                    icon: <CheckCircle className="w-4 h-4" />
                };
            case 'cancelled':
                return {
                    text: "Cancelado",
                    color: "text-red-500",
                    bgColor: "bg-red-500/10",
                    icon: <XCircle className="w-4 h-4" />
                };
            default:
                return {
                    text: "N/D",
                    color: "text-gray-400",
                    bgColor: "bg-gray-500/10",
                    icon: <></>
                };
        }
    };

    const getPlanIcon = (plan: string | null) => {
        switch (plan) {
            case 'BASICO': return '🥉';
            case 'PADRAO': return '🥈';
            case 'COMPLETO': return '🥇';
            default: return '👤';
        }
    };

    const getPlanColor = (plan: string | null) => {
        switch (plan) {
            case 'BASICO': return 'from-blue-500 to-cyan-400';
            case 'PADRAO': return 'from-green-500 to-emerald-400';
            case 'COMPLETO': return 'from-purple-600 to-pink-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            // Aqui você pode adicionar uma notificação de sucesso
        } catch (err) {
            console.error('Erro ao copiar:', err)
        }
    }

    const openWhatsApp = (number: string, message?: string) => {
        const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`
        window.open(url, '_blank')
    }

    const getPaymentLink = (valor: number | null) => {
        if (!valor) return null;

        switch (valor) {
            case 30: return 'https://mpago.la/23mDfCP';
            case 35: return 'https://mpago.la/2ogrkmW';
            case 38: return 'https://mpago.la/28HWukZ';
            case 42: return 'https://mpago.la/1aFWE4k';
            case 60: return 'https://mpago.la/2XTWvVS';
            default: return null; // Para valores personalizados
        }
    }

    const getPlanInfo = (valor: number | null) => {
        if (!valor) return { name: 'N/A', features: [], price: 0 };

        switch (valor) {
            case 30: return {
                name: 'BÁSICO',
                features: ['50 Downloads/dia', 'Acesso ao Drive', 'Suporte Básico'],
                price: 30
            };
            case 35: return {
                name: 'PADRÃO',
                features: ['100 Downloads/dia', 'Acesso ao Drive', 'Packs Extras', 'Suporte Prioritário'],
                price: 35
            };
            case 38: return {
                name: 'COMPLETO',
                features: ['200 Downloads/dia', 'Acesso ao Drive', 'Packs Extras', 'Deemix Incluso', 'Suporte VIP'],
                price: 38
            };
            case 42: return {
                name: 'PREMIUM',
                features: ['Downloads Ilimitados', 'Acesso Total', 'Deemix Incluso', 'Suporte 24/7'],
                price: 42
            };
            case 60: return {
                name: 'VIP',
                features: ['Downloads Ilimitados', 'Acesso Total', 'Deemix Incluso', 'Conteúdo Exclusivo', 'Suporte VIP'],
                price: 60
            };
            default: return {
                name: 'PERSONALIZADO',
                features: ['Plano customizado', 'Entre em contato para detalhes'],
                price: valor
            };
        }
    }

    const openDeemixManager = () => {
        window.open('https://plataformavip.nexorrecords.com.br/deemix-gerenciar', '_blank')
    }

    const openDeemixDownload = () => {
        window.open('https://workupload.com/file/AvaE2nLGqhn', '_blank')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1B1C1D]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!session?.user || !userData) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#1B1C1D] text-white">
                <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
                <p className="text-gray-400 mb-6">Você precisa estar logado para ver esta página.</p>
                <Button onClick={() => window.location.href = '/api/auth/signin'}>Fazer Login</Button>
            </div>
        );
    }

    const vencimentoDisplay = getVencimentoStatusDisplay(userData.vencimentoInfo);
    const planIcon = getPlanIcon(userData.vipPlan);
    const planColorClass = getPlanColor(userData.vipPlan);

    // Constantes para Deemix
    const arl = "048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e";
    const clientId = "JMgQuuKI1LDiXBm";
    const clientSecret = "d8db5aeefe6e439a951e5da66f392889";
    const spotifyUser = "31psvp6pv6rhvjz7zfkcn4bv2ksm";

    return (
        <>
            <Header />
            <div className="min-h-screen bg-black text-white font-sans pt-20">
                <div className="flex">
                    {/* NAVEGAÇÃO LATERAL */}
                    <div className="w-72 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 min-h-screen sticky top-20">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <User className="w-6 h-6 text-blue-400" />
                                Navegação
                            </h2>
                            <nav className="space-y-2">
                                <button
                                    onClick={() => document.getElementById('conta')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 text-gray-300 hover:text-white"
                                >
                                    <User className="w-5 h-5" />
                                    Informações da Conta
                                </button>
                                <button
                                    onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 text-gray-300 hover:text-white"
                                >
                                    <Gift className="w-5 h-5" />
                                    Benefícios do Plano
                                </button>
                                <button
                                    onClick={() => document.getElementById('deemix')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 text-gray-300 hover:text-white"
                                >
                                    <Headphones className="w-5 h-5" />
                                    Deemix - Download
                                </button>
                                <button
                                    onClick={() => document.getElementById('estatisticas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 text-gray-300 hover:text-white"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    Estatísticas de Uso
                                </button>
                                <button
                                    onClick={() => document.getElementById('atividade')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 text-gray-300 hover:text-white"
                                >
                                    <Activity className="w-5 h-5" />
                                    Atividade Recente
                                </button>
                                {userData?.is_vip && (
                                    <button
                                        onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                        className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 text-gray-300 hover:text-white"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Enviar Músicas
                                    </button>
                                )}
                            </nav>
                        </div>
                    </div>

                    {/* CONTEÚDO PRINCIPAL */}
                    <div className="flex-1 px-8 py-8">
                        <div className="max-w-6xl mx-auto space-y-8">
                            {/* Header */}
                            <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-2xl mb-8">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${planColorClass} flex items-center justify-center text-3xl shadow-2xl`}>
                                        {planIcon}
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-white tracking-tight">
                                            Olá, {userData.name || 'Usuário'}!
                                        </h1>
                                        <p className="text-gray-400 text-lg">
                                            {userData.planBenefits?.name || 'Usuário Gratuito'} • Membro desde {formatDate(userData.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Cards de destaque */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <Download className="w-8 h-8 text-white" />
                                            </div>
                                            <p className="text-4xl font-bold text-white mb-2">{userData.downloadsCount}</p>
                                            <p className="text-sm text-gray-300 font-medium">Downloads Totais</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/30 shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <Heart className="w-8 h-8 text-white" />
                                            </div>
                                            <p className="text-4xl font-bold text-white mb-2">{userData.likesCount}</p>
                                            <p className="text-sm text-gray-300 font-medium">Músicas Curtidas</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                                        <CardContent className="p-6 text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <PlayCircle className="w-8 h-8 text-white" />
                                            </div>
                                            <p className="text-4xl font-bold text-white mb-2">{userData.playsCount}</p>
                                            <p className="text-sm text-gray-300 font-medium">Plays Totais</p>
                                        </CardContent>
                                    </Card>

                                    <Card className={`bg-gradient-to-br ${vencimentoDisplay.bgColor.replace('bg-', 'from-')}/20 to-gray-500/20 border-gray-500/30 shadow-2xl hover:shadow-gray-500/25 transition-all duration-300 transform hover:scale-105`}>
                                        <CardContent className="p-6 text-center">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${vencimentoDisplay.bgColor.replace('bg-', 'from-')} to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                                <div className={`${vencimentoDisplay.color} text-3xl`}>{vencimentoDisplay.icon}</div>
                                            </div>
                                            <p className="text-4xl font-bold text-white mb-2">
                                                {userData.vencimentoInfo?.status === 'active' ? 'Ativo' :
                                                    userData.vencimentoInfo?.status === 'expiring_soon' ? `${userData.vencimentoInfo.daysRemaining}d` :
                                                        userData.vencimentoInfo?.status === 'expired' ? 'Vencido' : 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-300 font-medium">Status da Conta</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Alertas de vencimento */}
                            {userData.vencimentoInfo?.status === 'expiring_soon' && (
                                <ShadAlert className="bg-yellow-500/10 border-yellow-500/20">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <AlertDescription className="text-yellow-300">
                                        Seu plano vence em {userData.vencimentoInfo.daysRemaining} dias. Renove para manter seus benefícios!
                                    </AlertDescription>
                                </ShadAlert>
                            )}

                            {userData.vencimentoInfo?.status === 'expired' && (
                                <ShadAlert className="bg-red-500/10 border-red-500/20">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <AlertDescription className="text-red-300">
                                        Seu plano expirou. Renove agora para reativar todos os benefícios!
                                    </AlertDescription>
                                </ShadAlert>
                            )}


                            {/* LAYOUT EM SEÇÕES */}
                            {/* SEÇÃO - INFORMAÇÕES DA CONTA */}
                            <div id="conta" className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-2xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">Informações da Conta</h2>
                                        <p className="text-gray-400 mt-1">Gerencie seus dados pessoais e configurações</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Card Plano Atual */}
                                    <Card className="border-gray-700/50 shadow-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 hover:shadow-2xl transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-3 text-lg text-white">
                                                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                                    <Crown className="w-5 h-5 text-white" />
                                                </div>
                                                Plano Atual
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                    <div className="text-2xl">{planIcon}</div>
                                                </div>
                                                <h3 className="font-bold text-white mb-2 text-lg">
                                                    {userData.planBenefits?.name || 'Usuário Gratuito'}
                                                </h3>
                                                <p className="text-2xl font-bold text-green-400 mb-2">
                                                    {formatCurrency(userData.valor)}
                                                    <span className="text-sm text-gray-400">/mês</span>
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Card Status */}
                                    <Card className="border-gray-700/50 shadow-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 hover:shadow-2xl transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-3 text-lg text-white">
                                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                                    <ShieldCheck className="w-5 h-5 text-white" />
                                                </div>
                                                Status da Conta
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                    {userData.vencimentoInfo?.status === 'active' ? (
                                                        <CheckCircle className="text-white w-8 h-8" />
                                                    ) : (
                                                        <XCircle className="text-white w-8 h-8" />
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-white mb-2 text-lg">
                                                    {userData.vencimentoInfo?.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </h3>
                                                <p className="text-sm text-gray-300 mb-4">
                                                    {userData.vencimentoInfo?.status === 'active' ? 'Sua conta está ativa e funcionando normalmente' : 'Sua conta precisa ser reativada'}
                                                </p>

                                                {userData.vencimentoInfo?.status === 'expiring_soon' && (
                                                    <p className="text-sm text-yellow-400 mb-2">
                                                        Vence em {userData.vencimentoInfo.daysRemaining} dias
                                                    </p>
                                                )}

                                                <p className="text-sm text-gray-400 mb-4">
                                                    Próximo vencimento: {formatDate(userData.vencimento)}
                                                </p>

                                                {/* Botões de Pagamento se conta vencida ou vencendo (5 dias antes) */}
                                                {(userData.vencimentoInfo?.status === 'expired' || (userData.vencimentoInfo?.status === 'expiring_soon' && (userData.vencimentoInfo?.daysRemaining ?? 0) <= 5)) && (
                                                    <div className="space-y-3">
                                                        {getPaymentLink(userData.valor) ? (
                                                            <Button
                                                                onClick={() => window.open(getPaymentLink(userData.valor)!, '_blank')}
                                                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                                </svg>
                                                                PAGAR VIA MERCADO PAGO
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                onClick={() => openWhatsApp('5551935052274', `Olá! Gostaria de renovar meu plano de ${formatCurrency(userData.valor)}. Poderia me ajudar com o pagamento?`)}
                                                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z" />
                                                                </svg>
                                                                PLANO PERSONALIZADO - WHATSAPP
                                                            </Button>
                                                        )}

                                                        <Button
                                                            onClick={() => setPixModalOpen(true)}
                                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                                                        >
                                                            <CreditCard className="w-5 h-5" />
                                                            PAGAR VIA PIX
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Card Informações Pessoais */}
                                    <Card className="border-gray-700/50 shadow-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 hover:shadow-2xl transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-3 text-lg text-white">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-white" />
                                                </div>
                                                Dados Pessoais
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-3 bg-gray-800/30 rounded-lg">
                                                <p className="text-xs text-gray-400 mb-1">Email</p>
                                                <p className="text-sm font-medium text-white truncate">{userData.email}</p>
                                            </div>
                                            <div className="p-3 bg-gray-800/30 rounded-lg">
                                                <p className="text-xs text-gray-400 mb-1">WhatsApp</p>
                                                <p className="text-sm font-medium text-white">{userData.whatsapp || 'Não cadastrado'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-800/30 rounded-lg">
                                                <p className="text-xs text-gray-400 mb-1">Membro desde</p>
                                                <p className="text-sm font-medium text-white">{formatDate(userData.createdAt)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* SEÇÃO - BENEFÍCIOS E RECURSOS */}
                            {userData.planBenefits && (
                                <div id="beneficios" className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-2xl">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Gift className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">Benefícios do Plano</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                            <CardContent className="p-4 text-center">
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Disc className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <h3 className="font-semibold text-white mb-1">Drive Acesso</h3>
                                                <p className="text-xs text-green-400 font-medium">
                                                    {userData.planBenefits.driveAccess.description}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                            <CardContent className="p-4 text-center">
                                                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Package className="w-6 h-6 text-orange-400" />
                                                </div>
                                                <h3 className="font-semibold text-white mb-1">Packs Semanais</h3>
                                                <p className="text-xs text-blue-400 font-medium">
                                                    {userData.weeklyPackRequests || 0}/{userData.planBenefits.packRequests.limit}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                            <CardContent className="p-4 text-center">
                                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <ListMusic className="w-6 h-6 text-green-400" />
                                                </div>
                                                <h3 className="font-semibold text-white mb-1">Playlists</h3>
                                                <p className="text-xs text-green-400 font-medium">
                                                    {userData.weeklyPlaylistDownloads || 0}/{userData.planBenefits.playlistDownloads.limit === -1 ? '∞' : userData.planBenefits.playlistDownloads.limit}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                            <CardContent className="p-4 text-center">
                                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Zap className="w-6 h-6 text-purple-400" />
                                                </div>
                                                <h3 className="font-semibold text-white mb-1">Deezer Premium</h3>
                                                <p className={`text-xs font-medium ${userData.planBenefits.deezerPremium.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                                                    {userData.planBenefits.deezerPremium.enabled ? 'Incluso' : 'N/D'}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {/* SEÇÃO - DEEMIX DOWNLOAD DE MÚSICAS */}
                            <div className="space-y-6">
                                {/* Título da Seção */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <Headphones className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">Deemix - Download de Músicas</h2>
                                        <p className="text-gray-400 mt-1">Acesso à plataforma de download em alta qualidade</p>
                                    </div>
                                </div>

                                {/* Conteúdo da Seção */}
                                <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 shadow-2xl">
                                    {userData.deemix ? (
                                        <div className="space-y-6">
                                            {/* Credenciais de Acesso */}
                                            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                                                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                    <Key className="w-5 h-5 text-blue-400" />
                                                    🔑 Credenciais de Acesso
                                                </h4>
                                                <p className="text-gray-300 mb-4">
                                                    Use as credenciais abaixo para acessar o gerenciamento do Deemix:
                                                </p>

                                                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-gray-400">Senha:</p>
                                                            <p className="font-mono text-sm text-white">JMgQuuKI1LDiXBm</p>
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard('JMgQuuKI1LDiXBm')}
                                                            className="p-2 border border-blue-500/30 hover:bg-blue-500/20 rounded flex items-center justify-center"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={openDeemixManager}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-10 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Gerenciar Deemix
                                                </Button>
                                            </div>

                                            {/* Aviso ARL Premium Offline */}
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                                    <div>
                                                        <h4 className="font-semibold text-white">⚠️ ARL Premium Offline</h4>
                                                        <p className="text-sm text-gray-300">A ARL Premium está temporariamente indisponível. Estamos trabalhando para restaurar o serviço.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ARL Padrão */}
                                            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                                                <h4 className="text-sm font-bold text-white mb-3">
                                                    ARL Padrão:
                                                </h4>
                                                <div className="bg-gray-800/50 rounded-lg p-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-mono text-xs text-white break-all">
                                                                048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(arl)}
                                                            className="p-2 border border-yellow-500/30 hover:bg-yellow-500/20 rounded flex items-center justify-center"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Configurações do Spotify */}
                                            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                                                <h4 className="text-sm font-bold text-white mb-3">
                                                    🎵 Configurações Spotify:
                                                </h4>
                                                <div className="space-y-2">
                                                    <div className="bg-gray-800/50 rounded-lg p-2">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs text-gray-400">Client ID:</p>
                                                                <p className="font-mono text-xs text-white">JMgQuuKI1LDiXBm</p>
                                                            </div>
                                                            <button
                                                                onClick={() => copyToClipboard(clientId)}
                                                                className="p-1.5 border border-purple-500/30 hover:bg-purple-500/20 rounded flex items-center justify-center"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-800/50 rounded-lg p-2">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs text-gray-400">Client Secret:</p>
                                                                <p className="font-mono text-xs text-white">d8db5aeefe6e439a951e5da66f392889</p>
                                                            </div>
                                                            <button
                                                                onClick={() => copyToClipboard(clientSecret)}
                                                                className="p-1.5 border border-purple-500/30 hover:bg-purple-500/20 rounded flex items-center justify-center"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-800/50 rounded-lg p-2">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs text-gray-400">User:</p>
                                                                <p className="font-mono text-xs text-white">31psvp6pv6rhvjz7zfkcn4bv2ksm</p>
                                                            </div>
                                                            <button
                                                                onClick={() => copyToClipboard(spotifyUser)}
                                                                className="p-1.5 border border-purple-500/30 hover:bg-purple-500/20 rounded flex items-center justify-center"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botão Baixar Deemix */}
                                            <div className="text-center mt-6">
                                                <Button
                                                    onClick={openDeemixDownload}
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 px-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
                                                >
                                                    <Download className="w-5 h-5" />
                                                    BAIXAR DEEMIX
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Acesso Não Disponível */}
                                            <div className="text-center">
                                                <h3 className="text-2xl font-bold text-white mb-3">Acesso Não Disponível</h3>
                                                <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                                                    O Deemix não está incluído no seu plano atual. Faça upgrade ou assine separadamente com desconto exclusivo!
                                                </p>
                                            </div>

                                            {/* Aviso ARL Premium Offline */}
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                                    <div>
                                                        <h4 className="font-semibold text-white">⚠️ ARL Premium Offline</h4>
                                                        <p className="text-sm text-gray-300">A ARL Premium está temporariamente indisponível. Estamos trabalhando para restaurar o serviço.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recursos do Deemix */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                                                    <Music className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                                    <h4 className="font-semibold text-white mb-1">🎵 Download FLAC/MP3</h4>
                                                    <p className="text-xs text-gray-400">Alta qualidade garantida</p>
                                                </div>
                                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                                                    <Phone className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                                                    <h4 className="font-semibold text-white mb-1">📱 Interface Moderna</h4>
                                                    <p className="text-xs text-gray-400">Web app intuitiva</p>
                                                </div>
                                                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                                                    <Zap className="w-8 h-8 text-green-400 mx-auto mb-3" />
                                                    <h4 className="font-semibold text-white mb-1">⚡ Downloads Rápidos</h4>
                                                    <p className="text-xs text-gray-400">Conexão estável</p>
                                                </div>
                                                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-center">
                                                    <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                                                    <h4 className="font-semibold text-white mb-1">💎 ARL Padrão</h4>
                                                    <p className="text-xs text-gray-400">Disponível agora</p>
                                                </div>
                                            </div>

                                            {/* Oferta Especial VIP */}
                                            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                                                <h4 className="text-2xl font-bold text-white mb-4 text-center">
                                                    Oferta Especial VIP
                                                </h4>
                                                <p className="text-gray-300 text-center mb-6">
                                                    Como cliente VIP, você tem <span className="text-yellow-400 font-bold">10% de desconto</span> na assinatura do Deemix!
                                                </p>
                                                <div className="text-center">
                                                    <Button
                                                        onClick={() => openWhatsApp('5551981086784', 'Olá! Tenho interesse na assinatura do Deemix com desconto VIP.')}
                                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 px-8 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 w-full"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z" />
                                                        </svg>
                                                        <span className="text-center">Assinar Deemix com Desconto</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SEÇÃO - ESTATÍSTICAS DE USO */}
                            <div id="estatisticas" className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-2xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Estatísticas de Uso</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Pack Requests */}
                                    <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-orange-400" />
                                                </div>
                                                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">Esta semana</span>
                                            </div>
                                            <h3 className="font-semibold text-white mb-2">Packs Semanais</h3>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-3xl font-bold text-white">{userData.weeklyPackRequests || 0}</span>
                                                <span className="text-sm text-gray-400">/ {userData.planBenefits?.packRequests.limit || 0}</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${Math.min(100, ((userData.weeklyPackRequests || 0) / Math.max(1, userData.planBenefits?.packRequests.limit || 1)) * 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Playlist Downloads */}
                                    <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                                    <ListMusic className="w-6 h-6 text-green-400" />
                                                </div>
                                                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">Esta semana</span>
                                            </div>
                                            <h3 className="font-semibold text-white mb-2">Playlists</h3>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-3xl font-bold text-white">{userData.weeklyPlaylistDownloads || 0}</span>
                                                <span className="text-sm text-gray-400">/ {userData.planBenefits?.playlistDownloads.limit === -1 ? '∞' : userData.planBenefits?.playlistDownloads.limit || 0}</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-700"
                                                    style={{
                                                        width: userData.planBenefits?.playlistDownloads.limit === -1 ? '100%' :
                                                            `${Math.min(100, ((userData.weeklyPlaylistDownloads || 0) / Math.max(1, userData.planBenefits?.playlistDownloads.limit || 1)) * 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Daily Downloads */}
                                    <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                    <Download className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">Hoje</span>
                                            </div>
                                            <h3 className="font-semibold text-white mb-2">Downloads Diários</h3>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-3xl font-bold text-white">{userData.dailyDownloadCount || 0}</span>
                                                <span className="text-sm text-gray-400">/ {userData.dailyDownloadLimit || 50}</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${Math.min(100, ((userData.dailyDownloadCount || 0) / (userData.dailyDownloadLimit || 50)) * 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Total Activity */}
                                    <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                                    <Activity className="w-6 h-6 text-purple-400" />
                                                </div>
                                                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">Total</span>
                                            </div>
                                            <h3 className="font-semibold text-white mb-2">Atividade Total</h3>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-3xl font-bold text-white">
                                                    {(userData.downloadsCount + userData.likesCount + userData.playsCount)}
                                                </span>
                                                <span className="text-sm text-gray-400">ações</span>
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{userData.downloadsCount} DL</span>
                                                <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full">{userData.likesCount} ♥</span>
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{userData.playsCount} ▶</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* SEÇÃO - UPLOAD DE MÚSICAS (APENAS PARA VIP) */}
                            {userData?.is_vip && (
                                <div id="upload" className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-2xl">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight">Enviar Músicas</h2>
                                    </div>
                                    <MusicUploadForm />
                                </div>
                            )}

                            {/* SEÇÃO - ATIVIDADE RECENTE */}
                            <div id="atividade" className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 shadow-2xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Atividade Recente</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Downloads Recentes */}
                                    <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                        <CardHeader className="border-b border-gray-700/30 pb-4">
                                            <CardTitle className="flex items-center gap-3 text-lg text-white">
                                                <Download className="text-blue-400" />
                                                Downloads Recentes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {userData.recentDownloads.length > 0 ? (
                                                    userData.recentDownloads.map((download) => (
                                                        <div key={download.id} className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
                                                            <img
                                                                src={download.track.imageUrl}
                                                                alt={download.track.songName}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm text-white truncate">{download.track.songName}</p>
                                                                <p className="text-xs text-gray-400 truncate">{download.track.artist}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(download.downloadedAt ?? null)}</p>
                                                            </div>
                                                            <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                                                {download.track.style}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                                        <p className="text-gray-500 font-medium">Nenhum download ainda</p>
                                                        <p className="text-xs text-gray-600 mt-2">Suas músicas baixadas aparecerão aqui</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Likes Recentes */}
                                    <Card className="border-gray-700/50 shadow-xl" style={{ backgroundColor: '#1B1C1D' }}>
                                        <CardHeader className="border-b border-gray-700/30 pb-4">
                                            <CardTitle className="flex items-center gap-3 text-lg text-white">
                                                <Heart className="text-pink-400" />
                                                Curtidas Recentes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {userData.recentLikes.length > 0 ? (
                                                    userData.recentLikes.map((like) => (
                                                        <div key={like.id} className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
                                                            <img
                                                                src={like.track.imageUrl}
                                                                alt={like.track.songName}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm text-white truncate">{like.track.songName}</p>
                                                                <p className="text-xs text-gray-400 truncate">{like.track.artist}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(like.createdAt ?? null)}</p>
                                                            </div>
                                                            <div className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full">
                                                                {like.track.style}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                                        <p className="text-gray-500 font-medium">Nenhuma curtida ainda</p>
                                                        <p className="text-xs text-gray-600 mt-2">Suas músicas favoritas aparecerão aqui</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal de Planos */}
            {planModalOpen && userData && (
                <Dialog onMouseDown={() => setPlanModalOpen(false)}>
                    <DialogContent onMouseDown={(e) => e.stopPropagation()} className="max-w-4xl max-h-[90vh] overflow-y-auto z-50" style={{ backgroundColor: '#1B1C1D' }}>
                        <DialogHeader>
                            <DialogTitle className="text-white text-center text-2xl font-bold">
                                📋 Gerenciar Plano
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6">
                            {/* Plano Atual */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-yellow-400" />
                                    Seu Plano Atual
                                </h3>
                                {(() => {
                                    const currentPlan = getPlanInfo(userData?.valor ?? null);
                                    return (
                                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-xl font-bold text-white">{currentPlan.name}</h4>
                                                    <p className="text-2xl font-bold text-green-400">{formatCurrency(currentPlan.price)}/mês</p>
                                                </div>
                                                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                                                    ATIVO
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {currentPlan.features.map((feature, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-gray-300">
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                        <span className="text-sm">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Planos Disponíveis */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-6">Planos Disponíveis</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { valor: 30, name: 'BÁSICO', features: ['50 Downloads/dia', 'Acesso ao Drive', 'Suporte Básico'] },
                                        { valor: 35, name: 'PADRÃO', features: ['100 Downloads/dia', 'Acesso ao Drive', 'Packs Extras', 'Suporte Prioritário'] },
                                        { valor: 38, name: 'COMPLETO', features: ['200 Downloads/dia', 'Acesso ao Drive', 'Packs Extras', 'Deemix Incluso', 'Suporte VIP'] },
                                        { valor: 42, name: 'PREMIUM', features: ['Downloads Ilimitados', 'Acesso Total', 'Deemix Incluso', 'Suporte 24/7'] },
                                        { valor: 60, name: 'VIP', features: ['Downloads Ilimitados', 'Acesso Total', 'Deemix Incluso', 'Conteúdo Exclusivo', 'Suporte VIP'] }
                                    ].map((plan) => {
                                        const isCurrentPlan = plan.valor === (userData?.valor ?? null);
                                        return (
                                            <div key={plan.valor} className={`rounded-xl p-4 border transition-all duration-200 ${isCurrentPlan
                                                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50'
                                                : 'bg-gray-800/50 border-gray-600/50 hover:border-gray-500/50'
                                                }`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-bold text-white">{plan.name}</h4>
                                                    <div className="text-lg font-bold text-green-400">{formatCurrency(plan.valor)}/mês</div>
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    {plan.features.map((feature, index) => (
                                                        <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                                                            <CheckCircle className="w-3 h-3 text-green-400" />
                                                            <span>{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        setPlanModalOpen(false);
                                                        const action = isCurrentPlan ? 'manter' : (plan.valor > (userData?.valor || 0) ? 'fazer upgrade para' : 'fazer downgrade para');
                                                        openWhatsApp('5551935052274', `Olá! Gostaria de ${action} o plano ${plan.name} (${formatCurrency(plan.valor)}/mês). Poderia me ajudar?`);
                                                    }}
                                                    className={`w-full h-10 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isCurrentPlan
                                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                                        }`}
                                                    disabled={isCurrentPlan}
                                                >
                                                    {isCurrentPlan ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" />
                                                            PLANO ATUAL
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowUpRight className="w-4 h-4" />
                                                            {plan.valor > (userData?.valor || 0) ? 'UPGRADE' : 'DOWNGRADE'}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Plano Personalizado */}
                            <div className="mt-6">
                                <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-4 border border-orange-500/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-white">PLANO PERSONALIZADO</h4>
                                        <div className="text-lg font-bold text-orange-400">Sob consulta</div>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-4">
                                        Precisa de um plano específico? Entre em contato conosco para criar uma solução personalizada.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setPlanModalOpen(false);
                                            openWhatsApp('5551935052274', 'Olá! Gostaria de criar um plano personalizado. Poderia me ajudar?');
                                        }}
                                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-10 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        SOLICITAR PLANO PERSONALIZADO
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal PIX */}
            {pixModalOpen && userData && (
                <Dialog onMouseDown={() => setPixModalOpen(false)}>
                    <DialogContent onMouseDown={(e) => e.stopPropagation()} className="max-w-md z-50" style={{ backgroundColor: '#1B1C1D' }}>
                        <DialogHeader>
                            <DialogTitle className="text-white text-center flex items-center justify-center gap-2">
                                <QrCode className="w-6 h-6" />
                                Pagamento via PIX
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 p-4">
                            {/* QR Code */}
                            <div className="text-center">
                                <img
                                    src="https://i.ibb.co/DPThj40f/qr-code-pix.png"
                                    alt="QR Code PIX"
                                    className="w-40 h-40 mx-auto rounded-lg border border-gray-600"
                                />
                            </div>

                            {/* PIX Copia e Cola */}
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-sm text-gray-400 mb-2">PIX Copia e Cola:</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs bg-gray-900 p-2 rounded text-white break-all">
                                        00020101021126510014br.gov.bcb.pix0129djpoolrecordsbrazil@gmail.com5204000053039865802BR5923EDERSON L SIEBENEICHLER6013VENANCIO AIRE62070503***6304E4D4
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard('00020101021126510014br.gov.bcb.pix0129djpoolrecordsbrazil@gmail.com5204000053039865802BR5923EDERSON L SIEBENEICHLER6013VENANCIO AIRE62070503***6304E4D4')}
                                        className="p-2 border border-green-500/30 hover:bg-green-500/20 rounded flex items-center justify-center"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Informações Compactas */}
                            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Valor:</span>
                                    <span className="text-green-400 font-bold text-lg">{formatCurrency(userData?.valor ?? null)}</span>
                                </div>
                            </div>

                            {/* Botão Enviar Comprovante */}
                            <Button
                                onClick={() => {
                                    setPixModalOpen(false);
                                    openWhatsApp('5551935052274', `Olá! Realizei o pagamento via PIX no valor de ${formatCurrency(userData?.valor ?? null)}. Segue o comprovante.`);
                                }}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Phone className="w-4 h-4" />
                                ENVIAR COMPROVANTE
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}