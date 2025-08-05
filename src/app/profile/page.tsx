"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
// ...existing code...
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Alert from "@/components/ui/Alert";
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
    DollarSign,
    Package,
    ListMusic,
    AlertTriangle,
    MessageSquare,
    Clock,
    Activity,
    CheckCircle,
    XCircle,
    X,
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
    Database
} from "lucide-react";
import Link from "next/link";

// Tipos expandidos para os dados da API
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
    dailyDownloadLimit: number | string;
    weeklyPackRequests: number | null;
    weeklyPlaylistDownloads: number | null;
    weeklyPackRequestsUsed: number | null; // Novo campo
    weeklyPlaylistDownloadsUsed: number | null; // Novo campo
    customBenefits: any; // Benefícios personalizados
    deemix: boolean | null;
    deezerPremium: boolean | null;
    deezerEmail: string | null;
    deezerPassword: string | null;
    downloadsCount: number;
    likesCount: number;
    playsCount: number;
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
    const [activeSection, setActiveSection] = useState('overview');

    // Menu items da sidebar
    const menuItems = [
        { id: 'overview', label: 'Visão Geral', description: 'Status da conta', icon: User },
        { id: 'plan', label: 'Meu Plano', description: 'Gerenciar assinatura', icon: Crown },
        { id: 'vip', label: 'Recursos VIP', description: 'Benefícios exclusivos', icon: Star },
        { id: 'deemix', label: 'Deemix', description: 'Downloads premium', icon: Disc },
        { id: 'allavsoft', label: 'Allavsoft', description: 'Download universal', icon: Download },
        { id: 'activity', label: 'Atividade', description: 'Histórico e curtidas', icon: Clock },
        { id: 'profile', label: 'Dados Pessoais', description: 'Informações da conta', icon: Mail }
    ];

    useEffect(() => {
        async function fetchUserDetails() {
            if (sessionStatus === 'authenticated') {
                try {
                    const res = await fetch("/api/profile");
                    if (res.ok) {
                        const data = await res.json();
                        setUserData(data);
                    } else {
                        console.error("Erro ao buscar dados do usuário:", res.statusText);
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
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatRelativeTime = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) return "Agora";
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
        if (diffInDays < 7) return `${Math.floor(diffInDays)}d`;
        return formatDate(dateString);
    };

    const getVencimentoStatusDisplay = (vencimentoInfo: VencimentoInfo | undefined) => {
        if (!vencimentoInfo) {
            return {
                text: "N/D",
                color: "text-gray-400",
                bgColor: "bg-gray-500/10",
                icon: <></>
            };
        }

        switch (vencimentoInfo.status) {
            case 'expired':
                return {
                    text: "Vencido",
                    color: "text-red-400",
                    bgColor: "bg-red-500/10",
                    icon: <XCircle className="w-3 h-3" />
                };
            case 'expiring_soon':
                return {
                    text: `${vencimentoInfo.daysRemaining}d`,
                    color: "text-yellow-400",
                    bgColor: "bg-yellow-500/10",
                    icon: <AlertTriangle className="w-3 h-3" />
                };
            case 'active':
                return {
                    text: "Ativo",
                    color: "text-green-400",
                    bgColor: "bg-green-500/10",
                    icon: <CheckCircle className="w-3 h-3" />
                };
            case 'cancelled':
                return {
                    text: "Cancelado",
                    color: "text-red-400",
                    bgColor: "bg-red-500/10",
                    icon: <XCircle className="w-3 h-3" />
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

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };

    const openWhatsApp = (number: string, message?: string) => {
        const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
        window.open(url, '_blank');
    };

    const getPaymentLink = (valor: number | null) => {
        if (!valor) return null;
        // Novos valores dos planos
        if (valor === 35) return 'https://mpago.la/28HWukZ'; // VIP BÁSICO
        if (valor === 42) return 'https://mpago.la/1aFWE4k'; // VIP PADRÃO  
        if (valor === 50) return 'https://mpago.la/2XTWvVS'; // VIP COMPLETO
        return null; // Acima de R$ 50 não tem link
    };

    const getPlanInfo = (valor: number | null) => {
        if (!valor) return { name: 'N/A', features: [], price: 0, canManage: false };

        if (valor === 35) return {
            name: 'VIP BÁSICO',
            features: ['50 Downloads/dia', 'Acesso ao Drive', 'Até 4 packs/semana', 'Até 7 playlists/semana'],
            price: 35,
            canManage: true
        };
        if (valor === 42) return {
            name: 'VIP PADRÃO',
            features: ['75 Downloads/dia', 'Drive + Packs', 'Até 6 packs/semana', 'Até 9 playlists/semana'],
            price: 42,
            canManage: true
        };
        if (valor === 50) return {
            name: 'VIP COMPLETO',
            features: ['150 Downloads/dia', 'Drive + Deemix*', 'Até 10 packs/semana', 'Playlists ilimitadas', 'Deezer Premium', 'Produção Musical'],
            price: 50,
            canManage: true
        };
        return {
            name: 'PERSONALIZADO',
            features: ['Plano customizado'],
            price: valor,
            canManage: false // Planos acima de R$ 50 não podem ser gerenciados
        };
    };

    const getDeemixDiscount = (valor: number | null) => {
        if (!valor) return { percentage: 10, normalPrice: 35.00, vipPrice: 31.50 };

        // Preço normal do Deemix é R$ 35,00
        const normalPrice = 35.00;

        if (valor === 35) return { percentage: 35, normalPrice, vipPrice: normalPrice * 0.65 };
        if (valor === 42) return { percentage: 42, normalPrice, vipPrice: normalPrice * 0.58 };
        if (valor === 50) return { percentage: 60, normalPrice, vipPrice: normalPrice * 0.40 };

        // Para planos personalizados, usar 10% de desconto
        return { percentage: 10, normalPrice, vipPrice: normalPrice * 0.90 };
    };

    const openDeemixManager = () => {
        window.open('https://plataformavip.nexorrecords.com.br/deemix-gerenciar', '_blank');
    };

    const openDeemixDownload = () => {
        window.open('https://plataformavip.nexorrecords.com.br/deemix', '_blank');
    };

    // Estados de loading
    if (sessionStatus === 'loading') {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-[#202B3F] via-[#27212B] to-[#0C0C0C] text-white pt-16 flex items-center justify-center px-4">
                    <div className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                        <p className="text-sm">Carregando...</p>
                    </div>
                </div>
            </>
        );
    }

    if (sessionStatus === 'unauthenticated') {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-[#202B3F] via-[#27212B] to-[#0C0C0C] text-white pt-16 flex items-center justify-center px-4">
                    <div className="text-center max-w-sm">
                        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-red-400" />
                        <h1 className="text-lg font-bold mb-2">Acesso Negado</h1>
                        <p className="text-gray-400 mb-4 text-sm">Você precisa estar logado para acessar esta página.</p>
                        <Button onClick={() => window.location.href = '/auth/signin'} className="text-sm h-8 px-4">
                            Fazer Login
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-[#202B3F] via-[#27212B] to-[#0C0C0C] text-white pt-16 flex items-center justify-center px-4">
                    <div className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                        <p className="text-sm">Carregando dados...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!userData) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-[#202B3F] via-[#27212B] to-[#0C0C0C] text-white pt-16 flex items-center justify-center px-4">
                    <div className="text-center max-w-sm">
                        <XCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                        <h1 className="text-lg font-bold mb-2">Erro ao Carregar</h1>
                        <p className="text-gray-400 mb-4 text-sm">Não foi possível carregar os dados.</p>
                        <Button onClick={() => window.location.reload()} className="text-sm h-8 px-4">
                            Tentar Novamente
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    const statusDisplay = getVencimentoStatusDisplay(userData.vencimentoInfo);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-16">
                <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
                    <div className="max-w-7xl mx-auto">

                        {/* Layout com Sidebar */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                            {/* SIDEBAR MENU */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl rounded-3xl p-6 xl:p-8 border-2 border-gray-700/30 sticky top-20 shadow-2xl w-full max-w-xs xl:max-w-[370px] flex flex-col h-fit">
                                    {/* Profile Header */}
                                    <div className="text-center mb-8 pb-6 border-b border-gray-600/50">
                                        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl ring-4 ring-purple-500/20">
                                            <User className="w-10 h-10 text-white" />
                                            {userData.is_vip && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <Crown className="w-4 h-4 text-black" />
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-white truncate tracking-wide">
                                            {userData.name || "USUÁRIO"}
                                        </h2>
                                        <p className="text-sm text-gray-400 truncate font-mono">{userData.email}</p>
                                        <div className="flex items-center justify-center gap-3 mt-4">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusDisplay.bgColor} ${statusDisplay.color} border border-current/20`}>
                                                {statusDisplay.icon}
                                                <span >{statusDisplay.text}</span>
                                            </div>
                                            {userData.is_vip && (
                                                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
                                                    <Crown className="w-3 h-3" />
                                                    <span >VIP</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Navigation Menu */}
                                    <nav className="space-y-3">
                                        <button
                                            onClick={() => setActiveSection('overview')}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'overview'
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                }`}
                                        >
                                            <BarChart3 className="w-5 h-5" />
                                            VISÃO GERAL
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('plan')}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'plan'
                                                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
                                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                }`}
                                        >
                                            <Crown className="w-5 h-5" />
                                            MEU PLANO
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('deemix')}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'deemix'
                                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                }`}
                                        >
                                            <Disc className="w-5 h-5" />
                                            DEEMIX
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('deezer')}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'deezer'
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                }`}
                                        >
                                            <Headphones className="w-5 h-5" />
                                            DEEZER PREMIUM
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('allavsoft')}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'allavsoft'
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-400/30'
                                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                }`}
                                        >
                                            <Download className="w-5 h-5" />
                                            ALLAVSOFT
                                        </button>

                                        {userData?.is_vip && (
                                            <>
                                                <button
                                                    onClick={() => setActiveSection('vip')}
                                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'vip'
                                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/25 border border-yellow-400/50'
                                                        : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                        }`}
                                                >
                                                    <Zap className="w-5 h-5" />
                                                    RECURSOS VIP
                                                </button>

                                                <button
                                                    onClick={() => setActiveSection('upload')}
                                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'upload'
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400/30'
                                                        : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                        }`}
                                                >
                                                    <Upload className="w-5 h-5" />
                                                    UPLOAD MÚSICA
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => setActiveSection('activity')}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'activity'
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25 border border-green-400/30'
                                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                }`}
                                        >
                                            <Clock className="w-5 h-5" />
                                            ATIVIDADE
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('profile')}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'profile'
                                                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/25 border border-teal-400/30'
                                                : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                }`}
                                        >
                                            <Mail className="w-5 h-5" />
                                            DADOS PESSOAIS
                                        </button>
                                    </nav>

                                    {/* Quick Stats */}
                                    <div className="mt-8 pt-6 border-t border-gray-600/50">
                                        <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-semibold" >
                                            ESTATÍSTICAS
                                        </h3>
                                        <div className="flex flex-col gap-4">
                                            {/* Downloads Diários - Apenas para usuários não-VIP */}
                                            {typeof userData?.dailyDownloadLimit !== 'string' && (
                                                <Card className="border-gray-700/50 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-blue-500/50 transition-all duration-300">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                                                <Download className="w-5 h-5 text-white" />
                                                            </div>
                                                            <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">Hoje</span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-white mb-2">Downloads</h3>
                                                        <div className="flex items-baseline gap-2 mb-3">
                                                            <span className="text-2xl font-bold text-white">{userData?.dailyDownloadCount || 0}</span>
                                                            <span className="text-sm text-gray-400">/ {typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? '∞' : (userData?.dailyDownloadLimit ?? 10)}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-700"
                                                                style={{
                                                                    width: typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? '100%' : `${Math.min(100, ((userData?.dailyDownloadCount || 0) / (typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 1)) * 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? 'Downloads ilimitados' :
                                                                userData?.dailyDownloadCount === 0 ? 'Nenhum download hoje' :
                                                                    `${(typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 10) - (userData?.dailyDownloadCount || 0)} restantes`}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            )}
                                            <div className="bg-pink-500/10 rounded-xl p-3 text-center border border-pink-500/20 flex flex-col items-center justify-center min-h-[70px]">
                                                <div className="text-xl font-bold text-pink-400 mb-1">
                                                    {userData.likesCount}
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium">
                                                    CURTIDAS
                                                </div>
                                            </div>
                                            <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20 flex flex-col items-center justify-center min-h-[70px]">
                                                <div className="text-xl font-bold text-green-400 mb-1">
                                                    {userData.playsCount}
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium">
                                                    PLAYS
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MAIN CONTENT */}
                            <div className="lg:col-span-3">
                                <div className="space-y-6">
                                    {renderActiveSection()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {renderModals()}
        </>
    );

    // Função para renderizar a seção ativa
    function renderActiveSection() {
        switch (activeSection) {
            case 'overview':
                return renderOverviewSection();
            case 'plan':
                return renderPlanSection();
            case 'deemix':
                return renderDeemixSection();
            case 'deezer':
                return renderDeezerPremiumSection();
            case 'allavsoft':
                return renderAllavsoftSection();
            case 'vip':
                return renderVipSection();
            case 'upload':
                return renderUploadSection();
            case 'activity':
                return renderActivitySection();
            case 'profile':
                return renderProfileSection();
            default:
                return renderOverviewSection();
        }
    }

    // Seção de Visão Geral
    function renderOverviewSection() {
        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Visão Geral</h2>
                        <p className="text-gray-400">Resumo das suas atividades e estatísticas</p>
                    </div>
                </div>

                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Downloads Diários - Apenas para usuários não-VIP */}
                    {typeof userData?.dailyDownloadLimit !== 'string' && (
                        <Card className="border-gray-700/50 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-blue-500/50 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">Hoje</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Downloads</h3>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-2xl font-bold text-white">{userData?.dailyDownloadCount || 0}</span>
                                    <span className="text-sm text-gray-400">/ {typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? '∞' : (userData?.dailyDownloadLimit ?? 10)}</span>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-700"
                                        style={{
                                            width: typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? '100%' : `${Math.min(100, ((userData?.dailyDownloadCount || 0) / (typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 1)) * 100)}%`
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? 'Downloads ilimitados' :
                                        userData?.dailyDownloadCount === 0 ? 'Nenhum download hoje' :
                                            `${(typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 10) - (userData?.dailyDownloadCount || 0)} restantes`}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Total de Downloads */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-green-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">Total</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Downloads</h3>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-2xl font-bold text-white">{userData?.downloadsCount || 0}</span>
                                <span className="text-sm text-gray-400">músicas</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                {userData?.downloadsCount === 0 ? 'Nenhum download ainda' :
                                    'Sua biblioteca pessoal'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Likes */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-pink-900/20 to-rose-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-pink-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">Favoritos</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Curtidas</h3>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-2xl font-bold text-white">{userData?.likesCount || 0}</span>
                                <span className="text-sm text-gray-400">músicas</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                {userData?.likesCount === 0 ? 'Nenhuma curtida ainda' :
                                    'Suas músicas favoritas'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Plays */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-purple-900/20 to-violet-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-purple-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                                    <Play className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">Reproduções</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Plays</h3>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-2xl font-bold text-white">{userData?.playsCount || 0}</span>
                                <span className="text-sm text-gray-400">vezes</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                {userData?.playsCount === 0 ? 'Nenhuma reprodução ainda' :
                                    'Suas sessões de música'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Card de Atividade Total */}
                <Card className="border-gray-700/50 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Atividade Total</h3>
                                    <p className="text-sm text-gray-400">Resumo das suas interações</p>
                                </div>
                            </div>
                            <span className="text-3xl font-bold text-white">
                                {(userData?.downloadsCount || 0) + (userData?.likesCount || 0) + (userData?.playsCount || 0)}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <Download className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <div className="text-lg font-bold text-white">{userData?.downloadsCount || 0}</div>
                                <div className="text-xs text-gray-400">Downloads</div>
                            </div>
                            <div className="text-center p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                                <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                                <div className="text-lg font-bold text-white">{userData?.likesCount || 0}</div>
                                <div className="text-xs text-gray-400">Curtidas</div>
                            </div>
                            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                <Play className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                <div className="text-lg font-bold text-white">{userData?.playsCount || 0}</div>
                                <div className="text-xs text-gray-400">Plays</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status do Plano */}
                <Card className="border-gray-700/50 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-yellow-500/50 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Status do Plano</h3>
                                <p className="text-gray-400">Gerencie sua assinatura e benefícios</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="text-center p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                                <div className="text-3xl font-bold text-white mb-2">{getPlanInfo(userData?.valor ?? null).name}</div>
                                <div className="text-lg font-bold text-green-400">{formatCurrency(userData?.valor ?? null)}/mês</div>
                                <div className="text-xs text-gray-400 mt-1">Plano Atual</div>
                            </div>
                            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                                <div className="text-sm text-gray-400 mb-2">Vencimento</div>
                                <div className="text-lg font-bold text-white">{formatDate(userData?.vencimento ?? null)}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {userData?.vencimentoInfo?.daysRemaining ?
                                        `${userData.vencimentoInfo.daysRemaining} dias restantes` :
                                        'Sem vencimento definido'}
                                </div>
                            </div>
                            <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                                <div className="text-sm text-gray-400 mb-2">Status</div>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                                    {statusDisplay.icon}
                                    {statusDisplay.text}
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    {userData?.is_vip ? 'Usuário VIP' : 'Usuário Regular'}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={() => window.location.href = '/plans'}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 cursor-pointer px-8 py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                <Settings className="w-5 h-5 mr-2" />
                                Gerenciar Plano
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Seção do Deemix
    function renderDeemixSection() {
        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Disc className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white font-inter">Deemix - Download de Músicas</h2>
                        <p className="text-gray-400 font-inter">Plataforma premium para download de músicas em alta qualidade</p>
                    </div>
                </div>

                {/* Descrição Elegante do Deemix */}
                <Card className="border-gray-700/50 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 backdrop-blur-sm shadow-xl border border-indigo-500/20">
                    <CardContent className="p-6">
                        <p className="text-gray-300 text-sm leading-relaxed text-justify font-inter">
                            O Deemix é uma das ferramentas mais poderosas e populares para quem deseja baixar músicas diretamente do Deezer — uma das maiores plataformas de streaming do mundo. Diferente de métodos ilegais de extração de áudio por gravação de tela ou plugins inseguros, o Deemix atua como um cliente direto que baixa a música exatamente como ela está hospedada, sem perda de qualidade.
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed text-justify font-inter mt-3">
                            Com suporte completo a formatos de alta qualidade como FLAC e MP3, o Deemix oferece uma experiência de download premium com interface web moderna e intuitiva. A ferramenta permite downloads em lote, organização automática de metadados e acesso a milhões de músicas com qualidade de áudio excepcional.
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed text-justify font-inter mt-3">
                            Recursos exclusivos incluem downloads em velocidade máxima, suporte a playlists completas, extração de letras sincronizadas e integração com ARL Premium para acesso a conteúdo exclusivo. O Deemix é a solução definitiva para quem busca uma experiência de download musical profissional e confiável.
                        </p>
                    </CardContent>
                </Card>

                {/* Box 1: Status de Acesso */}
                {userData?.deemix ? (
                    // Box Verde - Usuário tem acesso
                    <Card className="border-gray-700/50 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-green-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white font-inter">Deemix - Acesso Liberado</h3>
                                        <p className="text-sm text-gray-400 font-inter">Sua conta está ativa</p>
                                    </div>
                                </div>
                                <span className="text-xs text-green-400 bg-green-500/20 px-3 py-1 rounded-full font-semibold">ATIVO</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300 font-inter">Download de músicas em FLAC/MP3</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300 font-inter">Interface web moderna</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300 font-inter">Downloads rápidos e estáveis</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300 font-inter">ARL Premium disponível</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Box Vermelho - Usuário não tem acesso
                    <Card className="border-gray-700/50 bg-gradient-to-br from-red-900/20 to-rose-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-red-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            {/* Header com design melhorado */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <XCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white font-inter bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                                        Deemix - Acesso Não Disponível
                                    </h3>
                                    <p className="text-sm text-gray-300 font-inter">O Deemix não está incluído no seu plano atual</p>
                                </div>
                            </div>

                            {/* Benefícios em cards individuais */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <Music className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-inter">Download de músicas em FLAC/MP3</span>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <Monitor className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-inter">Interface web moderna</span>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-inter">Downloads rápidos e estáveis</span>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                        <Diamond className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-inter">ARL Premium disponível</span>
                                </div>
                            </div>

                            {/* Call-to-action melhorado */}
                            <div className="pt-4 border-t border-gray-700/50">
                                <div className="mb-3 text-center">
                                    <p className="text-xs text-gray-400 font-inter mb-2">🎵 Desbloqueie downloads ilimitados</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                                        <span className="line-through">
                                            R$ {getDeemixDiscount(userData?.valor ?? null).normalPrice.toFixed(2)}/mês
                                        </span>
                                        <span className="text-green-400 font-semibold">
                                            R$ {getDeemixDiscount(userData?.valor ?? null).vipPrice.toFixed(2)}/mês
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => window.open('/deemix', '_blank')}
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-sm font-inter font-medium px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Assinar Deemix Premium
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Box 2: Credenciais (se tiver acesso) */}
                {userData?.deemix && (
                    <Card className="border-gray-700/50 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-blue-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <Key className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white font-inter">🔑 Credenciais de Acesso</h3>
                                    <p className="text-sm text-gray-400 font-inter">Suas credenciais para acessar o Deemix</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 font-inter">Senha:</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800/50 rounded-lg p-3 font-mono text-white text-sm border border-gray-700">
                                            JMgQuuKI1LDiXBm
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard('JMgQuuKI1LDiXBm')}
                                            className="bg-blue-600 hover:bg-blue-700 p-3"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 font-inter">ARL Premium:</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800/50 rounded-lg p-3 font-mono text-white text-xs break-all border border-gray-700">
                                            048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard('048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e')}
                                            className="bg-blue-600 hover:bg-blue-700 p-3"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Box 3: Oferta VIP (se for VIP e não tiver Deemix) */}
                {userData?.is_vip && !userData?.deemix && (
                    <Card className="border-gray-700/50 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-purple-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            {/* Header com ícone animado */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white font-inter bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                        🎁 Oferta Especial VIP
                                    </h3>
                                    <p className="text-sm text-gray-300 font-inter">Desconto exclusivo para clientes VIP</p>
                                </div>
                            </div>

                            {/* Preços com design melhorado */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-300 font-inter">Preço Normal:</span>
                                    </div>
                                    <span className="text-gray-400 line-through font-inter text-sm">
                                        R$ {getDeemixDiscount(userData?.valor ?? null).normalPrice.toFixed(2)}/mês
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg border border-purple-500/30">
                                    <div className="flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-purple-400" />
                                        <span className="text-gray-300 font-inter font-semibold">Preço VIP:</span>
                                    </div>
                                    <span className="text-purple-400 font-bold font-inter text-lg">
                                        R$ {getDeemixDiscount(userData?.valor ?? null).vipPrice.toFixed(2)}/mês
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-gray-300 font-inter">Desconto:</span>
                                    </div>
                                    <span className="text-green-400 font-semibold font-inter">
                                        {getDeemixDiscount(userData?.valor ?? null).percentage}% OFF
                                    </span>
                                </div>
                            </div>

                            {/* Dica com design melhorado */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg border border-purple-500/20">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs text-white font-bold">💡</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-200 font-inter leading-relaxed">
                                            <strong className="text-purple-300">Como cliente VIP</strong>, você tem
                                            <strong className="text-purple-300"> {getDeemixDiscount(userData?.valor ?? null).percentage}% de desconto</strong> na assinatura do Deemix!
                                            Aproveite downloads ilimitados com qualidade premium por um preço especial.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Badge de economia */}
                            <div className="mt-4 flex justify-center">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold font-inter shadow-lg">
                                    💰 Economia de R$ {(() => {
                                        const discount = getDeemixDiscount(userData?.valor ?? null);
                                        const monthlySavings = discount.normalPrice - discount.vipPrice;
                                        return (monthlySavings * 12).toFixed(2);
                                    })()}/ano
                                </div>
                            </div>

                            {/* Botão melhorado */}
                            <div className="mt-4">
                                <Button
                                    onClick={() => window.open('/deemix', '_blank')}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-inter font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Assinar Deemix com Desconto
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // Seção do Deezer Premium
    function renderDeezerPremiumSection() {
        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Headphones className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white font-inter">Deezer Premium - Streaming</h2>
                        <p className="text-gray-400 font-inter">Acesso premium ao Deezer para streaming de alta qualidade</p>
                    </div>
                </div>

                {/* Descrição Elegante do Deezer Premium */}
                <Card className="border-gray-700/50 bg-gradient-to-br from-blue-900/10 to-cyan-900/10 backdrop-blur-sm shadow-xl border border-blue-500/20">
                    <CardContent className="p-6">
                        <p className="text-gray-300 text-sm leading-relaxed text-justify font-inter">
                            O Deezer Premium é uma das principais plataformas de streaming musical do mundo, oferecendo uma experiência premium completa para os amantes da música. Com acesso a mais de 90 milhões de músicas, podcasts e rádios ao vivo, o Deezer Premium elimina completamente os anúncios, proporcionando uma experiência de audição ininterrupta e imersiva.
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed text-justify font-inter mt-3">
                            A qualidade de áudio é excepcional, com suporte a streaming em alta qualidade (320kbps) e formato FLAC para os verdadeiros audiophiles. Você pode baixar suas músicas favoritas para ouvir offline, criar playlists personalizadas e descobrir novas músicas através do algoritmo inteligente de recomendações do Deezer.
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed text-justify font-inter mt-3">
                            Recursos exclusivos incluem letras sincronizadas, modo de foco para concentração, equalizador personalizável e integração com dispositivos inteligentes. O Deezer Premium é perfeito para quem busca uma experiência de streaming musical completa, sem limitações e com a melhor qualidade de áudio disponível.
                        </p>
                    </CardContent>
                </Card>

                {/* Box 1: Status de Acesso */}
                {userData?.deezerPremium ? (
                    // Box Verde - Usuário tem acesso
                    <Card className="border-gray-700/50 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-green-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white font-inter">Deezer Premium - Acesso Liberado</h3>
                                        <p className="text-sm text-gray-400 font-inter">Sua conta está ativa</p>
                                    </div>
                                </div>
                                <span className="text-xs text-green-400 bg-green-500/20 px-3 py-1 rounded-full font-semibold">ATIVO</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300 font-inter">Streaming sem anúncios</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300 font-inter">Qualidade FLAC/320kbps</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300 font-inter">Downloads offline</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300 font-inter">Playlists personalizadas</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Box Vermelho - Usuário não tem acesso
                    <Card className="border-gray-700/50 bg-gradient-to-br from-red-900/20 to-rose-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-red-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            {/* Header com design melhorado */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <XCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white font-inter bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                                        Deezer Premium - Acesso Não Disponível
                                    </h3>
                                    <p className="text-sm text-gray-300 font-inter">O Deezer Premium não está incluído no seu plano atual</p>
                                </div>
                            </div>

                            {/* Benefícios em cards individuais */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                        <Headphones className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-inter">Streaming sem anúncios</span>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                        <Music className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-inter">Qualidade FLAC/320kbps</span>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-inter">Downloads offline</span>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                        <ListMusic className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-inter">Playlists personalizadas</span>
                                </div>
                            </div>

                            {/* Call-to-action melhorado */}
                            <div className="pt-4 border-t border-gray-700/50">
                                <div className="mb-3 text-center">
                                    <p className="text-xs text-gray-400 font-inter mb-2">🎵 Desbloqueie a experiência premium</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                                        <span className="line-through">R$ 35,00/mês</span>
                                        <span className="text-green-400 font-semibold">R$ 9,75/mês</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => window.open('https://mpago.la/2BcS59a', '_blank')}
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-sm font-inter font-medium px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Assinar Deezer Premium
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Box 2: Credenciais de Acesso (se disponível) */}
                {userData?.deezerPremium && userData?.deezerEmail && userData?.deezerPassword && (
                    <Card className="border-gray-700/50 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-blue-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <Key className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white font-inter">Credenciais de Acesso</h3>
                                    <p className="text-sm text-gray-400 font-inter">Use estas credenciais para acessar o Deezer Premium</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-gray-300 font-inter">Email:</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-white font-mono">{userData.deezerEmail}</span>
                                        <Button
                                            onClick={() => copyToClipboard(userData.deezerEmail!)}
                                            className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-6"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Key className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-gray-300 font-inter">Senha:</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-white font-mono">••••••••</span>
                                        <Button
                                            onClick={() => copyToClipboard(userData.deezerPassword!)}
                                            className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-6"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                                <p className="text-sm text-blue-300 font-inter">
                                    <strong>💡 Dica:</strong> Use estas credenciais para fazer login no aplicativo ou site do Deezer Premium.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Box 3: Oferta Especial VIP (se aplicável) */}
                {userData?.is_vip && !userData?.deezerPremium && (
                    <Card className="border-gray-700/50 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-purple-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            {/* Header com ícone animado */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white font-inter bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                        🎁 Oferta Especial VIP
                                    </h3>
                                    <p className="text-sm text-gray-300 font-inter">Exclusivo para clientes VIP</p>
                                </div>
                            </div>

                            {/* Preços com design melhorado */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-300 font-inter">Preço Normal:</span>
                                    </div>
                                    <span className="text-gray-400 line-through font-inter text-sm">
                                        R$ 9,75/mês
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg border border-purple-500/30">
                                    <div className="flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-purple-400" />
                                        <span className="text-gray-300 font-inter font-semibold">Preço VIP:</span>
                                    </div>
                                    <span className="text-purple-400 font-bold font-inter text-lg">
                                        R$ 9,75/mês
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-gray-300 font-inter">Benefício:</span>
                                    </div>
                                    <span className="text-green-400 font-semibold font-inter">Incluído em planos com Deemix</span>
                                </div>
                            </div>

                            {/* Dica com design melhorado */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg border border-purple-500/20">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs text-white font-bold">💡</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-200 font-inter leading-relaxed">
                                            <strong className="text-purple-300">Como cliente VIP</strong>, você pode ter o
                                            <strong className="text-purple-300"> Deezer Premium incluído gratuitamente </strong>
                                            em planos que incluem o Deemix!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Badge de economia */}
                            <div className="mt-4 flex justify-center">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold font-inter shadow-lg">
                                    💰 Economia de R$ 117,00/ano
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // Seção do Allavsoft
    function renderAllavsoftSection() {
        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Allavsoft - Download Universal</h2>
                        <p className="text-gray-400">Ferramenta completa para download de vídeos e áudios de +1000 sites</p>
                    </div>
                </div>

                {/* Box de descrição justificada */}
                <div className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 border border-green-500/20 rounded-xl p-6 mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed text-justify font-inter">
                        O Allavsoft é uma solução universal para quem precisa baixar vídeos e áudios de mais de 1000 sites diferentes, incluindo YouTube, Vimeo, Spotify, SoundCloud, Facebook, Instagram, TikTok e muitos outros. Com interface intuitiva e suporte a múltiplos formatos, permite baixar conteúdos em alta qualidade, converter arquivos para diversos formatos e gerenciar downloads em lote. Ideal para DJs, produtores, criadores de conteúdo e qualquer pessoa que deseja ter acesso offline a mídias de qualquer plataforma. Experimente a praticidade e o poder do Allavsoft para turbinar sua biblioteca de músicas e vídeos!
                    </p>
                </div>

                <Card className="border-gray-700/50 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Box principal - Em Breve */}
                            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full flex items-center justify-center">
                                            <Download className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">Allavsoft - Em Breve</h4>
                                            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">AGOSTO 2025</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                                        <Download className="w-5 h-5 text-green-400" />
                                        <span className="text-gray-300">Download de vídeos/áudios</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                                        <Database className="w-5 h-5 text-green-400" />
                                        <span className="text-gray-300">+1000 sites suportados</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                                        <Zap className="w-5 h-5 text-green-400" />
                                        <span className="text-gray-300">Downloads em lote</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                                        <Star className="w-5 h-5 text-green-400" />
                                        <span className="text-gray-300">Interface intuitiva</span>
                                    </div>
                                </div>

                                <Link href="/allavsoft" className="w-full">
                                    <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                                        <ExternalLink className="w-5 h-5" />
                                        Saber Mais
                                    </button>
                                </Link>
                            </div>

                            {/* Box de benefícios VIP */}
                            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                    <Crown className="w-6 h-6 text-blue-400" />
                                    Benefícios VIP
                                </h4>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                                        <span className="text-gray-300">VIP Completo:</span>
                                        <span className="text-green-400 font-semibold">INCLUÍDO</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                                        <span className="text-gray-300">Outros Planos:</span>
                                        <span className="text-blue-400 font-semibold">EM BREVE</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                                        <span className="text-gray-300">Lançamento:</span>
                                        <span className="text-yellow-400 font-semibold">AGOSTO 2025</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-500/10 rounded-lg">
                                    <p className="text-sm text-blue-300">
                                        <strong>💡 Dica:</strong> Será incluído gratuitamente no plano VIP Completo quando lançado!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Seção de Plano Atual
    function renderPlanSection() {
        if (!userData) return null;

        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Plano Atual</h2>
                        <p className="text-gray-400">Informações detalhadas do seu plano VIP</p>
                    </div>
                </div>

                {/* Card de Informações do Plano */}
                <Card className="border-gray-700/50 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Crown className="w-6 h-6 text-yellow-400" />
                                Status do Plano
                            </h3>
                            <Button
                                onClick={() => setPixModalOpen(true)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Gerenciar
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
                                <div className="text-2xl font-bold text-white mb-1">{getPlanInfo(userData?.valor ?? null).name}</div>
                                <div className="text-lg font-bold text-green-400">{formatCurrency(userData?.valor ?? null)}/mês</div>
                                <div className="text-xs text-gray-400 mt-1">Plano Contratado</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                                <div className="text-sm text-gray-400 mb-1">Vencimento</div>
                                <div className="text-lg font-bold text-white">{formatDate(userData?.vencimento ?? null)}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {userData?.vencimentoInfo?.daysRemaining ?
                                        `${userData.vencimentoInfo.daysRemaining} dias restantes` :
                                        'Sem vencimento definido'}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                                <div className="text-sm text-gray-400 mb-1">Status</div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                                    {statusDisplay.icon}
                                    {statusDisplay.text}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {userData?.is_vip ? 'Usuário VIP' : 'Usuário Regular'}
                                </div>
                            </div>
                        </div>

                        {/* Informações Detalhadas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-yellow-400" />
                                    Benefícios do Plano
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Downloads: {userData?.dailyDownloadLimit ?? 10}/dia</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Qualidade FLAC/320kbps</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Acesso total Drive</span>
                                    </div>
                                    {userData?.deemix && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-gray-300">Deemix Premium</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-400" />
                                    Informações de Pagamento
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-300">Valor mensal:</span>
                                        <span className="text-sm font-semibold text-white">{formatCurrency(userData?.valor ?? null)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-300">Próximo pagamento:</span>
                                        <span className="text-sm font-semibold text-white">{formatDate(userData?.vencimento ?? null)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-300">Forma de pagamento:</span>
                                        <span className="text-sm font-semibold text-white">PIX/Cartão</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de Descrição Elegante */}
                <Card className="border-gray-700/50 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-4">✨ Gerenciamento de Assinatura</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Nesta área, você pode visualizar e gerenciar sua assinatura na nossa plataforma de músicas.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-400" />
                                    Informações Disponíveis
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Nome do plano contratado
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Status da assinatura (ativa, pendente ou expirada)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Data de vencimento ou renovação automática
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Limites de download ou recursos disponíveis
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-purple-400" />
                                    Ações Disponíveis
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <ArrowUpRight className="w-4 h-4 text-blue-400" />
                                        Fazer upgrade ou downgrade de plano
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ArrowUpRight className="w-4 h-4 text-blue-400" />
                                        Renovar sua assinatura manualmente
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ArrowUpRight className="w-4 h-4 text-blue-400" />
                                        Alterar forma de pagamento
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ArrowUpRight className="w-4 h-4 text-blue-400" />
                                        Cancelar ou pausar seu plano
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                            <p className="text-sm text-gray-300 leading-relaxed">
                                <strong className="text-yellow-400">💡 Dica:</strong> Manter seu plano ativo garante acesso completo às faixas exclusivas,
                                lançamentos atualizados, playlists selecionadas e downloads ilimitados (conforme o plano).
                                Aproveite o melhor da música, sempre na palma da sua mão!
                            </p>
                        </div>

                        {/* Botão Cancelar Plano */}
                        <div className="mt-4 flex justify-center">
                            <Button
                                onClick={() => openWhatsApp('5551935052274', 'Olá! Gostaria de solicitar o cancelamento do meu plano.')}
                                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-inter font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                            >
                                <XCircle className="w-4 h-4" />
                                CANCELAR PLANO
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    function renderVipSection() {
        if (!userData?.is_vip) {
            return (
                <div className="space-y-6">
                    {/* Título da Seção */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">Recursos VIP</h2>
                            <p className="text-gray-400">Benefícios exclusivos para membros VIP</p>
                        </div>
                    </div>

                    <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                        <CardContent className="p-6">
                            <div className="text-center py-8">
                                <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Recursos VIP Não Disponíveis</h3>
                                <p className="text-gray-400">Faça upgrade para o plano VIP para acessar recursos exclusivos.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-black font-bold" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Recursos VIP</h2>
                        <p className="text-gray-400">Benefícios exclusivos e acesso prioritário</p>
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse inline-block mt-2">
                            ✨ EXCLUSIVO
                        </div>
                    </div>
                </div>

                <Card className="border-yellow-500/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg p-4 text-center border border-yellow-500/20">
                                <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                <h3 className="text-sm font-bold text-white mb-1">Acesso Prioritário</h3>
                                <p className="text-yellow-100 text-xs">Downloads sem fila</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-4 text-center border border-purple-500/20">
                                <Gift className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                <h3 className="text-sm font-bold text-white mb-1">Exclusivo</h3>
                                <p className="text-purple-100 text-xs">Lançamentos únicos</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-lg p-4 text-center border border-emerald-500/20">
                                <Headphones className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                <h3 className="text-sm font-bold text-white mb-1">Suporte VIP</h3>
                                <p className="text-emerald-100 text-xs">24/7 WhatsApp</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                <ListMusic className="w-4 h-4 text-yellow-400" />
                                Uso Semanal
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Acesso ao Drive */}
                                <div className="bg-gray-800/50 rounded p-3 flex flex-col items-center justify-center">
                                    <div className="flex items-center justify-between mb-1 w-full">
                                        <span className="text-xs text-gray-300">📁 Drive</span>
                                        <span className="text-xs text-green-400">Ativo</span>
                                    </div>
                                    <div className="text-sm font-bold text-white mb-2">Liberado</div>
                                    <Button
                                        className="mt-2 w-full flex justify-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded-xl"
                                        onClick={() => window.open('http://plataformavip.nexorrecords.com.br/atualizacoes/', '_blank')}
                                    >
                                        ACESSAR ACERVOS
                                    </Button>
                                </div>

                                {/* Packs Semanais */}
                                <div className="bg-gray-800/50 rounded p-3 flex flex-col items-center justify-center">
                                    <span className="text-xs text-gray-300">🎚️ Packs</span>
                                    <div className="text-sm font-bold text-white mb-2">
                                        {(() => {
                                            const used = userData?.weeklyPackRequestsUsed ?? 0;
                                            let limit = userData?.weeklyPackRequests;
                                            if (!limit || limit < 1) {
                                                limit = userData?.planBenefits?.packRequests?.limit ?? 4;
                                            }
                                            return `${used}/${limit}`;
                                        })()}
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                                        <div
                                            className="bg-blue-500 h-1 rounded-full transition-all"
                                            style={{
                                                width: `${(() => {
                                                    const used = userData?.weeklyPackRequestsUsed ?? 0;
                                                    let limit = userData?.weeklyPackRequests;
                                                    if (!limit || limit < 1) {
                                                        limit = userData?.planBenefits?.packRequests?.limit ?? 4;
                                                    }
                                                    return Math.min(100, (used / Math.max(1, limit)) * 100);
                                                })()}%`
                                            }}
                                        ></div>
                                    </div>
                                    <Button
                                        className="w-full flex justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-xl"
                                        onClick={() => window.open('https://wa.me/5551935052274', '_blank')}
                                    >
                                        PEDIR PACKS
                                    </Button>
                                </div>

                                {/* Playlists Semanais */}
                                <div className="bg-gray-800/50 rounded p-3 flex flex-col items-center justify-center">
                                    <span className="text-xs text-gray-300">🎵 Playlists</span>
                                    <div className="text-sm font-bold text-white mb-2">
                                        {(() => {
                                            const used = userData?.weeklyPlaylistDownloadsUsed ?? 0;
                                            let limit = userData?.weeklyPlaylistDownloads;
                                            if (!limit || limit < 1) {
                                                limit = userData?.planBenefits?.playlistDownloads?.limit ?? 7;
                                            }
                                            return `${used}/${limit}`;
                                        })()}
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                                        <div
                                            className="bg-green-500 h-1 rounded-full transition-all"
                                            style={{
                                                width: `${(() => {
                                                    const used = userData?.weeklyPlaylistDownloadsUsed ?? 0;
                                                    let limit = userData?.weeklyPlaylistDownloads;
                                                    if (!limit || limit < 1) {
                                                        limit = userData?.planBenefits?.playlistDownloads?.limit ?? 7;
                                                    }
                                                    return Math.min(100, (used / Math.max(1, limit)) * 100);
                                                })()}%`
                                            }}
                                        ></div>
                                    </div>
                                    <Button
                                        className="w-full flex justify-center bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-2 px-4 rounded-xl"
                                        onClick={() => window.open('https://wa.me/5551935052274', '_blank')}
                                    >
                                        PEDIR PLAYLISTS
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 mt-6">
                            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Crown className="w-6 h-6 text-yellow-400" />
                                Benefícios VIP
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col items-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-5 border border-blue-500/20 shadow-md">
                                    <Download className="w-8 h-8 text-blue-400 mb-2" />
                                    <div className="text-lg font-bold text-white mb-1">Downloads</div>
                                    <div className="text-green-400 font-bold text-base">{userData?.dailyDownloadLimit ?? 50}/dia</div>
                                    <div className="text-xs text-gray-400 mt-1">Limite diário</div>
                                </div>
                                <div className="flex flex-col items-center bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-lg p-5 border border-purple-500/20 shadow-md">
                                    <Disc className="w-8 h-8 text-purple-400 mb-2" />
                                    <div className="text-lg font-bold text-white mb-1">Qualidade</div>
                                    <div className="text-pink-400 font-bold text-base">FLAC/320kbps</div>
                                    <div className="text-xs text-gray-400 mt-1">Áudio premium</div>
                                </div>
                                <div className="flex flex-col items-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-5 border border-green-500/20 shadow-md">
                                    <Upload className="w-8 h-8 text-green-400 mb-2" />
                                    <div className="text-lg font-bold text-white mb-1">Upload</div>
                                    <div className="text-emerald-400 font-bold text-base">Personalizado</div>
                                    <div className="text-xs text-gray-400 mt-1">Envie suas músicas</div>
                                </div>
                                <div className="flex flex-col items-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-5 border border-blue-500/20 shadow-md">
                                    <Database className="w-8 h-8 text-blue-400 mb-2" />
                                    <div className="text-lg font-bold text-white mb-1">Drive</div>
                                    <div className="text-green-400 font-bold text-base">Acesso total</div>
                                    <div className="text-xs text-gray-400 mt-1">Acervo completo</div>
                                </div>
                                <div className="flex flex-col items-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-5 border border-purple-500/20 shadow-md">
                                    <Zap className="w-8 h-8 text-purple-400 mb-2" />
                                    <div className="text-lg font-bold text-white mb-1">Deemix Premium</div>
                                    <div className={`font-bold text-base ${userData?.deemix ? 'text-green-400' : 'text-red-400'}`}>{userData?.deemix ? 'Liberado' : 'Bloqueado'}</div>
                                    <div className="text-xs text-gray-400 mt-1">Downloads ilimitados</div>
                                </div>
                                <div className="flex flex-col items-center bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg p-5 border border-emerald-500/20 shadow-md">
                                    <MessageSquare className="w-8 h-8 text-emerald-400 mb-2" />
                                    <div className="text-lg font-bold text-white mb-1">Suporte</div>
                                    <div className="text-emerald-400 font-bold text-base">Prioritário</div>
                                    <div className="text-xs text-gray-400 mt-1">WhatsApp 24/7</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-4">
                            <Button
                                onClick={() => openWhatsApp('5551935052274', 'Olá! Sou usuário VIP e preciso de suporte.')}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-2 text-sm"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                SUPORTE VIP
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Seção de Atividade
    function renderActivitySection() {
        if (!userData) return null;

        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Atividade Recente</h2>
                        <p className="text-gray-400">Histórico de downloads, curtidas e interações</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Downloads Recentes */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-blue-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Downloads Recentes</h3>
                                    <p className="text-sm text-gray-400">Suas últimas músicas baixadas</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {userData.recentDownloads && userData.recentDownloads.length > 0 ? (
                                    userData.recentDownloads.slice(0, 5).map((activity, index) => (
                                        <div key={activity.id} className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {activity.track.imageUrl ? (
                                                            <img
                                                                src={activity.track.imageUrl}
                                                                alt={activity.track.songName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Music className="w-6 h-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-white">{index + 1}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-white truncate">{activity.track.songName}</h4>
                                                    <p className="text-sm text-gray-300 truncate">{activity.track.artist}</p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                        <Download className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/10">
                                        <Download className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium">Nenhum download recente</p>
                                        <p className="text-xs text-gray-500 mt-1">Comece a baixar músicas para ver aqui</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deemix Section */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-purple-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Deemix - Downloads Ilimitados</h2>
                                    <p className="text-gray-400">Ferramenta avançada para baixar músicas em alta qualidade</p>
                                </div>
                            </div>
                            {/* Box de descrição justificada */}
                            <div className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 border border-purple-500/20 rounded-xl p-6 mb-6">
                                <p className="text-gray-300 text-sm leading-relaxed text-justify font-inter">
                                    O Deemix é uma das ferramentas mais populares para baixar músicas em alta qualidade diretamente de plataformas como Deezer. Com suporte a FLAC, MP3 320kbps e playlists completas, oferece praticidade e velocidade para DJs, colecionadores e amantes da música. Permite organizar downloads, buscar faixas específicas, baixar álbuns inteiros e gerenciar sua biblioteca musical com facilidade. Ideal para quem busca qualidade máxima e controle total sobre seus arquivos de áudio. Experimente o Deemix e leve sua experiência musical para outro nível!
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Curtidas Recentes */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-pink-900/20 to-rose-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-pink-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Curtidas Recentes</h3>
                                    <p className="text-sm text-gray-400">Suas músicas favoritas</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {userData.recentLikes && userData.recentLikes.length > 0 ? (
                                    userData.recentLikes.slice(0, 5).map((activity, index) => (
                                        <div key={activity.id} className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {activity.track.imageUrl ? (
                                                            <img
                                                                src={activity.track.imageUrl}
                                                                alt={activity.track.songName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Music className="w-6 h-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                                                        <span className="text-xs font-bold text-white">{index + 1}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-white truncate">{activity.track.songName}</h4>
                                                    <p className="text-sm text-gray-300 truncate">{activity.track.artist}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-pink-400 bg-pink-500/20 px-2 py-1 rounded-full">
                                                            {activity.track.style}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatRelativeTime(activity.createdAt || null)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                                                        <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-xl border border-pink-500/10">
                                        <Heart className="w-16 h-16 text-pink-400/50 mx-auto mb-4" />
                                        <p className="text-gray-400 font-medium">Nenhuma curtida recente</p>
                                        <p className="text-xs text-gray-500 mt-1">Curta músicas para ver aqui</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Card de Estatísticas de Reprodução */}
                <Card className="border-gray-700/50 bg-gradient-to-br from-purple-900/20 to-violet-900/20 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Estatísticas de Reprodução</h3>
                                <p className="text-sm text-gray-400">Suas sessões de música</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl border border-purple-500/20">
                                <Play className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-white">{userData?.playsCount || 0}</div>
                                <div className="text-sm text-gray-400">Total de Plays</div>
                                <div className="text-xs text-purple-400 mt-1">
                                    {userData?.playsCount === 0 ? 'Nenhuma reprodução' :
                                        userData?.playsCount === 1 ? '1 reprodução' :
                                            `${userData.playsCount} reproduções`}
                                </div>
                            </div>

                            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                                <Download className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-white">{userData?.downloadsCount || 0}</div>
                                <div className="text-sm text-gray-400">Total de Downloads</div>
                                <div className="text-xs text-blue-400 mt-1">
                                    {userData?.downloadsCount === 0 ? 'Nenhum download' :
                                        userData?.downloadsCount === 1 ? '1 download' :
                                            `${userData.downloadsCount} downloads`}
                                </div>
                            </div>

                            <div className="text-center p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/20">
                                <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-white">{userData?.likesCount || 0}</div>
                                <div className="text-sm text-gray-400">Total de Curtidas</div>
                                <div className="text-xs text-pink-400 mt-1">
                                    {userData?.likesCount === 0 ? 'Nenhuma curtida' :
                                        userData?.likesCount === 1 ? '1 curtida' :
                                            `${userData.likesCount} curtidas`}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Seção de Dados Pessoais
    function renderProfileSection() {
        if (!userData) return null;

        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Dados Pessoais</h2>
                        <p className="text-gray-400">Informações cadastrais e estatísticas da conta</p>
                    </div>
                </div>

                {/* Cards de Informações Pessoais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Informações Básicas */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-green-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Informações Básicas</h3>
                                    <p className="text-xs text-gray-400">Dados do perfil</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                                    <span className="text-sm text-gray-300">Nome</span>
                                    <span className="text-sm font-semibold text-white">{userData.name || 'Não informado'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                                    <span className="text-sm text-gray-300">Email</span>
                                    <span className="text-sm font-semibold text-white truncate">{userData.email}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                                    <span className="text-sm text-gray-300">Status</span>
                                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${userData.status === 'ativo' ? 'text-green-400 bg-green-500/20' :
                                        'text-yellow-400 bg-yellow-500/20'
                                        }`}>
                                        {userData.status || 'Ativo'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contato */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-blue-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Contato</h3>
                                    <p className="text-xs text-gray-400">Informações de contato</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                                    <span className="text-sm text-gray-300">WhatsApp</span>
                                    <span className="text-sm font-semibold text-white">
                                        {userData.whatsapp || 'Não informado'}
                                    </span>
                                </div>
                                {userData.whatsapp && (
                                    <Button
                                        onClick={() => openWhatsApp(userData.whatsapp!, 'Olá!')}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Enviar Mensagem
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estatísticas da Conta */}
                    <Card className="border-gray-700/50 bg-gradient-to-br from-purple-900/20 to-violet-900/20 backdrop-blur-sm shadow-2xl border-2 hover:border-purple-500/50 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Estatísticas</h3>
                                    <p className="text-xs text-gray-400">Dados da conta</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                                    <span className="text-sm text-gray-300">Membro desde</span>
                                    <span className="text-sm font-semibold text-white">
                                        {formatDate(userData.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                                    <span className="text-sm text-gray-300">Tipo de conta</span>
                                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${userData.is_vip ? 'text-yellow-400 bg-yellow-500/20' :
                                        'text-gray-400 bg-gray-500/20'
                                        }`}>
                                        {userData.is_vip ? 'VIP' : 'Regular'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                                    <span className="text-sm text-gray-300">Deemix</span>
                                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${userData.deemix ? 'text-green-400 bg-green-500/20' :
                                        'text-red-400 bg-red-500/20'
                                        }`}>
                                        {userData.deemix ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Card de Resumo Final */}
                <Card className="border-gray-700/50 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Resumo da Conta</h3>
                                <p className="text-gray-400">Visão geral das suas atividades</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                                <Download className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <div className="text-lg font-bold text-white">{userData?.downloadsCount || 0}</div>
                                <div className="text-xs text-gray-400">Downloads</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/20">
                                <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                                <div className="text-lg font-bold text-white">{userData?.likesCount || 0}</div>
                                <div className="text-xs text-gray-400">Curtidas</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                                <Play className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                <div className="text-lg font-bold text-white">{userData?.playsCount || 0}</div>
                                <div className="text-xs text-gray-400">Plays</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                                <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                <div className="text-lg font-bold text-white">{userData?.is_vip ? 'VIP' : 'Regular'}</div>
                                <div className="text-xs text-gray-400">Tipo</div>
                            </div>
                        </div>

                        {typeof userData?.dailyDownloadLimit !== 'string' && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-xl border border-indigo-500/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Limite Diário</h4>
                                        <p className="text-sm text-gray-400">Downloads restantes hoje</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">
                                            {userData?.dailyDownloadCount || 0} / {typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? '∞' : (userData?.dailyDownloadLimit ?? 10)}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? 'Downloads ilimitados' :
                                                userData?.dailyDownloadCount === 0 ? 'Nenhum download hoje' :
                                                    `${(typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 10) - (userData?.dailyDownloadCount || 0)} restantes`}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2 mt-3">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-700"
                                        style={{
                                            width: typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? '100%' : `${Math.min(100, ((userData?.dailyDownloadCount || 0) / (typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 1)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Mail className="w-6 h-6 text-blue-400" />
                            Dados Pessoais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Nome</label>
                                    <p className="text-lg font-medium text-white">{userData.name || 'Não informado'}</p>
                                </div>

                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    <p className="text-lg font-medium text-white break-all">{userData.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp</label>
                                    <p className="text-lg font-medium text-white">{userData.whatsapp || 'Não cadastrado'}</p>
                                </div>

                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Membro desde</label>
                                    <p className="text-lg font-medium text-white">{formatDate(userData.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h4 className="text-lg font-bold text-white mb-4">Informações da Conta</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-400">{userData.downloadsCount}</div>
                                    <div className="text-sm text-gray-400">Total Downloads</div>
                                </div>
                                <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-pink-400">{userData.likesCount}</div>
                                    <div className="text-sm text-gray-400">Total Curtidas</div>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-400">{userData.playsCount}</div>
                                    <div className="text-sm text-gray-400">Total Plays</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Seção de Upload de Músicas
    function renderUploadSection() {
        return (
            <div className="space-y-8">
                {/* Header Elegante */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 rounded-3xl"></div>
                    <div className="relative flex items-center gap-6 p-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                                Upload de Músicas
                            </h2>
                            <p className="text-lg text-gray-300 mt-2">Compartilhe suas músicas com a comunidade</p>
                        </div>
                    </div>
                </div>

                {/* Cards de Informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card de Status */}
                    <div className="group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <Card className="relative border-0 bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover:scale-105">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-green-300 bg-green-500/20 px-3 py-1 rounded-full font-semibold">ATIVO</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Status de Upload</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Uploads ilimitados</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Formatos: MP3, WAV, FLAC</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Tamanho máximo: 50MB</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Metadados automáticos</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Card de Estatísticas */}
                    <div className="group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <Card className="relative border-0 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full font-semibold">ESTATÍSTICAS</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Suas Contribuições</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-300">Músicas enviadas:</span>
                                        <span className="text-lg font-bold text-white">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-300">Downloads totais:</span>
                                        <span className="text-lg font-bold text-white">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-300">Curtidas recebidas:</span>
                                        <span className="text-lg font-bold text-white">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-300">Reproduções:</span>
                                        <span className="text-lg font-bold text-white">0</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Formulário de Upload */}
                <div className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <Card className="relative border-0 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Music className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Enviar Nova Música</h3>
                                    <p className="text-gray-300">Compartilhe sua música com a comunidade</p>
                                </div>
                            </div>

                            {/* Área de Upload */}
                            <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center hover:border-purple-400/50 transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-8 h-8 text-purple-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-2">Arraste e solte sua música aqui</h4>
                                <p className="text-gray-400 mb-4">ou clique para selecionar arquivo</p>
                                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        MP3, WAV, FLAC
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Máx. 50MB
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Qualidade alta
                                    </span>
                                </div>
                            </div>

                            {/* Campos do formulário */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Música</label>
                                    <input
                                        type="text"
                                        placeholder="Digite o nome da música"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Artista</label>
                                    <input
                                        type="text"
                                        placeholder="Digite o nome do artista"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Gênero</label>
                                    <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none transition-all duration-300">
                                        <option value="">Selecione o gênero</option>
                                        <option value="house">House</option>
                                        <option value="techno">Techno</option>
                                        <option value="trance">Trance</option>
                                        <option value="dubstep">Dubstep</option>
                                        <option value="drum-bass">Drum & Bass</option>
                                        <option value="progressive">Progressive</option>
                                        <option value="deep-house">Deep House</option>
                                        <option value="minimal">Minimal</option>
                                        <option value="electro">Electro</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">BPM (Opcional)</label>
                                    <input
                                        type="number"
                                        placeholder="Ex: 128"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Área de descrição */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição (Opcional)</label>
                                <textarea
                                    placeholder="Descreva sua música, inspiração, ou qualquer informação adicional..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition-all duration-300 resize-none"
                                />
                            </div>

                            {/* Botões de ação */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700/50">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Info className="w-4 h-4" />
                                    <span>Seus uploads ficam visíveis para toda a comunidade</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-300">
                                        Cancelar
                                    </button>
                                    <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Enviar Música
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dicas e Informações */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                            <Music className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">Qualidade Importa</h4>
                        <p className="text-sm text-gray-300">Envie músicas em alta qualidade para melhor experiência dos usuários.</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">Metadados Corretos</h4>
                        <p className="text-sm text-gray-300">Preencha corretamente os metadados para facilitar a busca.</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">Compartilhe</h4>
                        <p className="text-sm text-gray-300">Suas músicas ficam disponíveis para toda a comunidade.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Função para renderizar os modais
    function renderModals() {
        if (!userData) return null;

        return (
            <>
                {/* Modal PIX */}
                {pixModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
                        <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg">
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-white text-lg font-bold">
                                        💳 PIX
                                    </h2>
                                    <button onClick={() => setPixModalOpen(false)} className="text-gray-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20 mb-4">
                                        <h4 className="font-bold text-white mb-2 text-sm">Chave PIX</h4>
                                        <div className="bg-gray-800/50 rounded p-2 mb-3">
                                            <p className="font-mono text-xs text-white break-all">pix@nexorrecords.com.br</p>
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard('pix@nexorrecords.com.br')}
                                            className="w-full bg-green-600 hover:bg-green-700 text-sm h-8"
                                        >
                                            <Copy className="w-3 h-3 mr-2" />
                                            Copiar Chave
                                        </Button>
                                    </div>
                                    <div className="text-xs text-gray-400 mb-4">
                                        <p>Valor: <span className="font-bold text-green-400">{formatCurrency(userData.valor)}</span></p>
                                        <p className="mt-1">Envie o comprovante via WhatsApp.</p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setPixModalOpen(false);
                                            openWhatsApp('5551935052274', `Pagamento PIX ${formatCurrency(userData.valor)} - comprovante em anexo`);
                                        }}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm h-8"
                                    >
                                        <MessageSquare className="w-3 h-3 mr-2" />
                                        Enviar Comprovante
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
}
