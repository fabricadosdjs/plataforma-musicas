"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import MusicList from '@/components/music/MusicList';
import InlineDownloadProgress from '@/components/music/InlineDownloadProgress';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Music, X, RefreshCw, ArrowLeft } from 'lucide-react';

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
    const { data: session } = useSession();

    // Verificar se deve iniciar download automático
    const [shouldAutoDownload, setShouldAutoDownload] = useState(false);

    const [tracks, setTracks] = useState<Track[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueArtists: 0,
        uniqueGenres: 0,
        latestRelease: null as Date | null,
        totalTracks: 0
    });



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

    // Estados para modal de confirmação mobile
    const [showMobileConfirmModal, setShowMobileConfirmModal] = useState(false);
    const [pendingDownloadAction, setPendingDownloadAction] = useState<{
        type: 'new' | 'all';
        tracks: Track[];
        callback: () => void;
    } | null>(null);

    // Função para baixar músicas em lote (simplificada)
    const downloadTracksInBatches = async (tracksToDownload: Track[]) => {
        if (!session) {
            showToast('👑 Para baixar músicas em lote, você precisa estar logado. Ative um plano VIP!', 'warning');
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
                                setDownloadedTrackIds(prev => {
                                    const newIds = [...prev, track.id];
                                    // Sincronizar com localStorage
                                    localStorage.setItem('downloadedTrackIds', JSON.stringify(newIds));
                                    // Forçar atualização do contador em tempo real
                                    setTimeout(() => updateAvailableTracksCount(), 0);
                                    return newIds;
                                });

                                // Atualizar também o localStorage de downloadedTracks
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

            // Sincronizar estado após download em lote
            syncDownloadedTrackIds();
            console.log('🔄 Estado sincronizado após download em lote');
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
        if (!session) {
            showToast('👑 Para limpar o histórico de downloads, você precisa estar logado. Ative um plano VIP!', 'warning');
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

    // Estado para contador em tempo real
    const [availableTracksCount, setAvailableTracksCount] = useState(0);

    // Calcular quantas músicas estão disponíveis para download
    const getAvailableTracksCount = useCallback(() => {
        if (!filteredTracks.length) return 0;

        const availableCount = filteredTracks.filter(track => {
            return !downloadedTrackIds.includes(track.id);
        }).length;

        console.log('🔍 getAvailableTracksCount:', {
            totalTracks: filteredTracks.length,
            downloadedIds: downloadedTrackIds.length,
            availableCount
        });

        return availableCount;
    }, [filteredTracks, downloadedTrackIds]);

    // Função para atualizar contador automaticamente
    const updateAvailableTracksCount = useCallback(() => {
        const count = getAvailableTracksCount();
        setAvailableTracksCount(count);
        console.log('🔄 Contador atualizado automaticamente:', count);
    }, [getAvailableTracksCount]);

    // Atualizar contador sempre que downloadedTrackIds mudar
    useEffect(() => {
        updateAvailableTracksCount();
    }, [downloadedTrackIds, updateAvailableTracksCount]);

    // Atualizar contador sempre que filteredTracks mudar
    useEffect(() => {
        updateAvailableTracksCount();
    }, [filteredTracks, updateAvailableTracksCount]);

    // Função para obter tracks disponíveis para download
    const getAvailableTracks = useCallback(() => {
        if (!filteredTracks.length) return [];

        const availableTracks = filteredTracks.filter(track => {
            return !downloadedTrackIds.includes(track.id);
        });

        console.log('🔍 getAvailableTracks:', {
            totalTracks: filteredTracks.length,
            downloadedIds: downloadedTrackIds.length,
            availableTracks: availableTracks.length
        });

        return availableTracks;
    }, [filteredTracks, downloadedTrackIds]);

    useEffect(() => {
        syncDownloadedTrackIds();
    }, []);

    const handleDownloadedTrackIdsChange = (newIds: number[] | ((prev: number[]) => number[])) => {
        if (typeof newIds === 'function') {
            setDownloadedTrackIds(prev => {
                const result = newIds(prev);
                localStorage.setItem('downloadedTrackIds', JSON.stringify(result));
                // Forçar atualização do contador
                setTimeout(() => updateAvailableTracksCount(), 0);
                return result;
            });
        } else {
            setDownloadedTrackIds(newIds);
            localStorage.setItem('downloadedTrackIds', JSON.stringify(newIds));
            // Forçar atualização do contador
            setTimeout(() => updateAvailableTracksCount(), 0);
        }
    };

    // Função para sincronizar estado com localStorage
    const syncDownloadedTrackIds = () => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDownloadedTrackIds(parsed);
                console.log('🔄 Sincronizando downloadedTrackIds com localStorage:', parsed.length, 'IDs');
            } catch (error) {
                console.error('❌ Erro ao sincronizar downloadedTrackIds:', error);
            }
        }
    };

    // Função para mostrar modal de confirmação mobile
    const showMobileDownloadConfirmation = (type: 'new' | 'all', tracks: Track[], callback: () => void) => {
        if (window.innerWidth < 640) {
            setPendingDownloadAction({ type, tracks, callback });
            setShowMobileConfirmModal(true);
        } else {
            // Em desktop, executa diretamente
            callback();
        }
    };

    // Função para confirmar download mobile
    const confirmMobileDownload = () => {
        if (pendingDownloadAction) {
            pendingDownloadAction.callback();
            setShowMobileConfirmModal(false);
            setPendingDownloadAction(null);
        }
    };

    // Função para cancelar download mobile
    const cancelMobileDownload = () => {
        setShowMobileConfirmModal(false);
        setPendingDownloadAction(null);
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

    // Obter estilos únicos disponíveis
    const availableStyles = useMemo(() => {
        if (!tracks.length) return [];
        return Array.from(new Set(tracks.map(track => track.style).filter(Boolean))).sort();
    }, [tracks]);

    // Filtrar tracks baseado no gênero ou estilo selecionado
    useEffect(() => {
        let filtered = tracks;

        if (selectedGenre) {
            filtered = filtered.filter(track => track.style === selectedGenre);
        }

        if (selectedStyle) {
            filtered = filtered.filter(track => track.style === selectedStyle);
        }

        setFilteredTracks(filtered);
    }, [selectedGenre, selectedStyle, tracks]);

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
        <div className="min-h-screen bg-[#121212] overflow-x-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                {/* Header do Pool */}
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
                                        {filteredTracks.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">
                                        {filteredTracks.length === 1 ? 'Música' : 'Músicas'}
                                        {selectedStyle && (
                                            <div className="text-xs text-[#1db954] mt-1">
                                                de {selectedStyle}
                                            </div>
                                        )}
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
                                        {new Set(filteredTracks.map((t: Track) => t.artist)).size}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Artistas</div>
                                </div>
                            </div>

                            {/* Botões de Download */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <button
                                    onClick={() => {
                                        if (session) {
                                            showMobileDownloadConfirmation('all', filteredTracks, () => downloadTracksInBatches(filteredTracks));
                                        } else {
                                            showToast('👑 Para baixar músicas em lote, você precisa estar logado. Ative um plano VIP!', 'warning');
                                        }
                                    }}
                                    disabled={isBatchDownloading || filteredTracks.length === 0 || !session}
                                    className="flex items-center justify-center gap-3 px-8 py-3 bg-[#1db954] text-white rounded-xl hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                                >
                                    <Download className="w-5 h-5" />
                                    Baixar Todas ({filteredTracks.length})
                                </button>

                                <button
                                    onClick={() => {
                                        if (session) {
                                            const availableTracks = getAvailableTracks();
                                            if (availableTracks.length > 0) {
                                                showMobileDownloadConfirmation('new', availableTracks, () => downloadTracksInBatches(availableTracks));
                                            } else {
                                                showToast('✅ Todas as músicas já foram baixadas!', 'info');
                                            }
                                        } else {
                                            showToast('👑 Para baixar músicas em lote, você precisa estar logado. Ative um plano VIP!', 'warning');
                                        }
                                    }}
                                    disabled={isBatchDownloading || availableTracksCount === 0 || !session}
                                    className="flex items-center justify-center gap-3 px-8 py-3 bg-[#282828] text-white rounded-xl hover:bg-[#3e3e3e] disabled:bg-[#535353] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg border border-[#3e3e3e] shadow-lg hover:shadow-xl"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Baixar Novas ({availableTracksCount})
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
                                                onClick={() => {
                                                    if (abortController) {
                                                        abortController.abort();
                                                        setIsBatchDownloading(false);
                                                        showToast('⏸️ Download em lote pausado', 'info');
                                                    }
                                                }}
                                                disabled={!isBatchDownloading}
                                                className="flex-1 px-3 py-2 bg-[#282828] text-white rounded-lg hover:bg-[#3e3e3e] disabled:bg-[#535353] disabled:cursor-not-allowed transition-colors text-sm"
                                            >
                                                Pausar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (filteredTracks.length > 0) {
                                                        downloadTracksInBatches(filteredTracks);
                                                    }
                                                }}
                                                disabled={isBatchDownloading}
                                                className="flex-1 px-3 py-2 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition-colors text-sm"
                                            >
                                                Continuar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    console.log('🛑 Tentando cancelar download em lote...');
                                                    console.log('🛑 AbortController existe:', !!abortController);
                                                    console.log('🛑 isBatchDownloading:', isBatchDownloading);

                                                    if (abortController) {
                                                        abortController.abort();
                                                        setIsBatchDownloading(false);
                                                        setBatchProgress({ total: 0, downloaded: 0, failed: 0, skipped: 0, currentTrack: '', failedDetails: [] });
                                                        setAbortController(null);
                                                        showToast('⏹️ Download em lote cancelado', 'info');
                                                        console.log('✅ Download cancelado com sucesso');
                                                    } else {
                                                        console.log('⚠️ Nenhum AbortController ativo para cancelar');
                                                        showToast('⚠️ Nenhum download ativo para cancelar', 'warning');
                                                    }
                                                }}
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

                {/* Filtros por Estilo */}
                {availableStyles.length > 0 && (
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4">
                        <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-white font-semibold">🎵 Filtrar por Estilo:</span>
                                <button
                                    onClick={() => setSelectedStyle(null)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStyle === null
                                        ? 'bg-[#1db954] text-white'
                                        : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'
                                        }`}
                                >
                                    Todos ({tracks.length})
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableStyles.map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStyle === style
                                            ? 'bg-[#1db954] text-white'
                                            : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'
                                            }`}
                                    >
                                        {style} ({tracks.filter(t => t.style === style).length})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Músicas */}
                <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">
                                    Carregando músicas de {decodedPoolName}...
                                </p>
                            </div>
                        </div>
                    ) : filteredTracks.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-6xl mb-4">🎵</div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Nenhuma música encontrada
                                </h3>
                                <p className="text-[#b3b3b3] mb-6">
                                    {selectedStyle
                                        ? `Não encontramos músicas do estilo "${selectedStyle}" no pool "${decodedPoolName}".`
                                        : `Não encontramos músicas para o pool "${decodedPoolName}".`
                                    }
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
                            tracks={filteredTracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                            showDate={true}
                            enableInfiniteScroll={false}
                        />
                    )}
                </div>

            </div>

            {/* Modal de Confirmação para Downloads Mobile */}
            {showMobileConfirmModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
                    <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5 max-w-sm w-full mx-3">
                        {/* Ícone de Aviso */}
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 bg-yellow-500/20 border-2 border-yellow-500/30 rounded-full flex items-center justify-center">
                                <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Título */}
                        <h3 className="text-white text-lg font-bold text-center mb-4">
                            Aviso de Download
                        </h3>

                        {/* Mensagem */}
                        <div className="text-gray-300 text-sm text-center mb-6 space-y-3">
                            <p className="font-medium">
                                {pendingDownloadAction?.type === 'new'
                                    ? `Baixar ${pendingDownloadAction.tracks.filter(t => !downloadedTrackIds.includes(t.id)).length} músicas novas?`
                                    : `Baixar todas as ${pendingDownloadAction?.tracks.length} músicas?`
                                }
                            </p>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                <p className="text-yellow-400 font-medium text-xs">
                                    ⚠️ Celulares podem não suportar muitos downloads simultâneos.
                                </p>
                                <p className="text-gray-300 text-xs mt-1">
                                    Recomendamos usar um computador para downloads em massa.
                                </p>
                            </div>

                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                <p className="text-purple-300 font-medium text-xs">
                                    💎 Para uma experiência premium, acesse nossa plataforma VIP!
                                </p>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmMobileDownload}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                            >
                                Continuar no Celular
                            </button>

                            <button
                                onClick={() => window.open('https://plataformavip.nexorrecords.com.br/atualizacoes', '_blank')}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg border border-purple-400/30 text-sm"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    Acessar Plataforma VIP
                                </div>
                            </button>

                            <button
                                onClick={cancelMobileDownload}
                                className="w-full bg-gradient-to-r from-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
