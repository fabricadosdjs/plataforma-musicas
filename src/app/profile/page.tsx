"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
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
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-16 flex items-center justify-center px-4">
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
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-16 flex items-center justify-center px-4">
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
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-16 flex items-center justify-center px-4">
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
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-16 flex items-center justify-center px-4">
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-16">
                <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
                    <div className="max-w-7xl mx-auto">

                        {/* Layout com Sidebar */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                            {/* SIDEBAR MENU */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-800 sticky top-20">
                                    {/* Profile Header */}
                                    <div className="text-center mb-6 pb-4 border-b border-gray-700">
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-lg font-bold text-white truncate">{userData.name || "Usuário"}</h2>
                                        <p className="text-sm text-gray-400 truncate">{userData.email}</p>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                                                {statusDisplay.icon}
                                                {statusDisplay.text}
                                            </div>
                                            {userData.is_vip && (
                                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <Crown className="w-3 h-3" />
                                                    VIP
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Navigation Menu */}
                                    <nav className="space-y-2">
                                        <button
                                            onClick={() => setActiveSection('overview')}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'overview'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <BarChart3 className="w-4 h-4" />
                                            Visão Geral
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('plan')}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'plan'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <Crown className="w-4 h-4" />
                                            Meu Plano
                                        </button>

                                        {(userData.deemix || (userData.valor && userData.valor >= 35)) && (
                                            <button
                                                onClick={() => setActiveSection('deemix')}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'deemix'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                    }`}
                                            >
                                                <Disc className="w-4 h-4" />
                                                Deemix
                                            </button>
                                        )}

                                        {userData?.is_vip && (
                                            <>
                                                <button
                                                    onClick={() => setActiveSection('vip')}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'vip'
                                                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                        }`}
                                                >
                                                    <Zap className="w-4 h-4" />
                                                    Recursos VIP
                                                </button>

                                                <button
                                                    onClick={() => setUploadModalOpen(true)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Upload Música
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => setActiveSection('activity')}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'activity'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <Clock className="w-4 h-4" />
                                            Atividade
                                        </button>

                                        <button
                                            onClick={() => setActiveSection('profile')}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'profile'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <Mail className="w-4 h-4" />
                                            Dados Pessoais
                                        </button>
                                    </nav>

                                    {/* Quick Stats */}
                                    <div className="mt-6 pt-4 border-t border-gray-700">
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <div className="text-lg font-bold text-white">{userData.downloadsCount}</div>
                                                <div className="text-xs text-gray-400">Downloads</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-white">{userData.likesCount}</div>
                                                <div className="text-xs text-gray-400">Curtidas</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-white">{userData.playsCount}</div>
                                                <div className="text-xs text-gray-400">Plays</div>
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
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-gray-700/50 bg-gray-800/60">
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

                    <Card className="border-gray-700/50 bg-gray-800/60">
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
                <Card className="border-gray-700/50 bg-gray-800/60">
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

    // Seção do Deemix
    function renderDeemixSection() {
        if (!userData || (!userData.deemix && (!userData.valor || userData.valor < 35))) {
            return (
                <Card className="border-gray-700/50 bg-gray-800/60">
                    <CardContent className="p-6">
                        <div className="text-center py-8">
                            <Disc className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Deemix Não Disponível</h3>
                            <p className="text-gray-400">Este recurso está disponível como add-on para qualquer plano VIP.</p>
                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-gray-300">• VIP Básico: +R$ 22,75/mês</p>
                                <p className="text-sm text-gray-300">• VIP Padrão: +R$ 20,30/mês</p>
                                <p className="text-sm text-gray-300">• VIP Completo: +R$ 14,00/mês</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-6">
                <Card className="border-purple-500/50 bg-gray-800/60">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <Disc className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Deemix</h2>
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold inline-block">
                                    PREMIUM
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                                <div>
                                    <h4 className="font-semibold text-white">Deemix Ativo</h4>
                                    <p className="text-sm text-gray-300">Downloads ilimitados em alta qualidade.</p>
                                </div>
                            </div>
                        </div>

                        {/* Credenciais de Acesso */}
                        <div className="bg-gray-700/30 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                🔑 Credenciais de Acesso
                            </h3>
                            <p className="text-gray-300 mb-6">Use as credenciais abaixo para acessar o gerenciamento do Deemix:</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Senha de Acesso:</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800 rounded-lg p-3 font-mono text-white">
                                            JMgQuuKI1LDiXBm
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard('JMgQuuKI1LDiXBm')}
                                            className="bg-gray-600 hover:bg-gray-700 p-3"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <Button
                                        onClick={() => window.open('https://plataformavip.nexorrecords.com.br/deemix-gerenciar', '_blank')}
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3"
                                    >
                                        <Key className="w-5 h-5 mr-2" />
                                        GERENCIAR DEEMIX
                                    </Button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        ARL Premium (Atualizada em 29.06.2025 às 01:45):
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800 rounded-lg p-3 font-mono text-white text-xs break-all">
                                            048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard('048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e')}
                                            className="bg-gray-600 hover:bg-gray-700 p-3"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configurações Spotify */}
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-bold text-white mb-4">
                                🎵 Configurações do Spotify (se necessário):
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Client ID:</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800 rounded-lg p-3 font-mono text-white">
                                            JMgQuuKI1LDiXBm
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard('JMgQuuKI1LDiXBm')}
                                            className="bg-gray-600 hover:bg-gray-700 p-3"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Client Secret:</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800 rounded-lg p-3 font-mono text-white">
                                            d8db5aeefe6e439a951e5da66f392889
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard('d8db5aeefe6e439a951e5da66f392889')}
                                            className="bg-gray-600 hover:bg-gray-700 p-3"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">User:</label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800 rounded-lg p-3 font-mono text-white">
                                            31psvp6pv6rhvjz7zfkcn4bv2ksm
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard('31psvp6pv6rhvjz7zfkcn4bv2ksm')}
                                            className="bg-gray-600 hover:bg-gray-700 p-3"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={() => window.open('https://workupload.com/file/AvaE2nLGqhn', '_blank')}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-3"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                BAIXAR DEEMIX
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Seção VIP
    function renderVipSection() {
        if (!userData?.is_vip) {
            return (
                <Card className="border-gray-700/50 bg-gray-800/60">
                    <CardContent className="p-6">
                        <div className="text-center py-8">
                            <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Recursos VIP Não Disponíveis</h3>
                            <p className="text-gray-400">Faça upgrade para o plano VIP para acessar recursos exclusivos.</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-6">
                <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <Crown className="w-6 h-6 text-black font-bold" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Recursos VIP</h2>
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse inline-block">
                                    ✨ EXCLUSIVO
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-6 text-center border border-yellow-500/20">
                                <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-white mb-2">Acesso Prioritário</h3>
                                <p className="text-yellow-100 text-sm">Downloads sem fila de espera e velocidade máxima.</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 text-center border border-purple-500/20">
                                <Gift className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-white mb-2">Conteúdo Exclusivo</h3>
                                <p className="text-purple-100 text-sm">Acesso a lançamentos e remixes exclusivos.</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-xl p-6 text-center border border-emerald-500/20">
                                <Headphones className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-white mb-2">Suporte VIP</h3>
                                <p className="text-emerald-100 text-sm">Atendimento prioritário 24/7 via WhatsApp.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <ListMusic className="w-5 h-5 text-yellow-400" />
                                Seus Benefícios VIP
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-white">Downloads ilimitados por dia</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-white">Qualidade FLAC e 320kbps</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-white">Upload de músicas personalizadas</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-white">Acesso total ao Drive</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-white">Deemix Premium incluso</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-white">Suporte prioritário 24/7</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={() => openWhatsApp('5551935052274', 'Olá! Sou usuário VIP e preciso de suporte.')}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8 py-3"
                            >
                                <MessageSquare className="w-5 h-5 mr-2" />
                                CONTATAR SUPORTE VIP
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Downloads Recentes */}
                    <Card className="border-gray-700/50 bg-gray-800/60">
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
                    <Card className="border-gray-700/50 bg-gray-800/60">
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
                <Card className="border-gray-700/50 bg-gray-800/60">
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

    // Seção do Plano
    function renderPlanSection() {
        if (!userData) return null;

        const currentPlan = getPlanInfo(userData.valor);

        return (
            <div className="space-y-6">
                {/* Plano Atual */}
                <Card className="border-gray-700/50 bg-gray-800/60">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Crown className="w-6 h-6 text-yellow-400" />
                            Plano Atual
                        </h3>

                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-2xl font-bold text-white">{currentPlan.name}</h4>
                                    <p className="text-3xl font-bold text-green-400">{formatCurrency(currentPlan.price)}/mês</p>
                                </div>
                                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-semibold">
                                    ATIVO
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentPlan.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 text-gray-300">
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center mt-6">
                            <Button
                                onClick={() => setPlanModalOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
                            >
                                <Hand className="w-5 h-5 mr-2" />
                                Gerenciar Plano
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Formas de Pagamento */}
                {(userData.vencimentoInfo?.status === 'expired' ||
                    (userData.vencimentoInfo?.status === 'expiring_soon' &&
                        (userData.vencimentoInfo?.daysRemaining ?? 0) <= 5)) && (
                        <Card className="border-red-500/50 bg-red-900/20">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                    Renovação Necessária
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {getPaymentLink(userData.valor) ? (
                                        <Button
                                            onClick={() => window.open(getPaymentLink(userData.valor)!, '_blank')}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
                                        >
                                            <Hand className="w-5 h-5 mr-2" />
                                            MERCADO PAGO
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => openWhatsApp('5551935052274', `Renovar plano ${formatCurrency(userData.valor)}`)}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12"
                                        >
                                            <Hand className="w-5 h-5 mr-2" />
                                            WHATSAPP
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setPixModalOpen(true)}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12"
                                    >
                                        <Hand className="w-5 h-5 mr-2" />
                                        PIX
                                    </Button>
                                    <Button
                                        onClick={() => openWhatsApp('5551935052274', 'Preciso de ajuda com meu plano')}
                                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 h-12"
                                    >
                                        <Hand className="w-5 h-5 mr-2" />
                                        SUPORTE
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white mb-2">Carregando perfil...</h2>
                    <p className="text-gray-300">Por favor aguarde</p>
                </div>
            </div>
        );
    }

    if (sessionStatus === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
                    <p className="text-gray-300 mb-6">Você precisa estar logado para acessar esta página.</p>
                    <button
                        onClick={() => signIn()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Erro</h2>
                    <p className="text-gray-300">Não foi possível carregar os dados do usuário.</p>
                </div>
            </div>
        );
    }

    // Render do layout principal com sidebar
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-gray-700/50 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <User className="w-8 h-8 text-purple-400" />
                        Meu Perfil
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300">Olá, {userData?.name || userData?.email}</span>
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {(userData?.name || userData?.email || '?').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 flex gap-6 min-h-screen">
                {/* Sidebar */}
                <div className="w-80 flex-shrink-0">
                    <Card className="sticky top-4 border-gray-700/50 bg-gray-800/60 backdrop-blur-sm">
                        <CardContent className="p-0">
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all duration-200 ${activeSection === item.id
                                            ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-r-4 border-purple-500 text-white'
                                            : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
                                            }`}
                                    >
                                        {item.icon && typeof item.icon === 'function' ? (
                                            <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-purple-400' : 'text-gray-400'}`} />
                                        ) : null}
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-xs text-gray-400">{item.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1">
                    {activeSection === 'overview' && renderOverviewSection()}
                    {activeSection === 'plan' && renderPlanSection()}
                    {activeSection === 'vip' && renderVipSection()}
                    {activeSection === 'deemix' && renderDeemixSection()}
                    {activeSection === 'activity' && renderActivitySection()}
                    {activeSection === 'profile' && renderProfileSection()}
                </div>
            </div>

            {/* Modais */}
            {renderModals()}
        </div>
    );
}