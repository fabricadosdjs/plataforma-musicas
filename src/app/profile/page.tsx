"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";
import { useToast } from "@/hooks/useToast";
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
    Database,
    MessageCircle,
    Ban,
    Lock,
    Search,
    AlertCircle,
    Edit
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
    isUploader: boolean | null;
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

    // ========== 🏆 NOVOS CAMPOS DO PLANO ==========
    plan: 'BASICO' | 'PADRAO' | 'COMPLETO' | null;
    planIcon: string;
    planName: string;
}

export default function ProfilePage() {
    // Cálculo de valor pro-rata para o PIX
    function calcularProRata(valorMensal: number | null, diasRestantes: number | null) {
        if (!valorMensal || !diasRestantes || diasRestantes <= 0) return null;
        const valorDiario = valorMensal / 30;
        const valorProRata = Math.ceil(valorDiario * diasRestantes * 100) / 100; // arredonda para 2 casas
        return valorProRata;
    }
    const { data: session, status: sessionStatus } = useSession();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [pixModalOpen, setPixModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const { showSuccessToast, showErrorToast } = useToast();

    // YouTube Downloader state
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubeVideoInfo, setYoutubeVideoInfo] = useState<any>(null);
    const [youtubeIsLoading, setYoutubeIsLoading] = useState(false);
    const [youtubeIsDownloading, setYoutubeIsDownloading] = useState(false);
    const [youtubeError, setYoutubeError] = useState('');
    const [youtubeSuccess, setYoutubeSuccess] = useState('');
    const [youtubeQuality, setYoutubeQuality] = useState('320'); // 128 ou 320 kbps
    const [youtubeDownloadHistory, setYoutubeDownloadHistory] = useState<any[]>([]);

    // Menu items da sidebar
    const menuItems = [
        { id: 'overview', label: 'Visão Geral', description: 'Status da conta', icon: User },
        { id: 'plan', label: 'Meu Plano', description: 'Gerenciar assinatura', icon: Crown },
        { id: 'vip', label: 'Recursos VIP', description: 'Benefícios exclusivos', icon: Star },
        { id: 'deemix', label: 'Deemix', description: 'Downloads premium', icon: Disc },
        { id: 'allavsoft', label: 'Allavsoft', description: 'Download universal', icon: Download },
        { id: 'youtube', label: 'YTB Downloader', description: 'Download do YouTube', icon: Music },
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

    const copyToClipboard = async (text: string, credentialName?: string) => {
        try {
            await navigator.clipboard.writeText(text);
            if (credentialName) {
                showSuccessToast(`${credentialName} copiado com sucesso!`, 3000);
            } else {
                showSuccessToast('Copiado para a área de transferência!', 3000);
            }
        } catch (err) {
            console.error('Erro ao copiar:', err);
            showErrorToast('Erro ao copiar para a área de transferência', 3000);
        }
    };

    const openWhatsApp = (number: string, message?: string) => {
        const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
        window.open(url, '_blank');
    };

    // Função para verificar se o botão de pagamento deve estar ativo
    const isPaymentButtonActive = (vencimentoInfo: VencimentoInfo | undefined) => {
        if (!vencimentoInfo || !vencimentoInfo.daysRemaining) return false;
        return vencimentoInfo.daysRemaining <= 5;
    };

    const getPaymentLink = (valor: number | null) => {
        if (!valor) return null;
        // Novos valores dos planos
        if (valor === 35) return 'https://mpago.la/28HWukZ'; // VIP BÁSICO
        if (valor === 42) return 'https://mpago.la/1aFWE4k'; // VIP PADRÃO  
        if (valor === 50) return 'https://mpago.la/2XTWvVS'; // VIP COMPLETO
        return null; // Acima de R$ 50 não tem link
    };

    // ========== 🏆 INFORMAÇÕES DO PLANO DO USUÁRIO ==========
    const getPlanInfo = (valor: number | null) => {
        if (!valor) return { name: 'N/A', features: [], price: 0, canManage: false };

        // ========== 🥉 VIP BÁSICO ==========
        if (valor === 35) return {
            name: 'VIP BÁSICO',
            features: ['50 Downloads/dia', 'Acesso ao Drive', 'Até 4 packs/semana', 'Até 7 playlists/semana'],
            price: 35,
            canManage: true
        };

        // ========== 🥈 VIP PADRÃO ==========
        if (valor === 42) return {
            name: 'VIP PADRÃO',
            features: ['75 Downloads/dia', 'Drive + Packs', 'Até 6 packs/semana', 'Até 9 playlists/semana'],
            price: 42,
            canManage: true
        };

        // ========== 🥇 VIP COMPLETO ==========
        if (valor === 50) return {
            name: 'VIP COMPLETO',
            features: ['150 Downloads/dia', 'Drive + Deemix*', 'Até 10 packs/semana', 'Playlists ilimitadas', 'Deezer Premium', 'Produção Musical'],
            price: 50,
            canManage: true
        };

        // ========== 💎 PLANOS PREMIUM ==========
        // Para valores acima dos planos padrão, usar nome do banco
        if (userData?.planName && userData.planName !== 'Sem Plano') {
            return {
                name: userData.planName,
                features: ['Plano customizado com benefícios exclusivos'],
                price: valor,
                canManage: false
            };
        }

        // ========== 📦 FALLBACK ==========
        return {
            name: 'Plano Especial',
            features: ['Benefícios personalizados'],
            price: valor,
            canManage: false
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

    // YouTube Downloader functions
    const validateAndGetYoutubeInfo = async () => {
        if (!youtubeUrl.trim()) {
            setYoutubeError('Por favor, insira uma URL do YouTube');
            return;
        }

        // Verificar se é uma playlist
        if (youtubeUrl.includes('playlist') || youtubeUrl.includes('&list=')) {
            setYoutubeError('Esta ferramenta não suporta playlists. Para download de playlists, acesse o Allavsoft clicando no link acima.');
            return;
        }

        setYoutubeIsLoading(true);
        setYoutubeError('');
        setYoutubeVideoInfo(null);

        try {
            const response = await fetch(`/api/youtube-download-robust?url=${encodeURIComponent(youtubeUrl)}`);
            const data = await response.json();

            if (response.ok) {
                // Verificar duração (limite de 10 minutos = 600 segundos)
                if (data.duration > 600) {
                    setYoutubeError('Este vídeo tem mais de 10 minutos. Esta ferramenta é destinada apenas para músicas normais. Para arquivos longos (sets, compilações), acesse o Allavsoft clicando no link acima.');
                    return;
                }

                setYoutubeVideoInfo(data);
                setYoutubeSuccess('Vídeo encontrado! Selecione a qualidade e clique em "Baixar MP3".');
            } else {
                setYoutubeError(data.error || 'Erro ao obter informações do vídeo');
            }
        } catch (error) {
            setYoutubeError('Erro ao conectar com o servidor');
        } finally {
            setYoutubeIsLoading(false);
        }
    };

    const downloadYoutubeMP3 = async () => {
        if (!youtubeVideoInfo) return;

        setYoutubeIsDownloading(true);
        setYoutubeError('');
        setYoutubeSuccess('');

        try {
            const response = await fetch('/api/youtube-download-robust', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: youtubeUrl,
                    title: youtubeVideoInfo.title,
                    quality: youtubeQuality
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setYoutubeSuccess(`Download concluído! Arquivo: ${data.fileName}`);

                // Criar link de download
                const downloadLink = document.createElement('a');
                downloadLink.href = data.downloadUrl;
                downloadLink.download = data.fileName;
                downloadLink.click();

                // Limpar formulário
                setYoutubeUrl('');
                setYoutubeVideoInfo(null);

                // Atualizar histórico
                loadYoutubeDownloadHistory();

                showSuccessToast('Download concluído com sucesso!', 3000);
            } else {
                setYoutubeError(data.error || 'Erro durante o download');
                showErrorToast('Erro durante o download', 3000);
            }
        } catch (error) {
            setYoutubeError('Erro ao conectar com o servidor');
            showErrorToast('Erro ao conectar com o servidor', 3000);
        } finally {
            setYoutubeIsDownloading(false);
        }
    };

    const loadYoutubeDownloadHistory = async () => {
        try {
            const response = await fetch('/api/youtube-downloads/history');
            if (response.ok) {
                const data = await response.json();
                setYoutubeDownloadHistory(data.downloads || []);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    };

    const formatDuration = (seconds: string) => {
        const totalSeconds = parseInt(seconds);
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatViewCount = (count: string) => {
        const num = parseInt(count);
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    // Load YouTube download history when section becomes active
    useEffect(() => {
        if (activeSection === 'youtube') {
            loadYoutubeDownloadHistory();
        }
    }, [activeSection]);

    // Estados de loading
    if (sessionStatus === 'loading') {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-[#202B3F] via-[#27212B] to-[#0C0C0C] text-white pt-16 flex items-center justify-center px-4">
                    <div className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                        <p className="text-sm">Carregando...</p>
                    // </div> // Removed stray JSX closing tag outside of a function/component
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

    const statusDisplay = getVencimentoStatusDisplay(userData?.vencimentoInfo);

    function renderModals() {
        if (!userData) return null;

        return (
            <>
                {/* Modal PIX */}
                {pixModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center p-2 sm:p-4" style={{ alignItems: 'flex-start' }}>
                        <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-[calc(100vh-40px)] overflow-y-auto mt-16">
                            <div className="p-4 sm:p-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-green-400" />
                                        Pagamento PIX
                                    </h2>
                                    <button onClick={() => setPixModalOpen(false)} className="text-gray-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Valor Pro-Rata */}
                                    <div className="text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20">
                                        <p className="text-gray-400 text-sm">Valor proporcional até o próximo vencimento</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            {(() => {
                                                const proRata = calcularProRata(userData.valor, userData.vencimentoInfo?.daysRemaining);
                                                return proRata ? formatCurrency(proRata) : formatCurrency(userData.valor);
                                            })()}
                                        </p>
                                        {userData.vencimentoInfo?.daysRemaining && (
                                            <>
                                                <p className="text-xs text-gray-400 mt-1">({userData.vencimentoInfo.daysRemaining} dias restantes)</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Próximo vencimento: {(() => {
                                                        const hoje = new Date();
                                                        hoje.setHours(0, 0, 0, 0);
                                                        const prox = new Date(hoje);
                                                        prox.setDate(hoje.getDate() + userData.vencimentoInfo.daysRemaining);
                                                        return prox.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                                                    })()}
                                                </p>
                                            </>
                                        )}
                                        <div className="flex flex-col items-center justify-center mt-2">
                                            <img src="https://i.ibb.co/RGcFygQQ/qrcode.png" alt="QR Code PIX" className="w-full max-w-[120px] h-auto rounded border-2 border-green-500 object-contain" />
                                            <p className="text-xs text-gray-300 mt-2 font-semibold">Escaneie o QR Code para pagar via PIX</p>
                                        </div>
                                    </div>

                                    {/* Dados do PIX */}
                                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                                        <h4 className="font-bold text-white mb-2 text-center text-xs">Dados para Transferência</h4>
                                        <div className="space-y-2">
                                            {/* Chave PIX */}
                                            <div>
                                                <p className="text-gray-400 text-xs mb-1">Chave PIX (E-mail):</p>
                                                <div className="bg-gray-900 rounded p-2 mb-2">
                                                    <p className="font-mono text-xs text-white break-all">djpoolrecordsbrazil@gmail.com</p>
                                                </div>
                                                <Button
                                                    onClick={() => copyToClipboard('djpoolrecordsbrazil@gmail.com')}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-8"
                                                >
                                                    <Copy className="w-4 h-4 mr-1" />
                                                    Copiar Chave PIX
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instruções */}


                                    {/* Botão WhatsApp */}
                                    <Button
                                        onClick={() => {
                                            setPixModalOpen(false);
                                            const proRata = calcularProRata(userData.valor, userData.vencimentoInfo?.daysRemaining);
                                            const proxVenc = (() => {
                                                const hoje = new Date();
                                                hoje.setHours(0, 0, 0, 0);
                                                const prox = new Date(hoje);
                                                prox.setDate(hoje.getDate() + (userData.vencimentoInfo?.daysRemaining || 0));
                                                return prox.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                                            })();
                                            openWhatsApp(
                                                '5551935052274',
                                                [
                                                    '✅ Pagamento PIX Realizado!',
                                                    '',
                                                    `💸 Valor: ${proRata ? formatCurrency(proRata) : formatCurrency(userData.valor)}`,
                                                    `📆 Próximo vencimento: ${proxVenc}`,
                                                    `👑 Plano: ${userData?.planName || 'N/A'}`,
                                                    '',
                                                    '📎 Comprovante em anexo'
                                                ].join('\n')
                                            );
                                        }}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg text-base flex items-center justify-center gap-2 mt-4"
                                    >
                                        <span role="img" aria-label="zap">💬</span> <MessageSquare className="w-5 h-5" /> <span>Enviar no WhatsApp</span> <span role="img" aria-label="zap">📲</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-16">
                <div className="w-full px-3 py-4 sm:px-4 sm:py-6">
                    <div className="max-w-7xl mx-auto">

                        {/* Layout com Sidebar */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                            {/* SIDEBAR MENU */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl rounded-3xl border-2 border-gray-700/30 sticky top-20 shadow-2xl w-full max-w-xs xl:max-w-[370px] flex flex-col h-[calc(100vh-6rem)] max-h-[800px] overflow-hidden">
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 xl:p-8">
                                        {/* Profile Header */}
                                        <div className="text-center mb-8 pb-6 border-b border-gray-600/50">
                                            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl ring-4 ring-purple-500/20">
                                                <User className="w-10 h-10 text-white" />
                                                {userData?.is_vip && (
                                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                                        <Crown className="w-4 h-4 text-black" />
                                                    </div>
                                                )}
                                            </div>
                                            <h2 className="text-xl font-bold text-white truncate tracking-wide">
                                                {userData?.name || "USUÁRIO"}
                                            </h2>
                                            <p className="text-sm text-gray-400 truncate font-mono">{userData?.email}</p>
                                            <div className="flex items-center justify-center gap-3 mt-4">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusDisplay?.bgColor || 'bg-gray-500/10'} ${statusDisplay?.color || 'text-gray-400'} border border-current/20`}>
                                                    {statusDisplay?.icon || <></>}
                                                    <span>{statusDisplay?.text || 'N/D'}</span>
                                                </div>
                                                {userData?.is_vip && (
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
                                                <button
                                                    onClick={() => setActiveSection('youtube')}
                                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${activeSection === 'youtube'
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 border border-red-400/30'
                                                        : 'text-gray-300 hover:bg-gray-800/70 hover:text-white border border-transparent hover:border-gray-600/50'
                                                        }`}
                                                >
                                                    <Music className="w-5 h-5" />
                                                    YTB DOWNLOADER
                                                </button>
                                            )}

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
                                                    <Card className="border-gray-700/50 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm shadow-2xl border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300">
                                                        <CardContent className="p-6">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                                                    <Download className="w-5 h-5 text-white" />
                                                                </div>
                                                                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full font-medium">Hoje</span>
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
                                                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                                                {typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado' ? 'Downloads ilimitados' :
                                                                    userData?.dailyDownloadCount === 0 ? 'Nenhum download hoje' :
                                                                        `${(typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 10) - (userData?.dailyDownloadCount || 0)} restantes`}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                                <div className="relative bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 text-center border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300 flex flex-col items-center justify-center min-h-[80px] group">
                                                    <div className="absolute top-2 right-2">
                                                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                                    </div>
                                                    <div className="text-xl font-bold text-pink-400 mb-1">
                                                        {userData?.likesCount || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium">
                                                        CURTIDAS
                                                    </div>
                                                </div>
                                                <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 text-center border border-green-500/20 hover:border-green-400/40 transition-all duration-300 flex flex-col items-center justify-center min-h-[80px] group">
                                                    <div className="absolute top-2 right-2">
                                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                    </div>
                                                    <div className="text-xl font-bold text-green-400 mb-1">
                                                        {userData?.playsCount || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium">
                                                        PLAYS
                                                    </div>
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
            case 'youtube':
                return renderYoutubeSection();
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
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Visão Geral</h2>
                        <p className="text-gray-400">Resumo das suas atividades e estatísticas</p>
                    </div>
                </div>

                {/* Estatísticas em Linhas */}
                <div className="space-y-4">
                    {/* Downloads Diários - Apenas para não-VIP */}
                    {typeof userData?.dailyDownloadLimit !== 'string' && (
                        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Download className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Downloads Hoje</h3>
                                            <p className="text-gray-400">Limite diário de downloads</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold text-blue-400">
                                            {userData?.dailyDownloadCount || 0}
                                            <span className="text-2xl text-gray-400"> / {typeof userData?.dailyDownloadLimit === 'string' ? '∞' : (userData?.dailyDownloadLimit ?? 10)}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1">
                                            {typeof userData?.dailyDownloadLimit === 'string' && userData?.dailyDownloadLimit === 'Ilimitado'
                                                ? 'Downloads ilimitados'
                                                : userData?.dailyDownloadCount === 0
                                                    ? 'Nenhum download hoje'
                                                    : `${(typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 10) - (userData?.dailyDownloadCount || 0)} restantes`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Total Downloads */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Total de Downloads</h3>
                                        <p className="text-gray-400">Sua biblioteca pessoal</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-green-400">{userData?.downloadsCount || 0}</div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.downloadsCount === 0 ? 'Nenhum download ainda' : 'músicas baixadas'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Curtidas */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Curtidas</h3>
                                        <p className="text-gray-400">Suas músicas favoritas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-pink-400">{userData?.likesCount || 0}</div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.likesCount === 0 ? 'Nenhuma curtida ainda' : 'músicas curtidas'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Plays */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Reproduções</h3>
                                        <p className="text-gray-400">Suas sessões de música</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-purple-400">{userData?.playsCount || 0}</div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.playsCount === 0 ? 'Nenhuma reprodução ainda' : 'vezes reproduzido'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Espaçamento entre seções */}
                <div className="h-8"></div>

                {/* Atividade Total */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Atividade Total</h3>
                        <p className="text-gray-400">Resumo das suas interações</p>
                    </div>
                </div>

                <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Total de Interações</h3>
                                    <p className="text-gray-400">Downloads + Curtidas + Reproduções</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-indigo-400">
                                    {(userData?.downloadsCount || 0) + (userData?.likesCount || 0) + (userData?.playsCount || 0)}
                                </div>
                                <p className="text-sm text-gray-300 mt-1">interações totais</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Espaçamento entre seções */}
                <div className="h-8"></div>



                {/* Status do Plano */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Status do Plano</h3>
                        <p className="text-gray-400">Informações da sua assinatura</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Plano Atual */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                                        <Crown className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Plano Atual</h3>
                                        <p className="text-gray-400">Sua assinatura ativa</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-amber-400">{userData?.planName || 'Sem Plano'}</div>
                                    <p className="text-lg font-semibold text-amber-300 mt-1">{formatCurrency(userData?.valor ?? null)}/mês</p>
                                </div>
                            </div>

                            {/* Botões Modificar Plano, Pagar Plano e Falar Conosco lado a lado */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <Link href="/plans" className="flex-1">
                                    <Button className="w-full bg-gradient-to-r from-blue-500/90 to-purple-500/90 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 border-blue-400/20">
                                        <Edit className="w-5 h-5" />
                                        <span className="text-base">MODIFICAR PLANO</span>
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => setPixModalOpen(true)}
                                    className="flex-1 w-full bg-gradient-to-r from-green-500/90 to-emerald-500/90 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 border-green-400/20"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    <span className="text-base">PAGAR PLANO</span>
                                </Button>
                                <Button
                                    onClick={() => openWhatsApp('5551935052274', 'Olá! Gostaria de informações sobre meu plano atual.')}
                                    className="flex-1 w-full bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 border-amber-400/20"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-base">FALAR CONOSCO</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
                        <h2 className="text-3xl font-bold text-white">Deemix</h2>
                        <p className="text-gray-400">Download de músicas premium</p>
                    </div>
                </div>

                {/* Status de Acesso em Linha */}
                <div className="space-y-4">
                    {/* Status do Deemix */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${userData?.deemix ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {userData?.deemix ? <CheckCircle className="w-6 h-6 text-white" /> : <XCircle className="w-6 h-6 text-white" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Status do Deemix</h3>
                                        <p className="text-gray-400">Acesso à plataforma premium</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-4xl font-bold ${userData?.deemix ? 'text-green-400' : 'text-red-400'}`}>
                                        {userData?.deemix ? 'ATIVO' : 'INATIVO'}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.deemix ? 'Acesso liberado' : 'Sem acesso'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status do Deezer Premium */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${userData?.deezerPremium ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                        <Headphones className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Deezer Premium</h3>
                                        <p className="text-gray-400">Conta premium do Deezer</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-4xl font-bold ${userData?.deezerPremium ? 'text-blue-400' : 'text-gray-400'}`}>
                                        {userData?.deezerPremium ? 'ATIVO' : 'INATIVO'}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.deezerPremium ? 'Streaming premium' : 'Sem acesso premium'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Credenciais do Deemix (se tiver acesso) */}
                {userData?.deemix && (
                    <>
                        <div className="flex items-center gap-4 mb-6 mt-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <Key className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Credenciais de Acesso</h3>
                                <p className="text-gray-400">Suas credenciais para configurar o Deemix</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* ARL Premium */}
                            <div>
                                <label className="block text-lg font-semibold text-white mb-2">ARL Premium</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value="048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e"
                                        readOnly
                                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={() => copyToClipboard('048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e', 'ARL Premium')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Senha de Acesso */}
                            <div>
                                <label className="block text-lg font-semibold text-white mb-2">Senha de Acesso</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value="JMgQuuKI1LDiXBm"
                                        readOnly
                                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={() => copyToClipboard('JMgQuuKI1LDiXBm', 'Senha')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Configurações do Spotify */}
                        <div className="flex items-center gap-4 mb-6 mt-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">🎵 Configurações do Spotify (se necessário)</h3>
                                <p className="text-gray-400">Use estas credenciais para configurar o Spotify no Deemix</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Client ID */}
                            <div>
                                <label className="block text-lg font-semibold text-white mb-2">Client ID</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value="JMgQuuKI1LDiXBm"
                                        readOnly
                                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                        onClick={() => copyToClipboard('JMgQuuKI1LDiXBm', 'Client ID')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Client Secret */}
                            <div>
                                <label className="block text-lg font-semibold text-white mb-2">Client Secret</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value="d8db5aeefe6e439a951e5da66f392889"
                                        readOnly
                                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <button
                                        onClick={() => copyToClipboard('d8db5aeefe6e439a951e5da66f392889', 'Client Secret')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* User */}
                            <div>
                                <label className="block text-lg font-semibold text-white mb-2">User</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value="31psvp6pv6rhvjz7zfkcn4bv2ksm"
                                        readOnly
                                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    <button
                                        onClick={() => copyToClipboard('31psvp6pv6rhvjz7zfkcn4bv2ksm', 'User')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-400 transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Credenciais do Deezer Premium (se disponível) */}
                        {userData?.deezerPremium && userData?.deezerEmail && userData?.deezerPassword && (
                            <>
                                <div className="flex items-center gap-4 mb-6 mt-8">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                        <Headphones className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Credenciais Deezer Premium</h3>
                                        <p className="text-gray-400">Sua conta premium do Deezer</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Email Deezer */}
                                    <div>
                                        <label className="block text-lg font-semibold text-white mb-2">Email Deezer</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={userData.deezerEmail}
                                                readOnly
                                                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => copyToClipboard(userData.deezerEmail!, 'Email Deezer')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Senha Deezer */}
                                    <div>
                                        <label className="block text-lg font-semibold text-white mb-2">Senha Deezer</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={userData.deezerPassword}
                                                readOnly
                                                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white font-mono pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            />
                                            <button
                                                onClick={() => copyToClipboard(userData.deezerPassword!, 'Senha Deezer')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                            <Button
                                onClick={() => window.open('https://plataformavip.nexorrecords.com.br/deemix-gerenciar', '_blank')}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Settings className="w-5 h-5" />
                                GERENCIAR DEEMIX
                            </Button>
                            <Button
                                onClick={() => window.open('https://workupload.com/file/AvaE2nLGqhn', '_blank')}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                BAIXAR DEEMIX
                            </Button>
                        </div>
                    </>
                )}

                {/* Oferta para usuários sem acesso */}
                {!userData?.deemix && (
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Deemix Não Disponível</h3>
                                <p className="text-gray-400 mb-6">
                                    O Deemix não está incluído no seu plano atual. Entre em contato para adicionar este recurso.
                                </p>
                                <Button
                                    onClick={() => openWhatsApp('5551935052274', 'Olá! Gostaria de informações sobre como adicionar o Deemix ao meu plano.')}
                                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    SOLICITAR ACESSO
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // Seção do Deezer Premium
    // Seção do YouTube Downloader
    function renderYoutubeSection() {
        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">YouTube Downloader</h2>
                        <p className="text-gray-400">Ferramenta temporariamente desabilitada</p>
                    </div>
                </div>

                {/* Aviso de Desabilitação */}
                <Card className="bg-red-900/20 border-red-600/30 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Ferramenta Temporariamente Desabilitada</h3>
                            <div className="space-y-3 text-gray-300 max-w-2xl mx-auto">
                                <p className="text-lg">
                                    Devido às <strong className="text-red-400">diretrizes atualizadas do YouTube</strong>,
                                    a ferramenta de download não está funcional no momento.
                                </p>
                                <p>
                                    O YouTube implementou novas medidas de proteção que impedem o funcionamento
                                    de ferramentas de download automatizado.
                                </p>
                                <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
                                    <h4 className="text-blue-300 font-semibold mb-2">Alternativa Recomendada:</h4>
                                    <p className="text-blue-200">
                                        Para downloads de YouTube, recomendamos usar o <strong>Allavsoft</strong>,
                                        uma ferramenta profissional que funciona de forma independente.
                                    </p>
                                    <Link
                                        href="/allavsoft"
                                        className="inline-flex items-center gap-2 mt-3 text-blue-400 hover:text-blue-300 underline"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Acessar Allavsoft
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Status da Ferramenta */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Status</h3>
                                        <p className="text-gray-400">Estado atual da ferramenta</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-red-400">DESABILITADA</div>
                                    <p className="text-sm text-gray-300 mt-1">Diretrizes YouTube</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alternativa */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Allavsoft</h3>
                                        <p className="text-gray-400">Alternativa funcional</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-400">DISPONÍVEL</div>
                                    <p className="text-sm text-gray-300 mt-1">100% funcional</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/allavsoft"
                        className="flex-1"
                    >
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                            <ExternalLink className="w-5 h-5" />
                            USAR ALLAVSOFT
                        </Button>
                    </Link>

                    <Button
                        onClick={() => openWhatsApp('5551935052274', 'Olá! Tenho dúvidas sobre o YouTube Downloader e as alternativas disponíveis.')}
                        className="flex-1 border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        FALAR COM SUPORTE
                    </Button>
                </div>
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

                {/* Status e Informações em Linhas */}
                <div className="space-y-4">
                    {/* Status de Disponibilidade */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Status</h3>
                                        <p className="text-gray-400">Disponibilidade do serviço</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-yellow-400">EM BREVE</div>
                                    <p className="text-sm text-gray-300 mt-1">agosto 2025</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sites Suportados */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Database className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Sites Suportados</h3>
                                        <p className="text-gray-400">Plataformas compatíveis</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-blue-400">+1000</div>
                                    <p className="text-sm text-gray-300 mt-1">plataformas diferentes</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recursos Principais */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Recursos</h3>
                                        <p className="text-gray-400">Funcionalidades disponíveis</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-green-400">COMPLETO</div>
                                    <p className="text-sm text-gray-300 mt-1">download universal</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Qualidade de Download */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Star className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Qualidade</h3>
                                        <p className="text-gray-400">Resolução e formatos</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-purple-400">4K/HD</div>
                                    <p className="text-sm text-gray-300 mt-1">máxima qualidade</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Seção de Benefícios VIP */}
                <div className="flex items-center gap-4 mb-6 mt-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Acesso VIP</h3>
                        <p className="text-gray-400">Benefícios para clientes VIP</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* VIP Completo */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">VIP Completo</h3>
                                        <p className="text-gray-400">R$ 42,00 por R$ 60,00 - desconto de 30%</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-red-400">NÃO INCLUÍDO</div>
                                    <p className="text-sm text-gray-300 mt-1">desconto de R$ 15,00</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Outros Planos */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Outros Planos</h3>
                                        <p className="text-gray-400">VIP Básico e Padrão - valor cheio</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-blue-400">R$ 38,00</div>
                                    <p className="text-sm text-gray-300 mt-1">valor único</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data de Lançamento */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Lançamento</h3>
                                        <p className="text-gray-400">Previsão de disponibilidade</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-orange-400">AGOSTO</div>
                                    <p className="text-sm text-gray-300 mt-1">2025</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Botão de Ação */}
                <div className="mt-8 text-center">
                    <Button
                        onClick={() => window.open('/allavsoft', '_blank')}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                    >
                        <ExternalLink className="w-5 h-5" />
                        SABER MAIS
                    </Button>
                </div>
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

                {/* Informações do Plano em Linhas */}
                <div className="space-y-4">
                    {/* Nome do Plano */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Crown className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Plano Contratado</h3>
                                        <p className="text-gray-400">Seu plano atual</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-purple-400">{userData?.planName || 'Sem Plano'}</div>
                                    <p className="text-sm text-gray-300 mt-1">plano ativo</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add-ons Ativos */}
                    {(userData?.deemix || userData?.deezerPremium || userData?.isUploader) && (
                        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Add-ons Ativos</h3>
                                        <p className="text-gray-400">Recursos adicionais contratados</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {userData?.deemix && (
                                        <div className="bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                                            <Disc className="w-4 h-4 text-purple-400" />
                                            <span className="text-purple-300 font-semibold">🎵 Deemix Premium</span>
                                        </div>
                                    )}
                                    {userData?.deezerPremium && (
                                        <div className="bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                                            <Headphones className="w-4 h-4 text-orange-400" />
                                            <span className="text-orange-300 font-semibold">🎁 Deezer Premium</span>
                                        </div>
                                    )}
                                    {userData?.isUploader && (
                                        <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-green-400" />
                                            <span className="text-green-300 font-semibold">📤 Uploader</span>
                                        </div>
                                    )}
                                </div>
                                {!(userData?.deemix || userData?.deezerPremium || userData?.isUploader) && (
                                    <div className="text-center py-4">
                                        <p className="text-gray-400">Nenhum add-on ativo</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Valor Mensal */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Valor Mensal</h3>
                                        <p className="text-gray-400">Cobrança recorrente</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-green-400">{formatCurrency(userData?.valor ?? null)}</div>
                                    <p className="text-sm text-gray-300 mt-1">por mês</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data de Vencimento */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Próximo Vencimento</h3>
                                        <p className="text-gray-400">Data de renovação</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-blue-400">{formatDate(userData?.vencimento ?? null)}</div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.vencimentoInfo?.daysRemaining ? `${userData.vencimentoInfo.daysRemaining} dias restantes` : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status do Plano */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusDisplay.color === 'text-green-400' ? 'bg-green-500' : statusDisplay.color === 'text-red-400' ? 'bg-red-500' : 'bg-gray-500'}`}>
                                        {statusDisplay.icon || <CheckCircle className="w-6 h-6 text-white" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Status da Assinatura</h3>
                                        <p className="text-gray-400">Estado atual</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-4xl font-bold ${statusDisplay.color || 'text-gray-400'}`}>{statusDisplay.text || 'N/A'}</div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.is_vip ? 'Usuário VIP' : 'Usuário Regular'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Limite de Downloads */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Limite de Downloads</h3>
                                        <p className="text-gray-400">Downloads por dia</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-cyan-400">
                                        {typeof userData?.dailyDownloadLimit === 'string' ? '∞' : (userData?.dailyDownloadLimit ?? 10)}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {typeof userData?.dailyDownloadLimit === 'string' ? 'downloads ilimitados' : 'por dia'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Benefícios do Plano */}
                <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Benefícios Inclusos</h3>
                                <p className="text-gray-400">O que você tem acesso</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-gray-300">Downloads: {userData?.dailyDownloadLimit ?? 10}/dia</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-gray-300">Qualidade FLAC/320kbps</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-gray-300">Acesso total Drive</span>
                            </div>
                            {userData?.deemix && (
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-purple-400" />
                                    <span className="text-gray-300">🎵 Deemix Premium</span>
                                </div>
                            )}
                            {userData?.deezerPremium && (
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-orange-400" />
                                    <span className="text-gray-300">🎁 Deezer Premium</span>
                                </div>
                            )}
                            {userData?.isUploader && (
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-gray-300">📤 Uploader (10 uploads/mês)</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Botões de Ação */}
                <div className="flex flex-col gap-4 justify-center w-full">
                    <div className="mb-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-justify text-sm text-green-200 font-medium shadow-sm w-full">
                        <span className="font-bold text-green-300">Atenção:</span> O pagamento será calculado de forma proporcional (pro-rata), ou seja, você paga apenas pelos dias até o próximo vencimento. Assim, você nunca perde dias e só paga pelo que realmente vai usar!
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <Button
                            onClick={() => setPixModalOpen(true)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-green-500/30 transform hover:scale-105"
                        >
                            <CreditCard className="w-6 h-6" />
                            <span className="text-lg">PAGAR PLANO</span>
                        </Button>
                        <Button
                            onClick={() => openWhatsApp('5551935052274', 'Olá! Gostaria de informações sobre gerenciar meu plano.')}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-amber-500/30 transform hover:scale-105"
                        >
                            <Settings className="w-6 h-6" />
                            <span className="text-lg">GERENCIAR PLANO</span>
                        </Button>
                        <Button
                            onClick={() => openWhatsApp('5551935052274', 'Olá! Gostaria de solicitar o cancelamento do meu plano.')}
                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-red-500/30 transform hover:scale-105"
                        >
                            <XCircle className="w-6 h-6" />
                            <span className="text-lg">CANCELAR PLANO</span>
                        </Button>
                    </div>
                </div>
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

        // Seção do Allavsoft
        function renderAllavsoftSection() {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Download className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white font-inter">Allavsoft</h2>
                            <p className="text-gray-400 font-inter">Downloader universal</p>
                        </div>
                    </div>

                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Allavsoft</h3>
                                        <p className="text-gray-400 text-sm">Download universal</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">Disponível</div>
                                    <div className="text-sm text-gray-400">Status</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // Seção VIP
        function renderVipSection() {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white font-inter">Recursos VIP</h2>
                            <p className="text-gray-400 font-inter">Benefícios exclusivos</p>
                        </div>
                    </div>

                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                                        <Crown className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Status VIP</h3>
                                        <p className="text-gray-400 text-sm">Plano premium</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        {userData?.is_vip ? 'Ativo' : 'Inativo'}
                                    </div>
                                    <div className="text-sm text-gray-400">Status</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // Seção de Planos
        function renderPlanSection() {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white font-inter">Planos</h2>
                            <p className="text-gray-400 font-inter">Informações do seu plano</p>
                        </div>
                    </div>

                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Plano Atual</h3>
                                        <p className="text-gray-400 text-sm">Sua assinatura</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        {userData?.is_vip ? (userData?.planName || 'VIP') : 'FREE'}
                                    </div>
                                    <div className="text-sm text-gray-400">Plano</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // Seção de Atividades
        function renderActivitySection() {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white font-inter">Atividades</h2>
                            <p className="text-gray-400 font-inter">Histórico de atividades</p>
                        </div>
                    </div>

                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Atividades Recentes</h3>
                                        <p className="text-gray-400 text-sm">Últimas ações</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        {(userData?.downloadsCount || 0) + (userData?.likesCount || 0)}
                                    </div>
                                    <div className="text-sm text-gray-400">Total</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // Seção de Perfil
        function renderProfileSection() {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white font-inter">Dados Pessoais</h2>
                            <p className="text-gray-400 font-inter">Informações da conta</p>
                        </div>
                    </div>

                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Perfil</h3>
                                        <p className="text-gray-400 text-sm">Dados da conta</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        {userData?.name || 'Usuário'}
                                    </div>
                                    <div className="text-sm text-gray-400">Nome</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // Seção de Upload
        function renderUploadSection() {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white font-inter">Upload de Músicas</h2>
                            <p className="text-gray-400 font-inter">Compartilhe suas músicas</p>
                        </div>
                    </div>

                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Upload</h3>
                                        <p className="text-gray-400 text-sm">Sistema ativo</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">Disponível</div>
                                    <div className="text-sm text-gray-400">Status</div>
                                </div>
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
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Recursos VIP</h2>
                        <p className="text-gray-400">Benefícios exclusivos e acesso prioritário</p>
                    </div>
                </div>

                {/* Recursos VIP em Linhas */}
                <div className="space-y-4">
                    {/* Deemix Premium */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${userData?.deemix ? 'bg-green-500' : 'bg-red-500'}`}>
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Deemix Premium</h3>
                                        <p className="text-gray-400">Downloads ilimitados</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-4xl font-bold ${userData?.deemix ? 'text-green-400' : 'text-red-400'}`}>
                                        {userData?.deemix ? 'LIBERADO' : 'BLOQUEADO'}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.deemix ? 'acesso completo' : 'sem acesso'}
                                    </p>
                                </div>
                            </div>

                            {/* Botão anexado na parte inferior */}
                            <div className="mt-6 -mx-6 -mb-6">
                                {userData?.deemix ? (
                                    <Button
                                        onClick={() => setActiveSection('deemix')}
                                        className="w-full bg-gradient-to-r from-green-500/90 to-emerald-500/90 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-none rounded-b-lg transition-all duration-300 flex items-center justify-center gap-3 border-t border-green-400/20"
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span className="text-base">GERENCIAR DEEMIX</span>
                                    </Button>
                                ) : (
                                    <Link href="/deemix">
                                        <Button className="w-full bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-none rounded-b-lg transition-all duration-300 flex items-center justify-center gap-3 border-t border-red-400/20">
                                            <CreditCard className="w-5 h-5" />
                                            <span className="text-base">ASSINAR</span>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Downloads Diários */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Downloads Diários</h3>
                                        <p className="text-gray-400">Limite de downloads por dia</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-blue-400">{userData?.dailyDownloadLimit ?? 50}</div>
                                    <p className="text-sm text-gray-300 mt-1">por dia</p>
                                </div>
                            </div>

                            {/* Botão anexado na parte inferior */}
                            <div className="mt-6 -mx-6 -mb-6">
                                <Link href="/new">
                                    <Button className="w-full bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-none rounded-b-lg transition-all duration-300 flex items-center justify-center gap-3 border-t border-blue-400/20">
                                        <Music className="w-5 h-5" />
                                        <span className="text-base">VER MÚSICAS</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Qualidade de Áudio */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Disc className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Qualidade de Áudio</h3>
                                        <p className="text-gray-400">Máxima qualidade disponível</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-purple-400">FLAC/320kbps</div>
                                    <p className="text-sm text-gray-300 mt-1">áudio premium</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Acesso ao Drive */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                                        <Database className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Acesso ao Drive</h3>
                                        <p className="text-gray-400">Acervo completo de músicas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-indigo-400">LIBERADO</div>
                                    <p className="text-sm text-gray-300 mt-1">acesso total</p>
                                </div>
                            </div>

                            {/* Botão anexado na parte inferior */}
                            <div className="mt-6 -mx-6 -mb-6">
                                <Link href="https://plataformavip.nexorrecords.com.br/" target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full bg-gradient-to-r from-indigo-500/90 to-indigo-600/90 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-4 rounded-none rounded-b-lg transition-all duration-300 flex items-center justify-center gap-3 border-t border-indigo-400/20">
                                        <ExternalLink className="w-5 h-5" />
                                        <span className="text-base">ACESSAR PACKS</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Packs Semanais */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Packs Semanais</h3>
                                        <p className="text-gray-400">Solicitações de packs por semana</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-green-400">
                                        {(() => {
                                            const used = userData?.weeklyPackRequestsUsed ?? 0;
                                            let limit = userData?.weeklyPackRequests;
                                            if (!limit || limit < 1) {
                                                limit = userData?.planBenefits?.packRequests?.limit ?? 4;
                                            }
                                            return `${used}/${limit}`;
                                        })()}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">por semana</p>
                                </div>
                            </div>

                            {/* Botão anexado na parte inferior */}
                            <div className="mt-6 -mx-6 -mb-6">
                                <Link href="https://wa.me/5551935052274" target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 rounded-none rounded-b-lg transition-all duration-300 flex items-center justify-center gap-3 border-t border-green-400/20">
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-base">SOLICITAR PACKS</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Playlists Semanais */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                                        <Music className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Playlists Semanais</h3>
                                        <p className="text-gray-400">Downloads de playlists por semana</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-pink-400">
                                        {(() => {
                                            const used = userData?.weeklyPlaylistDownloadsUsed ?? 0;
                                            let limit = userData?.weeklyPlaylistDownloads;
                                            if (!limit || limit < 1) {
                                                limit = userData?.planBenefits?.playlistDownloads?.limit ?? 7;
                                            }
                                            return `${used}/${limit}`;
                                        })()}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">por semana</p>
                                </div>
                            </div>

                            {/* Botão anexado na parte inferior */}
                            <div className="mt-6 -mx-6 -mb-6">
                                <Link href="https://wa.me/5551935052274" target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full bg-gradient-to-r from-pink-500/90 to-pink-600/90 hover:from-pink-500 hover:to-pink-600 text-white font-bold py-4 rounded-none rounded-b-lg transition-all duration-300 flex items-center justify-center gap-3 border-t border-pink-400/20">
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-base">SOLICITAR PLAYLISTS</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload Personalizado */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Upload Personalizado</h3>
                                        <p className="text-gray-400">Envie suas próprias músicas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-teal-400">LIBERADO</div>
                                    <p className="text-sm text-gray-300 mt-1">sem limitações</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Suporte Prioritário */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Suporte Prioritário</h3>
                                        <p className="text-gray-400">Atendimento WhatsApp 24/7</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-emerald-400">24/7</div>
                                    <p className="text-sm text-gray-300 mt-1">sempre disponível</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Atividade Recente</h2>
                        <p className="text-gray-400">Histórico de downloads, curtidas e interações</p>
                    </div>
                </div>

                {/* Resumo de Atividades em Linha */}
                <div className="space-y-4">
                    {/* Total de Downloads */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Downloads Realizados</h3>
                                        <p className="text-gray-400">Total de músicas baixadas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-blue-400">{userData?.downloadsCount || 0}</div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.downloadsCount === 0 ? 'Nenhum download ainda' :
                                            userData?.downloadsCount === 1 ? '1 música baixada' : 'músicas baixadas'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total de Curtidas */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Curtidas Dadas</h3>
                                        <p className="text-gray-400">Músicas que você curtiu</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-pink-400">{userData?.likesCount || 0}</div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.likesCount === 0 ? 'Nenhuma curtida ainda' :
                                            userData?.likesCount === 1 ? '1 música curtida' : 'músicas curtidas'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total de Reproduções */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Reproduções Feitas</h3>
                                        <p className="text-gray-400">Sessões de música reproduzidas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-purple-400">{userData?.playsCount || 0}</div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.playsCount === 0 ? 'Nenhuma reprodução ainda' :
                                            userData?.playsCount === 1 ? '1 reprodução feita' : 'reproduções feitas'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Downloads Diários (apenas para não-VIP) */}
                    {typeof userData?.dailyDownloadLimit !== 'string' && (
                        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Downloads Hoje</h3>
                                            <p className="text-gray-400">Limite diário de downloads</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold text-orange-400">
                                            {userData?.dailyDownloadCount || 0}
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1">
                                            de {typeof userData?.dailyDownloadLimit === 'number' ? userData.dailyDownloadLimit : 10} permitidos
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Espaçamento entre seções */}
                <div className="h-8"></div>

                {/* Atividade Total */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Resumo Total</h3>
                        <p className="text-gray-400">Soma de todas as suas atividades</p>
                    </div>
                </div>

                <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Total de Interações</h3>
                                    <p className="text-gray-400">Downloads + Curtidas + Reproduções</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-indigo-400">
                                    {(userData?.downloadsCount || 0) + (userData?.likesCount || 0) + (userData?.playsCount || 0)}
                                </div>
                                <p className="text-sm text-gray-300 mt-1">interações totais</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Espaçamento entre seções */}
                <div className="h-8"></div>

                {/* Histórico Recente */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Histórico Recente</h3>
                        <p className="text-gray-400">Suas últimas atividades na plataforma</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Downloads Recentes */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Downloads Recentes</h3>
                                        <p className="text-gray-400">Últimas músicas baixadas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-cyan-400">
                                        {userData?.recentDownloads?.length || 0}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.recentDownloads?.length === 0 ? 'Nenhum download recente' : 'downloads recentes'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Curtidas Recentes */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Curtidas Recentes</h3>
                                        <p className="text-gray-400">Últimas músicas curtidas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-rose-400">
                                        {userData?.recentLikes?.length || 0}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {userData?.recentLikes?.length === 0 ? 'Nenhuma curtida recente' : 'curtidas recentes'}
                                    </p>
                                </div>
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
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Dados Pessoais</h2>
                        <p className="text-gray-400">Informações cadastrais e estatísticas da conta</p>
                    </div>
                </div>

                {/* Cards Simples de Dados Pessoais */}
                <div className="space-y-4">
                    {/* Informações Básicas */}
                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">Nome</h3>
                                        <p className="text-sm text-gray-400">Seu nome de usuário</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-semibold">{userData.name || 'Não informado'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">Email</h3>
                                        <p className="text-sm text-gray-400">Seu endereço de email</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-semibold truncate">{userData.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">WhatsApp</h3>
                                        <p className="text-sm text-gray-400">Seu número de contato</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-semibold">{userData.whatsapp || 'Não informado'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">Membro desde</h3>
                                        <p className="text-sm text-gray-400">Data de cadastro</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-semibold">{formatDate(userData.createdAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Crown className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">Tipo de Conta</h3>
                                        <p className="text-sm text-gray-400">Seu plano atual</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${userData.is_vip ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-400 bg-gray-500/20'}`}>
                                        {userData.is_vip ? 'VIP' : 'Regular'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Download className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">Downloads</h3>
                                        <p className="text-sm text-gray-400">Total de downloads realizados</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-semibold">{userData?.downloadsCount || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">Curtidas</h3>
                                        <p className="text-sm text-gray-400">Total de curtidas dadas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-semibold">{userData?.likesCount || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Play className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">Reproduções</h3>
                                        <p className="text-sm text-gray-400">Total de plays realizados</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-white font-semibold">{userData?.playsCount || 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="text-white font-medium">Deemix</h3>
                                        <p className="text-sm text-gray-400">Status do sistema Deemix</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${userData.deemix ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'}`}>
                                        {userData.deemix ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Seção de Upload de Músicas
    function renderUploadSection() {
        return (
            <div className="space-y-6">
                {/* Título da Seção */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Upload de Músicas</h2>
                        <p className="text-gray-400">Compartilhe suas músicas com a comunidade</p>
                    </div>
                </div>

                {/* Status de Upload em Linha */}
                <div className="space-y-4">
                    {/* Status do Sistema */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Status do Sistema</h3>
                                        <p className="text-gray-400">Sistema de upload funcionando</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-400">ATIVO</div>
                                    <p className="text-sm text-gray-300 mt-1">Online 24/7</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Suas Contribuições */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Suas Contribuições</h3>
                                        <p className="text-gray-400">Músicas enviadas por você</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-blue-400">0</div>
                                    <p className="text-sm text-gray-300 mt-1">músicas enviadas</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Downloads Totais */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Download className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Downloads das Suas Músicas</h3>
                                        <p className="text-gray-400">Total de downloads recebidos</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-purple-400">0</div>
                                    <p className="text-sm text-gray-300 mt-1">downloads totais</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Curtidas Recebidas */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Curtidas Recebidas</h3>
                                        <p className="text-gray-400">Suas músicas mais curtidas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-pink-400">0</div>
                                    <p className="text-sm text-gray-300 mt-1">curtidas recebidas</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Espaçamento entre seções */}
                <div className="h-8"></div>

                {/* Formulário de Upload */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Enviar Nova Música</h3>
                        <p className="text-gray-400">Faça upload da sua música para a plataforma</p>
                    </div>
                </div>

                <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        {/* Componente de Upload Funcional */}
                        <MusicUploadForm />
                    </CardContent>
                </Card>

                {/* Espaçamento entre seções */}
                <div className="h-8"></div>

                {/* Requisitos e Dicas */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Requisitos e Dicas</h3>
                        <p className="text-gray-400">Informações importantes para upload</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Formatos Aceitos */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                                        <Music className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Formatos Aceitos</h3>
                                        <p className="text-gray-400">Tipos de arquivo suportados</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-amber-400">MP3, WAV, FLAC</div>
                                    <p className="text-sm text-gray-300 mt-1">alta qualidade</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tamanho Máximo */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Tamanho Máximo</h3>
                                        <p className="text-gray-400">Limite por arquivo</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-cyan-400">50</div>
                                    <p className="text-sm text-gray-300 mt-1">MB por arquivo</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadados */}
                    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Metadados Automáticos</h3>
                                        <p className="text-gray-400">Informações extraídas automaticamente</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-teal-400">AUTOMÁTICO</div>
                                    <p className="text-sm text-gray-300 mt-1">título, artista, álbum</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
}