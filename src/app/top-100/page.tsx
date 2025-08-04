"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Play,
    Pause,
    Download,
    Heart,
    TrendingUp,
    TrendingDown,
    Minus,
    Filter,
    Search,
    Music,
    Crown,
    Star,
    Flame,
    Zap,
    Target,
    BarChart3,
    Clock,
    Calendar,
    Users,
    Eye,
    Headphones,
    Share2,
    MoreHorizontal,
    ChevronUp,
    ChevronDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { Track } from '@/types/track';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToast } from '@/hooks/useToast';
import Top100Stats from '@/components/music/Top100Stats';
import Top100MobileCard from '@/components/music/Top100MobileCard';
import Top100Trends from '@/components/music/Top100Trends';
import { useTop100Data } from '@/hooks/useTop100Data';
import Header from '@/components/layout/Header';

interface Top100Track extends Track {
    position: number;
    previousPosition?: number;
    change: 'up' | 'down' | 'new' | 'stable';
    changeAmount?: number;
    trend: 'hot' | 'rising' | 'stable' | 'falling';
    views: number;
    plays: number;
    likes: number;
    downloads: number;
    pool: string;
    isExclusive?: boolean;
    isNew?: boolean;
    isFeatured?: boolean;
}

const Top100Page = () => {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useGlobalPlayer();

    const {
        tracks,
        loading,
        error,
        lastUpdate,
        searchTracks,
        sortTracks
    } = useTop100Data();

    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('position');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [showTrending, setShowTrending] = useState(false);
    const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());
    const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set());
    const [liking, setLiking] = useState<number | null>(null);

    // Gêneros disponíveis baseados no campo 'style' das tracks
    const genres = ['all', 'House', 'Tech House', 'Progressive House', 'Deep House',
        'Techno', 'Melodic House & Techno', 'Afro House', 'Bass House',
        'Dance / Pop', 'Indie Dance', 'UK Garage / Bassline', 'Drum & Bass',
        'Trap / Future Bass', '140 / Deep Dubstep / Grime'];

    // Buscar likes do usuário
    const fetchLikes = async () => {
        if (!session?.user?.email || tracks.length === 0) return;

        try {
            const trackIds = tracks.map(track => track.id);
            const likedIds: number[] = [];

            for (const trackId of trackIds) {
                try {
                    const res = await fetch(`/api/tracks/like?trackId=${trackId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.liked) {
                            likedIds.push(trackId);
                        }
                    }
                } catch (err) {
                    // Ignora erros individuais
                }
            }

            setLikedTracks(new Set(likedIds));
        } catch (err) {
            console.error('Erro ao buscar likes:', err);
        }
    };

    // Buscar downloads do usuário
    const fetchDownloads = async () => {
        if (!session?.user?.email) return;

        try {
            const res = await fetch('/api/user-data');
            if (res.ok) {
                const data = await res.json();
                if (data.downloadedTrackIds) {
                    setDownloadedTracks(new Set(data.downloadedTrackIds));
                }
            }
        } catch (err) {
            console.error('Erro ao buscar downloads:', err);
        }
    };

    // Carregar dados do usuário quando tracks mudarem
    useEffect(() => {
        if (tracks.length > 0) {
            fetchLikes();
            fetchDownloads();
        }
    }, [tracks, session?.user?.email]);

    const handlePlayPauseClick = (track: Top100Track) => {
        if (!session) {
            showToast('Faça login para ouvir as músicas', 'warning');
            return;
        }

        if (currentTrack?.id === track.id) {
            togglePlayPause();
        } else {
            playTrack(track, tracks);
        }
    };

    const handleLikeClick = async (trackId: number) => {
        if (!session?.user?.email || liking === trackId) return;

        setLiking(trackId);
        try {
            const isLiked = likedTracks.has(trackId);
            const response = await fetch('/api/tracks/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: trackId.toString(),
                    action: isLiked ? 'unlike' : 'like'
                }),
            });

            if (response.ok) {
                const newLikedTracks = new Set(likedTracks);
                if (isLiked) {
                    newLikedTracks.delete(trackId);
                } else {
                    newLikedTracks.add(trackId);
                }
                setLikedTracks(newLikedTracks);

                showToast(
                    isLiked ? 'Música removida dos favoritos!' : 'Música adicionada aos favoritos!',
                    'success'
                );
            } else {
                console.error('Erro ao curtir música');
                showToast('Erro ao curtir música', 'error');
            }
        } catch (error) {
            console.error('Erro ao curtir música:', error);
            showToast('Erro ao curtir música', 'error');
        } finally {
            setLiking(null);
        }
    };

    const handleDownloadClick = async (track: Top100Track) => {
        if (!session?.user?.email) {
            showToast('Faça login para fazer downloads', 'warning');
            return;
        }

        if (downloadedTracks.has(track.id)) {
            showToast('Você já baixou esta música nas últimas 24 horas', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/tracks/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id.toString()
                }),
            });

            if (response.ok) {
                const newDownloadedTracks = new Set(downloadedTracks);
                newDownloadedTracks.add(track.id);
                setDownloadedTracks(newDownloadedTracks);
                showToast(`"${track.songName}" baixada com sucesso!`, 'success');
            } else {
                const data = await response.json();
                showToast(data.error || 'Erro ao fazer download', 'error');
            }
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            showToast('Erro ao fazer download', 'error');
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'hot': return <Flame className="h-4 w-4 text-orange-500" />;
            case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'falling': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getChangeIcon = (change: string, amount?: number) => {
        switch (change) {
            case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
            case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
            case 'new': return <Star className="h-4 w-4 text-yellow-500" />;
            default: return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const filteredTracks = tracks.filter(track => {
        const matchesSearch = track.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'all' || track.style === selectedGenre;
        const matchesTrending = !showTrending || track.trend === 'hot' || track.trend === 'rising';

        return matchesSearch && matchesGenre && matchesTrending;
    });

    const sortedTracks = [...filteredTracks].sort((a, b) => {
        if (sortBy === 'position') {
            return sortOrder === 'asc' ? a.position - b.position : b.position - a.position;
        }
        if (sortBy === 'views') {
            return sortOrder === 'asc' ? a.views - b.views : b.views - a.views;
        }
        if (sortBy === 'plays') {
            return sortOrder === 'asc' ? a.plays - b.plays : b.plays - a.plays;
        }
        if (sortBy === 'likes') {
            return sortOrder === 'asc' ? a.likes - b.likes : b.likes - a.likes;
        }
        if (sortBy === 'downloads') {
            return sortOrder === 'asc' ? a.downloads - b.downloads : b.downloads - a.downloads;
        }
        return 0;
    });

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-white mt-4 text-lg">Carregando Top 100...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center pt-20">
                    <div className="text-center">
                        <p className="text-red-400 text-lg">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // Verificar se há tracks com interações
    if (tracks.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 border-b border-gray-800/50">
                            <div className="max-w-7xl mx-auto px-4 py-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Crown className="h-8 w-8 text-yellow-500" />
                                            <h1 className="text-4xl font-bold text-white">TOP 100</h1>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-300">
                                            <BarChart3 className="h-5 w-5" />
                                            <span className="text-sm">Ranking em tempo real</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 rounded-2xl p-8 border border-gray-700/50 max-w-md">
                                    <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">Nenhuma música no ranking</h2>
                                    <p className="text-gray-400 mb-6">
                                        O Top 100 só mostra músicas que foram curtidas, baixadas ou reproduzidas pelos usuários.
                                    </p>
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <p>• Interaja com as músicas para vê-las no ranking</p>
                                        <p>• Curta, baixe ou reproduza músicas</p>
                                        <p>• O ranking é atualizado em tempo real</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 border-b border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Crown className="h-8 w-8 text-yellow-500" />
                                    <h1 className="text-4xl font-bold text-white">TOP 100</h1>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-300">
                                    <BarChart3 className="h-5 w-5" />
                                    <span className="text-sm">Ranking em tempo real</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 text-green-400">
                                    <Zap className="h-5 w-5" />
                                    <span className="text-sm font-medium">Atualizado agora</span>
                                </div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar músicas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {genres.map(genre => (
                                    <option key={genre} value={genre} className="bg-gray-800">
                                        {genre === 'all' ? 'Todos os Gêneros' : genre}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="position">Posição</option>
                                <option value="views">Visualizações</option>
                                <option value="plays">Reproduções</option>
                                <option value="likes">Curtidas</option>
                                <option value="downloads">Downloads</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
                            >
                                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                <span>{sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}</span>
                            </button>
                        </div>

                        <div className="mt-4 flex items-center space-x-4">
                            <button
                                onClick={() => setShowTrending(!showTrending)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${showTrending
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                                    }`}
                            >
                                <Flame className="h-4 w-4 inline mr-2" />
                                Apenas Trending
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="max-w-7xl mx-auto px-4 py-8 hidden md:block">
                    <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
                        {/* Header da tabela */}
                        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black border-b border-gray-700/50 px-6 py-4">
                            <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-300 uppercase tracking-wider">
                                <div className="col-span-1">#</div>
                                <div className="col-span-4">Música</div>
                                <div className="col-span-2">Artista</div>
                                <div className="col-span-2">Gênero</div>
                                <div className="col-span-2">Pool</div>
                                <div className="col-span-1">Ações</div>
                            </div>
                        </div>

                        {/* Lista de músicas */}
                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {sortedTracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-all duration-300 ${currentTrack?.id === track.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                                        }`}
                                >
                                    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                                        {/* Posição - Fora da tabela */}
                                        <div className="col-span-1">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${track.position <= 3
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                                                    : track.position <= 10
                                                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                                                        : 'bg-gray-800 text-gray-300'
                                                    }`}>
                                                    {track.position}
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    {getChangeIcon(track.change, track.changeAmount)}
                                                    {track.changeAmount && track.changeAmount > 0 && (
                                                        <span className={`text-xs font-bold ${track.change === 'up' ? 'text-green-500' :
                                                            track.change === 'down' ? 'text-red-500' : 'text-gray-500'
                                                            }`}>
                                                            {track.changeAmount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Música */}
                                        <div className="col-span-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-12 h-12 group">
                                                    <img
                                                        src={track.imageUrl}
                                                        alt={track.songName}
                                                        className="w-12 h-12 rounded-lg object-cover border border-gray-600"
                                                    />
                                                    <button
                                                        onClick={() => handlePlayPauseClick(track)}
                                                        className={`absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 ${currentTrack?.id === track.id && isPlaying
                                                            ? 'bg-blue-600/80 text-white'
                                                            : 'bg-black/60 text-gray-200 hover:bg-blue-600/80 hover:text-white'
                                                            }`}
                                                    >
                                                        {isPlaying && currentTrack?.id === track.id ?
                                                            <Pause size={20} /> : <Play size={20} className="ml-1" />
                                                        }
                                                    </button>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="font-semibold text-white truncate text-xs">{track.songName}</h3>
                                                        {track.isExclusive && (
                                                            <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                                                                EXCLUSIVA
                                                            </span>
                                                        )}
                                                        {track.isNew && (
                                                            <span className="px-2 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-full">
                                                                NOVA
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                        <span>{track.pool}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        {getTrendIcon(track.trend)}
                                                        <span className="text-xs text-gray-500">
                                                            {track.views.toLocaleString()} views • {track.plays.toLocaleString()} plays
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Artista */}
                                        <div className="col-span-2">
                                            <span className="text-gray-300 font-medium text-xs">{track.artist}</span>
                                        </div>

                                        {/* Gênero */}
                                        <div className="col-span-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                                {track.style}
                                            </span>
                                        </div>

                                        {/* Pool */}
                                        <div className="col-span-2">
                                            <span className="text-gray-300 text-xs">{track.pool}</span>
                                        </div>

                                        {/* Ações */}
                                        <div className="col-span-1">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleLikeClick(track.id)}
                                                    disabled={liking === track.id}
                                                    className={`p-2 rounded-lg transition-all duration-300 ${likedTracks.has(track.id)
                                                        ? 'bg-pink-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                        } ${liking === track.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={likedTracks.has(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                >
                                                    <Heart size={16} className={likedTracks.has(track.id) ? 'fill-current' : ''} />
                                                </button>

                                                <button
                                                    onClick={() => handleDownloadClick(track)}
                                                    disabled={downloadedTracks.has(track.id)}
                                                    className={`p-2 rounded-lg transition-all duration-300 ${downloadedTracks.has(track.id)
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                    title={downloadedTracks.has(track.id) ? 'Já baixado' : 'Download'}
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden max-w-7xl mx-auto px-4 py-8">
                    <div className="space-y-4">
                        {sortedTracks.map((track, index) => (
                            <Top100MobileCard
                                key={track.id}
                                track={track}
                                index={index}
                                isPlaying={isPlaying && currentTrack?.id === track.id}
                                isCurrentTrack={currentTrack?.id === track.id}
                                isLiked={likedTracks.has(track.id)}
                                isDownloaded={downloadedTracks.has(track.id)}
                                onPlayPause={handlePlayPauseClick}
                                onLike={handleLikeClick}
                                onDownload={handleDownloadClick}
                                canDownload={!!session?.user?.email}
                            />
                        ))}
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl p-6 border border-blue-700/50">
                        <div className="flex items-center space-x-3">
                            <Eye className="h-8 w-8 text-blue-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Total de Visualizações</p>
                                <p className="text-2xl font-bold text-white">
                                    {tracks.reduce((sum, track) => sum + track.views, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-6 border border-green-700/50">
                        <div className="flex items-center space-x-3">
                            <Headphones className="h-8 w-8 text-green-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Total de Reproduções</p>
                                <p className="text-2xl font-bold text-white">
                                    {tracks.reduce((sum, track) => sum + track.plays, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 rounded-xl p-6 border border-pink-700/50">
                        <div className="flex items-center space-x-3">
                            <Heart className="h-8 w-8 text-pink-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Total de Curtidas</p>
                                <p className="text-2xl font-bold text-white">
                                    {tracks.reduce((sum, track) => sum + track.likes, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-6 border border-purple-700/50">
                        <div className="flex items-center space-x-3">
                            <Download className="h-8 w-8 text-purple-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Total de Downloads</p>
                                <p className="text-2xl font-bold text-white">
                                    {tracks.reduce((sum, track) => sum + track.downloads, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estatísticas em Tempo Real */}
                <div className="mt-8">
                    <Top100Stats tracks={tracks} lastUpdate={lastUpdate} />
                </div>

                {/* Tendências do Ranking */}
                <div className="mt-8">
                    <Top100Trends tracks={tracks} />
                </div>
            </div>
        </>
    );
};

export default Top100Page; 