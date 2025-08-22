"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Calendar, Award, Play, Download, Heart, Clock, Star, Music, Pause, Crown, Trophy, Headphones, Disc, Zap, Users, Target, BarChart3, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import FooterSpacer from '@/components/layout/FooterSpacer';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToastContext } from '@/context/ToastContext';
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

interface ArtistStats {
    totalDownloads: number;
    totalLikes: number;
    totalPlays: number;
    uniqueGenres: number;
    uniquePools: number;
    latestRelease: string | null;
}

// Função para obter informações sobre artistas baseada em dados reais
const getArtistInfo = (artistName: string, stats: ArtistStats | null): string => {
    // Se não temos estatísticas, retornar uma mensagem padrão
    if (!stats) {
        return `${artistName} é um artista presente em nossa plataforma.`;
    }

    // Gerar informações baseadas nos dados reais
    const totalDownloads = stats.totalDownloads || 0;
    const totalLikes = stats.totalLikes || 0;
    const uniqueGenres = stats.uniqueGenres || 0;
    const uniquePools = stats.uniquePools || 0;

    // Criar descrição baseada nos dados reais
    let description = `${artistName} é um artista ativo em nossa plataforma. `;

    if (totalDownloads > 0) {
        description += `Suas músicas já foram baixadas ${totalDownloads} vez${totalDownloads !== 1 ? 'es' : ''}. `;
    }

    if (totalLikes > 0) {
        description += `Recebeu ${totalLikes} curtida${totalLikes !== 1 ? 's' : ''} dos usuários. `;
    }

    if (uniqueGenres > 0) {
        description += `Seu trabalho abrange ${uniqueGenres} estilo${uniqueGenres !== 1 ? 's' : ''} musical${uniqueGenres !== 1 ? 'is' : ''}. `;
    }

    if (uniquePools > 0) {
        description += `Suas músicas estão disponíveis em ${uniquePools} gravadora${uniquePools !== 1 ? 's' : ''} ou plataforma${uniquePools !== 1 ? 's' : ''}.`;
    }

    return description;
};

export default function TrendingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { playTrack, currentTrack, isPlaying } = useGlobalPlayer();
    const { showToast } = useToastContext();

    const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedTracksSet, setLikedTracksSet] = useState<Set<number>>(new Set());
    const [liking, setLiking] = useState<number | null>(null);
    const [artistStats, setArtistStats] = useState<Record<string, ArtistStats>>({});
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        activeUsers: 16,
        trendingScore: 0
    });

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
                // Get current week tracks (week 1) and filter out invalid artists
                const currentWeekTracks = data.tracks
                    .filter((track: TrendingTrack) =>
                        track.weekNumber === 1 &&
                        track.artist &&
                        track.artist.trim() !== '' &&
                        track.artist !== 'Artista Desconhecido' &&
                        track.artist !== 'Unknown Artist' &&
                        track.artist !== 'N/A'
                    );

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

                // Buscar estatísticas dos artistas únicos
                await fetchArtistStats(currentWeekTracks);
            }
        } catch (error) {
            console.error('Error fetching trending tracks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Buscar estatísticas dos artistas
    const fetchArtistStats = async (tracks: TrendingTrack[]) => {
        try {
            // Obter artistas únicos e filtrar inválidos
            const uniqueArtists = [...new Set(tracks.map(track => track.artist))]
                .filter(artistName =>
                    artistName &&
                    artistName.trim() !== '' &&
                    artistName !== 'Artista Desconhecido' &&
                    artistName !== 'Unknown Artist' &&
                    artistName !== 'N/A'
                );

            // Buscar estatísticas para cada artista
            const artistStatsPromises = uniqueArtists.map(async (artistName) => {
                try {
                    const response = await fetch(`/api/tracks/artist/${encodeURIComponent(artistName)}/stats`);
                    if (response.ok) {
                        const stats = await response.json();
                        return { artistName, stats };
                    }
                } catch (error) {
                    console.error(`Error fetching stats for ${artistName}:`, error);
                }
                return { artistName, stats: null };
            });

            const results = await Promise.all(artistStatsPromises);
            const newArtistStats: Record<string, ArtistStats> = {};

            results.forEach(({ artistName, stats }) => {
                if (stats) {
                    newArtistStats[artistName] = stats;
                }
            });

            setArtistStats(newArtistStats);
        } catch (error) {
            console.error('Error fetching artist stats:', error);
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
        fetchActiveUsers();
    }, [session?.user?.id]);

    // Play functionality
    const handlePlay = (track: TrendingTrack) => {
        if (!session) {
            showToast('🔐 Faça login para ouvir músicas', 'warning');
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
            version: 'original',
            previewUrl: track.downloadUrl,
            releaseDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            __v: 0,
            updatedAt: new Date().toISOString(),
            pool: 'Nexor Records'
        };

        if (currentTrack?.id === track.id) {
            // Se é a mesma música, apenas toggle play/pause
            // togglePlayPause(); // Implementar se necessário
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

    // Download functionality
    const handleDownload = async (track: TrendingTrack) => {
        if (!session?.user?.is_vip) {
            showToast('🔐 Apenas usuários VIP podem fazer downloads', 'warning');
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
                            showToast('❌ Erro ao baixar arquivo da música', 'error');
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

                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error('Error downloading file:', error);
                        showToast('❌ Erro ao baixar arquivo da música', 'error');
                        return;
                    }
                }
                showToast(`✅ "${track.songName}" baixada com sucesso!`, 'success');
            } else {
                const errorData = await response.json();
                if (errorData.needsConfirmation) {
                    showToast(`🔄 Você já baixou "${track.songName}" nas últimas 24h. Clique novamente para baixar.`, 'warning');
                } else {
                    showToast(`❌ ${errorData.error || 'Erro ao baixar música'}`, 'error');
                }
            }
        } catch (error) {
            showToast('❌ Erro ao baixar música', 'error');
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

                    setTrendingTracks(prev => prev.map(track =>
                        track.id === trackId
                            ? { ...track, likeCount: (track.likeCount || 0) + 1 }
                            : track
                    ));
                } else {
                    newLikedTracksSet.delete(trackId);
                    showToast('💔 Música removida dos favoritos', 'info');

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

    const goBack = () => {
        router.back();
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#121212] overflow-x-hidden">
                {/* Header */}
                <div className="w-full max-w-6xl mx-auto mt-4 sm:mt-8 mb-8 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={goBack}
                            className="p-2 bg-[#181818] hover:bg-[#282828] rounded-lg text-white transition-all duration-300 hover:scale-105"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                                Trending Chart
                            </h1>
                            <p className="text-[#b3b3b3] text-sm sm:text-base mt-2">
                                As músicas mais quentes da semana
                            </p>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Download className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#1db954] mb-1">
                                {stats.totalDownloads.toLocaleString()}
                            </div>
                            <div className="text-[#b3b3b3] text-sm">Downloads da Semana</div>
                        </div>

                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#1db954] mb-1">
                                {stats.totalLikes.toLocaleString()}
                            </div>
                            <div className="text-[#b3b3b3] text-sm">Likes da Semana</div>
                        </div>

                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#1db954] mb-1">
                                {stats.activeUsers.toLocaleString()}
                            </div>
                            <div className="text-[#b3b3b3] text-sm">Usuários Ativos</div>
                        </div>

                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#1db954] mb-1">
                                {stats.trendingScore.toLocaleString()}
                            </div>
                            <div className="text-[#b3b3b3] text-sm">Score Trending</div>
                        </div>
                    </div>

                    {/* Seção de Login */}
                    {!session && (
                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-6 border border-[#282828]/50 text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center">
                                    <Headphones className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-white text-xl font-bold">Acesse o Trending</h2>
                            </div>
                            <p className="text-[#b3b3b3] mb-6 max-w-2xl mx-auto">
                                Faça login para ouvir as prévias, curtir músicas e baixar as faixas mais populares da semana.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/auth/sign-in">
                                    <button className="bg-[#1db954] hover:bg-[#1ed760] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                                        Fazer Login
                                    </button>
                                </Link>
                                <Link href="/auth/sign-up">
                                    <button className="bg-[#282828] hover:bg-[#3e3e3e] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                                        Criar Conta
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Como Funciona o Trending - Seção Colorida e Top */}
                    <div className="bg-gradient-to-br from-[#1db954]/10 via-[#1ed760]/5 to-[#1db954]/10 backdrop-blur-sm rounded-2xl p-8 border border-[#1db954]/20 mb-8 relative overflow-hidden">
                        {/* Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1db954]/5 to-[#1ed760]/5"></div>
                        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#1db954]/20 to-transparent rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-[#1ed760]/20 to-transparent rounded-full blur-3xl"></div>

                        <div className="relative z-10 text-center">
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#1db954] via-[#1ed760] to-[#1db954] rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <div className="w-2 h-12 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                                <h3 className="text-white text-3xl font-bold bg-gradient-to-r from-[#1db954] to-[#1ed760] bg-clip-text text-transparent">
                                    Como Funciona o Trending
                                </h3>
                                <div className="w-2 h-12 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                            </div>

                            <p className="text-[#b3b3b3] mb-12 max-w-4xl mx-auto text-lg leading-relaxed">
                                Nossa análise de trending é baseada no número real de downloads das músicas.
                                As faixas que aparecem aqui são as que mais estão sendo baixadas pelos DJs da comunidade.
                                Um sistema transparente e justo para todos.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                                <div className="text-center group transform hover:scale-105 transition-all duration-500">
                                    <div className="bg-gradient-to-br from-[#1db954]/20 to-[#1ed760]/20 p-6 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 border border-[#1db954]/30 group-hover:border-[#1db954]/50">
                                        <Download className="h-10 w-10 text-[#1db954] group-hover:text-[#1ed760] transition-colors duration-300" />
                                    </div>
                                    <h4 className="font-bold text-white mb-4 text-xl group-hover:text-[#1db954] transition-colors duration-300">Downloads Reais</h4>
                                    <p className="text-sm text-[#b3b3b3] leading-relaxed group-hover:text-white transition-colors duration-300">
                                        Baseado em downloads efetivos da plataforma. Sem manipulação, apenas dados autênticos da comunidade.
                                    </p>
                                </div>

                                <div className="text-center group transform hover:scale-105 transition-all duration-500">
                                    <div className="bg-gradient-to-br from-[#1ed760]/20 to-[#1db954]/20 p-6 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 border border-[#1ed760]/30 group-hover:border-[#1ed760]/50">
                                        <Clock className="h-10 w-10 text-[#1ed760] group-hover:text-[#1db954] transition-colors duration-300" />
                                    </div>
                                    <h4 className="font-bold text-white mb-4 text-xl group-hover:text-[#1ed760] transition-colors duration-300">Atualização Semanal</h4>
                                    <p className="text-sm text-[#b3b3b3] leading-relaxed group-hover:text-white transition-colors duration-300">
                                        Ranking atualizado todo domingo à meia-noite. Acompanhe as tendências em tempo real.
                                    </p>
                                </div>

                                <div className="text-center group transform hover:scale-105 transition-all duration-500">
                                    <div className="bg-gradient-to-br from-[#1db954]/20 to-[#1ed760]/20 p-6 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 border border-[#1db954]/30 group-hover:border-[#1db954]/50">
                                        <Star className="h-10 w-10 text-[#1db954] group-hover:text-[#1ed760] transition-colors duration-300" />
                                    </div>
                                    <h4 className="font-bold text-white mb-4 text-xl group-hover:text-[#1db954] transition-colors duration-300">Top 40 Exclusivo</h4>
                                    <p className="text-sm text-[#b3b3b3] leading-relaxed group-hover:text-white transition-colors duration-300">
                                        As 40 músicas mais baixadas da semana. Qualidade garantida e curadoria premium.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Artistas em Destaque */}
                    {Object.keys(artistStats).length > 0 && (
                        <div className="bg-gradient-to-br from-[#1ed760]/10 via-[#1db954]/5 to-[#1ed760]/10 backdrop-blur-sm rounded-2xl p-8 border border-[#1ed760]/20 mb-8 relative overflow-hidden">
                            {/* Background Elements */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1ed760]/5 to-[#1db954]/5"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1ed760]/20 to-transparent rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#1db954]/20 to-transparent rounded-full blur-3xl"></div>

                            <div className="relative z-10 text-center">
                                <div className="flex items-center justify-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#1ed760] via-[#1db954] to-[#1ed760] rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                                        <Crown className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="w-2 h-12 bg-gradient-to-b from-[#1ed760] to-[#1db954] rounded-full"></div>
                                    <h3 className="text-white text-3xl font-bold bg-gradient-to-r from-[#1ed760] to-[#1db954] bg-clip-text text-transparent">
                                        Artistas em Destaque
                                    </h3>
                                    <div className="w-2 h-12 bg-gradient-to-b from-[#1ed760] to-[#1db954] rounded-full"></div>
                                </div>

                                <p className="text-[#b3b3b3] mb-8 max-w-4xl mx-auto text-lg leading-relaxed">
                                    Conheça os artistas que estão dominando o trending desta semana com suas músicas mais populares.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                    {Object.entries(artistStats).slice(0, 6).map(([artistName, stats]) => (
                                        <div key={artistName} className="text-left group transform hover:scale-105 transition-all duration-500">
                                            <div className="bg-[#181818]/60 backdrop-blur-sm rounded-xl p-6 border border-[#1ed760]/20 group-hover:border-[#1ed760]/40 transition-all duration-300">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-[#1ed760] to-[#1db954] rounded-xl flex items-center justify-center">
                                                        <Music className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white text-lg group-hover:text-[#1ed760] transition-colors duration-300">
                                                            {artistName}
                                                        </h4>
                                                        <div className="flex items-center gap-4 text-sm text-[#b3b3b3]">
                                                            <span className="flex items-center gap-1">
                                                                <Download className="h-3 w-3 text-[#1ed760]" />
                                                                {stats.totalDownloads}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Heart className="h-3 w-3 text-[#1ed760]" />
                                                                {stats.totalLikes}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[#b3b3b3] text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
                                                    {getArtistInfo(artistName, stats)}
                                                </p>
                                                <div className="mt-4 pt-4 border-t border-[#1ed760]/20">
                                                    <Link href={`/artist/${encodeURIComponent(artistName)}`}>
                                                        <button className="w-full bg-gradient-to-r from-[#1ed760] to-[#1db954] hover:from-[#1db954] hover:to-[#1ed760] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105">
                                                            Ver Perfil Completo
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-20 h-20 border-4 border-[#1db954]/30 border-t-[#1db954] rounded-full animate-spin mx-auto mb-6"></div>
                                <h3 className="text-xl font-semibold text-white mb-2">Carregando Trending</h3>
                                <p className="text-[#b3b3b3]">Analisando as músicas mais populares...</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Current Week Tracks */}
                        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24 mb-8">
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="w-2 h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                                    <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                                        Semana Atual - Top 40
                                    </h2>
                                    <div className="w-2 h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                                </div>
                                <p className="text-[#b3b3b3] text-sm sm:text-base max-w-2xl mx-auto">
                                    Ranking baseado em downloads reais da comunidade
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {trendingTracks
                                    .filter(track =>
                                        track.artist &&
                                        track.artist.trim() !== '' &&
                                        track.artist !== 'Artista Desconhecido' &&
                                        track.artist !== 'Unknown Artist' &&
                                        track.artist !== 'N/A'
                                    )
                                    .slice(0, 40)
                                    .map((track, index) => (
                                        <div key={track.id} className="group relative">
                                            {/* Position Badge */}
                                            <div className="absolute -top-3 -right-3 z-20">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                                                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' :
                                                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                                                            'bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white'
                                                    }`}>
                                                    {index === 0 ? <Trophy className="h-4 w-4" /> : `#${index + 1}`}
                                                </div>
                                            </div>

                                            {/* Card */}
                                            <div className="bg-[#181818] rounded-xl border border-[#282828] p-4 hover:border-[#1db954]/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#1db954]/20">

                                                {/* Thumbnail */}
                                                <div className="relative mb-4">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-[#282828]">
                                                        {track.imageUrl ? (
                                                            <img
                                                                src={track.imageUrl}
                                                                alt={`${track.artist} - ${track.songName}`}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Music className="h-12 w-12 text-[#535353]" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Play Button Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <button
                                                            onClick={() => handlePlay(track)}
                                                            className={`bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-all duration-300 ${currentTrack?.id === track.id && isPlaying ? 'bg-[#1db954]/80' : ''
                                                                }`}
                                                        >
                                                            {isPlaying && currentTrack?.id === track.id ?
                                                                <Pause className="h-5 w-5 text-white" /> :
                                                                <Play className="h-5 w-5 text-white ml-0.5" />
                                                            }
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Track Info */}
                                                <div className="space-y-3">
                                                    {/* Artista */}
                                                    <p className="text-[#b3b3b3] text-xs truncate text-center">
                                                        {track.artist}
                                                    </p>
                                                    {/* Nome da faixa */}
                                                    <h3 className="font-bold text-white text-sm truncate group-hover:text-[#1db954] transition-colors text-center">
                                                        {track.songName}
                                                    </h3>

                                                    {/* Style Tag */}
                                                    <div className="flex justify-center">
                                                        <span className="inline-block bg-[#1db954]/20 text-[#1db954] text-xs px-2 py-1 rounded-full border border-[#1db954]/30">
                                                            {track.style}
                                                        </span>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1 text-[#1db954]">
                                                            <Download className="h-3 w-3" />
                                                            <span>{track.downloadCount}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[#b3b3b3]">
                                                            <Heart className="h-3 w-3" />
                                                            <span>{track.likeCount || 0}</span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleDownload(track)}
                                                            disabled={!session?.user?.is_vip}
                                                            className={`flex-1 bg-[#1db954] hover:bg-[#1ed760] text-white py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${!session?.user?.is_vip ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                            title={!session?.user?.is_vip ? 'Apenas usuários VIP podem fazer downloads' : 'Baixar música'}
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            Baixar
                                                        </button>
                                                        <button
                                                            onClick={() => handleLikeClick(track.id)}
                                                            disabled={!session?.user?.id || liking === track.id}
                                                            className={`bg-[#282828] hover:bg-[#3e3e3e] text-white p-2 rounded-lg transition-all duration-300 ${likedTracksSet.has(track.id) ? 'bg-[#1db954]/80 hover:bg-[#1ed760]/80' : ''
                                                                } ${liking === track.id ? 'opacity-50 cursor-not-allowed' : ''} ${!session?.user?.id ? 'opacity-50 cursor-not-allowed' : ''
                                                                }`}
                                                            title={!session?.user?.id ? 'Faça login para curtir músicas' : likedTracksSet.has(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                        >
                                                            {liking === track.id ? (
                                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <Heart className={`h-3 w-3 ${likedTracksSet.has(track.id) ? 'fill-[#1db954] text-[#1db954]' : 'text-[#b3b3b3]'
                                                                    }`} />
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
                        {trendingTracks.filter(track =>
                            track.artist &&
                            track.artist.trim() !== '' &&
                            track.artist !== 'Artista Desconhecido' &&
                            track.artist !== 'Unknown Artist' &&
                            track.artist !== 'N/A'
                        ).length === 0 && (
                                <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
                                    <div className="text-center py-20">
                                        <div className="bg-[#282828] rounded-xl inline-block p-8 mb-6">
                                            <TrendingUp className="h-16 w-16 text-[#535353] mx-auto" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4">Nenhuma música encontrada</h3>
                                        <p className="text-[#b3b3b3] mb-8">Não há dados de trending para esta semana.</p>
                                        <Link href="/new">
                                            <button className="bg-[#1db954] hover:bg-[#1ed760] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                                                Explorar Músicas
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}


                    </>
                )}

                <FooterSpacer />
            </div>
        </MainLayout>
    );
}
