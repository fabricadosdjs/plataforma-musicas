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
    Hand
} from "lucide-react";

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
    dailyDownloadLimit: number;
    weeklyPackRequests: number | null;
    weeklyPlaylistDownloads: number | null;
    weeklyPackRequestsUsed: number | null; // Novo campo
    weeklyPlaylistDownloadsUsed: number | null; // Novo campo
    customBenefits: any; // Benefícios personalizados
    deemix: boolean | null;
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
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
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
                    const res = await fetch("/api/user-data");
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

    const getVencimentoStatusDisplay = (vencimentoInfo: VencimentoInfo) => {
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
                                                    onClick={() => setUploadModalOpen(true)}
                                                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider text-gray-300 hover:bg-gray-800/70 hover:text-white transition-all duration-300 transform hover:scale-[1.02] border border-transparent hover:border-gray-600/50 cursor-pointer"
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
                                            <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20 flex flex-col items-center justify-center min-h-[70px]">
                                                <div className="text-xl font-bold text-blue-400 mb-1">
                                                    {userData.downloadsCount}
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium">
                                                    DOWNLOADS
                                                </div>
                                            </div>
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
            case 'allavsoft':
                return renderAllavsoftSection();
            case 'vip':
                return renderVipSection();
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
                    <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Download className="w-8 h-8 text-blue-400" />
                                <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">Hoje</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Downloads Diários</h3>
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-3xl font-bold text-white">{userData?.dailyDownloadCount || 0}</span>
                                <span className="text-gray-400">/ {userData?.dailyDownloadLimit}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.min(100, ((userData?.dailyDownloadCount || 0) / (userData?.dailyDownloadLimit || 1)) * 100)}%`
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Activity className="w-8 h-8 text-purple-400" />
                                <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">Total</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Atividade Total</h3>
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-3xl font-bold text-white">
                                    {(userData?.downloadsCount || 0) + (userData?.likesCount || 0) + (userData?.playsCount || 0)}
                                </span>
                                <span className="text-gray-400">ações</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">{userData?.downloadsCount || 0}</span>
                                <span className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-sm">{userData?.likesCount || 0}</span>
                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">{userData?.playsCount || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status do Plano */}
                <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                                <Crown className="w-6 h-6 text-yellow-400" />
                                Status do Plano
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{getPlanInfo(userData?.valor ?? null).name}</div>
                                <div className="text-xl font-bold text-green-400">{formatCurrency(userData?.valor ?? null)}/mês</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-400 mb-1">Vencimento</div>
                                <div className="text-lg font-bold text-white">{formatDate(userData?.vencimento ?? null)}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-400 mb-1">Status</div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                                    {statusDisplay.icon}
                                    {statusDisplay.text}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={() => setPlanModalOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer px-8 py-3 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
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
                        <h2 className="text-3xl font-bold text-white">Deemix - Download de Músicas</h2>
                        <p className="text-gray-400">Plataforma premium para download de músicas em alta qualidade</p>
                    </div>
                </div>

                <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">

                        {userData?.deemix ? (
                            // Box verde - Usuário tem acesso (compacto)
                            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <h4 className="text-base font-semibold text-white">Deemix - Acesso Liberado</h4>
                                    </div>
                                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">ATIVO</span>
                                </div>
                                <p className="text-gray-300 text-sm mt-2">
                                    Downloads FLAC/MP3 · ARL Premium · Suporte técnico
                                </p>
                            </div>
                        ) : (
                            // Box vermelho - Usuário não tem acesso (compacto)
                            <>
                                <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-red-400" />
                                            <h4 className="text-base font-semibold text-white">Deemix - Acesso Não Disponível</h4>
                                        </div>
                                        <Button
                                            className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1 h-7"
                                        >
                                            Upgrade
                                        </Button>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-2">
                                        Downloads FLAC/MP3 · Interface web · Downloads rápidos
                                    </p>
                                </div>

                                {/* Box roxa compacta - Oferta especial VIP */}
                                {userData?.is_vip && (
                                    <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Gift className="w-5 h-5 text-purple-400" />
                                                <h4 className="text-base font-semibold text-white">🎁 Oferta VIP</h4>
                                            </div>
                                            <Button
                                                onClick={() => window.open('/deemix', '_blank')}
                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs px-3 py-1 h-7"
                                            >
                                                <Star className="w-3 h-3 mr-1" />
                                                Desconto
                                            </Button>
                                        </div>
                                        <p className="text-gray-300 text-sm mt-2">
                                            Desconto especial no valor do seu plano como cliente VIP
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Credenciais de Acesso - Compactas */}
                        {userData?.deemix && (
                            <>
                                {/* Credenciais de Acesso */}
                                <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                                    <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                        🔑 Credenciais de Acesso
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Senha:</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-800 rounded p-2 font-mono text-white text-sm">
                                                    JMgQuuKI1LDiXBm
                                                </div>
                                                <Button
                                                    onClick={() => copyToClipboard('JMgQuuKI1LDiXBm')}
                                                    className="bg-gray-600 hover:bg-gray-700 p-2"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                                ARL Premium:
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-800 rounded p-2 font-mono text-white text-xs break-all">
                                                    048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e
                                                </div>
                                                <Button
                                                    onClick={() => copyToClipboard('048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e')}
                                                    className="bg-gray-600 hover:bg-gray-700 p-2"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between gap-2">
                                            <Button
                                                onClick={() => window.open('https://plataformavip.nexorrecords.com.br/deemix-gerenciar', '_blank')}
                                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-4 py-2 text-xs flex-1"
                                            >
                                                <Key className="w-3 h-3 mr-1" />
                                                Gerenciar
                                            </Button>
                                            <Button
                                                onClick={() => window.open('https://workupload.com/file/AvaE2nLGqhn', '_blank')}
                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 text-xs flex-1"
                                            >
                                                <Download className="w-3 h-3 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Configurações Spotify - Compactas */}
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                                    <h3 className="text-base font-bold text-white mb-3">
                                        🎵 Configurações Spotify
                                    </h3>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-300 w-20">Client ID:</span>
                                            <div className="flex-1 bg-gray-800 rounded p-2 font-mono text-white text-xs">
                                                JMgQuuKI1LDiXBm
                                            </div>
                                            <Button
                                                onClick={() => copyToClipboard('JMgQuuKI1LDiXBm')}
                                                className="bg-gray-600 hover:bg-gray-700 p-1"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-300 w-20">Secret:</span>
                                            <div className="flex-1 bg-gray-800 rounded p-2 font-mono text-white text-xs">
                                                d8db5aeefe6e439a951e5da66f392889
                                            </div>
                                            <Button
                                                onClick={() => copyToClipboard('d8db5aeefe6e439a951e5da66f392889')}
                                                className="bg-gray-600 hover:bg-gray-700 p-1"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-300 w-20">User:</span>
                                            <div className="flex-1 bg-gray-800 rounded p-2 font-mono text-white text-xs">
                                                31psvp6pv6rhvjz7zfkcn4bv2ksm
                                            </div>
                                            <Button
                                                onClick={() => copyToClipboard('31psvp6pv6rhvjz7zfkcn4bv2ksm')}
                                                className="bg-gray-600 hover:bg-gray-700 p-1"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Seção do Allavsoft
    function renderAllavsoftSection() {
        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Allavsoft - Download Universal</h2>
                        <p className="text-gray-400">Ferramenta completa para download de vídeos e áudios de +1000 sites</p>
                    </div>
                </div>

                <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">

                        {/* Box vermelha compacta - Indisponível para todos */}
                        <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Download className="w-5 h-5 text-red-400" />
                                    <h4 className="text-base font-semibold text-white">Allavsoft - Em Breve</h4>
                                </div>
                                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">AGOSTO 2025</span>
                            </div>
                            <p className="text-gray-300 text-sm">
                                Download de vídeos/áudios · +1000 sites · Downloads em lote
                            </p>
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

                <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Crown className="w-6 h-6 text-yellow-400" />
                                Status do Plano
                            </h3>
                            <Button
                                onClick={() => setPlanModalOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Gerenciar
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{getPlanInfo(userData?.valor ?? null).name}</div>
                                <div className="text-xl font-bold text-green-400">{formatCurrency(userData?.valor ?? null)}/mês</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-400 mb-1">Vencimento</div>
                                <div className="text-lg font-bold text-white">{formatDate(userData?.vencimento ?? null)}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-400 mb-1">Status</div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                                    {statusDisplay.icon}
                                    {statusDisplay.text}
                                </div>
                            </div>
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
                                <div className="bg-gray-800/50 rounded p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-300">📁 Drive</span>
                                        <span className="text-xs text-green-400">Ativo</span>
                                    </div>
                                    <div className="text-sm font-bold text-white">Liberado</div>
                                </div>

                                {/* Packs Semanais */}
                                <div className="bg-gray-800/50 rounded p-3">
                                    <span className="text-xs text-gray-300">🎚️ Packs</span>
                                    <div className="text-sm font-bold text-white">
                                        {(() => {
                                            const used = userData?.weeklyPackRequestsUsed ?? 0;
                                            let limit = userData?.weeklyPackRequests;
                                            if (!limit || limit < 1) {
                                                limit = userData?.planBenefits?.packRequests?.limit ?? 4;
                                            }
                                            return `${used}/${limit}`;
                                        })()}
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
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
                                </div>

                                {/* Playlists Semanais */}
                                <div className="bg-gray-800/50 rounded p-3">
                                    <span className="text-xs text-gray-300">🎵 Playlists</span>
                                    <div className="text-sm font-bold text-white">
                                        {(() => {
                                            const used = userData?.weeklyPlaylistDownloadsUsed ?? 0;
                                            let limit = userData?.weeklyPlaylistDownloads;
                                            if (!limit || limit < 1) {
                                                limit = userData?.planBenefits?.playlistDownloads?.limit ?? 7;
                                            }
                                            return `${used}/${limit}`;
                                        })()}
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
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
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                <ListMusic className="w-4 h-4 text-yellow-400" />
                                Benefícios VIP
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                    <span className="text-white">Downloads: <span className="font-bold text-green-300">{userData?.dailyDownloadLimit || 50}/dia</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                    <span className="text-white text-xs">Qualidade FLAC/320kbps</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                    <span className="text-white text-xs">Upload personalizado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                    <span className="text-white text-xs">Acesso total Drive</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {userData?.deemix ? (
                                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                                    )}
                                    <span className="text-white text-xs">Deemix Premium</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                    <span className="text-white text-xs">Suporte prioritário</span>
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
                    <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Download className="w-6 h-6 text-blue-400" />
                                Downloads Recentes
                            </h3>
                            <div className="space-y-4">
                                {userData.recentDownloads && userData.recentDownloads.length > 0 ? (
                                    userData.recentDownloads.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="bg-gray-700/50 rounded-lg p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {activity.track.imageUrl ? (
                                                        <img
                                                            src={activity.track.imageUrl}
                                                            alt={activity.track.songName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Music className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white truncate">{activity.track.songName}</h4>
                                                    <p className="text-sm text-gray-400 truncate">{activity.track.artist}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatRelativeTime(activity.downloadedAt || activity.createdAt || null)}
                                                    </p>
                                                </div>
                                                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">
                                                    {activity.track.style}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Download className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-400">Nenhum download recente</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Curtidas Recentes */}
                    <Card className="border-gray-700/50 bg-[#04060E]/90 backdrop-blur-sm shadow-2xl border-2">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Heart className="w-6 h-6 text-pink-400" />
                                Curtidas Recentes
                            </h3>
                            <div className="space-y-4">
                                {userData.recentLikes && userData.recentLikes.length > 0 ? (
                                    userData.recentLikes.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="bg-gray-700/50 rounded-lg p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {activity.track.imageUrl ? (
                                                        <img
                                                            src={activity.track.imageUrl}
                                                            alt={activity.track.songName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Music className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white truncate">{activity.track.songName}</h4>
                                                    <p className="text-sm text-gray-400 truncate">{activity.track.artist}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatRelativeTime(activity.createdAt || null)}
                                                    </p>
                                                </div>
                                                <div className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-xs">
                                                    {activity.track.style}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-400">Nenhuma curtida recente</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Dados Pessoais</h2>
                        <p className="text-gray-400">Informações cadastrais e estatísticas da conta</p>
                    </div>
                </div>

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

    // Função para renderizar os modais
    function renderModals() {
        if (!userData) return null;

        return (
            <>
                {/* Modal de Upload VIP */}
                {uploadModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                                        <Upload className="w-8 h-8 text-purple-400" />
                                        Upload VIP - Enviar Música para Comunidade
                                    </h2>
                                    <button
                                        onClick={() => setUploadModalOpen(false)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-8 h-8" />
                                    </button>
                                </div>
                                <MusicUploadForm />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Gerenciar Planos */}
                {planModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
                        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg">
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-white text-lg font-bold">
                                        📋 Gerenciar Plano
                                    </h2>
                                    <button onClick={() => setPlanModalOpen(false)} className="text-gray-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Plano Atual */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-yellow-400" />
                                        Plano Atual
                                    </h3>
                                    {(() => {
                                        const currentPlan = getPlanInfo(userData?.valor ?? null);
                                        return (
                                            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">{currentPlan.name}</h4>
                                                        <p className="text-xl font-bold text-green-400">{formatCurrency(currentPlan.price)}/mês</p>
                                                    </div>
                                                    <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                                                        ATIVO
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Planos Disponíveis ou Gerenciamento Especial */}
                                {getPlanInfo(userData.valor).canManage ? (
                                    <div>
                                        <h3 className="text-sm font-medium text-white mb-4">Planos Disponíveis</h3>
                                        <div className="space-y-3">
                                            {[
                                                { valor: 35, name: 'VIP BÁSICO', features: ['50 Downloads/dia', 'Drive', 'Até 4 packs/semana'] },
                                                { valor: 42, name: 'VIP PADRÃO', features: ['75 Downloads/dia', 'Drive + Packs', 'Até 6 packs/semana'] },
                                                { valor: 50, name: 'VIP COMPLETO', features: ['150 Downloads/dia', 'Drive + Deemix*', 'Deezer Premium'] }
                                            ].map((plan) => {
                                                const currentPlanInfo = getPlanInfo(userData?.valor ?? null);
                                                const isCurrentPlan = plan.valor === currentPlanInfo.price;

                                                return (
                                                    <div key={plan.valor} className={`rounded-lg p-3 border transition-all duration-200 ${isCurrentPlan
                                                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50'
                                                        : 'bg-gray-800/50 border-gray-600/50'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                                                            <div className="text-sm font-bold text-green-400">{formatCurrency(plan.valor)}</div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mb-3">
                                                            {plan.features.map((feature, index) => (
                                                                <span key={index} className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">
                                                                    {feature}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            onClick={() => {
                                                                setPlanModalOpen(false);
                                                                const action = isCurrentPlan ? 'manter' : (plan.valor > currentPlanInfo.price ? 'upgrade para' : 'downgrade para');
                                                                openWhatsApp('5551935052274', `Olá! Gostaria de ${action} o plano ${plan.name} (${formatCurrency(plan.valor)}/mês).`);
                                                            }}
                                                            className={`w-full h-8 text-xs font-semibold transition-all duration-300 ${isCurrentPlan
                                                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                                                }`}
                                                            disabled={isCurrentPlan}
                                                        >
                                                            {isCurrentPlan ? 'PLANO ATUAL' : (plan.valor > currentPlanInfo.price ? 'UPGRADE' : 'DOWNGRADE')}
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-4 border border-orange-500/30">
                                        <h3 className="text-lg font-bold text-white mb-3">Plano Personalizado</h3>
                                        <p className="text-gray-300 text-sm mb-4">
                                            Seu plano é personalizado e não pode ser alterado automaticamente. Entre em contato conosco para gerenciar seu plano.
                                        </p>
                                        <Button
                                            onClick={() => {
                                                setPlanModalOpen(false);
                                                openWhatsApp('5551935052274', 'Olá! Tenho um plano personalizado e gostaria de gerenciá-lo.');
                                            }}
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 font-semibold"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            CONTATAR SUPORTE
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
