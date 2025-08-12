"use client";
import React, { useState, useEffect } from 'react';
import {
    Eye,
    Headphones,
    Heart,
    Download,
    Flame,
    Star,
    Target,
    BarChart3,
    Zap,
    Users,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

interface Top100StatsProps {
    tracks: any[];
    lastUpdate: Date;
}

interface StatsData {
    onlineUsers: number;
    todayLikes: number;
    todayDownloads: number;
    todayPlays: number;
    likesGrowth: number;
    downloadsGrowth: number;
    playsGrowth: number;
    lastUpdate: string;
}

const Top100Stats = ({ tracks, lastUpdate }: Top100StatsProps) => {
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats/online-users');
                if (response.ok) {
                    const data = await response.json();
                    setStatsData(data);
                }
            } catch (error) {
                console.error('Erro ao buscar estatísticas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Atualizar a cada 30 segundos
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const totalViews = tracks.reduce((sum, track) => sum + track.views, 0);
    const totalPlays = tracks.reduce((sum, track) => sum + track.plays, 0);
    const totalLikes = tracks.reduce((sum, track) => sum + track.likes, 0);
    const totalDownloads = tracks.reduce((sum, track) => sum + track.downloads, 0);

    const risingTracks = tracks.filter(track => track.trend === 'hot' || track.trend === 'rising').length;
    const newTracks = tracks.filter(track => track.isNew).length;
    const exclusiveTracks = tracks.filter(track => track.isExclusive).length;

    const genreCounts: { [key: string]: number } = {};
    tracks.forEach(track => {
        const genre = track.style;
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    const mostPopularGenre = Object.entries(genreCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 1);

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
        return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 rounded-2xl p-6 border border-gray-700/50">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Estatísticas em Tempo Real</h2>
                <div className="flex items-center space-x-2 text-green-400">
                    <Zap className="h-5 w-5" />
                    <span className="text-sm">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl p-4 border border-blue-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Visualizações</p>
                            <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="flex items-center mt-2">
                        {statsData?.playsGrowth && statsData.playsGrowth > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${statsData?.playsGrowth && statsData.playsGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {statsData?.playsGrowth || 0}% hoje
                        </span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-4 border border-green-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Reproduções</p>
                            <p className="text-2xl font-bold text-white">{totalPlays.toLocaleString()}</p>
                        </div>
                        <Headphones className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="flex items-center mt-2">
                        {statsData?.playsGrowth && statsData.playsGrowth > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${statsData?.playsGrowth && statsData.playsGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {statsData?.playsGrowth || 0}% hoje
                        </span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 rounded-xl p-4 border border-pink-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Curtidas</p>
                            <p className="text-2xl font-bold text-white">{totalLikes.toLocaleString()}</p>
                        </div>
                        <Heart className="h-8 w-8 text-pink-400" />
                    </div>
                    <div className="flex items-center mt-2">
                        {statsData?.likesGrowth && statsData.likesGrowth > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${statsData?.likesGrowth && statsData.likesGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {statsData?.likesGrowth || 0}% hoje
                        </span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-4 border border-purple-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Downloads</p>
                            <p className="text-2xl font-bold text-white">{totalDownloads.toLocaleString()}</p>
                        </div>
                        <Download className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="flex items-center mt-2">
                        {statsData?.downloadsGrowth && statsData.downloadsGrowth > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${statsData?.downloadsGrowth && statsData.downloadsGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {statsData?.downloadsGrowth || 0}% hoje
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 rounded-xl p-4 border border-orange-700/50">
                    <div className="flex items-center space-x-3">
                        <Flame className="h-6 w-6 text-orange-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Tracks Trending</p>
                            <p className="text-xl font-bold text-white">{risingTracks}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 rounded-xl p-4 border border-yellow-700/50">
                    <div className="flex items-center space-x-3">
                        <Star className="h-6 w-6 text-yellow-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Novas Entradas</p>
                            <p className="text-xl font-bold text-white">{newTracks}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-4 border border-purple-700/50">
                    <div className="flex items-center space-x-3">
                        <Target className="h-6 w-6 text-purple-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Exclusivas</p>
                            <p className="text-xl font-bold text-white">{exclusiveTracks}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Gênero Mais Popular</p>
                            <p className="text-lg font-semibold text-white">{mostPopularGenre?.[0] || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm">Última Atualização</p>
                        <p className="text-sm text-gray-300">{getTimeAgo(lastUpdate)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Dados atualizados a cada 30s</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{statsData?.onlineUsers || 1} usuário{statsData?.onlineUsers !== 1 ? 's' : ''} online</span>
                </div>
            </div>
        </div>
    );
};

export default Top100Stats; 