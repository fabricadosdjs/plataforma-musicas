"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import MusicList from '@/components/music/MusicList';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Calendar, X, RefreshCw, ArrowLeft, Folder, Pause, Play as PlayIcon } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BatchDownloadButtons from '@/components/download/BatchDownloadButtons';
import { useHeaderHeight } from '@/hooks/useHeaderHeight';

// Função para detectar se é um folder de agosto de 2025
const isAugust2025Folder = (folderName: string): boolean => {
    // Como todas as pastas até hoje são de agosto, sempre retornar true
    return true;
};

// Função para obter informações sobre o folder baseada em dados reais
const getFolderInfo = (folderName: string, tracks: Track[], selectedStyle: string | null): string => {
    // Se não há tracks, mostrar mensagem padrão
    if (!tracks || tracks.length === 0) {
        return 'Não obtivemos informações detalhadas sobre este folder.';
    }

    // Gerar informações baseadas nos dados reais
    const totalTracks = tracks.length;
    const totalDownloads = tracks.reduce((sum: number, track: Track) => sum + (track.downloadCount || 0), 0);
    const totalLikes = tracks.reduce((sum: number, track: Track) => sum + (track.likeCount || 0), 0);
    const uniqueArtists = new Set(tracks.map((t: Track) => t.artist)).size;

    // Criar descrição baseada nos dados reais
    let description = `${folderName} é um folder com ${totalTracks} música${totalTracks !== 1 ? 's' : ''} em nossa plataforma. `;

    if (selectedStyle) {
        description = `${folderName} contém ${totalTracks} música${totalTracks !== 1 ? 's' : ''} do estilo ${selectedStyle}. `;
    }

    if (totalDownloads > 0) {
        description += `As músicas deste folder já foram baixadas ${totalDownloads} vez${totalDownloads !== 1 ? 'es' : ''}. `;
    }

    if (totalLikes > 0) {
        description += `Recebeu ${totalLikes} curtida${totalLikes !== 1 ? 's' : ''} dos usuários. `;
    }

    if (uniqueArtists > 0) {
        description += `Contém músicas de ${uniqueArtists} artista${uniqueArtists !== 1 ? 's' : ''} diferente${uniqueArtists !== 1 ? 's' : ''}.`;
    }

    return description;
};

export default function FolderPage() {
    const params = useParams();
    const folderName = decodeURIComponent(params.folderName as string);
    const { showToast } = useToastContext();
    const { data: session } = useSession();
    const { paddingClasses } = useHeaderHeight();

    // Função para detectar se é um folder de agosto de 2025
    const isAugust2025Folder = (folderName: string): boolean => {
        // Como todas as pastas até hoje são de agosto, sempre retornar true
        return true;
    };

    // URL para o botão da Plataforma VIP
    const googleDriveUrl = "https://plataformavip.nexorrecords.com.br/atualizacoes/agosto-2025";

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueArtists: 0,
        uniquePools: 0,
        latestRelease: null as Date | null,
        totalTracks: 0
    });

    // Estado para filtros
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);

    // Estado para download em lote (sistema completo da página /new)
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

    // Estados para controle de download em lote
    const [isPaused, setIsPaused] = useState(false);
    const [downloadStartTime, setDownloadStartTime] = useState<number | null>(null);
    const [downloadErrors, setDownloadErrors] = useState<Array<{ trackName: string, reason: string }>>([]);
    const [retryCount, setRetryCount] = useState(0);
    const [currentAttempt, setCurrentAttempt] = useState(1);

    // Estados para modal de confirmação mobile
    const [showMobileConfirmModal, setShowMobileConfirmModal] = useState(false);
    const [pendingDownloadAction, setPendingDownloadAction] = useState<{
        type: 'new' | 'all';
        tracks: Track[];
        callback: () => void;
    } | null>(null);

    // Verificar se o usuário é VIP (simples)
    const isVip = true; // Por enquanto, sempre true para teste

    // Estado para contador em tempo real
    const [availableTracksCount, setAvailableTracksCount] = useState(0);

    // Carregar tracks do folder
    useEffect(() => {
        const loadTracks = async () => {
            try {
                setLoading(true);
                console.log('🔍 Carregando tracks para folder:', folderName);

                const response = await fetch(`/api/tracks/by-folder?folder=${encodeURIComponent(folderName)}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Tracks carregadas:', data.tracks?.length || 0);
                    setTracks(data.tracks || []);

                    // Calcular estatísticas
                    if (data.tracks && data.tracks.length > 0) {
                        const tracks = data.tracks;
                        const totalDownloads = tracks.reduce((sum: number, track: Track) => sum + (track.downloadCount || 0), 0);
                        const totalLikes = tracks.reduce((sum: number, track: Track) => sum + (track.likeCount || 0), 0);
                        const totalPlays = tracks.reduce((sum: number, track: Track) => sum + (typeof track.playCount === 'number' ? track.playCount : 0), 0);
                        const uniqueArtists = new Set(tracks.map((t: Track) => t.artist)).size;
                        const uniquePools = new Set(tracks.map((t: Track) => t.pool).filter(Boolean)).size;
                        const latestRelease = tracks[0]?.releaseDate ? new Date(tracks[0].releaseDate) : null;

                        setStats({
                            totalDownloads,
                            totalLikes,
                            totalPlays,
                            uniqueArtists,
                            uniquePools,
                            latestRelease,
                            totalTracks: tracks.length
                        });
                    }
                } else {
                    console.error('❌ Erro na resposta da API:', response.status);
                    showToast('Erro ao carregar músicas do folder', 'error');
                }
            } catch (error) {
                console.error('❌ Erro ao carregar tracks:', error);
                showToast('Erro ao carregar músicas', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadTracks();
    }, [folderName, showToast]);

    // Obter estilos únicos disponíveis
    const availableStyles = useMemo(() => {
        if (!tracks.length) return [];
        return Array.from(new Set(tracks.map(track => track.style).filter(Boolean))).sort();
    }, [tracks]);

    // Calcular quantas músicas estão disponíveis para download
    const getAvailableTracksCount = useCallback(() => {
        if (!filteredTracks.length) return 0;

        const availableCount = filteredTracks.filter(track => {
            return !downloadedTrackIds.includes(track.id);
        }).length;

        console.log('🔍 getAvailableTracksCount (Folder):', {
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
        console.log('🔄 Contador atualizado automaticamente (Folder):', count);
    }, [getAvailableTracksCount]);

    // Função para obter tracks disponíveis para download
    const getAvailableTracks = useCallback(() => {
        if (!filteredTracks.length) return [];

        const availableTracks = filteredTracks.filter(track => {
            return !downloadedTrackIds.includes(track.id);
        });

        console.log('🔍 getAvailableTracks (Folder):', {
            totalTracks: filteredTracks.length,
            downloadedIds: downloadedTrackIds.length,
            availableTracks: availableTracks.length
        });

        return availableTracks;
    }, [filteredTracks, downloadedTrackIds]);

    // Função para sincronizar estado com localStorage
    const syncDownloadedTrackIds = () => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDownloadedTrackIds(parsed);
                console.log('🔄 Sincronizando downloadedTrackIds com localStorage (Folder):', parsed.length, 'IDs');
            } catch (error) {
                console.error('❌ Erro ao sincronizar downloadedTrackIds (Folder):', error);
            }
        }
    };

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

    // Função para baixar músicas em lote (sistema completo da página /new)
    const downloadTracksInBatches = async (tracksToDownload: Track[]) => {
        if (!isVip) {
            showToast('👑 Apenas usuários VIP podem baixar músicas em lote', 'error');
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
            showToast('✅ Todas as músicas já foram baixadas!', 'success');
            return;
        }

        const controller = new AbortController();
        setAbortController(controller);
        setIsBatchDownloading(true);
        setIsPaused(false);
        setDownloadStartTime(Date.now());
        setDownloadErrors([]);
        setRetryCount(0);
        setCurrentAttempt(1);

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

                // Verificar se está pausado
                while (isPaused && !controller.signal.aborted) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

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

                                // Adicionar ao array de erros
                                setDownloadErrors(prev => [...prev, {
                                    trackName: `${track.artist} - ${track.songName}`,
                                    reason: reason
                                }]);

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

                        // Adicionar ao array de erros
                        setDownloadErrors(prev => [...prev, {
                            trackName: `${track.artist} - ${track.songName}`,
                            reason: reason
                        }]);

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
                    await new Promise(resolve => setTimeout(resolve, 500));
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
            setIsPaused(false);
            setDownloadStartTime(null);
            setBatchProgress({ total: 0, downloaded: 0, failed: 0, skipped: 0, currentTrack: '', failedDetails: [] });
            setAbortController(null);

            // Sincronizar estado após download em lote
            syncDownloadedTrackIds();
            console.log('🔄 Estado sincronizado após download em lote');
        }
    };

    // Filtrar tracks baseado no estilo selecionado
    useEffect(() => {
        if (selectedStyle) {
            const filtered = tracks.filter(track => track.style === selectedStyle);
            setFilteredTracks(filtered);
        } else {
            setFilteredTracks(tracks);
        }
    }, [selectedStyle, tracks]);

    // Atualizar contador sempre que downloadedTrackIds mudar
    useEffect(() => {
        updateAvailableTracksCount();
    }, [downloadedTrackIds, updateAvailableTracksCount]);

    // Atualizar contador sempre que filteredTracks mudar
    useEffect(() => {
        updateAvailableTracksCount();
    }, [filteredTracks, updateAvailableTracksCount]);

    useEffect(() => {
        syncDownloadedTrackIds();
    }, []);

    // Listener para eventos de download em lote
    useEffect(() => {
        const handleBatchDownload = (event: CustomEvent) => {
            const { type, tracks: tracksToDownload, batchName } = event.detail;
            console.log(`🚀 Iniciando download em lote: ${type} - ${tracksToDownload.length} músicas`);
            downloadTracksInBatches(tracksToDownload);
        };

        window.addEventListener('startBatchDownload', handleBatchDownload as EventListener);

        return () => {
            window.removeEventListener('startBatchDownload', handleBatchDownload as EventListener);
        };
    }, [downloadTracksInBatches]);

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
        const fetchFolderTracks = async () => {
            try {
                setLoading(true);

                // Buscar tracks e estatísticas em paralelo
                const [tracksResponse, statsResponse] = await Promise.all([
                    fetch(`/api/tracks/by-folder?folder=${encodeURIComponent(folderName)}`),
                    fetch(`/api/tracks/folder/${encodeURIComponent(folderName)}/stats`)
                ]);

                if (tracksResponse.ok) {
                    const data = await tracksResponse.json();
                    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
                    setTracks(tracks);
                    setFilteredTracks(tracks);

                    // Atualizar totalTracks nas estatísticas
                    setStats(prev => ({ ...prev, totalTracks: tracks.length }));
                } else {
                    setTracks([]);
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
                        uniquePools: statsData.uniquePools || 0,
                        latestRelease: statsData.latestRelease ? new Date(statsData.latestRelease) : null,
                        totalTracks: tracks.length // Manter sincronizado com o número de tracks
                    }));
                }
            } catch (e) {
                console.error('Erro ao buscar dados do folder:', e);
                setTracks([]);
                setStats(prev => ({ ...prev, totalTracks: 0 }));
            } finally {
                setLoading(false);
            }
        };

        if (folderName) fetchFolderTracks();
    }, [folderName]);



    // Função para cancelar download em lote
    const cancelBatchDownload = () => {
        console.log('🛑 Tentando cancelar download em lote...');
        console.log('🛑 AbortController existe:', !!abortController);
        console.log('🛑 isBatchDownloading:', isBatchDownloading);

        if (abortController) {
            abortController.abort();
            setIsBatchDownloading(false);
            setIsPaused(false);
            setDownloadStartTime(null);
            setBatchProgress({ total: 0, downloaded: 0, failed: 0, skipped: 0, currentTrack: '', failedDetails: [] });
            setAbortController(null);
            showToast('⏹️ Download em lote cancelado', 'info');
            console.log('✅ Download cancelado com sucesso');
        } else {
            console.log('⚠️ Nenhum AbortController ativo para cancelar');
            showToast('⚠️ Nenhum download ativo para cancelar', 'error');
        }
    };

    // Função para pausar/retomar download em lote
    const togglePauseDownload = () => {
        if (isPaused) {
            setIsPaused(false);
            showToast('▶️ Download retomado', 'info');
        } else {
            setIsPaused(true);
            showToast('⏸️ Download pausado', 'info');
        }
    };

    // Função para retry de downloads que falharam
    const retryFailedDownloads = async () => {
        if (downloadErrors.length === 0) {
            showToast('✅ Nenhum erro para tentar novamente', 'info');
            return;
        }

        const failedTrackNames = downloadErrors.map(error => error.trackName);
        const tracksToRetry = tracks.filter(track =>
            failedTrackNames.includes(`${track.artist} - ${track.songName}`)
        );

        if (tracksToRetry.length > 0) {
            setRetryCount(prev => prev + 1);
            setCurrentAttempt(1);
            showToast(`🔄 Tentando novamente ${tracksToRetry.length} downloads que falharam`, 'info');
            await downloadTracksInBatches(tracksToRetry);
        }
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#121212] overflow-x-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className={paddingClasses}>
                {/* Header do Folder */}
                <div className="w-full bg-gradient-to-b from-[#8b5cf6]/20 to-transparent">
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
                        {/* Botão Voltar */}
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar
                        </button>

                        {/* Informações do Folder */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                {/* Capa da Pasta ou Ícone Padrão */}
                                {(() => {
                                    // Buscar a primeira imagem disponível das músicas do folder
                                    const folderCover = filteredTracks.find(track => track.imageUrl)?.imageUrl;

                                    if (folderCover) {
                                        return (
                                            <div className="relative">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#8b5cf6]/30 shadow-lg">
                                                    <img
                                                        src={folderCover}
                                                        alt={`Capa do folder ${folderName}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback para ícone se a imagem falhar
                                                            const target = e.currentTarget as HTMLImageElement;
                                                            const fallback = target.nextElementSibling as HTMLElement;
                                                            if (target && fallback) {
                                                                target.style.display = 'none';
                                                                fallback.style.display = 'flex';
                                                            }
                                                        }}
                                                    />
                                                    {/* Fallback ícone (inicialmente oculto) */}
                                                    <div className="hidden w-full h-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-xl items-center justify-center">
                                                        <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-[#8b5cf6]" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Ícone padrão se não houver imagem
                                        return (
                                            <div className="p-3 bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-xl">
                                                <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-[#8b5cf6]" />
                                            </div>
                                        );
                                    }
                                })()}
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                                    {folderName}
                                </h1>
                            </div>

                            {/* Informações Adicionais do Folder */}
                            <div className="max-w-3xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm leading-relaxed text-justify">
                                        {folderName === 'The Mashup' ? (
                                            'TheMashup é uma record pool — uma plataforma de distribuição voltada para DJs e profissionais da indústria musical. Seu foco principal é disponibilizar músicas para fins promocionais, incluindo mashups, edições, remixes, acapellas, transições, entre outros formatos criativos.'
                                        ) : (
                                            getFolderInfo(folderName, filteredTracks, selectedStyle)
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="mb-4 text-center">
                                <p className="text-[#b3b3b3] text-sm">
                                    📊 Estatísticas baseadas em interações únicas por usuário
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-3xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-3 sm:p-4 border border-[#282828]">
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {filteredTracks.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-xs sm:text-sm">
                                        {filteredTracks.length === 1 ? 'Música' : 'Músicas'}
                                        {selectedStyle && (
                                            <div className="text-[10px] sm:text-xs text-[#8b5cf6] mt-1">
                                                de {selectedStyle.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-3 sm:p-4 border border-[#282828]">
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {stats.totalDownloads}
                                    </div>
                                    <div className="text-[#b3b3b3] text-xs sm:text-sm">
                                        Downloads Únicos
                                        <div className="text-[10px] sm:text-xs text-[#8b5cf6] mt-1">
                                            por usuário
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-3 sm:p-4 border border-[#282828]">
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {stats.totalLikes}
                                    </div>
                                    <div className="text-[#b3b3b3] text-xs sm:text-sm">
                                        Curtidas Únicas
                                        <div className="text-[10px] sm:text-xs text-[#8b5cf6] mt-1">
                                            por usuário
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-3 sm:p-4 border border-[#282828]">
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {new Set(filteredTracks.map((t: Track) => t.artist)).size}
                                    </div>
                                    <div className="text-[#b3b3b3] text-xs sm:text-sm">Artistas</div>
                                </div>
                            </div>





                            {/* Botões de Download em Massa */}
                            <BatchDownloadButtons
                                tracks={filteredTracks}
                                downloadedTrackIds={downloadedTrackIds}
                                batchName={`Folder ${folderName}`}
                                sourcePageName={`Folder ${folderName}`}
                                isGlobal={true}
                                showNewTracksOnly={true}
                                showAllTracks={true}
                                showStyleDownload={false}
                                className="mt-8"
                            />

                            {/* Indicador de Progresso do Download em Lote */}
                            {isBatchDownloading && (
                                <div className="mt-6 bg-[#181818] rounded-xl p-6 border border-[#282828]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-[#8b5cf6] rounded-full animate-pulse"></div>
                                            <h3 className="text-lg font-semibold text-white">
                                                Download em Andamento: {batchProgress.currentTrack || 'Iniciando...'}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Botão Pausar/Retomar */}
                                            <button
                                                onClick={togglePauseDownload}
                                                className="flex items-center gap-2 px-3 py-2 bg-[#282828] hover:bg-[#3e3e3e] text-white rounded-lg transition-colors"
                                            >
                                                {isPaused ? <PlayIcon className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                                {isPaused ? 'Retomar' : 'Pausar'}
                                            </button>

                                            {/* Botão Cancelar */}
                                            <button
                                                onClick={cancelBatchDownload}
                                                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Barra de Progresso */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-[#b3b3b3] mb-2">
                                            <span>Progresso</span>
                                            <span>{Math.min(Math.round((batchProgress.downloaded / batchProgress.total) * 100), 100)}%</span>
                                        </div>
                                        <div className="w-full bg-[#282828] rounded-full h-3">
                                            <div
                                                className="bg-[#8b5cf6] h-3 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min(Math.round((batchProgress.downloaded / batchProgress.total) * 100), 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Estatísticas em Tempo Real */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-[#282828] rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-[#8b5cf6]">
                                                {batchProgress.total}
                                            </div>
                                            <div className="text-xs text-[#b3b3b3]">
                                                Total
                                            </div>
                                        </div>
                                        <div className="bg-[#282828] rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-green-500">
                                                {batchProgress.downloaded}
                                            </div>
                                            <div className="text-xs text-[#b3b3b3]">
                                                Baixadas
                                            </div>
                                        </div>
                                        <div className="bg-[#282828] rounded-lg p-3 text-center">
                                            <div className="text-2xl font-bold text-yellow-500">
                                                {batchProgress.skipped}
                                            </div>
                                            <div className="text-xs text-[#b3b3b3]">
                                                Puladas
                                            </div>
                                        </div>
                                        <div className="bg-[#282828] rounded-lg p-3">
                                            <div className="text-2xl font-bold text-red-500">
                                                {batchProgress.failed}
                                            </div>
                                            <div className="text-xs text-[#b3b3b3]">
                                                Falharam
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informações Adicionais */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#b3b3b3]">
                                        <div>
                                            <span className="font-medium">Tentativa:</span> {currentAttempt}
                                            {retryCount > 0 && <span className="ml-2 text-yellow-400">(Retry #{retryCount})</span>}
                                        </div>
                                        {downloadStartTime && (
                                            <div>
                                                <span className="font-medium">Tempo decorrido:</span> {Math.round((Date.now() - downloadStartTime) / 1000)}s
                                            </div>
                                        )}
                                    </div>

                                    {/* Botão Retry para Downloads que Falharam */}
                                    {batchProgress.failed > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[#282828]">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-[#b3b3b3]">
                                                    {batchProgress.failed} download(s) falharam
                                                </div>
                                                <button
                                                    onClick={retryFailedDownloads}
                                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
                                                >
                                                    🔄 Tentar Novamente
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                                        ? 'bg-[#8b5cf6] text-white'
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
                                            ? 'bg-[#8b5cf6] text-white'
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
                                <div className="animate-spin w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">
                                    Carregando músicas do folder {folderName}...
                                </p>
                            </div>
                        </div>
                    ) : filteredTracks.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-6xl mb-4">📁</div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Nenhuma música encontrada
                                </h3>
                                <p className="text-[#b3b3b3] mb-6">
                                    {selectedStyle
                                        ? `Não encontramos músicas do estilo "${selectedStyle}" no folder "${folderName}".`
                                        : `Não encontramos músicas para o folder "${folderName}".`
                                    }
                                </p>
                                <button
                                    onClick={goBack}
                                    className="px-6 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#9333ea] transition-colors font-medium"
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

            {/* Footer Simples */}
            <footer className="bg-black border-t border-gray-800 mt-20">
                <div className="max-w-[95%] mx-auto px-6 py-12">

                    {/* Conteúdo Principal */}
                    <div className="flex flex-col items-center gap-4">

                        {/* Logo e Nome */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold text-white">
                                    Nexor Records Pools
                                </span>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link href="/new" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Novidades
                            </Link>
                            <Link href="/trending" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Trending
                            </Link>
                            <Link href="/plans" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Planos
                            </Link>
                            <Link href="/privacidade" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Privacidade
                            </Link>
                            <Link href="/termos" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Termos
                            </Link>
                        </div>

                        {/* Redes Sociais */}
                        <div className="flex gap-4">
                            <a href="https://twitter.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806.026-1.566.247-2.229.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </a>
                            <a href="https://instagram.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.017 12.017.017z" />
                                </svg>
                            </a>
                            <a href="https://youtube.com/@plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>

                        {/* Copyright */}
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                © 2025 Nexor Records Pools. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Dados Estruturados para SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "MusicGroup",
                        "name": folderName,
                        "description": `${folderName} é um folder musical com ${filteredTracks.length} músicas disponíveis para download.`,
                        "url": `https://plataformamusicas.com/folder/${encodeURIComponent(folderName)}`,
                        "genre": "Música Eletrônica",
                        "numberOfTracks": filteredTracks.length,
                        "track": filteredTracks.slice(0, 10).map(track => ({
                            "@type": "MusicRecording",
                            "name": track.songName,
                            "byArtist": {
                                "@type": "MusicGroup",
                                "name": track.artist
                            },
                            "genre": track.style || "Música Eletrônica",
                            "datePublished": track.releaseDate || track.createdAt
                        })),
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.5",
                            "reviewCount": stats.totalLikes || 100
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Nexor Records Pools",
                            "url": "https://plataformamusicas.com"
                        }
                    })
                }}
            />
        </div>
    );
}
