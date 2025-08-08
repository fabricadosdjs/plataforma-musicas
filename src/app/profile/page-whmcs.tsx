// src/app/profile/page-whmcs.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import WHMCSLayout from "@/components/layout/WHMCSLayout";
import {
    User,
    Download,
    Music,
    Star,
    Crown,
    Calendar,
    TrendingUp,
    DollarSign,
    Activity,
    CheckCircle,
    AlertTriangle,
    Clock,
    Database,
    Play,
    Heart,
    Disc
} from "lucide-react";

// Interfaces (reutilizando da página original)
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

interface UserProfile {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    is_vip: boolean;
    vencimento: string | null;
    downloads_count: number;
    daily_downloads_used: number;
    daily_download_limit: number;
    recent_activities: RecentActivity[];
    total_likes: number;
    total_plays: number;
    favorite_genres: string[];
    created_at: string;
    last_login: string;
}

const ProfilePageWHMCS = () => {
    const { data: session, status } = useSession();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs = [
        { label: "Minha Conta" }
    ];

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!session?.user?.id) return;

            try {
                setLoading(true);
                const response = await fetch('/api/user-data');

                if (!response.ok) {
                    throw new Error('Falha ao carregar dados do usuário');
                }

                const data = await response.json();
                setUserProfile(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchUserProfile();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [session, status]);

    // Calcular progresso de downloads
    const downloadProgress = userProfile
        ? Math.min((userProfile.daily_downloads_used / userProfile.daily_download_limit) * 100, 100)
        : 0;

    // Verificar vencimento
    const getExpiryStatus = () => {
        if (!userProfile?.vencimento) return null;

        const vencimentoDate = new Date(userProfile.vencimento);
        const now = new Date();
        const diffTime = vencimentoDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return { type: 'danger', message: 'Plano expirado' };
        } else if (diffDays <= 7) {
            return { type: 'warning', message: `Expira em ${diffDays} dias` };
        } else {
            return { type: 'success', message: `${diffDays} dias restantes` };
        }
    };

    const expiryStatus = getExpiryStatus();

    if (status === 'loading' || loading) {
        return (
            <WHMCSLayout
                title="Carregando..."
                breadcrumbs={breadcrumbs}
                showSidebar={true}
            >
                <div className="whmcs-card">
                    <div className="whmcs-card-body">
                        <div className="text-center">
                            <div className="whmcs-loading-spinner"></div>
                            <p>Carregando seus dados...</p>
                        </div>
                    </div>
                </div>
            </WHMCSLayout>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <WHMCSLayout
                title="Acesso Negado"
                breadcrumbs={breadcrumbs}
                showSidebar={false}
            >
                <div className="whmcs-alert danger">
                    <AlertTriangle className="h-5 w-5" />
                    <div className="whmcs-alert-content">
                        <h4 className="whmcs-alert-title">Acesso Restrito</h4>
                        <p className="whmcs-alert-text">
                            Você precisa fazer login para acessar esta página.
                        </p>
                    </div>
                </div>
            </WHMCSLayout>
        );
    }

    if (error) {
        return (
            <WHMCSLayout
                title="Erro"
                breadcrumbs={breadcrumbs}
                showSidebar={true}
            >
                <div className="whmcs-alert danger">
                    <AlertTriangle className="h-5 w-5" />
                    <div className="whmcs-alert-content">
                        <h4 className="whmcs-alert-title">Erro ao Carregar Dados</h4>
                        <p className="whmcs-alert-text">{error}</p>
                    </div>
                </div>
            </WHMCSLayout>
        );
    }

    if (!userProfile) {
        return (
            <WHMCSLayout
                title="Usuário não encontrado"
                breadcrumbs={breadcrumbs}
                showSidebar={true}
            >
                <div className="whmcs-alert warning">
                    <AlertTriangle className="h-5 w-5" />
                    <div className="whmcs-alert-content">
                        <h4 className="whmcs-alert-title">Dados Não Encontrados</h4>
                        <p className="whmcs-alert-text">
                            Não foi possível carregar os dados do seu perfil.
                        </p>
                    </div>
                </div>
            </WHMCSLayout>
        );
    }

    return (
        <WHMCSLayout
            title="Visão Geral da Conta"
            breadcrumbs={breadcrumbs}
            showSidebar={true}
        >
            {/* Alert de Status VIP */}
            {expiryStatus && (
                <div className={`whmcs-alert ${expiryStatus.type}`}>
                    {expiryStatus.type === 'danger' ? <AlertTriangle className="h-5 w-5" /> :
                        expiryStatus.type === 'warning' ? <Clock className="h-5 w-5" /> :
                            <CheckCircle className="h-5 w-5" />}
                    <div className="whmcs-alert-content">
                        <h4 className="whmcs-alert-title">Status do Plano VIP</h4>
                        <p className="whmcs-alert-text">{expiryStatus.message}</p>
                    </div>
                </div>
            )}

            {/* Estatísticas Principais */}
            <div className="whmcs-profile-cards">
                {/* Downloads Diários */}
                <div className="whmcs-stat-card">
                    <div className="whmcs-stat-header">
                        <div className="whmcs-stat-icon primary">
                            <Download className="h-6 w-6" />
                        </div>
                        <div className="whmcs-stat-content">
                            <h3>{userProfile.daily_downloads_used}/{userProfile.daily_download_limit}</h3>
                            <p>Downloads Diários</p>
                        </div>
                    </div>
                    <div className="whmcs-stat-footer">
                        <div className="whmcs-progress">
                            <div className="whmcs-progress-bar">
                                <div
                                    className="whmcs-progress-fill"
                                    style={{ width: `${downloadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                        <span className="whmcs-progress-text">{downloadProgress.toFixed(0)}%</span>
                    </div>
                </div>

                {/* Total de Downloads */}
                <div className="whmcs-stat-card">
                    <div className="whmcs-stat-header">
                        <div className="whmcs-stat-icon success">
                            <Database className="h-6 w-6" />
                        </div>
                        <div className="whmcs-stat-content">
                            <h3>{userProfile.downloads_count.toLocaleString()}</h3>
                            <p>Total de Downloads</p>
                        </div>
                    </div>
                    <div className="whmcs-stat-footer">
                        <span className="whmcs-progress-text">Desde o cadastro</span>
                    </div>
                </div>

                {/* Status VIP */}
                <div className="whmcs-stat-card">
                    <div className="whmcs-stat-header">
                        <div className={`whmcs-stat-icon ${userProfile.is_vip ? 'warning' : 'info'}`}>
                            <Crown className="h-6 w-6" />
                        </div>
                        <div className="whmcs-stat-content">
                            <h3>{userProfile.is_vip ? 'VIP' : 'FREE'}</h3>
                            <p>Status da Conta</p>
                        </div>
                    </div>
                    <div className="whmcs-stat-footer">
                        {userProfile.vencimento && (
                            <span className="whmcs-progress-text">
                                Vence: {new Date(userProfile.vencimento).toLocaleDateString('pt-BR')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Músicas Curtidas */}
                <div className="whmcs-stat-card">
                    <div className="whmcs-stat-header">
                        <div className="whmcs-stat-icon danger">
                            <Heart className="h-6 w-6" />
                        </div>
                        <div className="whmcs-stat-content">
                            <h3>{userProfile.total_likes?.toLocaleString() || 0}</h3>
                            <p>Músicas Curtidas</p>
                        </div>
                    </div>
                    <div className="whmcs-stat-footer">
                        <span className="whmcs-progress-text">Total de likes</span>
                    </div>
                </div>
            </div>

            {/* Informações da Conta */}
            <div className="whmcs-card">
                <div className="whmcs-card-header">
                    <h3 className="whmcs-card-title">Informações da Conta</h3>
                </div>
                <div className="whmcs-card-body">
                    <div className="whmcs-table-wrapper">
                        <table className="whmcs-table">
                            <tbody>
                                <tr>
                                    <td><strong>Nome</strong></td>
                                    <td>{userProfile.name}</td>
                                </tr>
                                <tr>
                                    <td><strong>Email</strong></td>
                                    <td>{userProfile.email}</td>
                                </tr>
                                <tr>
                                    <td><strong>WhatsApp</strong></td>
                                    <td>{userProfile.whatsapp || 'Não informado'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Membro desde</strong></td>
                                    <td>{new Date(userProfile.created_at).toLocaleDateString('pt-BR')}</td>
                                </tr>
                                <tr>
                                    <td><strong>Último acesso</strong></td>
                                    <td>{userProfile.last_login ? new Date(userProfile.last_login).toLocaleDateString('pt-BR') : 'Nunca'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Atividade Recente */}
            {userProfile.recent_activities && userProfile.recent_activities.length > 0 && (
                <div className="whmcs-card">
                    <div className="whmcs-card-header">
                        <h3 className="whmcs-card-title">Atividade Recente</h3>
                    </div>
                    <div className="whmcs-card-body">
                        <div className="whmcs-table-wrapper">
                            <table className="whmcs-table">
                                <thead>
                                    <tr>
                                        <th>Música</th>
                                        <th>Artista</th>
                                        <th>Gênero</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userProfile.recent_activities.slice(0, 10).map((activity) => (
                                        <tr key={activity.id}>
                                            <td>{activity.track.songName}</td>
                                            <td>{activity.track.artist}</td>
                                            <td>{activity.track.style}</td>
                                            <td>
                                                {new Date(activity.downloadedAt || activity.createdAt || '').toLocaleDateString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Ações Rápidas */}
            <div className="whmcs-card">
                <div className="whmcs-card-header">
                    <h3 className="whmcs-card-title">Ações Rápidas</h3>
                </div>
                <div className="whmcs-card-body">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a href="/profile/dados" className="whmcs-btn-primary text-center">
                            <User className="h-5 w-5 mx-auto mb-2" />
                            Editar Perfil
                        </a>
                        <a href="/profile/meu-plano" className="whmcs-btn-primary text-center">
                            <Crown className="h-5 w-5 mx-auto mb-2" />
                            Meu Plano
                        </a>
                        <a href="/profile/atividade" className="whmcs-btn-primary text-center">
                            <Activity className="h-5 w-5 mx-auto mb-2" />
                            Ver Atividade
                        </a>
                        <a href="/plans" className="whmcs-btn-primary text-center">
                            <TrendingUp className="h-5 w-5 mx-auto mb-2" />
                            Upgrade VIP
                        </a>
                    </div>
                </div>
            </div>
        </WHMCSLayout>
    );
};

export default ProfilePageWHMCS;

