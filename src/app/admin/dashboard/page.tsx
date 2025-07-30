// src/app/admin/dashboard/page.tsx
"use client";

import { Activity, Calendar, Clock, CpuIcon, DollarSign, Download, HardDrive, Heart, MemoryStick, Music, Server, TrendingUp, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardStats {
    serverInfo: {
        platform: string;
        hostname: string;
        uptime: number;
        memory: {
            total: number;
            free: number;
            used: number;
        };
        cpus: number;
    };
    userStats: {
        total: number;
        vipUsers: number;
        freeUsers: number;
        activeUsers: number;
        newUsersToday: number;
        newUsersWeek: number;
        expiringUsersWeek: number;
    };
    downloadStats: {
        totalDownloads: number;
        downloadsToday: number;
        downloadsWeek: number;
        downloadsMonth: number;
        topDownloaderToday: any;
        topDownloaderWeek: any;
        topDownloaderMonth: any;
    };
    trackStats: {
        totalTracks: number;
        tracksAddedToday: number;
        tracksAddedWeek: number;
        mostDownloadedTrack: any;
        mostLikedTrack: any;
        recentTracks: any[];
    };
    likeStats: {
        totalLikes: number;
        likesToday: number;
        likesWeek: number;
        topLikedUser: any;
    };
    revenueStats: {
        totalRevenue: number;
        averageUserValue: number;
        vipPlansDistribution: any[];
    };
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoaded = status !== 'loading';
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    if (isLoaded && !user) {
        redirect('/auth/sign-in');
    }

    if (isLoaded && user && !user.isAdmin) {
        redirect('/access-denied');
    }

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/dashboard');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
                setLastUpdated(new Date());
            } else {
                console.error('Erro na resposta da API:', response.status);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.isAdmin) {
            fetchStats();
            // Atualizar a cada 60 segundos (reduzido para melhor performance)
            const interval = setInterval(fetchStats, 60000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#202124] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session?.user?.isAdmin) {
        return (
            <div className="min-h-screen bg-[#202124] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
                    <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#202124] text-white">
            {/* Header */}
            <header className="p-4" style={{ backgroundColor: '#2d2f32' }}>
                <div className="flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-2">
                        <Activity size={24} />
                        <span className="text-xl font-bold">Dashboard Admin</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">
                            Última atualização: {lastUpdated.toLocaleTimeString()}
                        </span>
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Atualizando...' : 'Atualizar'}
                        </button>
                        <Link href="/admin" className="bg-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
                            Voltar
                        </Link>
                    </div>
                </div>
            </header>

            <div className="p-6">
                {stats ? (
                    <>
                        {/* Informações do Servidor */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Server className="text-green-400" />
                                Informações do Servidor
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CpuIcon size={20} className="text-blue-400" />
                                        <span className="font-semibold">Sistema</span>
                                    </div>
                                    <p className="text-gray-300">{stats.serverInfo.platform}</p>
                                    <p className="text-sm text-gray-400">{stats.serverInfo.hostname}</p>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={20} className="text-green-400" />
                                        <span className="font-semibold">Uptime</span>
                                    </div>
                                    <p className="text-gray-300">{formatUptime(stats.serverInfo.uptime)}</p>
                                    <p className="text-sm text-gray-400">{stats.serverInfo.cpus} CPUs</p>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MemoryStick size={20} className="text-yellow-400" />
                                        <span className="font-semibold">Memória</span>
                                    </div>
                                    <p className="text-gray-300">{formatBytes(stats.serverInfo.memory.used)} / {formatBytes(stats.serverInfo.memory.total)}</p>
                                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{ width: `${(stats.serverInfo.memory.used / stats.serverInfo.memory.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <HardDrive size={20} className="text-purple-400" />
                                        <span className="font-semibold">Memória Livre</span>
                                    </div>
                                    <p className="text-gray-300">{formatBytes(stats.serverInfo.memory.free)}</p>
                                    <p className="text-sm text-gray-400">
                                        {((stats.serverInfo.memory.free / stats.serverInfo.memory.total) * 100).toFixed(1)}% livre
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas de Usuários */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Users className="text-blue-400" />
                                Usuários
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Total de Usuários</p>
                                            <p className="text-2xl font-bold text-blue-400">{stats.userStats.total}</p>
                                        </div>
                                        <Users className="text-blue-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Usuários VIP</p>
                                            <p className="text-2xl font-bold text-yellow-400">{stats.userStats.vipUsers}</p>
                                        </div>
                                        <TrendingUp className="text-yellow-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Novos Hoje</p>
                                            <p className="text-2xl font-bold text-green-400">{stats.userStats.newUsersToday}</p>
                                        </div>
                                        <Calendar className="text-green-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Vencendo em 7 dias</p>
                                            <p className="text-2xl font-bold text-red-400">{stats.userStats.expiringUsersWeek}</p>
                                        </div>
                                        <Clock className="text-red-400" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas de Downloads */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Download className="text-green-400" />
                                Downloads
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Total</p>
                                            <p className="text-2xl font-bold text-green-400">{stats.downloadStats.totalDownloads}</p>
                                        </div>
                                        <Download className="text-green-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Hoje</p>
                                            <p className="text-2xl font-bold text-blue-400">{stats.downloadStats.downloadsToday}</p>
                                        </div>
                                        <Calendar className="text-blue-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Esta Semana</p>
                                            <p className="text-2xl font-bold text-purple-400">{stats.downloadStats.downloadsWeek}</p>
                                        </div>
                                        <TrendingUp className="text-purple-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Este Mês</p>
                                            <p className="text-2xl font-bold text-yellow-400">{stats.downloadStats.downloadsMonth}</p>
                                        </div>
                                        <Calendar className="text-yellow-400" size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Top Downloaders */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {stats.downloadStats.topDownloaderToday ? (
                                    <div className="bg-[#2d2f32] p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2 text-green-400">Top Downloader Hoje</h3>
                                        <p className="text-white">{stats.downloadStats.topDownloaderToday.name}</p>
                                        <p className="text-sm text-gray-400">{stats.downloadStats.topDownloaderToday.email}</p>
                                        <p className="text-sm text-blue-400">{stats.downloadStats.topDownloaderToday.downloadCount} downloads</p>
                                        <span className={`inline-block px-2 py-1 rounded text-xs ${stats.downloadStats.topDownloaderToday.is_vip ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                                            {stats.downloadStats.topDownloaderToday.is_vip ? 'VIP' : 'FREE'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-[#2d2f32] p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2 text-green-400">Top Downloader Hoje</h3>
                                        <p className="text-gray-400">Nenhum download hoje</p>
                                    </div>
                                )}

                                {stats.downloadStats.topDownloaderWeek ? (
                                    <div className="bg-[#2d2f32] p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2 text-purple-400">Top Downloader Semana</h3>
                                        <p className="text-white">{stats.downloadStats.topDownloaderWeek.name}</p>
                                        <p className="text-sm text-gray-400">{stats.downloadStats.topDownloaderWeek.email}</p>
                                        <p className="text-sm text-blue-400">{stats.downloadStats.topDownloaderWeek.downloadCount} downloads</p>
                                        <span className={`inline-block px-2 py-1 rounded text-xs ${stats.downloadStats.topDownloaderWeek.is_vip ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                                            {stats.downloadStats.topDownloaderWeek.is_vip ? 'VIP' : 'FREE'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-[#2d2f32] p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2 text-purple-400">Top Downloader Semana</h3>
                                        <p className="text-gray-400">Nenhum download esta semana</p>
                                    </div>
                                )}

                                {stats.downloadStats.topDownloaderMonth ? (
                                    <div className="bg-[#2d2f32] p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2 text-yellow-400">Top Downloader Mês</h3>
                                        <p className="text-white">{stats.downloadStats.topDownloaderMonth.name}</p>
                                        <p className="text-sm text-gray-400">{stats.downloadStats.topDownloaderMonth.email}</p>
                                        <p className="text-sm text-blue-400">{stats.downloadStats.topDownloaderMonth.downloadCount} downloads</p>
                                        <span className={`inline-block px-2 py-1 rounded text-xs ${stats.downloadStats.topDownloaderMonth.is_vip ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                                            {stats.downloadStats.topDownloaderMonth.is_vip ? 'VIP' : 'FREE'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="bg-[#2d2f32] p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2 text-yellow-400">Top Downloader Mês</h3>
                                        <p className="text-gray-400">Nenhum download este mês</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Estatísticas de Músicas */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Music className="text-purple-400" />
                                Músicas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Total de Músicas</p>
                                            <p className="text-2xl font-bold text-purple-400">{stats.trackStats.totalTracks}</p>
                                        </div>
                                        <Music className="text-purple-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Adicionadas Hoje</p>
                                            <p className="text-2xl font-bold text-green-400">{stats.trackStats.tracksAddedToday}</p>
                                        </div>
                                        <Calendar className="text-green-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Adicionadas Semana</p>
                                            <p className="text-2xl font-bold text-blue-400">{stats.trackStats.tracksAddedWeek}</p>
                                        </div>
                                        <TrendingUp className="text-blue-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Total de Likes</p>
                                            <p className="text-2xl font-bold text-red-400">{stats.likeStats.totalLikes}</p>
                                        </div>
                                        <Heart className="text-red-400" size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Músicas Populares e Recentes */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <h3 className="font-semibold mb-4 text-yellow-400">Música Mais Baixada</h3>
                                    {stats.trackStats.mostDownloadedTrack ? (
                                        <div>
                                            <p className="text-white font-medium">{stats.trackStats.mostDownloadedTrack.songName}</p>
                                            <p className="text-gray-400">{stats.trackStats.mostDownloadedTrack.artist}</p>
                                            <p className="text-sm text-blue-400">{stats.trackStats.mostDownloadedTrack.downloadCount} downloads</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">Nenhuma música baixada ainda</p>
                                    )}
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <h3 className="font-semibold mb-4 text-red-400">Música Mais Curtida</h3>
                                    {stats.trackStats.mostLikedTrack ? (
                                        <div>
                                            <p className="text-white font-medium">{stats.trackStats.mostLikedTrack.songName}</p>
                                            <p className="text-gray-400">{stats.trackStats.mostLikedTrack.artist}</p>
                                            <p className="text-sm text-red-400">{stats.trackStats.mostLikedTrack.likeCount} likes</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">Nenhuma música curtida ainda</p>
                                    )}
                                </div>
                            </div>

                            {/* Músicas Recentes */}
                            <div className="mt-6 bg-[#2d2f32] p-4 rounded-lg">
                                <h3 className="font-semibold mb-4 text-green-400">Músicas Adicionadas Recentemente</h3>
                                <div className="space-y-3">
                                    {stats.trackStats.recentTracks.map((track, index) => (
                                        <div key={track.id} className="flex items-center justify-between p-3 bg-[#1a1c1e] rounded">
                                            <div>
                                                <p className="text-white font-medium">{track.songName}</p>
                                                <p className="text-sm text-gray-400">{track.artist}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(track.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-blue-400">{track._count.downloads} downloads</p>
                                                <p className="text-sm text-red-400">{track._count.likes} likes</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas de Receita */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <DollarSign className="text-yellow-400" />
                                Receita
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Receita Total</p>
                                            <p className="text-2xl font-bold text-yellow-400">R$ {stats.revenueStats.totalRevenue.toFixed(2)}</p>
                                        </div>
                                        <DollarSign className="text-yellow-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Valor Médio por Usuário</p>
                                            <p className="text-2xl font-bold text-green-400">R$ {stats.revenueStats.averageUserValue.toFixed(2)}</p>
                                        </div>
                                        <Users className="text-green-400" size={24} />
                                    </div>
                                </div>

                                <div className="bg-[#2d2f32] p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3 text-blue-400">Distribuição de Planos</h3>
                                    <div className="space-y-2">
                                        {stats.revenueStats.vipPlansDistribution.map((plan, index) => (
                                            <div key={index} className="flex justify-between">
                                                <span className="text-gray-400">R$ {parseFloat(plan.valor?.toString() || '0').toFixed(2)}</span>
                                                <span className="text-white">{plan._count.valor} usuários</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold mb-4">Erro ao carregar dados</h2>
                        <p className="text-gray-400 mb-4">Não foi possível carregar as estatísticas do dashboard.</p>
                        <button
                            onClick={fetchStats}
                            className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
