"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Alert from "@/components/ui/Alert";
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
    Database,
    Lock,
    Home,
    ChevronRight,
    Bell,
    HelpCircle,
    LogOut,
    Edit,
    Wallet,
    Award,
    Globe,
    FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    arlPremium: PlanBenefit;
    musicProduction: PlanBenefit;
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
    isPro: boolean | null;
    isAdmin: boolean | null;
    status: string | null;
    valor: number | null;
    vencimento: string | null;
    dataPagamento: string | null;
    dailyDownloadCount: number | null;
    dailyDownloadLimit: number | string;
    lastDownloadReset: string | null;
    weeklyPackRequests: number | null;
    weeklyPlaylistDownloads: number | null;
    weeklyPackRequestsUsed: number | null;
    weeklyPlaylistDownloadsUsed: number | null;
    lastWeekReset: string | null;
    customBenefits: any;
    deemix: boolean | null;
    deezerPremium: boolean | null;
    deezerEmail: string | null;
    deezerPassword: string | null;
    isUploader: boolean | null;
    downloadsCount: number;
    likesCount: number;
    playsCount: number;
    vipPlan: 'BASICO' | 'PADRAO' | 'COMPLETO' | null;
    planBenefits: PlanBenefits | null;
    vencimentoInfo: VencimentoInfo;
    recentDownloads: RecentActivity[];
    recentLikes: RecentActivity[];
    deemix_access?: boolean;
    deemix_username?: string;
    deemix_password?: string;
    arlPremium?: boolean | null;
    musicProduction?: boolean | null;
}

export default function ModernProfilePage() {
    const { data: session, status: sessionStatus } = useSession();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');
    const router = useRouter();

    // Navegação principal moderna
    const navigationItems = [
        {
            id: 'dashboard',
            label: 'Painel',
            icon: BarChart3,
            href: '/profile',
            active: true
        },
        {
            id: 'plan',
            label: 'Meu Plano',
            icon: Crown,
            href: '/profile/meu-plano'
        },
        {
            id: 'benefits',
            label: 'Benefícios',
            icon: Gift,
            href: '/profile/beneficios'
        },
        {
            id: 'tools',
            label: 'Ferramentas',
            icon: Settings,
            children: [
                { id: 'deemix', label: 'Deemix', icon: Disc, href: '/profile/deemix' },
                { id: 'allavsoft', label: 'Allavsoft', icon: Download, href: '/profile/allavsoft' }
            ]
        },
        {
            id: 'activity',
            label: 'Atividade',
            icon: Activity,
            href: '/profile/atividade'
        },
        {
            id: 'account',
            label: 'Conta',
            icon: User,
            href: '/profile/dados'
        }
    ];

    // Quick actions para o dashboard
    const quickActions = [
        {
            title: 'Renovar Plano',
            description: 'Estenda sua assinatura VIP',
            icon: CreditCard,
            color: 'bg-blue-500',
            href: '/plans',
            action: 'external'
        },
        {
            title: 'Download Premium',
            description: 'Acesse o Deemix agora',
            icon: Download,
            color: 'bg-green-500',
            href: '/profile/deemix',
            action: 'internal'
        },
        {
            title: 'Suporte VIP',
            description: 'Fale conosco pelo WhatsApp',
            icon: MessageSquare,
            color: 'bg-emerald-500',
            href: 'https://wa.me/5551935052274',
            action: 'external'
        },
        {
            title: 'Nova Música',
            description: 'Explore nosso catálogo',
            icon: Music,
            color: 'bg-purple-500',
            href: '/new',
            action: 'internal'
        }
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'expiring_soon': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'expired': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'expiring_soon': return 'Expirando em breve';
            case 'expired': return 'Expirado';
            case 'cancelled': return 'Cancelado';
            default: return 'Indefinido';
        }
    };

    if (sessionStatus === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    if (sessionStatus === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center p-8">
                    <ShieldCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Acesso Restrito
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Você precisa fazer login para acessar seu perfil.
                    </p>
                    <Button onClick={() => signIn()} className="bg-blue-600 hover:bg-blue-700">
                        <User className="h-4 w-4 mr-2" />
                        Fazer Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ zIndex: 0 }}>
            <Header />
            
            {/* Breadcrumb moderno */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                            <Home className="h-4 w-4" />
                        </Link>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-medium">
                            Painel do Cliente
                        </span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar de Navegação */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Header do perfil */}
                            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold truncate">
                                            {userData?.name || session?.user?.name || 'Usuário'}
                                        </h3>
                                        <p className="text-sm text-blue-100 truncate">
                                            {userData?.email || session?.user?.email}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Status do plano */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status:</span>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            userData?.is_vip 
                                                ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' 
                                                : 'bg-gray-400/20 text-gray-300 border border-gray-400/30'
                                        }`}>
                                            {userData?.is_vip ? (
                                                <>
                                                    <Crown className="h-3 w-3 mr-1" />
                                                    VIP {userData?.vipPlan || ''}
                                                </>
                                            ) : (
                                                <>
                                                    <User className="h-3 w-3 mr-1" />
                                                    Free
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu de navegação */}
                            <nav className="p-2">
                                {navigationItems.map((item) => (
                                    <div key={item.id}>
                                        {item.children ? (
                                            <div className="mb-2">
                                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <item.icon className="h-4 w-4 inline mr-2" />
                                                    {item.label}
                                                </div>
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.id}
                                                        href={child.href}
                                                        className="ml-4 flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <child.icon className="h-4 w-4 mr-2" />
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                                                    item.active
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600'
                                                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <item.icon className="h-4 w-4 mr-2" />
                                                {item.label}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </nav>

                            {/* Footer da sidebar */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => router.push('/auth/sign-out')}
                                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sair da Conta
                                </button>
                            </div>
                        </div>

                        {/* Card de suporte */}
                        <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                            <div className="text-center">
                                <div className="h-12 w-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Precisa de Ajuda?
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Nossa equipe está pronta para te ajudar
                                </p>
                                <a
                                    href="https://wa.me/5551935052274"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="lg:col-span-3">
                        {/* Header do Dashboard */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Painel do Cliente
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Gerencie sua conta, planos e acesse suas ferramentas VIP
                            </p>
                        </div>

                        {/* Cards de Status Principais */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Status do Plano */}
                            <div className="profile-card-wide">
                                <div className="flex items-center space-x-4">
                                    <div className="icon-container-wide bg-blue-100 dark:bg-blue-900/20">
                                        <Crown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                Plano Atual
                                            </h3>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(userData?.vencimentoInfo?.status || 'no_expiry')}`}>
                                                {getStatusText(userData?.vencimentoInfo?.status || 'no_expiry')}
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            {userData?.is_vip ? `VIP ${userData?.vipPlan || ''}` : 'Free'}
                                        </p>
                                        {userData?.vencimento && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Vence em {formatDate(userData.vencimento)}
                                            </p>
                                        )}
                                        {userData?.valor && (
                                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                                Valor: {formatCurrency(userData.valor)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Downloads Hoje */}
                            <div className="profile-card-wide">
                                <div className="flex items-center space-x-4">
                                    <div className="icon-container-wide bg-green-100 dark:bg-green-900/20">
                                        <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                                            Downloads Hoje
                                        </h3>
                                        <div className="flex items-baseline space-x-2 mb-3">
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {userData?.dailyDownloadCount || 0}
                                            </p>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                de {userData?.dailyDownloadLimit || 'ilimitado'}
                                            </span>
                                        </div>
                                        {userData?.dailyDownloadLimit && userData?.dailyDownloadLimit !== 'ilimitado' && (
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${Math.min(100, ((userData?.dailyDownloadCount || 0) / Number(userData.dailyDownloadLimit)) * 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                        {userData?.lastDownloadReset && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Último reset: {formatDate(userData.lastDownloadReset)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Deemix Premium */}
                            <div className="profile-card-wide">
                                <div className="flex items-center space-x-4">
                                    <div className="icon-container-wide bg-purple-100 dark:bg-purple-900/20">
                                        <Disc className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                                            Deemix Premium
                                        </h3>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className={`h-3 w-3 rounded-full ${userData?.deemix ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {userData?.deemix ? 'Ativo' : 'Inativo'}
                                            </p>
                                        </div>
                                        {userData?.deemix && userData?.deezerPremium && (
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    ARL Premium: <span className="text-green-600 dark:text-green-400">✓ Disponível</span>
                                                </p>
                                                {userData?.deezerEmail && (
                                                    <p className="text-xs text-gray-400 truncate">
                                                        Email: {userData.deezerEmail}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Pack Requests Semanais */}
                            <div className="profile-card-wide">
                                <div className="flex items-center space-x-4">
                                    <div className="icon-container-wide bg-orange-100 dark:bg-orange-900/20">
                                        <Package className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                                            Pack Requests
                                        </h3>
                                        <div className="flex items-baseline space-x-2 mb-3">
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {userData?.weeklyPackRequestsUsed || 0}
                                            </p>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                de {userData?.weeklyPackRequests || 0} por semana
                                            </span>
                                        </div>
                                        {userData?.weeklyPackRequests && userData?.weeklyPackRequests > 0 && (
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill bg-orange-500"
                                                    style={{
                                                        width: `${Math.min(100, ((userData?.weeklyPackRequestsUsed || 0) / userData.weeklyPackRequests) * 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                        {userData?.lastWeekReset && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Último reset: {formatDate(userData.lastWeekReset)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cards Secundários */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Downloads */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                        <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Total Downloads
                                </h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userData?.downloadsCount || 0}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    músicas baixadas
                                </p>
                            </div>

                            {/* Total Likes */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                        <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Curtidas
                                </h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userData?.likesCount || 0}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    músicas favoritas
                                </p>
                            </div>

                            {/* Total Plays */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                        <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Total Plays
                                </h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userData?.playsCount || 0}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    reproduções
                                </p>
                            </div>

                            {/* Playlist Downloads */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                        <ListMusic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Playlists
                                </h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {userData?.weeklyPlaylistDownloadsUsed || 0}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    de {userData?.weeklyPlaylistDownloads || 0} por semana
                                </p>
                            </div>
                        </div>

                        {/* Informações Pessoais e Configurações */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Informações Pessoais */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                        Informações Pessoais
                                    </h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                                        <span className="text-sm text-gray-900 dark:text-white">{userData?.email}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</span>
                                        <span className="text-sm text-gray-900 dark:text-white">{userData?.name || 'Não informado'}</span>
                                    </div>
                                    
                                    {userData?.whatsapp && (
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">WhatsApp</span>
                                            <span className="text-sm text-gray-900 dark:text-white">{userData.whatsapp}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Cadastro</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {userData?.createdAt ? formatDate(userData.createdAt) : 'Não disponível'}
                                        </span>
                                    </div>
                                    
                                    {userData?.dataPagamento && (
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Último Pagamento</span>
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {formatDate(userData.dataPagamento)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Conta</span>
                                        <div className="flex items-center space-x-2">
                                            {userData?.isAdmin && (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                                                    Admin
                                                </span>
                                            )}
                                            {userData?.isPro && (
                                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                                                    Pro
                                                </span>
                                            )}
                                            {userData?.isUploader && (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                                                    Uploader
                                                </span>
                                            )}
                                            {!userData?.isAdmin && !userData?.isPro && !userData?.isUploader && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 rounded-full">
                                                    Usuário Padrão
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Configurações e Recursos */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                        <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                        Recursos e Configurações
                                    </h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ARL Premium</span>
                                        <div className="flex items-center space-x-2">
                                            <div className={`h-2 w-2 rounded-full ${userData?.arlPremium ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {userData?.arlPremium ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Music Production</span>
                                        <div className="flex items-center space-x-2">
                                            <div className={`h-2 w-2 rounded-full ${userData?.musicProduction ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {userData?.musicProduction ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Downloads por Dia</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {userData?.dailyDownloadLimit || 'Ilimitado'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Downloads de Playlist</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {userData?.weeklyPlaylistDownloads || 0} por semana
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pack Requests</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {userData?.weeklyPackRequests || 0} por semana
                                        </span>
                                    </div>
                                    
                                    {userData?.customBenefits && (
                                        <div className="py-3">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                                Benefícios Customizados
                                            </span>
                                            <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                {userData.customBenefits}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ações Rápidas */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Ações Rápidas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={index}
                                        href={action.href}
                                        target={action.action === 'external' ? '_blank' : '_self'}
                                        className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200 hover:scale-105"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`${action.color} h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <action.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {action.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {action.description}
                                                </p>
                                            </div>
                                            {action.action === 'external' && (
                                                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Atividade Recente */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Downloads Recentes */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Downloads Recentes
                                    </h2>
                                    <Link
                                        href="/profile/atividade"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                    >
                                        Ver todos
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {userData?.recentDownloads?.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                                                {activity.track?.imageUrl ? (
                                                    <img
                                                        src={activity.track.imageUrl}
                                                        alt={activity.track.songName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Music className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {activity.track?.songName || 'Música não identificada'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {activity.track?.artist || 'Artista desconhecido'}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                {activity.downloadedAt ? formatDate(activity.downloadedAt) : 'Data N/A'}
                                            </div>
                                        </div>
                                    )) || (
                                        <div className="text-center py-8">
                                            <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Nenhum download recente
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Favoritos Recentes */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Favoritos Recentes
                                    </h2>
                                    <Link
                                        href="/profile/atividade"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                    >
                                        Ver todos
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {userData?.recentLikes?.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                                                {activity.track?.imageUrl ? (
                                                    <img
                                                        src={activity.track.imageUrl}
                                                        alt={activity.track.songName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Music className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {activity.track?.songName || 'Música não identificada'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {activity.track?.artist || 'Artista desconhecido'}
                                                </p>
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                {activity.createdAt ? formatDate(activity.createdAt) : 'Data N/A'}
                                            </div>
                                        </div>
                                    )) || (
                                        <div className="text-center py-8">
                                            <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Nenhuma música favoritada
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
