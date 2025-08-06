"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    Play, Pause, Download, Heart, TrendingUp, TrendingDown, Minus,
    Search, Music, Crown, Star, Flame, Zap, BarChart3, Clock,
    Calendar, Eye, Headphones, Share2, MoreHorizontal, ChevronUp,
    ChevronDown, ArrowUp, ArrowDown, Filter, Target, Users,
    AlertTriangle, Copyright, Plus, ShoppingCart, Package, Music2,
    Sparkles, CheckCircle, Loader2, Trash2, X
} from 'lucide-react';
import Link from 'next/link';
import { Track } from '@/types/track';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToastContext } from '@/context/ToastContext';
import { useUserData } from '@/hooks/useUserData';
import Header from '@/components/layout/Header';
import clsx from 'clsx';

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
    const { showToast } = useToastContext();
    const { userData } = useUserData();
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useGlobalPlayer();

    // Estados
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [sortBy, setSortBy] = useState('position');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [liking, setLiking] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [downloadQueue, setDownloadQueue] = useState<Track[]>([]);
    const [isDownloadingQueue, setIsDownloadingQueue] = useState(false);
    const [zipProgress, setZipProgress] = useState<{
        isActive: boolean;
        progress: number;
        current: number;
        total: number;
        trackName: string;
        elapsedTime: number;
        remainingTime: number;
        isGenerating: boolean;
    }>({
        isActive: false,
        progress: 0,
        current: 0,
        total: 0,
        trackName: '',
        elapsedTime: 0,
        remainingTime: 0,
        isGenerating: false
    });

    // Memos para performance
    const isAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';
    const isVip = !!userData?.isVip || isAdmin;
    const downloadsToday = userData?.dailyDownloadCount || 0;
    const dailyLimit = userData?.dailyDownloadLimit || 50;
    const downloadsLeft = (typeof dailyLimit === 'string' && dailyLimit === 'Ilimitado') ? 'Ilimitado' : Math.max(Number(dailyLimit) - downloadsToday, 0);
    const hasDownloadedTrack = useCallback((trackId: number) => userData?.downloadedTrackIds?.includes(trackId) || false, [userData?.downloadedTrackIds]);

    // Gêneros disponíveis
    const genres = ['all', 'House', 'Tech House', 'Progressive House', 'Deep House',
        'Techno', 'Melodic House & Techno', 'Afro House', 'Bass House',
        'Dance / Pop', 'Indie Dance', 'UK Garage / Bassline', 'Drum & Bass',
        'Trap / Future Bass', '140 / Deep Dubstep / Grime'];

    // Lógica para `canDownload`
    const canDownload = useCallback((trackId: number) => {
        if (isVip) {
            return { can: true, reason: 'Clique para baixar.', timeLeft: '' };
        }
        if (typeof downloadsLeft === 'number' && downloadsLeft <= 0) return { can: false, reason: 'Limite diário atingido.', showUpgrade: true, timeLeft: '' };
        return { can: true, reason: `Downloads restantes: ${downloadsLeft}`, timeLeft: '' };
    }, [isVip, downloadsLeft]);

    // Carregar tracks do Top 100
    const fetchTop100Tracks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/top-100');
            if (!response.ok) {
                throw new Error('Erro ao carregar Top 100');
            }

            const data = await response.json();
            setTracks(data.tracks || []);
        } catch (err) {
            console.error('Erro ao carregar Top 100:', err);
            setError('Erro ao carregar ranking');
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar dados na montagem do componente
    useEffect(() => {
        fetchTop100Tracks();
    }, [fetchTop100Tracks]);

    // Persistência da fila
    useEffect(() => {
        try { const savedQueue = localStorage.getItem('downloadQueue'); if (savedQueue) setDownloadQueue(JSON.parse(savedQueue)); }
        catch (e) { console.error(e); localStorage.removeItem('downloadQueue'); }
    }, []);
    useEffect(() => { localStorage.setItem('downloadQueue', JSON.stringify(downloadQueue)); }, [downloadQueue]);

    // Handlers
    const handlePlayPauseClick = (track: Track) => {
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
            const response = await fetch('/api/tracks/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: trackId.toString(),
                    action: 'toggle'
                }),
            });

            if (response.ok) {
                showToast('Like atualizado com sucesso!', 'success');
            } else {
                showToast('Erro ao curtir música', 'error');
            }
        } catch (error) {
            console.error('Erro ao curtir música:', error);
            showToast('Erro ao curtir música', 'error');
        } finally {
            setLiking(null);
        }
    };

    const handleDownloadClick = async (track: Track) => {
        if (!session?.user?.email) {
            showToast('Faça login para fazer downloads', 'warning');
            return;
        }

        const canDownloadResult = canDownload(track.id);
        if (!canDownloadResult.can) {
            showToast(canDownloadResult.reason, 'warning');
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

    const handleDeleteClick = async (track: Track) => {
        if (!isAdmin) return;

        setDeleting(track.id);
        try {
            const response = await fetch('/api/tracks/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id })
            });

            if (response.ok) {
                setTracks(prev => prev.filter(t => t.id !== track.id));
                showToast(`"${track.songName}" excluída com sucesso!`, 'success');
            } else {
                showToast('Erro ao excluir música', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir música:', error);
            showToast('Erro ao excluir música', 'error');
        } finally {
            setDeleting(null);
        }
    };

    // Função para reportar problema
    const handleReportClick = async (track: Track) => {
        try {
            const response = await fetch('/api/report-bug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id,
                    trackName: track.songName,
                    artist: track.artist,
                    issue: 'Problema reportado pelo usuário',
                    userEmail: session?.user?.email || 'Não identificado'
                })
            });

            if (response.ok) {
                showToast('✅ Problema reportado com sucesso!', 'success');
            } else {
                showToast('❌ Erro ao reportar problema', 'error');
            }
        } catch (error) {
            console.error('Erro ao reportar:', error);
            showToast('❌ Erro ao reportar problema', 'error');
        }
    };

    // Função para reportar copyright
    const handleCopyrightClick = async (track: Track) => {
        try {
            const response = await fetch('/api/report-copyright', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id,
                    trackName: track.songName,
                    artist: track.artist,
                    issue: 'Violação de copyright reportada',
                    userEmail: session?.user?.email || 'Não identificado'
                })
            });

            if (response.ok) {
                showToast('✅ Copyright reportado com sucesso!', 'success');
            } else {
                showToast('❌ Erro ao reportar copyright', 'error');
            }
        } catch (error) {
            console.error('Erro ao reportar copyright:', error);
            showToast('❌ Erro ao reportar copyright', 'error');
        }
    };

    const onToggleQueue = (track: Track) => {
        setDownloadQueue(prev => {
            const isInQueue = prev.some(t => t.id === track.id);
            showToast(isInQueue ? `📦 "${track.songName}" removida da fila` : `📦 "${track.songName}" adicionada à fila`, 'success');
            return isInQueue ? prev.filter(t => t.id !== track.id) : [...prev, track];
        });
    };

    // Função para download em lote (ZIP)
    const handleDownloadQueue = async () => {
        if (!session?.user) {
            showToast('👤 Faça login para fazer downloads', 'warning');
            return;
        }

        if (downloadQueue.length === 0) {
            showToast('📦 Adicione músicas à fila primeiro', 'warning');
            return;
        }

        setIsDownloadingQueue(true);
        setZipProgress(prev => ({ ...prev, isActive: true, isGenerating: true }));

        // Timeout de 5 minutos
        const timeout = setTimeout(() => {
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingQueue(false);
            showToast('⏰ Timeout - download em lote demorou muito', 'error');
        }, 5 * 60 * 1000);

        try {
            const trackIds = downloadQueue.map(track => track.id);
            const filename = `top-100-${new Date().toISOString().split('T')[0]}.zip`;

            const response = await fetch('/api/downloads/zip-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackIds, filename })
            });

            if (!response.ok) {
                throw new Error('Erro ao iniciar download em lote');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Erro ao ler resposta do servidor');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                buffer += chunk;

                // Processar linhas completas
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Manter linha incompleta no buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = line.slice(6).trim();

                            // Verificar se a linha não está vazia
                            if (!jsonData) {
                                continue;
                            }

                            const data = JSON.parse(jsonData);

                            if (data.type === 'progress') {
                                setZipProgress(prev => ({
                                    ...prev,
                                    progress: data.progress,
                                    current: data.current,
                                    total: data.total,
                                    trackName: data.trackName,
                                    elapsedTime: data.elapsedTime,
                                    remainingTime: data.remainingTime
                                }));
                            } else if (data.type === 'complete') {
                                console.log('✅ ZIP gerado com sucesso');

                                // Verificar se zipData existe
                                if (!data.zipData) {
                                    throw new Error('Dados do ZIP não recebidos');
                                }

                                // Decodificar dados do ZIP
                                const zipBuffer = atob(data.zipData);
                                const bytes = new Uint8Array(zipBuffer.length);
                                for (let i = 0; i < zipBuffer.length; i++) {
                                    bytes[i] = zipBuffer.charCodeAt(i);
                                }

                                // Criar blob e fazer download
                                const blob = new Blob([bytes], { type: 'application/zip' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                URL.revokeObjectURL(url);
                                document.body.removeChild(a);

                                // Limpar fila e estados
                                setDownloadQueue([]);
                                setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
                                setIsDownloadingQueue(false);
                                clearTimeout(timeout);

                                showToast('✅ Download em lote concluído!', 'success');
                            } else if (data.type === 'error') {
                                throw new Error(data.message || 'Erro ao gerar ZIP');
                            }
                        } catch (error) {
                            console.error('Erro ao processar dados do ZIP:', error);
                            console.error('Linha problemática:', line);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erro no download em lote:', error);
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingQueue(false);
            clearTimeout(timeout);
            showToast('❌ Erro ao fazer download em lote', 'error');
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

        return matchesSearch && matchesGenre;
    });

    const sortedTracks = [...filteredTracks].sort((a, b) => {
        if (sortBy === 'position') {
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        }
        if (sortBy === 'views') {
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        }
        if (sortBy === 'plays') {
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        }
        if (sortBy === 'likes') {
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        }
        if (sortBy === 'downloads') {
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
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
                {/* Header inspirado no Traxsource */}
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
                    </div>
                </div>

                {/* Download Queue Section */}
                {downloadQueue.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 mb-6 mx-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="h-5 w-5 text-blue-400" />
                                <h3 className="text-lg font-semibold text-white">
                                    Fila de Downloads ({downloadQueue.length}/20)
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDownloadQueue}
                                    disabled={isDownloadingQueue || zipProgress.isActive}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDownloadingQueue || zipProgress.isActive ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {zipProgress.isGenerating ? 'Processando...' : 'Baixando...'}
                                        </>
                                    ) : (
                                        <>
                                            <Package className="h-4 w-4" />
                                            Baixar ZIP
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setDownloadQueue([])}
                                    disabled={isDownloadingQueue || zipProgress.isActive}
                                    className="px-4 py-2 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 border border-gray-500/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {zipProgress.isActive && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-300">
                                        {zipProgress.trackName}
                                    </span>
                                    <span className="text-sm text-gray-300">
                                        {zipProgress.current}/{zipProgress.total} ({zipProgress.progress}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${zipProgress.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Queue List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {downloadQueue.map((track, index) => (
                                <div key={`${track.id}-${index}`} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{track.songName}</p>
                                        <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                                    </div>
                            <button
                                        onClick={() => onToggleQueue(track)}
                                        disabled={isDownloadingQueue || zipProgress.isActive}
                                        className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200 disabled:opacity-50"
                                        title="Remover da fila"
                                    >
                                        <X className="h-4 w-4" />
                            </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Desktop Table - Design inspirado no Traxsource */}
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
                            {tracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className={clsx(
                                        "border-b border-gray-800/50 hover:bg-gray-800/30 transition-all duration-300",
                                        currentTrack?.id === track.id && 'bg-blue-900/20 border-l-4 border-l-blue-500'
                                    )}
                                >
                                    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                                        {/* Posição */}
                                        <div className="col-span-1">
                                            <div className="flex items-center space-x-2">
                                                <div className={clsx(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                                    index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                                                        index < 10 ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white' :
                                                            'bg-gray-800 text-gray-300'
                                                )}>
                                                    {index + 1}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Música */}
                                        <div className="col-span-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-12 h-12 group">
                                                    <img
                                                        src={track.imageUrl || "/images/default-track.jpg"}
                                                        alt={track.songName}
                                                        className="w-12 h-12 rounded-lg object-cover border border-gray-600"
                                                    />
                                                    <button
                                                        onClick={() => handlePlayPauseClick(track)}
                                                        className={clsx(
                                                            "absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300",
                                                            currentTrack?.id === track.id && isPlaying
                                                            ? 'bg-blue-600/80 text-white'
                                                            : 'bg-black/60 text-gray-200 hover:bg-blue-600/80 hover:text-white'
                                                        )}
                                                    >
                                                        {isPlaying && currentTrack?.id === track.id ?
                                                            <Pause size={20} /> : <Play size={20} className="ml-1" />
                                                        }
                                                    </button>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="font-semibold text-white truncate text-xs">{track.songName}</h3>
                                                        {track.pool === 'Nexor Records' && (
                                                            <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                                                                EXCLUSIVA
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                        <span>{track.pool || 'Nexor Records'}</span>
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
                                            <span className="text-gray-300 text-xs">{track.pool || 'Nexor Records'}</span>
                                        </div>

                                        {/* Ações */}
                                        <div className="col-span-1">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleLikeClick(track.id)}
                                                    disabled={liking === track.id}
                                                    className={clsx(
                                                        "p-2 rounded-lg transition-all duration-300",
                                                        liking === track.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600',
                                                        'bg-gray-700 text-gray-300'
                                                    )}
                                                    title="Curtir"
                                                >
                                                    {liking === track.id ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
                                                </button>

                                                <button
                                                    onClick={() => handleDownloadClick(track)}
                                                    disabled={!canDownload(track.id).can}
                                                    className={clsx(
                                                        "p-2 rounded-lg transition-all duration-300",
                                                        canDownload(track.id).can ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    )}
                                                    title={canDownload(track.id).reason}
                                                >
                                                    <Download size={16} />
                                                </button>

                                                <button
                                                    onClick={() => onToggleQueue(track)}
                                                    className={clsx(
                                                        "p-2 rounded-lg transition-all duration-300",
                                                        downloadQueue.some(t => t.id === track.id) ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    )}
                                                    title={downloadQueue.some(t => t.id === track.id) ? "Remover da Fila" : "Adicionar à Fila"}
                                                >
                                                    {downloadQueue.some(t => t.id === track.id) ? <Minus size={16} /> : <Plus size={16} />}
                                                </button>

                                                <button
                                                    onClick={() => handleReportClick(track)}
                                                    className="p-2 rounded-lg text-gray-400 transition-all duration-200 hover:bg-orange-500/10 hover:text-orange-500"
                                                    title="Reportar Problema"
                                                >
                                                    <AlertTriangle size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleCopyrightClick(track)}
                                                    className="p-2 rounded-lg text-gray-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
                                                    title="Reportar Copyright"
                                                >
                                                    <Copyright size={16} />
                                                </button>

                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteClick(track)}
                                                        disabled={deleting === track.id}
                                                        className="p-2 rounded-lg text-gray-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
                                                        title="Excluir Música"
                                                    >
                                                        {deleting === track.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                    </button>
                                                )}
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
                        {tracks.map((track, index) => (
                            <div key={track.id} className={clsx(
                                "rounded-xl border shadow-lg backdrop-blur-md transition-all",
                                currentTrack?.id === track.id ? 'ring-2 ring-blue-500 bg-zinc-900 border-zinc-700' : 'bg-zinc-900/70 border-zinc-800'
                            )}>
                                <div className="p-4 flex items-center gap-4">
                                    <div className="relative flex-shrink-0 w-14 h-14">
                                        <img src={track.imageUrl || "/images/default-track.jpg"} alt={track.songName} className="w-14 h-14 rounded-lg object-cover border border-zinc-700" />
                                        <button onClick={() => handlePlayPauseClick(track)} className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50" title={isPlaying && currentTrack?.id === track.id ? "Pausar" : "Tocar"}>
                                            {isPlaying && currentTrack?.id === track.id ? <Pause size={26} strokeWidth={1.75} className="text-blue-400" /> : <Play size={26} strokeWidth={1.75} className="ml-1 text-white" />}
                                        </button>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-yellow-500">#{index + 1}</span>
                                            <span className="font-bold text-white text-base truncate">{track.songName}</span>
                                            {track.pool === 'Nexor Records' && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white">EXCLUSIVA</span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-400 truncate">{track.artist}</span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white">{track.style}</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white">{track.pool || 'NR'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 grid grid-cols-2 gap-2">
                                    <button onClick={() => handleDownloadClick(track)} disabled={!canDownload(track.id).can} title={canDownload(track.id).reason} className={clsx("flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all text-xs active:scale-95", canDownload(track.id).can ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-zinc-700 text-gray-400 cursor-not-allowed")}>
                                        <Download size={15} strokeWidth={1.5} />
                                        DOWNLOAD
                                    </button>
                                    <button onClick={() => handleLikeClick(track.id)} disabled={liking === track.id} title="Curtir" className={clsx("flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all text-xs active:scale-95", "bg-zinc-700 hover:bg-zinc-600 text-white")}>
                                        {liking === track.id ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} strokeWidth={1.5} />}
                                        CURTIR
                                    </button>
                                    <button onClick={() => onToggleQueue(track)} title={downloadQueue.some(t => t.id === track.id) ? "Remover da Fila" : "Adicionar à Fila"} className={clsx("col-span-2 flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all text-xs active:scale-95", downloadQueue.some(t => t.id === track.id) ? "bg-blue-600/20 text-blue-400" : "bg-zinc-700/50 hover:bg-zinc-700 text-white")}>
                                        {downloadQueue.some(t => t.id === track.id) ? <><Minus size={16} strokeWidth={2.5} /> NA FILA</> : <><Plus size={16} strokeWidth={2.5} /> ADD À FILA</>}
                                    </button>
                                    <button onClick={() => handleReportClick(track)} title="Reportar Problema" className="flex items-center justify-center gap-2 py-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 font-semibold text-xs active:scale-95">
                                        <AlertTriangle size={14} strokeWidth={1.5} /> REPORTAR
                                    </button>
                                    <button onClick={() => handleCopyrightClick(track)} title="Reportar Copyright" className="flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold text-xs active:scale-95">
                                        <Copyright size={14} strokeWidth={1.5} /> COPYRIGHT
                                    </button>
                                    {isAdmin && <button onClick={() => handleDeleteClick(track)} disabled={deleting === track.id} title="Excluir Música" className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-800/60 hover:bg-red-700/60 text-white font-semibold text-xs active:scale-95">{deleting === track.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={14} strokeWidth={1.5} />} {deleting === track.id ? 'Excluindo...' : 'Excluir'}</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl p-6 border border-blue-700/50">
                        <div className="flex items-center space-x-3">
                            <Eye className="h-8 w-8 text-blue-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Total de Tracks</p>
                                <p className="text-2xl font-bold text-white">{tracks.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-6 border border-green-700/50">
                        <div className="flex items-center space-x-3">
                            <Headphones className="h-8 w-8 text-green-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Em Reprodução</p>
                                <p className="text-2xl font-bold text-white">
                                    {isPlaying ? '1' : '0'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 rounded-xl p-6 border border-pink-700/50">
                        <div className="flex items-center space-x-3">
                            <Heart className="h-8 w-8 text-pink-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Favoritos</p>
                                <p className="text-2xl font-bold text-white">
                                    {userData?.likedTrackIds?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-6 border border-purple-700/50">
                        <div className="flex items-center space-x-3">
                            <Download className="h-8 w-8 text-purple-400" />
                            <div>
                                <p className="text-gray-400 text-sm">Downloads Hoje</p>
                                <p className="text-2xl font-bold text-white">
                                    {downloadsToday}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Top100Page; 