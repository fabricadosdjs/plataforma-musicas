"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { MusicList } from '@/components/music/MusicList';
import FooterSpacer from '@/components/layout/FooterSpacer';
import InlineDownloadProgress from '@/components/music/InlineDownloadProgress';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Music, X, RefreshCw, ArrowLeft } from 'lucide-react';
import { useBatchDownload } from '@/hooks/useBatchDownload';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

// Função para obter informações sobre gravadoras/plataformas baseada em dados reais
const getPoolInfo = (poolName: string, stats: any): string => {
    // Se não temos estatísticas ou não há tracks, mostrar mensagem padrão
    if (!stats || stats.totalTracks === 0) {
        return 'Não obtivemos informações detalhadas sobre esta gravadora ou plataforma musical.';
    }

    // Gerar informações baseadas nos dados reais
    const totalTracks = stats.totalTracks || 0;
    const totalDownloads = stats.totalDownloads || 0;
    const totalLikes = stats.totalLikes || 0;
    const uniqueGenres = stats.uniqueGenres || 0;

    // Criar descrição baseada nos dados reais
    let description = `${poolName} é uma gravadora/plataforma com ${totalTracks} música${totalTracks !== 1 ? 's' : ''} em nossa plataforma. `;

    if (totalDownloads > 0) {
        description += `As músicas desta gravadora já foram baixadas ${totalDownloads} vez${totalDownloads !== 1 ? 'es' : ''}. `;
    }

    if (totalLikes > 0) {
        description += `Recebeu ${totalLikes} curtida${totalLikes !== 1 ? 's' : ''} dos usuários. `;
    }

    if (uniqueGenres > 0) {
        description += `Representa ${uniqueGenres} estilo${uniqueGenres !== 1 ? 's' : ''} musical${uniqueGenres !== 1 ? 'is' : ''} diferentes.`;
    }

    return description;
};

export default function PoolPage() {
    const params = useParams();
    const poolName = params?.poolName as string;
    const decodedPoolName = decodeURIComponent(poolName);
    const { showToast } = useToastContext();

    // Verificar se deve iniciar download automático
    const [shouldAutoDownload, setShouldAutoDownload] = useState(false);

    const [tracks, setTracks] = useState<Track[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueArtists: 0,
        uniqueGenres: 0,
        latestRelease: null as Date | null,
        totalTracks: 0
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
        const confirmed = window.confirm(`Tem certeza que deseja limpar o histórico de downloads para todas as músicas da pool ${decodedPoolName}? Isso removerá ${trackIdsToClear.length} músicas do seu histórico de downloads.`);

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
                        // Não há mais useRecentDownloads, então não precisamos chamar checkDownloads aqui
                        // A lógica de verificação de downloads recentes agora está integrada ao backend

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

    // Calcular quantas músicas estão disponíveis para download
    const getAvailableTracksCount = () => {
        if (!filteredTracks.length) return 0;

        return filteredTracks.filter(track => {
            // Verificar se não foi baixada no localStorage (antigos)
            const notInLocalStorage = !downloadedTrackIds.includes(track.id);
            // Verificar se não foi baixada nas últimas 24h (recentes)
            // Não há mais useRecentDownloads, então não precisamos verificar recentemente
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
        const fetchPoolTracks = async () => {
            try {
                setLoading(true);

                // Buscar tracks e estatísticas em paralelo
                const [tracksResponse, statsResponse] = await Promise.all([
                    fetch(`/api/tracks/pool/${encodeURIComponent(decodedPoolName)}`),
                    fetch(`/api/tracks/pool/${encodeURIComponent(decodedPoolName)}/stats`)
                ]);

                if (tracksResponse.ok) {
                    const tracksData = await tracksResponse.json();
                    const tracks = Array.isArray(tracksData.tracks) ? tracksData.tracks : [];
                    setTracks(tracks);
                    setFilteredTracks(tracks);

                    // Atualizar totalTracks nas estatísticas
                    setStats(prev => ({ ...prev, totalTracks: tracks.length }));
                } else {
                    setTracks([]);
                    setFilteredTracks([]);
                    setStats(prev => ({ ...prev, totalTracks: 0 }));
                }

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(prev => ({
                        ...prev,
                        totalDownloads: statsData.totalDownloads || 0,
                        totalLikes: statsData.totalLikes || 0,
                        totalPlays: statsData.totalPlays || 0,
                        uniqueArtists: statsData.uniqueArtists || 0,
                        uniqueGenres: statsData.uniqueGenres || 0,
                        latestRelease: statsData.latestRelease ? new Date(statsData.latestRelease) : null,
                        totalTracks: tracks.length // Manter sincronizado com o número de tracks
                    }));
                }
            } catch (e) {
                console.error('Erro ao buscar dados da pool:', e);
                setTracks([]);
                setFilteredTracks([]);
                setStats(prev => ({ ...prev, totalTracks: 0 }));
            } finally {
                setLoading(false);
            }
        };
        if (decodedPoolName) fetchPoolTracks();
    }, [decodedPoolName]);

    // Processar filtros da URL (hash)
    useEffect(() => {
        const hash = window.location.hash;
        const genreMatch = hash.match(/genre=([^&]+)/);

        if (genreMatch) {
            const genre = decodeURIComponent(genreMatch[1]);
            setSelectedGenre(genre);
        } else {
            setSelectedGenre(null);
        }
    }, []);

    // Filtrar tracks baseado no gênero selecionado
    useEffect(() => {
        if (selectedGenre) {
            const filtered = tracks.filter(track => track.style === selectedGenre);
            setFilteredTracks(filtered);
        } else {
            setFilteredTracks(tracks);
        }
    }, [selectedGenre, tracks]);

    // Verificar se o usuário é VIP (simples)
    const isVip = true; // Por enquanto, sempre true para teste

    const goBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-amber-400 text-lg">Carregando músicas da pool...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#121212]">
                {/* Header do Pool */}
                <div className="w-full bg-gradient-to-b from-[#1db954]/20 to-transparent">
                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
                        {/* Botão Voltar */}
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar
                        </button>

                        {/* Informações do Pool */}
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                {decodedPoolName}
                            </h1>

                            {/* Informações Adicionais da Gravadora */}
                            <div className="max-w-3xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm leading-relaxed">
                                        {getPoolInfo(decodedPoolName, stats)}
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {tracks.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">
                                        {tracks.length === 1 ? 'Música' : 'Músicas'}
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalDownloads}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Downloads</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalLikes}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Curtidas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.uniqueArtists}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Artistas</div>
                                </div>
                            </div>

                            {/* Botões de Download */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <button
                                    onClick={() => downloadTracksInBatches(tracks)}
                                    disabled={isBatchDownloading || tracks.length === 0}
                                    className="flex items-center justify-center gap-3 px-8 py-3 bg-[#1db954] text-white rounded-xl hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                                >
                                    <Download className="w-5 h-5" />
                                    Baixar Todas ({tracks.length})
                                </button>

                                <button
                                    onClick={() => {
                                        const newTracks = tracks.filter(track => !downloadedTrackIds.includes(track.id));
                                        if (newTracks.length > 0) {
                                            downloadTracksInBatches(newTracks);
                                        } else {
                                            showToast('Todas as músicas já foram baixadas!', 'info');
                                        }
                                    }}
                                    disabled={isBatchDownloading || tracks.length === 0}
                                    className="flex items-center justify-center gap-3 px-8 py-3 bg-[#282828] text-white rounded-xl hover:bg-[#3e3e3e] disabled:bg-[#535353] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg border border-[#3e3e3e] shadow-lg hover:shadow-xl"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Baixar Novas ({getAvailableTracksCount()})
                                </button>
                            </div>

                            {/* Indicador de Progresso do Download */}
                            {isBatchDownloading && (
                                <div className="mt-6 max-w-md mx-auto">
                                    <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[#b3b3b3] text-sm font-medium">
                                                Baixando músicas...
                                            </span>
                                            <span className="text-[#1db954] text-sm font-bold">
                                                {batchProgress.downloaded}/{batchProgress.total}
                                            </span>
                                        </div>

                                        {/* Barra de Progresso */}
                                        <div className="w-full bg-[#282828] rounded-full h-2 mb-3">
                                            <div
                                                className="bg-[#1db954] h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${batchProgress.total > 0 ? (batchProgress.downloaded / batchProgress.total) * 100 : 0}%`
                                                }}
                                            ></div>
                                        </div>

                                        {/* Música Atual */}
                                        {batchProgress.currentTrack && (
                                            <p className="text-[#b3b3b3] text-xs text-center mb-3">
                                                {batchProgress.currentTrack}
                                            </p>
                                        )}

                                        {/* Controles */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={pauseDownload}
                                                disabled={!isBatchDownloading}
                                                className="flex-1 px-3 py-2 bg-[#282828] text-white rounded-lg hover:bg-[#3e3e3e] disabled:bg-[#535353] disabled:cursor-not-allowed transition-colors text-sm"
                                            >
                                                Pausar
                                            </button>
                                            <button
                                                onClick={resumeDownload}
                                                disabled={isBatchDownloading}
                                                className="flex-1 px-3 py-2 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition-colors text-sm"
                                            >
                                                Continuar
                                            </button>
                                            <button
                                                onClick={cancelDownload}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                            >
                                                Cancelar
                                            </button>
                                        </div>

                                        {/* Estatísticas do Download */}
                                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                            <div className="text-center">
                                                <div className="text-[#1db954] font-bold">{batchProgress.downloaded}</div>
                                                <div className="text-[#b3b3b3]">Baixadas</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-yellow-500 font-bold">{batchProgress.failed}</div>
                                                <div className="text-[#b3b3b3]">Falharam</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[#535353] font-bold">{batchProgress.skipped}</div>
                                                <div className="text-[#b3b3b3]">Puladas</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de Músicas */}
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">
                                    Carregando músicas de {decodedPoolName}...
                                </p>
                            </div>
                        </div>
                    ) : tracks.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-6xl mb-4">🎵</div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Nenhuma música encontrada
                                </h3>
                                <p className="text-[#b3b3b3] mb-6">
                                    Não encontramos músicas para o pool "{decodedPoolName}".
                                </p>
                                <button
                                    onClick={goBack}
                                    className="px-6 py-2 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] transition-colors font-medium"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <MusicList
                            tracks={tracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                            showDate={true}
                            enableInfiniteScroll={false}
                        />
                    )}
                </div>

                <FooterSpacer />
            </div>
        </MainLayout>
    );
}
