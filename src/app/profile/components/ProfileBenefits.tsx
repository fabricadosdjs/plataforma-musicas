"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Crown, CheckCircle, XCircle, Package, Music, Star, Zap, Disc, Upload } from "lucide-react";

interface UserData {
    customBenefits?: any;
    plan?: 'BASICO' | 'PADRAO' | 'COMPLETO' | null;
    planName?: string;
    planIcon?: string;
    weeklyPackRequests?: number;
    weeklyPlaylistDownloads?: number;
    weeklyPackRequestsUsed?: number;
    weeklyPlaylistDownloadsUsed?: number;
    deemix?: boolean;
    deezerPremium?: boolean;
    isUploader?: boolean;
    vipPlan?: string;
}

// Configuração dos benefícios padrão por plano
const DEFAULT_PLAN_BENEFITS = {
    BASICO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal ao Drive' },
        packRequests: { enabled: true, limit: 4, description: 'Até 4 estilos por semana' },
        playlistDownloads: { enabled: true, limit: 7, description: 'Até 7 playlists por semana' },
        individualContent: { enabled: true, description: 'Downloads individuais ilimitados' },
        deezerPremium: { enabled: false, description: 'Não incluído' },
        uploader: { enabled: false, description: 'Não incluído' }
    },
    PADRAO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal ao Drive' },
        packRequests: { enabled: true, limit: 6, description: 'Até 6 estilos por semana' },
        playlistDownloads: { enabled: true, limit: 10, description: 'Até 10 playlists por semana' },
        individualContent: { enabled: true, description: 'Downloads individuais ilimitados' },
        deezerPremium: { enabled: false, description: 'Não incluído' },
        uploader: { enabled: false, description: 'Não incluído' }
    },
    COMPLETO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal ao Drive' },
        packRequests: { enabled: true, limit: 10, description: 'Até 10 estilos por semana' },
        playlistDownloads: { enabled: true, limit: 15, description: 'Até 15 playlists por semana' },
        individualContent: { enabled: true, description: 'Downloads individuais ilimitados' },
        deezerPremium: { enabled: false, description: 'Não incluído' },
        uploader: { enabled: false, description: 'Não incluído' }
    }
};

export default function ProfileBenefits() {
    const { data: session } = useSession();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            if (session) {
                try {
                    const response = await fetch('/api/profile');
                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchUserData();
    }, [session]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">Recursos VIP</h1>
                <p className="text-gray-600">Erro ao carregar benefícios do usuário.</p>
            </div>
        );
    }

    // Obter benefícios padrão baseado no plano
    const defaultBenefits = userData.plan ? DEFAULT_PLAN_BENEFITS[userData.plan] : null;

    // Mesclar benefícios padrão com personalizações
    const getBenefitValue = (benefitKey: string, defaultValue: any) => {
        if (userData.customBenefits && userData.customBenefits[benefitKey] !== undefined) {
            return userData.customBenefits[benefitKey];
        }
        return defaultValue;
    };

    const renderBenefitItem = (
        icon: React.ReactNode,
        title: string,
        description: string,
        enabled: boolean,
        usage?: { used: number; limit: number }
    ) => (
        <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border">
            <div className={`p-2 rounded-full ${enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    {enabled ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                </div>
                <p className="text-gray-600 text-sm">{description}</p>

                {usage && enabled && (
                    <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Usado esta semana</span>
                            <span>{usage.used} / {usage.limit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${usage.used >= usage.limit ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold">Recursos VIP</h1>
                </div>
                <p className="text-gray-600">
                    Seus benefícios exclusivos e status de uso.
                    {userData.customBenefits && Object.keys(userData.customBenefits).length > 0 && (
                        <span className="ml-1 text-purple-600 font-medium">
                            ⚙️ Benefícios personalizados aplicados
                        </span>
                    )}
                </p>
            </div>

            {/* Status do Plano */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{userData.planIcon || '👑'}</span>
                    <div>
                        <h2 className="text-xl font-bold">{userData.planName || 'Plano VIP'}</h2>
                        <p className="opacity-90">Recursos exclusivos para membros VIP</p>
                    </div>
                </div>
            </div>

            {/* Lista de Benefícios */}
            <div className="grid gap-4">
                {/* Acesso ao Drive */}
                {renderBenefitItem(
                    <Package className="w-5 h-5" />,
                    "Acesso ao Drive VIP",
                    getBenefitValue('driveAccess', defaultBenefits?.driveAccess)?.description || "Acesso mensal ao drive com conteúdo exclusivo",
                    getBenefitValue('driveAccess', defaultBenefits?.driveAccess)?.enabled !== false
                )}

                {/* Pack Requests */}
                {renderBenefitItem(
                    <Music className="w-5 h-5" />,
                    "Solicitações de Packs",
                    `Solicite packs de estilos musicais específicos`,
                    getBenefitValue('packRequests', defaultBenefits?.packRequests)?.enabled !== false,
                    {
                        used: userData.weeklyPackRequestsUsed || 0,
                        limit: getBenefitValue('packRequests', defaultBenefits?.packRequests)?.limit ||
                            userData.weeklyPackRequests ||
                            defaultBenefits?.packRequests?.limit || 4
                    }
                )}

                {/* Playlist Downloads */}
                {renderBenefitItem(
                    <Star className="w-5 h-5" />,
                    "Downloads de Playlists",
                    `Download de playlists completas`,
                    getBenefitValue('playlistDownloads', defaultBenefits?.playlistDownloads)?.enabled !== false,
                    {
                        used: userData.weeklyPlaylistDownloadsUsed || 0,
                        limit: getBenefitValue('playlistDownloads', defaultBenefits?.playlistDownloads)?.limit ||
                            userData.weeklyPlaylistDownloads ||
                            defaultBenefits?.playlistDownloads?.limit || 7
                    }
                )}

                {/* Downloads Individuais */}
                {renderBenefitItem(
                    <Zap className="w-5 h-5" />,
                    "Downloads Individuais",
                    "Downloads ilimitados de faixas individuais",
                    getBenefitValue('individualContent', defaultBenefits?.individualContent)?.enabled !== false
                )}

                {/* Deemix */}
                {renderBenefitItem(
                    <Disc className="w-5 h-5" />,
                    "Deemix Premium",
                    userData.deemix ? "Acesso liberado ao Deemix" : "Não incluído no seu plano",
                    getBenefitValue('deemix', userData.deemix) === true
                )}

                {/* Deezer Premium */}
                {renderBenefitItem(
                    <Music className="w-5 h-5" />,
                    "Deezer Premium",
                    userData.deezerPremium ? "Credenciais Deezer Premium fornecidas" : "Não incluído no seu plano",
                    getBenefitValue('deezerPremium', userData.deezerPremium) === true
                )}

                {/* Uploader */}
                {renderBenefitItem(
                    <Upload className="w-5 h-5" />,
                    "Uploader Premium",
                    userData.isUploader ? "Acesso aos recursos de upload premium" : "Não incluído no seu plano",
                    getBenefitValue('uploader', userData.isUploader) === true
                )}
            </div>

            {/* Nota sobre personalização */}
            {userData.customBenefits && Object.keys(userData.customBenefits).length > 0 && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">Benefícios Personalizados</h3>
                    </div>
                    <p className="text-purple-700 text-sm">
                        Alguns dos seus benefícios foram personalizados pela administração.
                        Os valores e limites mostrados acima refletem essas personalizações.
                    </p>
                </div>
            )}
        </div>
    );
}
