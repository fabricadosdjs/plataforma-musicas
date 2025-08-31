"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Crown, TrendingUp, Trophy, BarChart3,
    Calendar, Users, Flame, Sparkles,
    Filter, Music, Star, Target, Download, Headphones
} from 'lucide-react';
import { Track } from '@/types/track';
import { useToastContext } from '@/context/ToastContext';
import { useUserData } from '@/hooks/useUserData';
import Header from '@/components/layout/Header';
import MusicTable from '@/components/music/MusicTable';
import clsx from 'clsx';

interface Top100Track extends Track {
    position: number;
    previousPosition?: number;
    change: 'up' | 'down' | 'new' | 'same';
    changeAmount?: number;
    trend: 'up' | 'down' | 'stable';
    views: number;
    plays: number;
    likes: number;
    downloads: number;
    score: number;
    isExclusive?: boolean;
    isNew?: boolean;
    isFeatured?: boolean;
    isHot?: boolean;
    isRising?: boolean;
}

interface Top100Response {
    tracks: Top100Track[];
    lastUpdate: string;
    total: number;
    metadata: {
        algorithm: string;
        weights: {
            downloads: number;
            likes: number;
            plays: number;
            newBonus: string;
        };
    };
}

const Top100Page = () => {
    const { data: session } = useSession();
    const { showToast } = useToastContext();
    const { userData } = useUserData();

    // Estados
    const [data, setData] = useState<Top100Response | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    // Carregar dados do Top 100
    const loadTop100 = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/top-100');

            if (!response.ok) {
                throw new Error('Falha ao carregar Top 100');
            }

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar Top 100:', err);
            setError('Erro ao carregar o ranking');
            showToast('Erro ao carregar o Top 100', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTop100();
    }, []);

    // Filtrar tracks baseado no filtro selecionado
    const getFilteredTracks = () => {
        if (!data?.tracks) return [];

        switch (selectedFilter) {
            case 'top10':
                return data.tracks.slice(0, 10);
            case 'rising':
                return data.tracks.filter(track => track.isRising);
            case 'new':
                return data.tracks.filter(track => track.isNew);
            case 'hot':
                return data.tracks.filter(track => track.isHot);
            case 'exclusive':
                return data.tracks.filter(track => track.isExclusive);
            default:
                return data.tracks;
        }
    };

    const filteredTracks = getFilteredTracks();

    // Obter informações de estatísticas
    const getStats = () => {
        if (!data?.tracks) return null;

        const totalDownloads = data.tracks.reduce((sum, track) => sum + track.downloads, 0);
        const totalLikes = data.tracks.reduce((sum, track) => sum + track.likes, 0);
        const totalPlays = data.tracks.reduce((sum, track) => sum + track.plays, 0);
        const newTracks = data.tracks.filter(track => track.isNew).length;
        const risingTracks = data.tracks.filter(track => track.isRising).length;

        return {
            totalDownloads,
            totalLikes,
            totalPlays,
            newTracks,
            risingTracks
        };
    };

    const stats = getStats();

    // Filtros disponíveis
    const filters = [
        { id: 'all', label: 'Todos', icon: Music, count: data?.tracks.length || 0 },
        { id: 'top10', label: 'Top 10', icon: Crown, count: Math.min(10, data?.tracks.length || 0) },
        { id: 'rising', label: 'Em Alta', icon: TrendingUp, count: stats?.risingTracks || 0 },
        { id: 'new', label: 'Novos', icon: Sparkles, count: stats?.newTracks || 0 },
        { id: 'hot', label: 'Populares', icon: Flame, count: data?.tracks.filter(t => t.isHot).length || 0 },
        { id: 'exclusive', label: 'Exclusivos', icon: Star, count: data?.tracks.filter(t => t.isExclusive).length || 0 }
    ];

    // Componente de estatísticas
    const StatsCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );

    // Componente de cabeçalho do ranking
    const RankingHeader = () => (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                    <Trophy className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Top 100 Mundial</h1>
                    <p className="text-white/80">As músicas mais populares do momento</p>
                </div>
            </div>

            {data && (
                <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Atualizado: {new Date(data.lastUpdate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Algoritmo: {data.metadata.algorithm}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{data.total} tracks ranqueadas</span>
                    </div>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Carregando Top 100...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                            <button
                                onClick={loadTop100}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <RankingHeader />

                {/* Estatísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <StatsCard
                            label="Total Downloads"
                            value={stats.totalDownloads}
                            icon={Download}
                            color="bg-green-500"
                        />
                        <StatsCard
                            label="Total Likes"
                            value={stats.totalLikes}
                            icon={Users}
                            color="bg-pink-500"
                        />
                        <StatsCard
                            label="Total Plays"
                            value={stats.totalPlays}
                            icon={Headphones}
                            color="bg-blue-500"
                        />
                        <StatsCard
                            label="Novas Tracks"
                            value={stats.newTracks}
                            icon={Sparkles}
                            color="bg-purple-500"
                        />
                        <StatsCard
                            label="Em Alta"
                            value={stats.risingTracks}
                            icon={TrendingUp}
                            color="bg-orange-500"
                        />
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros de Ranking
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Modo:</span>
                            <button
                                onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                                className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                            >
                                {viewMode === 'cards' ? 'Tabela' : 'Cards'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {filters.map((filter) => {
                            const Icon = filter.icon;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setSelectedFilter(filter.id)}
                                    className={clsx(
                                        'p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2',
                                        selectedFilter === filter.id
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-sm font-medium">{filter.label}</span>
                                    <span className="text-xs opacity-80">({filter.count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Seção do Ranking */}
                {filteredTracks.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Music className="h-6 w-6" />
                                {selectedFilter === 'all' ? 'Top 100 Mundial' :
                                    selectedFilter === 'top10' ? 'Top 10' :
                                        selectedFilter === 'rising' ? 'Músicas em Alta' :
                                            selectedFilter === 'new' ? 'Novos Lançamentos' :
                                                selectedFilter === 'hot' ? 'Mais Populares' :
                                                    'Exclusivos'}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    ({filteredTracks.length} {filteredTracks.length === 1 ? 'música' : 'músicas'})
                                </span>
                            </h2>
                        </div>

                        {/* Usar o MusicTable com as props corretas */}
                        <MusicTable
                            tracks={filteredTracks}
                            onDownload={() => loadTop100()}
                        />
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                        <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Nenhuma música encontrada
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Não há músicas para o filtro selecionado.
                        </p>
                        <button
                            onClick={() => setSelectedFilter('all')}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Ver Todas as Músicas
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Top100Page;
