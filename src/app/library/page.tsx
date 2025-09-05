'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    ListMusic,
    Music,
    User,
    Calendar,
    Eye,
    EyeOff,
    Play,
    Download,
    Trash2,
    RefreshCw,
    TrendingUp,
    Clock,
    Heart,
    Star,
    Zap,
    Crown,
    Sparkles,
    Layers,
    Activity
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LibrarySection from '@/components/profile/LibrarySection';

export default function LibraryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [libraryStats, setLibraryStats] = useState({
        totalPlaylists: 0,
        totalTracks: 0,
        totalDuration: 0,
        favoriteGenres: [],
        recentActivity: 0
    });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        loadLibraryStats();
        setLoading(false);
    }, [session, status, router]);

    const loadLibraryStats = async () => {
        try {
            const response = await fetch('/api/user/library/stats');
            if (response.ok) {
                const stats = await response.json();
                setLibraryStats(stats);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadLibraryStats();
        setTimeout(() => setRefreshing(false), 1000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Header />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        {/* Hero Section */}
                        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl p-8 border border-purple-500/20 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center border border-purple-400/30 backdrop-blur-sm">
                                            <Sparkles className="h-8 w-8 text-purple-300" />
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                                                Minha Biblioteca
                                            </h1>
                                            <p className="text-gray-300 text-lg">Suas playlists salvas e organizadas</p>
                                        </div>
                                    </div>

                                    {/* Botão de Atualizar Moderno */}
                                    <button
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-white rounded-xl border border-purple-400/30 backdrop-blur-sm transition-all duration-300 disabled:opacity-50"
                                        title="Atualizar biblioteca"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
                                        <span className="font-medium">{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cards de Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total de Playlists */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-400/20">
                                            <Layers className="h-6 w-6 text-purple-300" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-white">{libraryStats.totalPlaylists}</p>
                                            <p className="text-sm text-gray-400">Playlists</p>
                                        </div>
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">Total de Playlists</h3>
                                    <p className="text-gray-400 text-sm">Coleções salvas</p>
                                </div>
                            </div>

                            {/* Total de Músicas */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-400/20">
                                            <Music className="h-6 w-6 text-blue-300" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-white">{libraryStats.totalTracks}</p>
                                            <p className="text-sm text-gray-400">Músicas</p>
                                        </div>
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">Total de Músicas</h3>
                                    <p className="text-gray-400 text-sm">Faixas organizadas</p>
                                </div>
                            </div>

                            {/* Duração Total */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-400/20">
                                            <Clock className="h-6 w-6 text-green-300" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-white">{Math.floor(libraryStats.totalDuration / 60)}h</p>
                                            <p className="text-sm text-gray-400">Duração</p>
                                        </div>
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">Duração Total</h3>
                                    <p className="text-gray-400 text-sm">Tempo de reprodução</p>
                                </div>
                            </div>

                            {/* Atividade Recente */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-orange-400/20">
                                            <Activity className="h-6 w-6 text-orange-300" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-white">{libraryStats.recentActivity}</p>
                                            <p className="text-sm text-gray-400">Hoje</p>
                                        </div>
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">Atividade Recente</h3>
                                    <p className="text-gray-400 text-sm">Ações hoje</p>
                                </div>
                            </div>
                        </div>

                        {/* Seção de Playlists */}
                        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-3xl p-8 border border-gray-700/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-indigo-400/20">
                                    <ListMusic className="h-6 w-6 text-indigo-300" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Suas Playlists</h2>
                                    <p className="text-gray-400">Gerencie suas coleções musicais</p>
                                </div>
                            </div>

                            <LibrarySection />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
