"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Calendar, Award, Play, Download, Heart, Clock, Star, Music, Pause, Trophy, Headphones, Disc, Zap, Users, Target, BarChart3, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
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

export default function TrendingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { playTrack, currentTrack, isPlaying } = useGlobalPlayer();
    const { showToast } = useToastContext();

    const [trendingTracks, setTrendingTracks] = useState<TrendingTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedTracksSet, setLikedTracksSet] = useState<Set<number>>(new Set());
    const [liking, setLiking] = useState<number | null>(null);
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

            }
        } catch (error) {
            console.error('Error fetching trending tracks:', error);
        } finally {
            setLoading(false);
        }
    };



    // Buscar usuários ativos do banco de dados
    const fetchTrendingStats = async () => {
        try {
            const response = await fetch('/api/tracks/trending/stats');
            if (response.ok) {
                const data = await response.json();
                setStats({
                    totalDownloads: data.totalDownloads || 0,
                    totalLikes: data.totalLikes || 0,
                    activeUsers: data.activeUsers || 16,
                    trendingScore: data.trendingScore || 0
                });
            }
        } catch (error) {
            console.error('Erro ao buscar estatísticas do trending:', error);
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
        // Só executar se o componente estiver montado
        let isMounted = true;

        const loadData = async () => {
            try {
                await fetchTrendingTracks();
                if (isMounted) {
                    await fetchLikes();
                    await fetchTrendingStats();
                }
            } catch (error) {
                console.error('Erro ao carregar dados iniciais:', error);
            }
        };

        loadData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
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
        console.log('🔍 handleDownload chamado para track:', track.id);
        console.log('🔍 session.user:', session?.user);
        console.log('🔍 session.user.id:', session?.user?.id);

        if (!session?.user?.id) {
            console.log('❌ Usuário não logado, bloqueando download');
            showToast('🔐 Faça login para baixar músicas', 'warning');
            return;
        }

        console.log('✅ Usuário logado, prosseguindo com download');

        try {
            // Usar a mesma API da página /new para manter consistência
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.id || ''}`,
                },
                body: JSON.stringify({ trackId: track.id }),
            });

            console.log('🔍 Resposta da API:', response.status, response.statusText);

            if (response.ok) {
                console.log('✅ API retornou sucesso');
                const data = await response.json();
                console.log('🔍 Dados da API:', data);

                if (!data.downloadUrl) {
                    console.error('❌ URL de download não disponível nos dados:', data);
                    showToast('❌ URL de download não disponível', 'error');
                    return;
                }

                console.log('🔍 Fazendo download via proxy:', data.downloadUrl);

                // Fazer download do arquivo via nosso proxy (mesma lógica da página /new)
                const downloadResponse = await fetch(data.downloadUrl);
                console.log('🔍 Download response status:', downloadResponse.status, downloadResponse.statusText);

                if (!downloadResponse.ok) {
                    console.error('❌ Erro na resposta do download:', downloadResponse.status, downloadResponse.statusText);

                    let errorMessage = `Erro ao baixar arquivo: ${downloadResponse.status}`;

                    if (downloadResponse.status === 404) {
                        errorMessage = 'Arquivo não encontrado no servidor';
                    } else if (downloadResponse.status === 403) {
                        errorMessage = 'Acesso negado ao arquivo';
                    } else if (downloadResponse.status === 500) {
                        errorMessage = 'Erro interno do servidor';
                    } else if (downloadResponse.status === 0) {
                        errorMessage = 'Falha na conexão com o servidor';
                    }

                    throw new Error(errorMessage);
                }

                const blob = await downloadResponse.blob();
                console.log('🔍 Blob criado, tamanho:', blob.size);

                if (blob.size === 0) {
                    throw new Error('Arquivo vazio recebido');
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${track.artist} - ${track.songName}.mp3`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                await new Promise(resolve => setTimeout(resolve, 100));
                console.log('✅ Download concluído com sucesso');
                showToast(`✅ "${track.songName}" baixada com sucesso!`, 'success');
            } else {
                let errorMessage = 'Falha no download';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('❌ Erro ao fazer parse da resposta de erro:', parseError);
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('❌ Erro na função handleDownload:', error);
            showToast(`❌ ${error instanceof Error ? error.message : 'Erro ao baixar música'}`, 'error');
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
        <div className="min-h-screen bg-[#121212] relative overflow-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                {/* Header da página Trending */}
                <div className="w-full bg-gradient-to-b from-[#1db954]/20 to-transparent">
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
                        {/* Botão Voltar */}
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar
                        </button>

                        {/* Informações da página Trending */}
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                Trending Chart
                            </h1>

                            {/* Seção Hero - Descrição da página Trending */}
                            <div className="max-w-4xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm sm:text-base leading-relaxed space-y-4">
                                        <p>
                                            Bem-vindo à Trending, o ponto de encontro para quem quer estar sempre à frente das tendências da música eletrônica. Aqui você encontra os tracks, remixes e sets que estão bombando nas pistas do mundo todo, diretamente na sua tela.
                                        </p>

                                        <p>
                                            🔥 Descubra novos hits antes de todo mundo, siga os lançamentos mais quentes e mergulhe nas vibes que estão movimentando DJs e clubes. Seja techno, house, trance ou EDM, nossa curadoria garante que você nunca perca o ritmo.
                                        </p>

                                        <p>
                                            💥 Atualizações diárias, playlists selecionadas e conteúdos exclusivos para transformar sua experiência musical. Este é o lugar onde a batida nunca para e a energia nunca cai.
                                        </p>

                                        <p className="text-[#1db954] font-semibold text-base sm:text-lg">
                                            Entre, explore e sinta a vibe da cena eletrônica como nunca antes!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {trendingTracks.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Músicas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalDownloads.toLocaleString()}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Downloads</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalLikes.toLocaleString()}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Curtidas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.activeUsers}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Usuários Ativos</div>
                                </div>
                            </div>

                        </div>
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

            </div>

            {/* Loading State */}
            {loading ? (
                <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8">
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
                    <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                        <div className="text-center mb-6 sm:mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-2 h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                                <h2 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                                    Semana Atual - Top 40
                                </h2>
                                <div className="w-2 h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                            </div>
                            <p className="text-[#b3b3b3] text-xs sm:text-sm max-w-2xl mx-auto">
                                Ranking baseado em downloads reais da comunidade
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
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
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                                                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' :
                                                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                                                        'bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white'
                                                }`}>
                                                {index === 0 ? <Trophy className="h-3 w-3 sm:h-4 sm:w-4" /> : `#${index + 1}`}
                                            </div>
                                        </div>

                                        {/* Card */}
                                        <div className="bg-[#181818] rounded-xl border border-[#282828] p-3 sm:p-4 hover:border-[#1db954]/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#1db954]/20">

                                            {/* Thumbnail */}
                                            <div className="relative mb-3 sm:mb-4">
                                                <div className="aspect-square rounded-lg overflow-hidden bg-[#282828]">
                                                    {track.imageUrl ? (
                                                        <img
                                                            src={track.imageUrl}
                                                            alt={`${track.artist} - ${track.songName}`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Music className="h-8 w-8 sm:h-12 sm:w-12 text-[#535353]" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-black/70 z-20">
                                                    <button
                                                        onClick={() => handlePlay(track)}
                                                        className={`bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 hover:bg-white/30 transition-all duration-300 ${currentTrack?.id === track.id && isPlaying ? 'bg-[#1db954]/80' : ''
                                                            }`}
                                                    >
                                                        {isPlaying && currentTrack?.id === track.id ?
                                                            <Pause className="h-6 w-6 sm:h-5 sm:w-5 text-white" /> :
                                                            <Play className="h-6 w-6 sm:h-5 sm:w-5 text-white ml-0.5" />
                                                        }
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Track Info */}
                                            <div className="space-y-2 sm:space-y-3">
                                                {/* Artista */}
                                                <p className="text-[#b3b3b3] text-xs truncate text-center">
                                                    {track.artist}
                                                </p>
                                                {/* Nome da faixa */}
                                                <h3 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-[#1db954] transition-colors text-center">
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
                                                        disabled={!session?.user?.id}
                                                        className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${!session?.user?.id
                                                            ? 'bg-[#535353] text-gray-400 cursor-not-allowed opacity-50'
                                                            : 'bg-[#1db954] hover:bg-[#1ed760] text-white hover:scale-105 shadow-lg'
                                                            }`}
                                                        title={!session?.user?.id ? 'Faça login para baixar músicas' : 'Baixar música'}
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        <span className="text-[10px] sm:text-xs">Baixar</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleLikeClick(track.id)}
                                                        disabled={!session?.user?.id || liking === track.id}
                                                        className={`bg-[#282828] hover:bg-[#3e3e3e] text-white p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${likedTracksSet.has(track.id) ? 'bg-[#1db954]/80 hover:bg-[#1ed760]/80' : ''
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
                            <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8">
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

        </div>
    );
}
