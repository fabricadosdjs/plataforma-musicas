"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { MusicList } from '@/components/music/MusicList';
import FooterSpacer from '@/components/layout/FooterSpacer';
import InlineDownloadProgress from '@/components/music/InlineDownloadProgress';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Calendar, X, RefreshCw } from 'lucide-react';
import { useBatchDownload } from '@/hooks/useBatchDownload';
import { useToastContext } from '@/context/ToastContext';

export default function GenrePage() {
    const params = useParams();
    const genreName = params?.genreName as string;
    const decodedGenreName = decodeURIComponent(genreName);
    const { showToast } = useToastContext();



    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueArtists: 0,
        uniquePools: 0,
        latestRelease: null as Date | null
    });

    const {
        state: batchState,
        startBatchDownload,
        pauseDownload,
        resumeDownload,
        cancelDownload
    } = useBatchDownload();

    // Estado para download em lote
    const [isBatchDownloading, setIsBatchDownloading] = useState(false);
    const [batchProgress, setBatchProgress] = useState({
        total: 0,
        downloaded: 0,
        failed: 0,
        skipped: 0,
        currentTrack: '',
        failedDetails: [] as Array<{ trackName: string, reason: string }>
    });
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Verificar se o usuário é VIP (simples)
    const isVip = true; // Por enquanto, sempre true para teste

    // Calcular quantas músicas estão disponíveis para download
    const getAvailableTracksCount = () => {
        if (!tracks.length) return 0;

        return tracks.filter(track => {
            // Verificar se não foi baixada no localStorage (antigos)
            const notInLocalStorage = !downloadedTrackIds.includes(track.id);
            // Por enquanto, considerar todas como disponíveis
            return notInLocalStorage;
        }).length;
    };

    useEffect(() => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try { setDownloadedTrackIds(JSON.parse(saved)); } catch { }
        }

    }, []);

    const handleDownloadedTrackIdsChange = (newIds: number[] | ((prev: number[]) => number[])) => {
        if (typeof newIds === 'function') {
            setDownloadedTrackIds(newIds);
        } else {
            setDownloadedTrackIds(newIds);
        }
        localStorage.setItem('downloadedTrackIds', JSON.stringify(typeof newIds === 'function' ? newIds(downloadedTrackIds) : newIds));
    };

    useEffect(() => {
        const fetchGenreTracks = async () => {
            try {
                setLoading(true);

                // Buscar tracks e estatísticas em paralelo
                const [tracksResponse, statsResponse] = await Promise.all([
                    fetch(`/api/tracks/genre/${encodeURIComponent(decodedGenreName)}`),
                    fetch(`/api/tracks/genre/${encodeURIComponent(decodedGenreName)}/stats`)
                ]);

                if (tracksResponse.ok) {
                    const tracksData = await tracksResponse.json();
                    const tracks = Array.isArray(tracksData.tracks) ? tracksData.tracks : [];
                    setTracks(tracks);

                    // Verificar quais tracks foram baixadas recentemente
                    if (tracks.length > 0) {
                        // checkDownloads(tracks.map((track: Track) => track.id)); // Removed as per edit hint
                    }
                }

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats({
                        totalDownloads: statsData.totalDownloads || 0,
                        totalLikes: statsData.totalLikes || 0,
                        totalPlays: statsData.totalPlays || 0,
                        uniqueArtists: statsData.uniqueArtists || 0,
                        uniquePools: statsData.uniquePools || 0,
                        latestRelease: statsData.latestRelease ? new Date(statsData.latestRelease) : null
                    });
                }

                if (!tracksResponse.ok) {
                    setTracks([]);
                }
            } catch (e) {
                console.error('Erro ao buscar dados do gênero:', e);
                setTracks([]);
            } finally {
                setLoading(false);
            }
        };
        if (decodedGenreName) fetchGenreTracks();
    }, [decodedGenreName]);

    // Função para baixar músicas em lote (simplificada)
    const downloadTracksInBatches = async (tracksToDownload: Track[]) => {
        if (!isVip) {
            showToast('👑 Apenas usuários VIP podem baixar músicas em lote', 'warning');
            return;
        }

        // Primeiro, verificar quais músicas já foram baixadas nas últimas 24h
        const trackIds = tracksToDownload.map(track => track.id);
        let recentDownloadIds: Record<number, boolean> = {};

        try {
            const checkResponse = await fetch('/api/tracks/check-downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackIds })
            });

            if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                recentDownloadIds = checkData.downloadedTrackIds || {};
            }
        } catch (error) {
            console.warn('⚠️ Erro ao verificar downloads recentes:', error);
        }

        // Filtrar apenas músicas não baixadas (nem no localStorage nem nas últimas 24h)
        const availableTracks = tracksToDownload.filter(track =>
            !downloadedTrackIds.includes(track.id) && !recentDownloadIds[track.id]
        );

        if (availableTracks.length === 0) {
            showToast('✅ Todas as músicas já foram baixadas!', 'info');
            return;
        }

        const controller = new AbortController();
        setAbortController(controller);
        setIsBatchDownloading(true);
        setBatchProgress({
            total: availableTracks.length,
            downloaded: 0,
            failed: 0,
            skipped: 0,
            currentTrack: '',
            failedDetails: []
        });

        try {
            for (let i = 0; i < availableTracks.length; i += 10) {
                if (controller.signal.aborted) break;

                const batch = availableTracks.slice(i, i + 10);
                console.log(`📦 Processando lote ${Math.floor(i / 10) + 1}: ${batch.length} músicas simultaneamente`);

                // Baixar todas as músicas do lote simultaneamente
                const batchPromises = batch.map(async (track) => {
                    if (controller.signal.aborted) return;

                    console.log(`🎵 Iniciando download: ${track.artist} - ${track.songName}`);

                    try {
                        const response = await fetch('/api/tracks/download', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ trackId: track.id }),
                            signal: controller.signal
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.downloadUrl) {
                                // Construir nome do arquivo com fallbacks robustos para garantir formato artista - música
                                let artistName = data.artist || track.artist || 'Artista';
                                let trackName = data.trackName || track.songName || 'Faixa';

                                // Garantir que não temos nomes vazios ou undefined
                                if (!artistName || artistName === 'undefined' || artistName === 'null') {
                                    artistName = 'Artista';
                                }
                                if (!trackName || trackName === 'undefined' || trackName === 'null') {
                                    trackName = 'Faixa';
                                }

                                const safeName = `${artistName} - ${trackName}.mp3`;

                                if (/^https?:\/\//i.test(data.downloadUrl)) {
                                    // Para URLs externas, usar fetch + blob para forçar download
                                    try {
                                        const fileResp = await fetch(data.downloadUrl);
                                        if (fileResp.ok) {
                                            const blob = await fileResp.blob();
                                            const objectUrl = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = objectUrl;
                                            a.download = safeName;
                                            document.body.appendChild(a);
                                            a.click();
                                            window.URL.revokeObjectURL(objectUrl);
                                            document.body.removeChild(a);
                                        }
                                    } catch (downloadError) {
                                        console.warn(`⚠️ Erro ao baixar arquivo: ${track.songName}`, downloadError);
                                    }
                                } else {
                                    // Para URLs locais, usar fetch + blob
                                    try {
                                        const fileResp = await fetch(data.downloadUrl);
                                        if (fileResp.ok) {
                                            const blob = await fileResp.blob();
                                            const objectUrl = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = objectUrl;
                                            a.download = safeName;
                                            document.body.appendChild(a);
                                            a.click();
                                            window.URL.revokeObjectURL(objectUrl);
                                            document.body.removeChild(a);
                                        }
                                    } catch (downloadError) {
                                        console.warn(`⚠️ Erro ao baixar arquivo: ${track.songName}`, downloadError);
                                    }
                                }

                                // Marcar como baixada
                                setDownloadedTrackIds(prev => [...prev, track.id]);
                                const savedTracks = JSON.parse(localStorage.getItem('downloadedTracks') || '[]');
                                localStorage.setItem('downloadedTracks', JSON.stringify([...savedTracks, track]));

                                setBatchProgress(prev => ({
                                    ...prev,
                                    downloaded: prev.downloaded + 1
                                }));

                                console.log(`✅ Download concluído: ${safeName}`);
                                return { success: true, track };
                            }
                        } else {
                            let reason = 'Erro desconhecido';
                            try {
                                const errorData = await response.json();
                                if (errorData.error) {
                                    if (errorData.error.includes('já baixou esta música nas últimas 24 horas')) {
                                        reason = 'Já baixada nas últimas 24h';
                                        setBatchProgress(prev => ({
                                            ...prev,
                                            skipped: prev.skipped + 1
                                        }));
                                        return { success: true, skipped: true, track, reason };
                                    } else if (errorData.error.includes('não encontrada')) {
                                        reason = 'Música não localizada';
                                    } else {
                                        reason = errorData.error;
                                    }
                                } else {
                                    reason = `HTTP ${response.status}`;
                                }
                            } catch {
                                reason = `HTTP ${response.status}`;
                            }

                            if (reason === 'Já baixada nas últimas 24h') {
                                // Não incrementar failed para músicas já baixadas
                                console.log(`⏭️ Música pulada (já baixada): ${track.songName}`);
                                return { success: true, skipped: true, track, reason };
                            } else {
                                setBatchProgress(prev => ({
                                    ...prev,
                                    failed: prev.failed + 1,
                                    failedDetails: [...prev.failedDetails, {
                                        trackName: `${track.artist} - ${track.songName}`,
                                        reason: reason
                                    }]
                                }));
                                console.log(`❌ Falha no download: ${track.songName} - ${reason}`);
                                return { success: false, track, reason };
                            }
                        }
                    } catch (error) {
                        if (error instanceof Error && error.name === 'AbortError') return { aborted: true };

                        let reason = 'Erro de rede';
                        if (error instanceof Error) {
                            reason = error.message || 'Erro desconhecido';
                        }

                        setBatchProgress(prev => ({
                            ...prev,
                            failed: prev.failed + 1,
                            failedDetails: [...prev.failedDetails, {
                                trackName: `${track.artist} - ${track.songName}`,
                                reason: reason
                            }]
                        }));

                        console.log(`❌ Erro de rede: ${track.songName} - ${reason}`);
                        return { success: false, track, reason };
                    }
                });

                // Aguardar todas as músicas do lote terminarem
                const batchResults = await Promise.all(batchPromises);

                // Atualizar progresso baseado nos resultados
                batchResults.forEach(result => {
                    if (result && !result.aborted) {
                        if (result.success && !result.skipped) {
                            setBatchProgress(prev => ({
                                ...prev,
                                currentTrack: `${result.track.artist} - ${result.track.songName}`
                            }));
                        }
                    }
                });

                // Pequena pausa entre lotes para não sobrecarregar o servidor
                if (i + 10 < availableTracks.length && !controller.signal.aborted) {
                    console.log('⏸️ Pausa entre lotes...');
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            if (!controller.signal.aborted) {
                showToast(`✅ Download em lote concluído! ${batchProgress.downloaded} baixadas, ${batchProgress.failed} falharam`, 'success');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                showToast('❌ Erro durante download em lote', 'error');
            }
        } finally {
            setIsBatchDownloading(false);
            setBatchProgress({ total: 0, downloaded: 0, failed: 0, skipped: 0, currentTrack: '', failedDetails: [] });
            setAbortController(null);
        }
    };

    // Função para cancelar download em lote
    const cancelBatchDownload = () => {
        if (abortController) {
            abortController.abort();
            showToast('⏹️ Download em lote cancelado', 'info');
        }
    };

    // Função para limpar o histórico de downloads de um estilo específico
    const clearDownloadHistory = async (tracks: Track[]) => {
        if (!isVip) {
            showToast('👑 Apenas usuários VIP podem limpar o histórico de downloads', 'warning');
            return;
        }

        const trackIdsToClear = tracks.map(track => track.id);
        const confirmed = window.confirm(`Tem certeza que deseja limpar o histórico de downloads para todas as músicas do gênero ${decodedGenreName}? Isso removerá ${trackIdsToClear.length} músicas do seu histórico de downloads.`);

        if (confirmed) {
            try {
                const response = await fetch('/api/tracks/clear-downloads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trackIds: trackIdsToClear }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Limpar estado local
                        setDownloadedTrackIds(prev => prev.filter(id => !trackIdsToClear.includes(id)));

                        // Limpar localStorage
                        localStorage.setItem('downloadedTracks', JSON.stringify(JSON.parse(localStorage.getItem('downloadedTracks') || '[]').filter((track: any) => !trackIdsToClear.includes(track.id))));

                        // Atualizar verificação de downloads recentes
                        if (tracks.length > 0) {
                            // checkDownloads(tracks.map((track: Track) => track.id)); // Removed as per edit hint
                        }

                        showToast('✅ Histórico de downloads limpo com sucesso!', 'success');
                    } else {
                        showToast('❌ Erro ao limpar histórico de downloads.', 'error');
                    }
                } else {
                    let msg = `HTTP ${response.status}`;
                    try {
                        const err = await response.json();
                        if (err?.error) msg = err.error;
                    } catch { }
                    showToast(`❌ Erro ao limpar histórico de downloads: ${msg}`, 'error');
                }
            } catch (error) {
                console.error('❌ Erro ao limpar histórico de downloads:', error);
                showToast('❌ Erro ao limpar histórico de downloads', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-amber-400 text-lg">Carregando músicas do gênero...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black text-white">
                {/* Hero Section */}
                <div className="relative z-10 bg-gradient-to-r from-slate-900 via-neutral-900 to-zinc-900 border-b border-gray-700/40 shadow-2xl">
                    <div className="container mx-auto px-4 py-16">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded-3xl shadow-2xl mb-6">
                                <span className="text-white text-5xl">🎧</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-gray-200 via-gray-300 to-gray-100 bg-clip-text text-transparent mb-6">
                                {decodedGenreName}
                            </h1>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto w-48 mb-6"></div>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Explore todas as músicas do estilo {decodedGenreName} disponíveis na plataforma.
                            </p>
                            <div className="mt-8">
                                <span className="inline-block bg-gradient-to-r from-gray-700/40 to-gray-600/40 text-gray-200 px-6 py-3 rounded-full text-lg font-semibold border border-gray-500/50 shadow-lg">
                                    {tracks.length} músicas disponíveis
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards de Estatísticas */}
                <div className="relative z-[9988] -mt-8 mb-8">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {/* Total de Músicas */}
                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🎵</span>
                                </div>
                                <div className="text-blue-400 font-bold text-2xl">{tracks.length}</div>
                                <div className="text-blue-300 text-sm">Músicas</div>
                            </div>

                            {/* Total de Downloads */}
                            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Download className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="text-green-400 font-bold text-2xl">{stats.totalDownloads.toLocaleString()}</div>
                                <div className="text-green-300 text-sm">Downloads</div>
                            </div>

                            {/* Total de Likes */}
                            <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Heart className="h-6 w-6 text-pink-400" />
                                </div>
                                <div className="text-pink-400 font-bold text-2xl">{stats.totalLikes.toLocaleString()}</div>
                                <div className="text-pink-300 text-sm">Likes</div>
                            </div>

                            {/* Total de Plays */}
                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Play className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="text-purple-400 font-bold text-2xl">{stats.totalPlays.toLocaleString()}</div>
                                <div className="text-purple-300 text-sm">Plays</div>
                            </div>

                            {/* Artistas Únicos */}
                            <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Users className="h-6 w-6 text-amber-400" />
                                </div>
                                <div className="text-amber-400 font-bold text-2xl">{stats.uniqueArtists}</div>
                                <div className="text-amber-300 text-sm">Artistas</div>
                            </div>

                            {/* Labels Únicas */}
                            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div className="text-indigo-400 font-bold text-2xl">{stats.uniquePools}</div>
                                <div className="text-indigo-300 text-sm">Labels</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top 5 Músicas */}
                {tracks.length > 0 && (
                    <div className="relative z-[9987] mb-8">
                        <div className="container mx-auto px-4">
                            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">🔥</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Top 5 Mais Populares</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                    {tracks.slice(0, 5).map((track, index) => (
                                        <div key={track.id} className="bg-gray-800/50 rounded-xl p-3 sm:p-4 hover:bg-gray-700/50 transition-all duration-300 group">
                                            {/* Posição */}
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <span className="text-lg sm:text-2xl font-bold text-gray-400">#{index + 1}</span>
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                                </div>
                                            </div>

                                            {/* Capa da música */}
                                            <div className="relative mb-2 sm:mb-3">
                                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-700">
                                                    {track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? (
                                                        <img
                                                            src={track.imageUrl}
                                                            alt={`${track.artist} - ${track.songName}`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                                            <span className="text-white text-2xl sm:text-3xl">🎵</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Informações da música */}
                                            <div className="text-center">
                                                <h3 className="font-bold text-white text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                                                    {track.songName}
                                                </h3>
                                                <p className="text-gray-300 text-xs mb-1 sm:mb-2">{track.artist}</p>
                                                <p className="text-gray-400 text-xs">{track.pool}</p>
                                            </div>

                                            {/* Estatísticas */}
                                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-600/30">
                                                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                                                    <div className="text-center">
                                                        <div className="text-green-400 font-bold">{track.downloadCount || 0}</div>
                                                        <div className="text-gray-500">Downloads</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-pink-400 font-bold">{track.likeCount || 0}</div>
                                                        <div className="text-gray-500">Likes</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-blue-400 font-bold">{track.playCount || 0}</div>
                                                        <div className="text-gray-500">Plays</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botão Download em Lote */}
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/30 shadow-2xl mb-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Download className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">Download em Lote</h3>
                        <p className="text-slate-300 text-lg">
                            Baixe {getAvailableTracksCount()} músicas disponíveis do gênero <span className="text-purple-400 font-semibold">{decodedGenreName}</span> em lotes de 10 por vez
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => downloadTracksInBatches(tracks)}
                            disabled={isBatchDownloading}
                            className="bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-purple-400/30 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            <Download className="h-7 w-7" />
                            Baixar {getAvailableTracksCount()} - {decodedGenreName}
                        </button>

                        {/* Botão Limpar Histórico */}
                        <button
                            onClick={() => clearDownloadHistory(tracks)}
                            disabled={isBatchDownloading}
                            className="bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-slate-500/30 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            title="Limpar histórico de downloads para baixar todas novamente"
                        >
                            <RefreshCw className="h-7 w-7" />
                            Limpar Histórico
                        </button>

                        {/* Botão Cancelar Download */}
                        {isBatchDownloading && (
                            <button
                                onClick={cancelBatchDownload}
                                className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-red-400/30 flex items-center gap-3"
                            >
                                <X className="h-7 w-7" />
                                Cancelar
                            </button>
                        )}
                    </div>

                    {/* Progresso inline do download em lote */}
                    {isBatchDownloading && (
                        <div className="mt-8 p-6 bg-slate-700/50 rounded-2xl border border-slate-500/30">
                            <div className="text-center mb-4">
                                <h4 className="text-xl font-bold text-white mb-2">Baixando músicas do gênero {decodedGenreName}</h4>
                                <p className="text-slate-300">Progresso em tempo real</p>
                            </div>

                            {/* Barra de progresso */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-3">
                                    <span>📥 Progresso</span>
                                    <span className="font-semibold">{batchProgress.downloaded}/{batchProgress.total}</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-4 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${(batchProgress.downloaded / batchProgress.total) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-center mt-2">
                                    <span className="text-sm text-slate-400">
                                        {Math.round((batchProgress.downloaded / batchProgress.total) * 100)}% concluído
                                    </span>
                                </div>
                            </div>

                            {/* Música atual */}
                            {batchProgress.currentTrack && (
                                <div className="text-center mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
                                    <div className="text-sm text-slate-400 mb-2">Baixando agora:</div>
                                    <div className="text-lg text-white font-medium truncate">
                                        {batchProgress.currentTrack}
                                    </div>
                                </div>
                            )}

                            {/* Estatísticas */}
                            <div className="flex justify-center gap-4 mb-6">
                                <div className="text-center p-4 bg-green-900/30 border border-green-500/30 rounded-xl">
                                    <div className="text-2xl font-bold text-green-400">{batchProgress.downloaded}</div>
                                    <div className="text-sm text-green-300">Baixadas</div>
                                </div>
                                <div className="text-center p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl">
                                    <div className="text-2xl font-bold text-blue-400">{batchProgress.total - batchProgress.downloaded}</div>
                                    <div className="text-sm text-blue-300">Ainda faltam</div>
                                </div>
                                {batchProgress.skipped > 0 && (
                                    <div className="text-center p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl">
                                        <div className="text-2xl font-bold text-yellow-400">{batchProgress.skipped}</div>
                                        <div className="text-sm text-yellow-300">Puladas</div>
                                    </div>
                                )}
                                {batchProgress.failed > 0 && (
                                    <div className="text-center p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                                        <div className="text-2xl font-bold text-red-400">{batchProgress.failed}</div>
                                        <div className="text-sm text-red-300">Falharam</div>
                                    </div>
                                )}
                            </div>

                            {/* Detalhes dos erros */}
                            {batchProgress.failedDetails.length > 0 && (
                                <details className="mt-6">
                                    <summary className="text-sm text-red-400 cursor-pointer hover:text-red-300 text-center">
                                        🔍 Ver detalhes dos erros ({batchProgress.failedDetails.length})
                                    </summary>
                                    <div className="mt-3 max-h-32 overflow-y-auto">
                                        {batchProgress.failedDetails.map((detail, index) => (
                                            <div key={index} className="text-xs text-red-300 mb-2 p-2 bg-red-900/20 rounded border border-red-700/30">
                                                <div className="font-medium">{detail.trackName}</div>
                                                <div className="text-red-400">Motivo: {detail.reason}</div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    )}
                </div>

                {/* Lista de Músicas */}
                <div className="relative z-[9989]">
                    <div className="container mx-auto px-4 py-6">
                        <MusicList
                            tracks={tracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                            showDate={true}
                        />
                        {/* Espaçamento condicional para o FooterPlayerNew (apenas em desktop) */}
                        <FooterSpacer />
                    </div>
                </div>


            </div>
        </MainLayout>
    );
}
