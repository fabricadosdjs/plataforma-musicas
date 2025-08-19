"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import { TrendingUp, Calendar, Award, Play, Download, Heart, Clock, Star, Music, Pause, Upload, Edit3, Zap, Users, Target, BarChart3, Crown, Trophy, Headphones, Disc } from 'lucide-react';
import NewFooter from '@/components/layout/NewFooter';
import { useAppContext } from '@/context/AppContext';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import { useToastContext } from '@/context/ToastContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Track } from '@/types/track';

interface TrendingTrack {
    id: number;
    songName: string;
    artist: string;
    imageUrl: string;
    style: string;
    downloadCount: number;
    likeCount?: number;
    downloadUrl: string;
    weekNumber: number;
    weekStart: string;
}

function TrendingPageContent() {
    const { data: session } = useSession();
    const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedTracksSet, setLikedTracksSet] = useState<Set<number>>(new Set());
    const [liking, setLiking] = useState<number | null>(null);
    const [editingImage, setEditingImage] = useState<number | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        activeUsers: 16, // Valor padrão baseado no que o usuário mencionou
        trendingScore: 0
    });

    // Audio player context
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAppContext();
    const { showToast } = useToastContext();

    // Check if user is admin
    const isAdmin = session?.user?.email === 'admin@djpool.com' ||
        session?.user?.name === 'Admin' ||
        session?.user?.email === 'edersonleonardo@nexorrecords.com.br';

    const fetchTrendingTracks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tracks/trending');
            if (response.ok) {
                const data = await response.json();
                // Get current week tracks (week 1)
                const currentWeekTracks = data.tracks.filter((track: TrendingTrack) => track.weekNumber === 1);
                setTrendingTracks(currentWeekTracks);

                // Calculate stats
                const totalDownloads = currentWeekTracks.reduce((sum: number, track: TrendingTrack) => sum + track.downloadCount, 0);
                const totalLikes = currentWeekTracks.reduce((sum: number, track: TrendingTrack) => sum + (track.likeCount || 0), 0);
                const trendingScore = Math.round((totalDownloads * 0.7) + (totalLikes * 0.3));

                setStats(prevStats => ({
                    ...prevStats,
                    totalDownloads,
                    totalLikes,
                    trendingScore
                }));
            }
        } catch (error) {
            console.error('Error fetching trending tracks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Buscar usuários ativos do banco de dados
    const fetchActiveUsers = async () => {
        try {
            const response = await fetch('/api/stats/active-users-today');
            if (response.ok) {
                const data = await response.json();
                setStats(prevStats => ({
                    ...prevStats,
                    activeUsers: data.activeUsersToday
                }));
            }
        } catch (error) {
            console.error('Error fetching active users:', error);
            // Manter o valor padrão de 16 em caso de erro
        }
    };

    // Fetch user likes
    const fetchLikes = async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch('/api/likes');
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data.likedTracks)) {
                setLikedTracksSet(new Set(data.likedTracks));
            }
        } catch (err) { }
    };

    useEffect(() => {
        fetchTrendingTracks();
        fetchLikes();
        fetchActiveUsers(); // Buscar usuários ativos do banco
    }, [session?.user?.id]);

    // Play functionality
    const handlePlay = (track: TrendingTrack) => {
        if (!session) {
            alert('Faça login para ouvir a prévia');
            return;
        }

        // Convert TrendingTrack to Track type
        const trackForPlayer = {
            id: track.id,
            songName: track.songName,
            artist: track.artist,
            style: track.style,
            downloadUrl: track.downloadUrl,
            imageUrl: track.imageUrl,
            version: 'original', // Default value
            previewUrl: track.downloadUrl, // Use downloadUrl as preview
            releaseDate: new Date().toISOString(), // Default value
            createdAt: new Date().toISOString(), // Added
            __v: 0, // Add missing property
            updatedAt: new Date().toISOString(), // Added
            pool: 'Nexor Records' // Added
        };

        if (currentTrack?.id === track.id) {
            // Se é a mesma música, apenas toggle play/pause
            togglePlayPause();
        } else {
            // Se é uma música diferente, toca ela
            playTrack(trackForPlayer, trendingTracks.map(t => ({
                id: t.id,
                songName: t.songName,
                artist: t.artist,
                style: t.style,
                downloadUrl: t.downloadUrl,
                imageUrl: t.imageUrl,
                version: 'original',
                previewUrl: t.downloadUrl,
                releaseDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                pool: 'Nexor Records',
                __v: 0
            })));
        }
    };

    // Download functionality with forced download
    const handleDownload = async (track: TrendingTrack) => {
        if (!session?.user?.is_vip) {
            alert('Apenas usuários VIP podem fazer downloads');
            return;
        }

        try {
            const response = await fetch('/api/downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id }),
            });

            if (response.ok) {
                // Force download using blob
                if (track.downloadUrl) {
                    try {
                        const fileRes = await fetch(track.downloadUrl);
                        if (!fileRes.ok) {
                            alert('Erro ao baixar arquivo da música');
                            return;
                        }
                        const blob = await fileRes.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `${track.artist} - ${track.songName}.mp3`);
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);

                        // Small delay to ensure download starts
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error('Error downloading file:', error);
                        alert('Erro ao baixar arquivo da música');
                        return;
                    }
                }
                alert(`✅ "${track.songName}" baixada com sucesso!`);
            } else {
                const errorData = await response.json();
                if (errorData.needsConfirmation) {
                    alert(`🔄 Você já baixou "${track.songName}" nas últimas 24h. Clique novamente para baixar.`);
                } else {
                    alert(`❌ ${errorData.error || 'Erro ao baixar música'}`);
                }
            }
        } catch (error) {
            alert('❌ Erro ao baixar música');
        }
    };

    // Like functionality
    const handleLikeClick = async (trackId: number) => {
        if (!session?.user?.id) {
            showToast('🔐 Faça login para curtir músicas', 'warning');
            return;
        }

        if (liking === trackId) return;

        setLiking(trackId);
        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId }),
            });

            if (response.ok) {
                const data = await response.json();
                const newLikedTracksSet = new Set(likedTracksSet);

                if (data.liked) {
                    newLikedTracksSet.add(trackId);
                    showToast('❤️ Música adicionada aos favoritos!', 'success');

                    // Atualizar contagem de likes localmente
                    setTrendingTracks(prev => prev.map(track =>
                        track.id === trackId
                            ? { ...track, likeCount: (track.likeCount || 0) + 1 }
                            : track
                    ));
                } else {
                    newLikedTracksSet.delete(trackId);
                    showToast('💔 Música removida dos favoritos', 'info');

                    // Atualizar contagem de likes localmente
                    setTrendingTracks(prev => prev.map(track =>
                        track.id === trackId
                            ? { ...track, likeCount: Math.max(0, (track.likeCount || 0) - 1) }
                            : track
                    ));
                }

                setLikedTracksSet(newLikedTracksSet);
            } else {
                const errorData = await response.json();
                showToast(`❌ ${errorData.error || 'Erro ao processar like'}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao curtir música:', error);
            showToast('❌ Erro de conexão ao processar like', 'error');
        } finally {
            setLiking(null);
        }
    };

    // Admin functionality for updating cover image
    const handleImageUpdate = async (trackId: number) => {
        if (!isAdmin) return;

        try {
            const response = await fetch('/api/tracks/update-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId, imageUrl }),
            });

            if (response.ok) {
                // Update local state
                setTrendingTracks(prev => prev.map(track =>
                    track.id === trackId
                        ? { ...track, imageUrl }
                        : track
                ));
                setEditingImage(null);
                setImageUrl('');
                alert('Capa atualizada com sucesso!');
            } else {
                alert('Erro ao atualizar capa');
            }
        } catch (error) {
            alert('Erro ao atualizar capa');
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="relative z-10 pt-20 pb-8">
                {/* Hero Section - Trending Stats */}
                <div className="container mx-auto px-4 mb-12">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                                    <TrendingUp className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute -inset-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl blur opacity-30 animate-ping"></div>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                                    TRENDING CHART
                                </h1>
                                <p className="text-gray-300 text-lg mt-2">As músicas mais quentes da semana</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Download className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{stats.totalDownloads.toLocaleString()}</h3>
                            <p className="text-yellow-300 text-sm">Downloads da Semana</p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl border border-pink-500/30 p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{stats.totalLikes.toLocaleString()}</h3>
                            <p className="text-pink-300 text-sm">Likes da Semana</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{stats.activeUsers.toLocaleString()}</h3>
                            <p className="text-purple-300 text-sm">Usuários Ativos</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl border border-emerald-500/30 p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{stats.trendingScore.toLocaleString()}</h3>
                            <p className="text-emerald-300 text-sm">Score Trending</p>
                        </div>
                    </div>

                    {/* Cards de Recursos do Trending */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-6 group hover:border-yellow-500/40 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                    <Target className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Ranking Real</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Baseado em downloads reais e engajamento da comunidade.
                                Sem manipulação, apenas dados autênticos.
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-pink-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl border border-pink-500/20 p-6 group hover:border-pink-500/40 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Atualização Semanal</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Novo ranking toda semana. Acompanhe as tendências
                                e descubra as músicas que estão bombando.
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 group hover:border-purple-500/40 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                    <Crown className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Top 40 Exclusivo</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                As 40 músicas mais populares da semana.
                                Qualidade garantida e curadoria premium.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Login/Register Section */}
                {!session && (
                    <div className="container mx-auto px-4 mb-12">
                        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-8 text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <Headphones className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Acesse o Trending</h2>
                            </div>
                            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                                Faça login para ouvir as prévias, curtir músicas e baixar as faixas mais populares da semana.
                                Junte-se à comunidade de DJs e descubra o que está bombando!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/auth/sign-in">
                                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                                        Fazer Login
                                    </button>
                                </Link>
                                <Link href="/auth/sign-up">
                                    <button className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                                        Criar Conta
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-yellow-600/30 border-t-yellow-600 rounded-full animate-spin mx-auto mb-6"></div>
                                <TrendingUp className="h-8 w-8 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Carregando Trending</h3>
                            <p className="text-gray-400">Analisando as músicas mais populares...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Current Week Tracks */}
                        <div className="container mx-auto px-4 mb-12">
                            <div className="flex items-center justify-center mb-8">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                                        <Award className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="absolute -inset-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl blur opacity-30 animate-pulse"></div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-white mb-2">
                                        Semana Atual - Top 40
                                    </h2>
                                    <p className="text-gray-400">Ranking baseado em downloads reais</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {trendingTracks.slice(0, 40).map((track, index) => (
                                    <div key={track.id} className="group relative">
                                        {/* Position Badge */}
                                        <div className="absolute -top-3 -right-3 z-20">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 animate-bounce' :
                                                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' :
                                                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                                                        'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                                                }`}>
                                                {index === 0 ? <Trophy className="h-5 w-5" /> : `#${index + 1}`}
                                            </div>
                                        </div>

                                        {/* Card */}
                                        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-yellow-500/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-yellow-500/20">

                                            {/* Thumbnail */}
                                            <div className="relative mb-4">
                                                <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                                                    {track.imageUrl ? (
                                                        <Image
                                                            src={track.imageUrl}
                                                            alt={`${track.artist} - ${track.songName}`}
                                                            width={300}
                                                            height={300}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Music className="h-16 w-16 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <button
                                                        onClick={() => handlePlay(track)}
                                                        className={`bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-all duration-300 ${currentTrack?.id === track.id && isPlaying ? 'bg-blue-600/80' : ''
                                                            }`}
                                                    >
                                                        {isPlaying && currentTrack?.id === track.id ?
                                                            <Pause className="h-6 w-6 text-white" /> :
                                                            <Play className="h-6 w-6 text-white ml-1" />
                                                        }
                                                    </button>
                                                </div>

                                                {/* Admin Edit Image Button */}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setEditingImage(track.id)}
                                                        className="absolute top-2 right-2 bg-blue-600/80 hover:bg-blue-700/80 text-white p-2 rounded-lg transition-all duration-300"
                                                        title="Editar capa da música"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Track Info */}
                                            <div className="space-y-3">
                                                {/* Artista abaixo da capa */}
                                                <p className="text-gray-400 text-xs md:text-sm truncate mb-1 text-center">
                                                    {track.artist}
                                                </p>
                                                {/* Nome da faixa maior */}
                                                <h2 className="font-extrabold text-white text-lg md:text-xl truncate group-hover:text-yellow-300 transition-colors text-center">
                                                    {track.songName}
                                                </h2>

                                                {/* Style Tag */}
                                                <div className="flex justify-center">
                                                    <span className="inline-block bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
                                                        {track.style}
                                                    </span>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-1 text-yellow-400">
                                                        <Download className="h-4 w-4" />
                                                        <span>{track.downloadCount}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-pink-400">
                                                        <Heart className="h-4 w-4" />
                                                        <span>{track.likeCount || 0}</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => handleDownload(track)}
                                                        disabled={!session?.user?.is_vip}
                                                        className={`flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${!session?.user?.is_vip ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        title={!session?.user?.is_vip ? 'Apenas usuários VIP podem fazer downloads' : 'Baixar música'}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Baixar
                                                    </button>
                                                    <button
                                                        onClick={() => handleLikeClick(track.id)}
                                                        disabled={!session?.user?.id || liking === track.id}
                                                        className={`bg-gray-700/50 hover:bg-gray-600/50 text-white p-2 rounded-lg transition-all duration-300 ${likedTracksSet.has(track.id) ? 'bg-pink-600/80 hover:bg-pink-700/80' : ''
                                                            } ${liking === track.id ? 'opacity-50 cursor-not-allowed' : ''} ${!session?.user?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title={!session?.user?.id ? 'Faça login para curtir músicas' : likedTracksSet.has(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                    >
                                                        {liking === track.id ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <Heart className={`h-4 w-4 ${likedTracksSet.has(track.id) ? 'fill-pink-400 text-pink-200' : 'text-gray-300'}`} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Empty State */}
                        {trendingTracks.length === 0 && (
                            <div className="container mx-auto px-4">
                                <div className="text-center py-20">
                                    <div className="bg-gray-800/50 rounded-2xl inline-block p-8 mb-6">
                                        <TrendingUp className="h-16 w-16 text-gray-400 mx-auto" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Nenhuma música encontrada</h3>
                                    <p className="text-gray-400 mb-8">Não há dados de trending para esta semana.</p>
                                    <Link href="/new">
                                        <button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                                            Explorar Músicas
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Info Section */}
                        <div className="container mx-auto px-4">
                            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border border-yellow-500/20">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                            <Zap className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Como Funciona o Trending</h3>
                                    </div>
                                    <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                                        Nossa análise de trending é baseada no número real de downloads das músicas.
                                        As faixas que aparecem aqui são as que mais estão sendo baixadas pelos DJs da comunidade.
                                        Um sistema transparente e justo para todos.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                                        <div className="text-center group">
                                            <div className="bg-yellow-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Download className="h-8 w-8 text-yellow-400" />
                                            </div>
                                            <h4 className="font-semibold text-white mb-3 text-lg">Downloads Reais</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed">Baseado em downloads efetivos da plataforma. Sem manipulação, apenas dados autênticos da comunidade.</p>
                                        </div>

                                        <div className="text-center group">
                                            <div className="bg-pink-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Clock className="h-8 w-8 text-pink-400" />
                                            </div>
                                            <h4 className="font-semibold text-white mb-3 text-lg">Atualização Semanal</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed">Ranking atualizado todo domingo à meia-noite. Acompanhe as tendências em tempo real.</p>
                                        </div>

                                        <div className="text-center group">
                                            <div className="bg-purple-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Star className="h-8 w-8 text-purple-400" />
                                            </div>
                                            <h4 className="font-semibold text-white mb-3 text-lg">Top 40 Exclusivo</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed">As 40 músicas mais baixadas da semana. Qualidade garantida e curadoria premium.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Admin Image Edit Modal */}
                {editingImage && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-white mb-4">Editar Capa da Música</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        URL da Imagem
                                    </label>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://exemplo.com/imagem.jpg"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleImageUpdate(editingImage)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingImage(null);
                                            setImageUrl('');
                                        }}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Novo Footer */}
            <NewFooter />
        </div>
    );
}

export default function TrendingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAppContext();
    const { hasExtension, detectedExtensions } = useDownloadExtensionDetector();
    const { showToast } = useToastContext();
    const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<TrendingTrack | null>(null);
    const [imageUrl, setImageUrl] = useState('');

    // Verificar extensões quando há músicas trending
    useEffect(() => {
        if (trendingTracks.length > 0 && hasExtension && detectedExtensions.length > 0) {
            const extensionNames = detectedExtensions
                .map(ext => ext.charAt(0).toUpperCase() + ext.slice(1))
                .join(', ');

            const warningMessage = `⚠️ Extensão de download detectada: ${extensionNames}. O uso de extensões para baixar músicas é PROIBIDO e pode resultar no cancelamento do seu plano. Desative a extensão para continuar usando a plataforma.`;

            showToast(warningMessage, 'warning', 15000); // 15 segundos para páginas de música
        }
    }, [trendingTracks.length, hasExtension, detectedExtensions, showToast]);

    return (
        <div className="min-h-screen bg-black z-0" style={{ zIndex: 0 }}>
            <TrendingPageContent />
        </div>
    );
}
