"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Track } from '@/types/track';
import { useToastContext } from '@/context/ToastContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useSession } from 'next-auth/react';
import { useNotificationContext } from '@/context/NotificationContext';
import { Play, Pause, Download, Heart, Plus, Calendar } from 'lucide-react';
import { formatDateBrazil, formatDateShortBrazil, formatDateExtendedBrazil, getDateKeyBrazil, isTodayBrazil, isYesterdayBrazil } from '@/utils/dateUtils';
import { useRouter, usePathname } from 'next/navigation';
import { useMobileAudio } from '@/hooks/useMobileAudio';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useDownloadsCache } from '@/hooks/useDownloadsCache';
import { useMusicImageLoader } from '@/hooks/useImageLoader';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ImageErrorBoundary } from '@/components/ui/ImageErrorBoundary';
import { generateGradientColors, generateInitials } from '@/utils/imageUtils';

interface MusicListProps {
    tracks: Track[];
    downloadedTrackIds: number[];
    setDownloadedTrackIds: (ids: number[] | ((prev: number[]) => number[])) => void;
    showDate?: boolean;
    itemsPerPage?: number;
    // Props para infinite scroll
    hasMore?: boolean;
    isLoading?: boolean;
    onLoadMore?: () => void;
    enableInfiniteScroll?: boolean;
    // Props para likes
    likedTrackIds?: number[];
    setLikedTrackIds?: (ids: number[] | ((prev: number[]) => number[])) => void;
    // Props para paginaÃ§Ã£o
    currentPage?: number;
    setCurrentPage?: (page: number | ((prev: number) => number)) => void;
}

interface GroupedTracks {
    [key: string]: {
        label: string;
        tracks: Track[];
        date: Date;
    };
}

export default function MusicList({
    tracks,
    itemsPerPage = 20,
    enableInfiniteScroll = false,
    downloadedTrackIds = [],
    setDownloadedTrackIds,
    likedTrackIds = [],
    setLikedTrackIds,
    hasMore = false,
    isLoading = false,
    onLoadMore = () => { },
    showDate = true
}: MusicListProps) {
    const { showToast } = useToastContext();
    const { playTrack, currentTrack, isPlaying, togglePlayPause, stopTrack } = useGlobalPlayer();
    const { data: session } = useSession();
    const { addDownloadNotification, addMusicNotification } = useNotificationContext();
    const router = useRouter();
    const pathname = usePathname();
    const { isMobile, hasUserInteracted, canPlayAudio, requestAudioPermission } = useMobileAudio();

    // Hook para cache de downloads
    const downloadsCache = useDownloadsCache();

    // FunÃ§Ã£o para forÃ§ar sincronizaÃ§Ã£o
    const handleForceSync = async () => {
        try {
            await downloadsCache.forceSync();
            showToast('ðŸ”„ Cache sincronizado com sucesso!', 'success');
        } catch (error) {
            console.error('âŒ Erro ao sincronizar cache:', error);
            showToast('âŒ Erro ao sincronizar cache', 'error');
        }
    };

    // Estados para funcionalidades
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [liking, setLiking] = useState<number | null>(null);
    const [showNotificationPermission, setShowNotificationPermission] = useState(false);
    const [stableTracks, setStableTracks] = useState<Track[]>([]);
    const [isStable, setIsStable] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [testingAudio, setTestingAudio] = useState<Set<number>>(new Set());

    // Estados para modal de confirmaÃ§Ã£o mobile
    const [showMobileConfirmModal, setShowMobileConfirmModal] = useState(false);
    const [pendingDownloadAction, setPendingDownloadAction] = useState<{
        type: 'new' | 'all';
        tracks: Track[];
        callback: () => void;
    } | null>(null);

    // Cache para URLs que falharam (evitar tentativas repetidas)
    const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

    // Verificar permissÃ£o de notificaÃ§Ãµes ao carregar
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            setShowNotificationPermission(true);
        }
    }, []);

    // FunÃ§Ã£o para solicitar permissÃ£o de notificaÃ§Ãµes
    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            showToast('ðŸ“± NotificaÃ§Ãµes nÃ£o suportadas neste navegador', 'warning');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setShowNotificationPermission(false);
                showToast('âœ… PermissÃ£o de notificaÃ§Ãµes concedida!', 'success');
            } else {
                showToast('âŒ PermissÃ£o de notificaÃ§Ãµes negada', 'warning');
            }
        } catch (error) {
            console.error('Erro ao solicitar permissÃ£o:', error);
            showToast('âŒ Erro ao solicitar permissÃ£o', 'error');
        }
    }, [showToast]);

    // FunÃ§Ã£o para mostrar modal de confirmaÃ§Ã£o mobile
    const showMobileDownloadConfirmation = (type: 'new' | 'all', tracks: Track[], callback: () => void) => {
        if (window.innerWidth < 640) {
            setPendingDownloadAction({ type, tracks, callback });
            setShowMobileConfirmModal(true);
        } else {
            // Em desktop, executa diretamente
            callback();
        }
    };

    // FunÃ§Ã£o para confirmar download mobile
    const confirmMobileDownload = () => {
        if (pendingDownloadAction) {
            pendingDownloadAction.callback();
            setShowMobileConfirmModal(false);
            setPendingDownloadAction(null);
        }
    };

    // FunÃ§Ã£o para cancelar download mobile
    const cancelMobileDownload = () => {
        setShowMobileConfirmModal(false);
        setPendingDownloadAction(null);
    };

    // FunÃ§Ã£o para mostrar notificaÃ§Ã£o amigÃ¡vel de arquivo nÃ£o disponÃ­vel
    const showFileUnavailableMessage = (track: Track, reason: string) => {
        const message = `âŒ "${track.songName}" nÃ£o estÃ¡ disponÃ­vel: ${reason}`;
        showToast(message, 'warning');

        // Adicionar ao cache de falhas para evitar tentativas futuras
        setFailedUrls(prev => new Set([...prev, track.downloadUrl]));

        // Log para debugging
        console.log(`ðŸŽµ MusicList: Arquivo marcado como nÃ£o disponÃ­vel:`, {
            trackId: track.id,
            songName: track.songName,
            reason,
            url: track.downloadUrl
        });
    };

    // FunÃ§Ã£o para tentar reproduzir com diferentes estratÃ©gias
    const tryPlayWithFallback = async (track: Track, tracks: Track[]) => {
        const strategies = [
            { name: 'URL direta', url: track.downloadUrl },
            { name: 'Proxy CORS', url: `/api/audio-mobile-proxy?url=${encodeURIComponent(track.downloadUrl)}` }
        ];

        for (const strategy of strategies) {
            try {
                console.log(`ðŸŽµ MusicList: Tentando estratÃ©gia: ${strategy.name}`);

                const trackWithStrategy = {
                    ...track,
                    downloadUrl: strategy.url
                };

                await playTrack(trackWithStrategy, undefined, tracks);
                console.log(`ðŸŽµ MusicList: EstratÃ©gia ${strategy.name} funcionou!`);
                return true;
            } catch (error) {
                console.log(`ðŸŽµ MusicList: EstratÃ©gia ${strategy.name} falhou:`, error);
                continue;
            }
        }

        return false;
    };

    // Estabilizar tracks para evitar piscamentos - SoluÃ§Ã£o mais robusta
    useEffect(() => {
        if (tracks && tracks.length > 0) {
            // SÃ³ atualiza se realmente mudou significativamente
            const currentIds = tracks.map(t => t.id).sort().join(',');
            const stableIds = stableTracks.map(t => t.id).sort().join(',');

            if (currentIds !== stableIds) {
                setIsStable(false);
                // Delay para estabilizar visualmente
                const timer = setTimeout(() => {
                    setStableTracks([...tracks]);
                    setIsStable(true);
                }, 100);
                return () => clearTimeout(timer);
            }
        } else if (tracks.length === 0 && stableTracks.length > 0) {
            setIsStable(false);
            setStableTracks([]);
            setIsStable(true);
        }
    }, [tracks]);

    // Usar cache se disponÃ­vel, senÃ£o usar props
    const finalDownloadedTrackIds = downloadsCache.downloadedTrackIds.length > 0
        ? downloadsCache.downloadedTrackIds
        : downloadedTrackIds;
    const finalLikedTrackIds = downloadsCache.likedTrackIds;

    // Hook para infinite scroll
    const { loadingRef, isLoadingMore: infiniteScrollLoading } = useInfiniteScroll({
        hasMore: enableInfiniteScroll ? hasMore : false,
        isLoading: isLoading || isLoadingMore,
        onLoadMore,
        threshold: 200,
        rootMargin: '0px 0px 300px 0px'
    });

    // Agrupar mÃºsicas por data de postagem - Otimizado para evitar re-renderizaÃ§Ãµes
    const groupedTracks = useMemo(() => {
        if (!stableTracks || stableTracks.length === 0) return {};

        const groups: GroupedTracks = {};

        stableTracks.forEach(track => {
            const trackDate = track.releaseDate || track.createdAt;
            if (!trackDate) return;

            const dateKey = getDateKeyBrazil(trackDate);
            const date = new Date(trackDate);

            if (!groups[dateKey]) {
                let label = '';
                if (dateKey === 'today') {
                    label = 'Hoje';
                } else if (dateKey === 'yesterday') {
                    label = formatDateExtendedBrazil(date);
                } else if (dateKey === 'future') {
                    label = 'Em breve';
                } else {
                    label = formatDateExtendedBrazil(date);
                }

                groups[dateKey] = {
                    label,
                    tracks: [],
                    date
                };
            }

            groups[dateKey].tracks.push(track);
        });

        // Ordenar grupos por data (mais recente primeiro)
        const sortedGroups: GroupedTracks = {};
        Object.keys(groups)
            .sort((a, b) => {
                if (a === 'future') return -1;
                if (b === 'future') return 1;
                if (a === 'today') return -1;
                if (b === 'today') return 1;
                if (a === 'yesterday') return -1;
                if (b === 'yesterday') return 1;
                return groups[b].date.getTime() - groups[a].date.getTime();
            })
            .forEach(key => {
                sortedGroups[key] = groups[key];
            });

        return sortedGroups;
    }, [stableTracks]);

    // PaginaÃ§Ã£o dos grupos - Otimizada para evitar re-renderizaÃ§Ãµes
    const paginatedGroups = useMemo(() => {
        const groupKeys = Object.keys(groupedTracks);
        if (groupKeys.length === 0) return {};
        if (enableInfiniteScroll) {
            // Infinite scroll: mostrar todos os grupos até a página atual (comportamento antigo)
            const endIndex = currentPage * itemsPerPage;
            const pageGroups = groupKeys.slice(0, endIndex);
            const result: GroupedTracks = {};
            pageGroups.forEach(key => {
                result[key] = groupedTracks[key];
            });
            return result;
        }

        // Paginação: pode cortar grupos entre páginas
        // 1. Juntar todas as tracks em ordem, mantendo referência ao grupo
        const allTracksWithGroup: Array<{ groupKey: string; group: typeof groupedTracks[string]; track: Track; trackIndex: number; groupTrackIndex: number; }> = [];
        groupKeys.forEach(key => {
            const group = groupedTracks[key];
            group.tracks.forEach((track, idx) => {
                allTracksWithGroup.push({ groupKey: key, group, track, trackIndex: allTracksWithGroup.length, groupTrackIndex: idx });
            });
        });

        // 2. Selecionar as tracks da página atual
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageTracks = allTracksWithGroup.slice(startIndex, endIndex);

        // 3. Reconstruir os grupos para a página, incluindo headers de grupo mesmo se for continuação
        const pageGroups: GroupedTracks = {};
        pageTracks.forEach(({ groupKey, group, track, groupTrackIndex }) => {
            if (!pageGroups[groupKey]) {
                // Se for continuação, manter o mesmo header
                pageGroups[groupKey] = { ...group, tracks: [] };
            }
            pageGroups[groupKey].tracks.push(track);
        });

        return pageGroups;
    }, [groupedTracks, currentPage, itemsPerPage, enableInfiniteScroll]);

    // Calcular total de páginas para paginação agrupada
    const totalPages = React.useMemo(() => {
    // Total de páginas baseado no total de músicas
    const totalTracks = Object.values(groupedTracks).reduce((acc, group) => acc + group.tracks.length, 0);
    return Math.max(1, Math.ceil(totalTracks / itemsPerPage));
    }, [groupedTracks, itemsPerPage]);

    const generateThumbnail = (track: Track) => {
        if (!track.songName || !track.artist) {
            return { initials: '?', colors: 'from-gray-500 to-gray-700' };
        }

        return {
            initials: generateInitials(track.songName, track.artist),
            colors: generateGradientColors(track.songName, track.artist)
        };
    };

    const isDownloaded = (track: Track) => finalDownloadedTrackIds.includes(track.id);
    const isLiked = (track: Track) => finalLikedTrackIds.includes(track.id);

    const handlePlayPause = async (track: Track) => {
        try {
            // Se a mÃºsica atual jÃ¡ estÃ¡ tocando, apenas pausar/despausar
            if (currentTrack?.id === track.id && isPlaying) {
                console.log('ðŸŽµ MusicList: MÃºsica jÃ¡ tocando, alternando play/pause');
                togglePlayPause();
                return;
            }

            // Detectar dispositivo mÃ³vel e tipo
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isAndroid = /Android/i.test(navigator.userAgent);
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            const isChrome = /Chrome/i.test(navigator.userAgent);
            const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);

            console.log('ðŸŽµ MusicList: Dispositivo detectado:', {
                isMobile,
                isAndroid,
                isIOS,
                isChrome,
                isSafari
            });

            // Em dispositivos mÃ³veis, verificar permissÃµes primeiro
            if (isMobile && !hasUserInteracted) {
                console.log('ðŸŽµ MusicList: Primeira interaÃ§Ã£o em mobile - solicitando permissÃ£o');

                // EstratÃ©gia universal para mobile
                try {
                    // Tentar criar um contexto de Ã¡udio silencioso para "desbloquear" o Ã¡udio
                    if (window.AudioContext || (window as any).webkitAudioContext) {
                        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                        const audioContext = new AudioContextClass();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();

                        gainNode.gain.value = 0; // Volume 0 (silencioso)
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);

                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.001);

                        console.log('ðŸŽµ MusicList: Contexto de Ã¡udio mobile ativado');

                        // Aguardar um pouco para o contexto ser estabelecido
                        await new Promise(resolve => setTimeout(resolve, 100));

                        audioContext.close();
                    }
                } catch (audioContextError) {
                    console.log('ðŸŽµ MusicList: Erro no contexto de Ã¡udio mobile:', audioContextError);
                }

                const permissionGranted = await requestAudioPermission();
                if (!permissionGranted) {
                    if (isAndroid) {
                        showToast('ðŸ”‡ Toque novamente para ativar o Ã¡udio no Android', 'warning');
                    } else if (isIOS) {
                        showToast('ðŸ”‡ Toque novamente para ativar o Ã¡udio no iOS', 'warning');
                    } else {
                        showToast('ðŸ”‡ Toque novamente para ativar o Ã¡udio no seu dispositivo', 'warning');
                    }
                    return;
                }
            }

            // SoluÃ§Ã£o universal para problemas de CORS em mobile
            if (isMobile && track.downloadUrl && track.downloadUrl.includes('contabostorage.com')) {
                console.log('ðŸŽµ MusicList: Mobile + Contabo - aplicando soluÃ§Ã£o universal CORS');

                // Verificar se esta URL jÃ¡ falhou recentemente
                if (failedUrls.has(track.downloadUrl)) {
                    console.log('ðŸŽµ MusicList: URL jÃ¡ falhou recentemente, tentando proxy direto');
                    try {
                        const trackWithProxy = {
                            ...track,
                            downloadUrl: `/api/audio-mobile-proxy?url=${encodeURIComponent(track.downloadUrl)}`
                        };
                        await playTrack(trackWithProxy, undefined, tracks);
                        return;
                    } catch (proxyError) {
                        console.log('ðŸŽµ MusicList: Proxy direto falhou para URL em cache:', proxyError);
                        showFileUnavailableMessage(track, 'arquivo nÃ£o disponÃ­vel (pode ter sido removido)');
                        return;
                    }
                }

                // Verificar se a URL estÃ¡ acessÃ­vel antes de tentar proxy
                try {
                    console.log('ðŸŽµ MusicList: Verificando acessibilidade da URL antes do proxy');
                    const testResponse = await fetch(track.downloadUrl, {
                        method: 'HEAD',
                        signal: AbortSignal.timeout(5000) // 5 segundos timeout
                    });

                    if (testResponse.status === 401 || testResponse.status === 403) {
                        console.log(`ðŸŽµ MusicList: URL retorna ${testResponse.status} - arquivo nÃ£o autorizado`);
                        showFileUnavailableMessage(track, 'arquivo nÃ£o autorizado ou removido');
                        return;
                    } else if (testResponse.status === 404) {
                        console.log('ðŸŽµ MusicList: URL retorna 404 - arquivo nÃ£o encontrado');
                        showFileUnavailableMessage(track, 'arquivo nÃ£o encontrado (pode ter sido movido)');
                        return;
                    } else if (!testResponse.ok) {
                        console.log(`ðŸŽµ MusicList: URL retorna ${testResponse.status} - erro desconhecido`);
                        // Continuar com proxy para tentar resolver CORS
                    } else {
                        console.log('ðŸŽµ MusicList: URL acessÃ­vel, tentando proxy para resolver CORS');
                    }
                } catch (testError) {
                    console.log('ðŸŽµ MusicList: Erro ao testar URL:', testError);
                    // Se nÃ£o conseguir testar, continuar com proxy
                }

                // Para iOS Safari e Android Chrome, sempre usar proxy CORS
                if ((isIOS && isSafari) || (isAndroid && isChrome)) {
                    console.log('ðŸŽµ MusicList: Usando proxy CORS para', isIOS ? 'iOS Safari' : 'Android Chrome');

                    // Sistema de retry com 3 tentativas
                    for (let attempt = 1; attempt <= 3; attempt++) {
                        try {
                            console.log(`ðŸŽµ MusicList: Tentativa ${attempt}/3 com proxy CORS`);

                            const proxyUrl = `/api/audio-mobile-proxy?url=${encodeURIComponent(track.downloadUrl)}`;

                            // Verificar se o proxy estÃ¡ funcionando com timeout
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos

                            const proxyResponse = await fetch(proxyUrl, {
                                signal: controller.signal,
                                method: 'HEAD' // Usar HEAD para teste mais rÃ¡pido
                            });

                            clearTimeout(timeoutId);

                            if (proxyResponse.ok) {
                                console.log(`ðŸŽµ MusicList: Proxy CORS funcionou na tentativa ${attempt}`);

                                // Criar uma nova track com URL do proxy
                                const trackWithProxy = {
                                    ...track,
                                    downloadUrl: proxyUrl
                                };

                                await playTrack(trackWithProxy, undefined, tracks);
                                return;
                            } else if (proxyResponse.status === 401 || proxyResponse.status === 403) {
                                // Se for erro de autorizaÃ§Ã£o, nÃ£o tentar mais com proxy
                                console.log(`ðŸŽµ MusicList: Erro de autorizaÃ§Ã£o (${proxyResponse.status}) - arquivo nÃ£o acessÃ­vel`);
                                showFileUnavailableMessage(track, 'arquivo nÃ£o autorizado ou removido');
                                return;
                            } else {
                                throw new Error(`Proxy falhou com status ${proxyResponse.status}`);
                            }
                        } catch (proxyError) {
                            console.log(`ðŸŽµ MusicList: Tentativa ${attempt}/3 falhou:`, proxyError);

                            if (attempt === 3) {
                                // Adicionar URL ao cache de falhas
                                setFailedUrls(prev => new Set([...prev, track.downloadUrl]));

                                // Ãšltima tentativa: tentar URL direta
                                try {
                                    console.log('ðŸŽµ MusicList: Ãšltima tentativa com URL direta');
                                    await playTrack(track, undefined, tracks);
                                    return;
                                } catch (finalError) {
                                    console.log('ðŸŽµ MusicList: URL direta tambÃ©m falhou:', finalError);
                                    showFileUnavailableMessage(track, 'erro de reproduÃ§Ã£o');
                                    return;
                                }
                            } else {
                                // Aguardar um pouco antes da prÃ³xima tentativa
                                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                            }
                        }
                    }
                } else {
                    // Para outros navegadores mobile, tentar proxy direto
                    try {
                        console.log('ðŸŽµ MusicList: Outro navegador mobile - tentando proxy direto');
                        const trackWithProxy = {
                            ...track,
                            downloadUrl: `/api/audio-mobile-proxy?url=${encodeURIComponent(track.downloadUrl)}`
                        };
                        await playTrack(trackWithProxy, undefined, tracks);
                        return;
                    } catch (proxyError) {
                        console.log('ðŸŽµ MusicList: Proxy direto falhou, tentando URL original:', proxyError);
                        // Continuar com a URL original
                    }
                }
            }

            // Passar a lista de mÃºsicas atual para permitir navegaÃ§Ã£o
            try {
                await playTrack(track, undefined, tracks);
            } catch (playError) {
                console.log('ðŸŽµ MusicList: Erro ao tocar mÃºsica diretamente:', playError);

                // Se falhar, tentar com estratÃ©gias de fallback
                if (isMobile && track.downloadUrl && track.downloadUrl.includes('contabostorage.com')) {
                    console.log('ðŸŽµ MusicList: Tentando estratÃ©gias de fallback para mobile');

                    const fallbackSuccess = await tryPlayWithFallback(track, tracks);
                    if (fallbackSuccess) {
                        return;
                    }

                    // Se todas as estratÃ©gias falharem, mostrar mensagem de erro
                    showFileUnavailableMessage(track, 'erro de reproduÃ§Ã£o em todas as estratÃ©gias');
                    return;
                } else {
                    showToast('âŒ Erro ao reproduzir mÃºsica. Tente novamente.', 'error');
                    return;
                }
            }
        } catch (error) {
            console.error('Erro ao tocar mÃºsica:', error);

            // Mensagens especÃ­ficas para mobile
            if (isMobile) {
                const isAndroid = /Android/i.test(navigator.userAgent);
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

                if (error instanceof Error) {
                    if (error.name === 'NotAllowedError') {
                        if (isAndroid) {
                            showToast('ðŸ”‡ PermissÃ£o negada no Android. Toque novamente.', 'warning');
                        } else if (isIOS) {
                            showToast('ðŸ”‡ PermissÃ£o negada no iOS. Toque novamente.', 'warning');
                        } else {
                            showToast('ðŸ”‡ Toque no botÃ£o de play para ativar o Ã¡udio', 'warning');
                        }
                    } else if (error.name === 'NotSupportedError') {
                        if (isAndroid) {
                            showToast('ðŸ”‡ Formato de Ã¡udio nÃ£o suportado no Android', 'error');
                        } else if (isIOS) {
                            showToast('ðŸ”‡ Formato de Ã¡udio nÃ£o suportado no iOS', 'error');
                        } else {
                            showToast('âŒ Formato de Ã¡udio nÃ£o suportado', 'error');
                        }
                    } else if (error.message.includes('CORS') || error.message.includes('cors')) {
                        if (isAndroid) {
                            showToast('ðŸ”‡ Erro de CORS no Android. Tentando soluÃ§Ã£o automÃ¡tica...', 'warning');
                        } else if (isIOS) {
                            showToast('ðŸ”‡ Erro de CORS no iOS. Tentando soluÃ§Ã£o automÃ¡tica...', 'warning');
                        } else {
                            showToast('âŒ Erro de CORS ao reproduzir Ã¡udio', 'error');
                        }
                    } else {
                        if (isAndroid) {
                            showToast('âŒ Erro ao reproduzir mÃºsica no Android', 'error');
                        } else if (isIOS) {
                            showToast('âŒ Erro ao reproduzir mÃºsica no iOS', 'error');
                        } else {
                            showToast('âŒ Erro ao reproduzir mÃºsica no dispositivo mÃ³vel', 'error');
                        }
                    }
                } else {
                    if (isAndroid) {
                        showToast('âŒ Erro desconhecido no Android', 'error');
                    } else if (isIOS) {
                        showToast('âŒ Erro desconhecido no iOS', 'error');
                    } else {
                        showToast('âŒ Erro desconhecido ao reproduzir mÃºsica', 'error');
                    }
                }
            } else {
                showToast('âŒ Erro ao reproduzir mÃºsica', 'error');
            }
        }
    };

    const handleDownload = async (track: Track) => {
        if (!session) {
            showToast('ðŸ” Ative um plano', 'warning');
            return;
        }

        if (isDownloaded(track)) {
            showToast('âœ… MÃºsica jÃ¡ foi baixada', 'info');
            return;
        }

        setDownloadingTracks(prev => new Set([...prev, track.id]));

        try {
            console.log('ðŸ” Iniciando download para track:', track.id);

            const response = await fetch(`/api/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.id || ''}`,
                },
                body: JSON.stringify({ trackId: track.id }),
            });

            console.log('ðŸ” Response status:', response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = 'Falha no download';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('âŒ Erro ao fazer parse da resposta de erro:', parseError);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('ðŸ” Dados da API:', data);

            if (!data.downloadUrl) {
                console.error('âŒ URL de download nÃ£o disponÃ­vel nos dados:', data);
                throw new Error('URL de download nÃ£o disponÃ­vel');
            }

            console.log('ðŸ” Fazendo download via proxy:', data.downloadUrl);

            // Fazer download do arquivo via nosso proxy
            const downloadResponse = await fetch(data.downloadUrl);
            console.log('ðŸ” Download response status:', downloadResponse.status, downloadResponse.statusText);

            if (!downloadResponse.ok) {
                console.error('âŒ Erro na resposta do download:', downloadResponse.status, downloadResponse.statusText);

                let errorMessage = `Erro ao baixar arquivo: ${downloadResponse.status}`;

                if (downloadResponse.status === 404) {
                    errorMessage = 'Arquivo nÃ£o encontrado no servidor';
                } else if (downloadResponse.status === 403) {
                    errorMessage = 'Acesso negado ao arquivo';
                } else if (downloadResponse.status === 500) {
                    errorMessage = 'Erro interno do servidor';
                } else if (downloadResponse.status === 0) {
                    errorMessage = 'Falha na conexÃ£o com o servidor';
                }

                throw new Error(errorMessage);
            }

            const blob = await downloadResponse.blob();
            console.log('ðŸ” Blob criado, tamanho:', blob.size);

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

            await downloadsCache.markAsDownloaded(track.id);
            showToast('âœ… Download concluÃ­do!', 'success');

            // Disparar evento customizado para notificar o contexto global
            window.dispatchEvent(new CustomEvent('trackDownloaded', {
                detail: { trackId: track.id, status: 'completed' }
            }));

            // Adicionar notificaÃ§Ã£o de download com dados da mÃºsica para push nativo
            addMusicNotification(
                'Download ConcluÃ­do',
                `"${track.songName}" de ${track.artist} foi baixada com sucesso!`,
                {
                    coverUrl: track.imageUrl || (typeof track.thumbnailUrl === 'string' ? track.thumbnailUrl : undefined),
                    artistName: track.artist,
                    songName: track.songName,
                    trackId: track.id
                },
                '/downloads',
                'Ver Downloads'
            );
        } catch (error) {
            console.error('âŒ Erro no download:', error);
            showToast(`âŒ ${error instanceof Error ? error.message : 'Erro ao baixar arquivo'}`, 'error');

            // Disparar evento customizado para notificar o contexto global sobre falha
            window.dispatchEvent(new CustomEvent('trackDownloaded', {
                detail: {
                    trackId: track.id,
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Erro desconhecido'
                }
            }));
        } finally {
            setDownloadingTracks(prev => {
                const newSet = new Set(prev);
                newSet.delete(track.id);
                return newSet;
            });
        }
    };

    const handleLike = async (track: Track) => {
        try {
            const isCurrentlyLiked = finalLikedTrackIds.includes(track.id);
            const action = isCurrentlyLiked ? 'unlike' : 'like';

            console.log('ðŸ” MusicList handleLike:', { trackId: track.id, action, isCurrentlyLiked });

            const response = await fetch('/api/tracks/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: track.id,
                    action: action
                })
            });

            if (!response.ok) {
                let errorMessage = 'Falha ao curtir/descurtir mÃºsica';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } else {
                        const textError = await response.text();
                        errorMessage = textError || errorMessage;
                    }
                } catch (parseError) {
                    console.error('âŒ Erro ao fazer parse da resposta:', parseError);
                    errorMessage = 'Falha ao processar resposta da API';
                }

                console.error('âŒ Response nÃ£o ok:', { error: errorMessage });
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('ðŸ” Response result:', result);

            if (result.success) {
                if (isCurrentlyLiked) {
                    downloadsCache.markAsUnliked(track.id);
                    showToast('ðŸ’” Removido dos favoritos', 'info');
                } else {
                    downloadsCache.markAsLiked(track.id);
                    showToast('â¤ï¸ Adicionado aos favoritos!', 'success');
                }

                // O downloadsCache jÃ¡ gerencia o estado dos likes automaticamente
            } else {
                throw new Error('API retornou success: false');
            }
        } catch (error) {
            console.error('âŒ Erro ao curtir mÃºsica:', error);
            showToast('âŒ Erro ao curtir mÃºsica', 'error');
        }
    };

    const handleStyleClick = (style: string | null | undefined) => {
        if (!style || style === 'N/A') return;
        router.push(`/genre/${encodeURIComponent(style)}`);
    };

    const handlePoolClick = (pool: string | null | undefined) => {
        if (!pool || pool === 'N/A') return;
        router.push(`/pool/${encodeURIComponent(pool)}`);
    };

    const handleArtistClick = (artist: string | null | undefined) => {
        if (!artist || artist === 'N/A') return;
        router.push(`/artist/${encodeURIComponent(artist)}`);
    };

    // FunÃ§Ã£o para renderizar artistas separados por background
    const renderArtists = (artistString: string | null | undefined) => {
        if (!artistString || artistString === 'N/A') return null;

        // Separar artistas por vÃ­rgula e limpar espaÃ§os
        const artists = artistString.split(',').map(artist => artist.trim()).filter(artist => artist);

        return (
            <div className="flex flex-wrap gap-1 max-w-full">
                {artists.map((artist, index) => (
                    <button
                        key={index}
                        onClick={() => handleArtistClick(artist)}
                        className="text-[#1db954] hover:text-[#1ed760] text-xs font-medium transition-all duration-200 cursor-pointer hover:underline"
                        title={`Filtrar por artista: ${artist}`}
                    >
                        {artist}
                    </button>
                ))}
            </div>
        );
    };

    const loadMoreGroups = () => {
        if (currentPage < totalPages && !isLoadingMore) {
            setIsLoadingMore(true);

            if (enableInfiniteScroll) {
                // Para infinite scroll, carregar prÃ³xima pÃ¡gina automaticamente
                const timeoutId = setTimeout(() => {
                    setCurrentPage(prev => prev + 1);
                    setIsLoadingMore(false);
                    console.log(`ðŸ“„ Infinite scroll: Carregada pÃ¡gina ${currentPage + 1} de ${totalPages}`);
                }, 300);

                return () => clearTimeout(timeoutId);
            } else {
                // PaginaÃ§Ã£o tradicional
                const timeoutId = setTimeout(() => {
                    setCurrentPage(prev => prev + 1);
                    setIsLoadingMore(false);
                }, 500);

                return () => clearTimeout(timeoutId);
            }
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    const downloadTracksInBatches = async (tracksToDownload: Track[], includeDownloaded: boolean) => {
        if (!session) {
            showToast('ðŸ” Ative um plano', 'warning');
            return;
        }

        const filteredTracks = includeDownloaded
            ? tracksToDownload
            : tracksToDownload.filter(track => !isDownloaded(track));

        if (filteredTracks.length === 0) {
            showToast('â„¹ï¸ Nenhuma mÃºsica nova para baixar', 'info');
            return;
        }

        const batchSize = 3;
        let downloadedCount = 0;
        let failedCount = 0;

        showToast(`ðŸ“¥ Iniciando download de ${filteredTracks.length} mÃºsicas...`, 'info');

        for (let i = 0; i < filteredTracks.length; i += batchSize) {
            const batch = filteredTracks.slice(i, i + batchSize);

            const promises = batch.map(async (track) => {
                if (downloadingTracks.has(track.id)) return;

                setDownloadingTracks(prev => new Set([...prev, track.id]));

                try {
                    const response = await fetch(`/api/download`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.user?.id || ''}`,
                        },
                        body: JSON.stringify({ trackId: track.id }),
                    });

                    if (!response.ok) {
                        throw new Error('Falha no download');
                    }

                    const data = await response.json();
                    if (!data.downloadUrl) {
                        throw new Error('URL de download nÃ£o encontrada');
                    }

                    // Baixar o arquivo diretamente da URL retornada
                    const fileResponse = await fetch(data.downloadUrl);
                    if (!fileResponse.ok) {
                        throw new Error('Falha ao baixar o arquivo');
                    }
                    const blob = await fileResponse.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${track.artist} - ${track.songName}.mp3`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    if (!isDownloaded(track)) {
                        setDownloadedTrackIds(prev => [...prev, track.id]);
                    }

                    downloadedCount++;
                } catch (error) {
                    console.error(`Erro no download de ${track.songName}:`, error);
                    failedCount++;
                } finally {
                    setDownloadingTracks(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(track.id);
                        return newSet;
                    });
                }
            });

            await Promise.all(promises);

            if (i + batchSize < filteredTracks.length) {
                await new Promise(resolve => {
                    const timeoutId = setTimeout(resolve, 1000);
                    // Cleanup se necessÃ¡rio
                    return () => clearTimeout(timeoutId);
                });
            }
        }

        if (downloadedCount > 0) {
            showToast(`âœ… ${downloadedCount} mÃºsica(s) baixada(s) com sucesso!`, 'success');
        }

        if (failedCount > 0) {
            showToast(`âŒ ${failedCount} download(s) falharam`, 'error');
        }
    };

    const downloadNewTracks = async (tracksToDownload: Track[]) => {
        await downloadTracksInBatches(tracksToDownload, false);
    };

    const downloadAllTracks = async (tracksToDownload: Track[]) => {
        await downloadTracksInBatches(tracksToDownload, true);
    };



    // Mostrar skeleton durante transições para evitar piscamentos
    if (!isStable || stableTracks.length === 0 || isLoading) {
        // Skeleton loader: 3 blocos grandes
        return (
            <div className="space-y-0 w-full overflow-x-hidden">
                <div className="animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-800 rounded-lg mb-4"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Banner de Permissão de Notificações */}
            {showNotificationPermission && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 mb-4 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">ðŸ“±</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm sm:text-base">Ativar Notificações Push</h3>
                                <p className="text-blue-100 text-xs sm:text-sm">
                                    Receba notificações sobre downloads e novas músicas
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={requestNotificationPermission}
                                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                            >
                                Ativar
                            </button>
                            <button
                                onClick={() => setShowNotificationPermission(false)}
                                className="px-3 py-2 text-blue-100 hover:text-white transition-colors"
                            >
                                âœ•
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Banner de Sincronização de Cache */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 mb-4 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-lg">ðŸ”„</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm sm:text-base">Sincronização de Downloads</h3>
                            <p className="text-green-100 text-xs sm:text-sm">
                                Seus downloads estão sincronizados com o banco de dados
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleForceSync}
                            className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors"
                        >
                            Sincronizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de músicas */}
            {showDate ? (
                // RenderizaÃ§Ã£o com agrupamento por data (padrÃ£o)
                groupedTracks && Object.keys(groupedTracks).length > 0 ? (
                    <div className="space-y-0 w-full overflow-x-hidden">
                        {Object.entries(paginatedGroups).map(([dateKey, group], groupIndex) => (
                            <div key={dateKey} className={`space-y-4 ${groupIndex > 0 ? 'pt-8' : ''}`}>
                                {/* CabeÃ§alho de data alinhado com o tÃ­tulo "Novidades" */}
                                <div className="relative mb-6">
                                    <div className="mb-3">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex items-center justify-between lg:justify-start gap-2 lg:gap-4 flex-nowrap">
                                                <h2 className="text-sm sm:text-lg lg:text-2xl text-white font-sans min-w-0 flex-1 break-words">
                                                    {group.label === 'Hoje' || group.label === 'Em breve' ? (
                                                        <span className="font-bold">{group.label}</span>
                                                    ) : (
                                                        <>
                                                            <span className="font-bold">{group.label.split(',')[0]}</span>
                                                            <span className="text-xs sm:text-base lg:text-xl">, {group.label.split(',').slice(1).join(',')}</span>
                                                        </>
                                                    )}
                                                </h2>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-gray-400 text-xs lg:text-base font-medium bg-gray-800/50 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full whitespace-nowrap">
                                                        {group.tracks.length} {group.tracks.length === 1 ? 'música' : 'músicas'}
                                                    </span>
                                                    {/* Indicador de sincronizaÃ§Ã£o com Google Drive */}
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/30 px-2 py-1 rounded-full border border-gray-700/50">
                                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                        </svg>
                                                        <span className="hidden sm:inline">Google Drive</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BotÃµes de download em massa responsivos */}
                                            <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 w-full lg:w-auto">
                                                <button
                                                    onClick={() => {
                                                        showMobileDownloadConfirmation('new', group.tracks, () => downloadNewTracks(group.tracks));
                                                    }}
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-2 sm:px-3 lg:px-4 py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all duration-200 transform hover:scale-105 shadow-lg border border-blue-400/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                                                    title={`Baixar ${group.tracks.filter(t => !downloadedTrackIds.includes(t.id)).length} mÃºsicas novas desta data`}
                                                >
                                                    <Download className="h-3 w-3 lg:h-4 lg:w-4" />
                                                    <span className="hidden sm:inline">Baixar Novas</span>
                                                    <span className="sm:hidden">Baixar Novas</span>
                                                    ({group.tracks.filter(t => !downloadedTrackIds.includes(t.id)).length})
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        showMobileDownloadConfirmation('all', group.tracks, () => downloadAllTracks(group.tracks));
                                                    }}
                                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-2 sm:px-3 lg:px-4 py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all duration-200 transform hover:scale-105 shadow-lg border border-green-400/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                                                    title={`Baixar todas as ${group.tracks.length} mÃºsicas desta data`}
                                                >
                                                    <Download className="h-3 w-3 lg:h-4 lg:w-4" />
                                                    <span className="hidden sm:inline">Baixar Tudo</span>
                                                    <span className="sm:hidden">Baixar Tudo</span>
                                                    ({group.tracks.length})
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linha verde sutil */}
                                    <div className="h-px bg-green-500/40 rounded-full"></div>


                                </div>

                                {/* Lista de mÃºsicas */}
                                <div className="">
                                    {/* Mobile: Grid de cards */}
                                    <div className="block sm:hidden">
                                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                            {group.tracks.map((track, index) => {
                                                const { initials, colors } = generateThumbnail(track);
                                                const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

                                                return (
                                                    <div key={track.id} className="">
                                                        <div className="group mb-3">
                                                            <div className="bg-black border border-white/10 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 group relative overflow-hidden">
                                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                                <div className="relative mb-2 sm:mb-2">
                                                                    {/* Thumbnail responsivo */}
                                                                    <div className="w-full aspect-square bg-black border border-gray-700 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden relative">
                                                                        <OptimizedImage
                                                                            track={track}
                                                                            className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                                                                            fallbackClassName={`w-full h-full bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-lg shadow-lg border border-gray-700 rounded-lg sm:rounded-xl`}
                                                                            fallbackContent={initials}
                                                                        />

                                                                        {/* Player sempre visÃ­vel na thumbnail - Mobile */}
                                                                        <button
                                                                            onClick={() => {
                                                                                if (!session) {
                                                                                    showToast('ðŸ” Ative um plano', 'warning');
                                                                                    return;
                                                                                }
                                                                                handlePlayPause(track);
                                                                            }}
                                                                            disabled={testingAudio.has(track.id)}
                                                                            className="absolute inset-0 bg-black/50 rounded-lg sm:rounded-xl opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-20 hover:bg-black/70"
                                                                            title={testingAudio.has(track.id) ? 'Testando compatibilidade...' : isCurrentlyPlaying ? 'Pausar' : 'Tocar'}
                                                                        >
                                                                            {testingAudio.has(track.id) ? (
                                                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                            ) : isCurrentlyPlaying ? (
                                                                                <Pause className="h-8 w-8 text-white drop-shadow-lg" />
                                                                            ) : (
                                                                                <Play className="h-8 w-8 text-white drop-shadow-lg ml-1" />
                                                                            )}
                                                                        </button>

                                                                        {/* Overlay preto com 70% de opacidade quando tocando - Mobile */}
                                                                        {currentTrack?.id === track.id && isPlaying && (
                                                                            <div className="absolute inset-0 bg-black/70 rounded-lg sm:rounded-xl z-20"></div>
                                                                        )}

                                                                        {/* Efeito de ondas sonoras quando tocando - Mobile */}
                                                                        {currentTrack?.id === track.id && isPlaying && (
                                                                            <div className="absolute inset-0 z-40 flex items-center justify-center">
                                                                                <div className="flex items-center gap-1">
                                                                                    <div className="w-1 h-2 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }}></div>
                                                                                    <div className="w-1 h-3 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }}></div>
                                                                                    <div className="w-1 h-1.5 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }}></div>
                                                                                    <div className="w-1 h-4 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1s' }}></div>
                                                                                    <div className="w-1 h-2 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '1s' }}></div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Badge do estilo da mÃºsica */}
                                                                        <div className="absolute top-1.5 left-1.5 z-40">
                                                                            <button
                                                                                onClick={() => handleStyleClick(track.style)}
                                                                                disabled={!track.style || track.style === 'N/A'}
                                                                                className={`px-0.5 text-white text-[9px] font-bold rounded-sm backdrop-blur-sm border transition-all duration-200 shadow-sm ${track.style && track.style !== 'N/A'
                                                                                    ? 'bg-emerald-500/90 border-emerald-400/50 cursor-pointer hover:bg-emerald-500 hover:scale-105 hover:shadow-md'
                                                                                    : 'bg-gray-600/90 border-gray-400/50 cursor-not-allowed opacity-60'
                                                                                    }`}
                                                                                title={track.style && track.style !== 'N/A' ? `Filtrar por estilo: ${track.style}` : 'Estilo nÃ£o disponÃ­vel'}
                                                                            >
                                                                                {track.style || 'N/A'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* InformaÃ§Ãµes da mÃºsica - Nome, Artista e Folder com espaÃ§amento igual */}
                                                                <div className="space-y-1.5 sm:space-y-2">
                                                                    <div className="overflow-hidden">
                                                                        <h3
                                                                            className="font-black text-white text-xs sm:text-base truncate cursor-pointer transition-all duration-500 ease-in-out tracking-tight"
                                                                            title={track.songName}
                                                                            onClick={() => {
                                                                                const element = event?.target as HTMLElement;
                                                                                if (element) {
                                                                                    element.classList.remove('truncate');
                                                                                    element.classList.add('whitespace-nowrap', 'animate-scroll-text');
                                                                                    element.style.animationDuration = '3s';

                                                                                    // Reset apÃ³s a animaÃ§Ã£o com cleanup
                                                                                    const timeoutId = setTimeout(() => {
                                                                                        if (element && element.parentNode) {
                                                                                            element.classList.remove('whitespace-nowrap', 'animate-scroll-text');
                                                                                            element.classList.add('truncate');
                                                                                            element.style.animationDuration = '';
                                                                                        }
                                                                                    }, 3000);

                                                                                    // Cleanup se o componente for desmontado
                                                                                    return () => clearTimeout(timeoutId);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {track.songName}
                                                                        </h3>
                                                                        <div className="text-xs sm:text-sm text-gray-300 font-medium truncate">
                                                                            {track.artist}
                                                                        </div>
                                                                    </div>

                                                                    {/* InformaÃ§Ãµes adicionais - Mobile */}
                                                                    <button
                                                                        onClick={() => {
                                                                            const folderName = track.folder || formatDateShortBrazil(track.updatedAt || track.createdAt);
                                                                            router.push(`/folder/${encodeURIComponent(folderName)}`);
                                                                        }}
                                                                        className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-200 cursor-pointer w-full relative z-50"
                                                                        title={`Ver todas as mÃºsicas do folder: ${track.folder || formatDateShortBrazil(track.updatedAt || track.createdAt)}`}
                                                                    >
                                                                        <span className="text-purple-400 text-xs">ðŸ“</span>
                                                                        <span className="text-gray-200 text-[10px] sm:text-xs font-medium truncate text-center">
                                                                            {track.folder || formatDateShortBrazil(track.updatedAt || track.createdAt)}
                                                                        </span>
                                                                    </button>

                                                                    {/* BotÃµes de aÃ§Ã£o - Mobile */}
                                                                    <div className="flex flex-col gap-2 mt-1 relative z-50">
                                                                        {/* BotÃ£o Download */}
                                                                        <button
                                                                            onClick={() => handleDownload(track)}
                                                                            disabled={downloadingTracks.has(track.id) || isDownloaded(track) || !session}
                                                                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 w-full transform hover:scale-105 active:scale-95 ${isDownloaded(track)
                                                                                ? 'bg-gradient-to-br from-green-500/30 to-green-600/40 text-green-400 border border-green-500/50 cursor-not-allowed shadow-lg shadow-green-500/20'
                                                                                : !session
                                                                                    ? 'bg-gradient-to-br from-gray-600/40 to-gray-700/50 text-gray-500 border border-gray-600/50 cursor-not-allowed shadow-lg shadow-gray-600/20'
                                                                                    : 'bg-gradient-to-br from-blue-600/60 to-blue-700/70 text-white border border-blue-500/60 hover:from-blue-500/70 hover:to-blue-600/80 hover:border-blue-400/70 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                                                                                } font-sans`}
                                                                            title={isDownloaded(track) ? 'MÃºsica jÃ¡ baixada' : !session ? 'Ative um plano' : 'Baixar mÃºsica'}
                                                                        >
                                                                            {downloadingTracks.has(track.id) ? (
                                                                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                                            ) : (
                                                                                <Download className="h-3 w-3" />
                                                                            )}
                                                                            <span>
                                                                                {isDownloaded(track) ? 'Baixado' : !session ? 'Login' : 'Download'}
                                                                            </span>
                                                                        </button>

                                                                        {/* BotÃ£o Like */}
                                                                        <button
                                                                            onClick={() => {
                                                                                if (!session) {
                                                                                    showToast('ðŸ” Ative um plano', 'warning');
                                                                                    return;
                                                                                }
                                                                                handleLike(track);
                                                                            }}
                                                                            disabled={!session}
                                                                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 w-full transform hover:scale-105 active:scale-95 ${!session
                                                                                ? 'bg-gradient-to-br from-gray-600/40 to-gray-700/50 text-gray-500 border border-gray-600/50 cursor-not-allowed shadow-lg shadow-gray-600/20'
                                                                                : isLiked(track)
                                                                                    ? 'bg-gradient-to-br from-red-500/30 to-red-600/40 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/20'
                                                                                    : 'bg-gradient-to-br from-pink-600/60 to-pink-700/70 text-white border border-pink-500/60 hover:from-pink-500/70 hover:to-pink-600/80 hover:border-pink-400/70 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40'
                                                                                } font-sans`}
                                                                            title={!session ? 'Ative um plano' : isLiked(track) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                                        >
                                                                            <Heart className={`h-3 w-3 ${isLiked(track) ? 'fill-current' : ''}`} />
                                                                            <span>
                                                                                {!session ? 'Login' : isLiked(track) ? 'Curtido' : 'Curtir'}
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Desktop: Lista original */}
                                    <div className="hidden sm:block">
                                        {group.tracks.map((track, index) => {
                                            const { initials, colors } = generateThumbnail(track);
                                            const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                                            const isDownloadedTrack = isDownloaded(track);

                                            return (
                                                <div key={track.id} className="overflow-x-hidden">
                                                    {/* Linha separadora sutil */}
                                                    {index > 0 && (
                                                        <div className="w-full h-px bg-white/15 mb-1 mt-0"></div>
                                                    )}
                                                    <div className="group py-1">
                                                        <div className="flex items-start gap-2 min-h-16 sm:min-h-20">
                                                            {/* Thumbnail responsivo */}
                                                            <div className="flex-shrink-0 relative h-16 w-16 sm:h-20 sm:w-20">
                                                                <ImageErrorBoundary
                                                                    fallback={
                                                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg border border-red-500/30`}>
                                                                            {initials}
                                                                        </div>
                                                                    }
                                                                >
                                                                    <OptimizedImage
                                                                        track={track}
                                                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover shadow-lg border border-red-500/30 z-10"
                                                                        fallbackClassName={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg border border-red-500/30`}
                                                                        fallbackContent={initials}
                                                                        style={{ position: 'absolute', inset: 0 }}
                                                                    />
                                                                </ImageErrorBoundary>



                                                                {/* Overlay preto com 70% de opacidade quando tocando */}
                                                                {currentTrack?.id === track.id && isPlaying && (
                                                                    <div className="absolute inset-0 bg-black/70 rounded-lg sm:rounded-xl z-20"></div>
                                                                )}

                                                                {/* Efeito de ondas sonoras quando tocando */}
                                                                {currentTrack?.id === track.id && isPlaying && (
                                                                    <div className="absolute inset-0 z-40 flex items-center justify-center">
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="w-1 h-2 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }}></div>
                                                                            <div className="w-1 h-4 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }}></div>
                                                                            <div className="w-1 h-3 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }}></div>
                                                                            <div className="w-1 h-5 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1s' }}></div>
                                                                            <div className="w-1 h-2 bg-gradient-to-t from-red-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '1s' }}></div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* BotÃ£o Play/Pause responsivo */}
                                                                <button
                                                                    onClick={() => {
                                                                        if (!session) {
                                                                            showToast('ðŸ” Ative um plano', 'warning');
                                                                            return;
                                                                        }
                                                                        handlePlayPause(track);
                                                                    }}
                                                                    disabled={testingAudio.has(track.id)}
                                                                    className="absolute inset-0 bg-red-900/60 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-30"
                                                                    title={testingAudio.has(track.id) ? 'Testando compatibilidade...' : isCurrentlyPlaying ? 'Pausar' : 'Tocar'}
                                                                >
                                                                    {testingAudio.has(track.id) ? (
                                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : isCurrentlyPlaying ? (
                                                                        <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
                                                                    ) : (
                                                                        <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg ml-0.5" />
                                                                    )}
                                                                </button>
                                                            </div>

                                                            {/* InformaÃ§Ãµes da mÃºsica responsivas */}
                                                            <div className="flex-1 min-w-0 pt-1">
                                                                <div className="flex items-center gap-2 mb-0.5 mt-0">
                                                                    <h3 className="text-white font-bold text-xs sm:text-sm truncate tracking-wide font-sans">
                                                                        {track.songName}
                                                                    </h3>

                                                                </div>

                                                                <div className="text-gray-300 text-xs sm:text-sm font-medium mb-0.5 font-sans">
                                                                    {renderArtists(track.artist)}
                                                                </div>

                                                                {/* Estilo, Pool e Folder - Responsivos */}
                                                                <div className="hidden sm:flex items-center gap-1 lg:gap-1.5">
                                                                    <button
                                                                        onClick={() => handleStyleClick(track.style)}
                                                                        disabled={!track.style || track.style === 'N/A'}
                                                                        className={`flex items-center gap-1 lg:gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${track.style && track.style !== 'N/A'
                                                                            ? 'bg-emerald-500/20 border border-emerald-500/30 cursor-pointer'
                                                                            : 'bg-gray-600/20 border border-gray-600/30 cursor-not-allowed opacity-50'
                                                                            }`}
                                                                        title={track.style && track.style !== 'N/A' ? `Filtrar por estilo: ${track.style}` : 'Estilo nÃ£o disponÃ­vel'}
                                                                    >
                                                                        <span className="text-emerald-400 text-xs">ðŸŽ­</span>
                                                                        <span className="text-gray-200 text-xs font-medium">
                                                                            {track.style || 'N/A'}
                                                                        </span>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handlePoolClick(track.pool)}
                                                                        disabled={!track.pool || track.pool === 'N/A'}
                                                                        className={`flex items-center gap-1 lg:gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${track.pool && track.pool !== 'N/A'
                                                                            ? 'bg-amber-500/20 border border-amber-500/30 cursor-pointer'
                                                                            : 'bg-gray-600/20 border border-gray-600/30 cursor-not-allowed opacity-50'
                                                                            }`}
                                                                        title={track.pool && track.pool !== 'N/A' ? `Filtrar por pool: ${track.pool}` : 'Pool nÃ£o disponÃ­vel'}
                                                                    >
                                                                        <span className="text-amber-500 text-xs">ðŸ·ï¸</span>
                                                                        <span className="text-gray-200 text-xs font-medium">
                                                                            {track.pool || 'N/A'}
                                                                        </span>
                                                                    </button>

                                                                    {/* Nova coluna Folder */}
                                                                    <button
                                                                        onClick={() => {
                                                                            const folderName = track.folder || formatDateShortBrazil(track.updatedAt || track.createdAt);
                                                                            router.push(`/folder/${encodeURIComponent(folderName)}`);
                                                                        }}
                                                                        className="flex items-center gap-1 lg:gap-1.5 px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-200 cursor-pointer"
                                                                        title={`Ver todas as mÃºsicas do folder: ${track.folder || formatDateShortBrazil(track.updatedAt || track.createdAt)}`}
                                                                    >
                                                                        <span className="text-purple-400 text-xs">ðŸ“</span>
                                                                        <span className="text-gray-200 text-[10px] sm:text-xs font-medium">
                                                                            {track.folder || formatDateShortBrazil(track.updatedAt || track.createdAt)}
                                                                        </span>
                                                                    </button>


                                                                </div>
                                                            </div>

                                                            {/* BotÃµes de aÃ§Ã£o responsivos */}
                                                            <div className="flex items-start gap-1 sm:gap-2 pt-1">
                                                                <button
                                                                    onClick={() => handleDownload(track)}
                                                                    disabled={downloadingTracks.has(track.id) || isDownloadedTrack || !session}
                                                                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-300 justify-center transform hover:scale-105 active:scale-95 ${isDownloadedTrack
                                                                        ? 'bg-gradient-to-br from-green-500/30 to-green-600/40 text-green-400 border border-green-500/50 cursor-not-allowed shadow-lg shadow-green-500/20'
                                                                        : !session
                                                                            ? 'bg-gradient-to-br from-gray-600/40 to-gray-700/50 text-gray-500 border border-gray-600/50 cursor-not-allowed shadow-lg shadow-gray-600/20'
                                                                            : 'bg-gradient-to-br from-blue-600/60 to-blue-700/70 text-white border border-blue-500/60 hover:from-blue-500/70 hover:to-blue-600/80 hover:border-blue-400/70 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                                                                        } font-sans`}
                                                                    title={isDownloadedTrack ? 'MÃºsica jÃ¡ baixada' : !session ? 'Ative um plano' : 'Baixar mÃºsica'}
                                                                >
                                                                    {downloadingTracks.has(track.id) ? (
                                                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <span className="flex justify-center w-full"><Download className="h-3 w-3" /></span>
                                                                    )}
                                                                    <span className="hidden sm:inline">
                                                                        {isDownloadedTrack ? 'Baixado' : !session ? 'Login' : 'Download'}
                                                                    </span>
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        if (!session) {
                                                                            showToast('ðŸ” Ative um plano', 'warning');
                                                                            return;
                                                                        }
                                                                        handleLike(track);
                                                                    }}
                                                                    disabled={!session}
                                                                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${!session
                                                                        ? 'bg-gradient-to-br from-gray-600/40 to-gray-700/50 text-gray-500 border border-gray-600/50 cursor-not-allowed shadow-lg shadow-gray-600/20'
                                                                        : isLiked(track)
                                                                            ? 'bg-gradient-to-br from-red-500/30 to-red-600/40 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/20'
                                                                            : 'bg-gradient-to-br from-pink-600/60 to-pink-700/70 text-white border border-pink-500/60 hover:from-pink-500/70 hover:to-pink-600/80 hover:border-pink-400/70 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40'
                                                                        } font-sans`}
                                                                    title={!session ? 'Ative um plano' : isLiked(track) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                                >
                                                                    <span className="flex justify-center w-full"><Heart className={`h-3 w-3 ${isLiked(track) ? 'fill-current' : ''}`} /></span>
                                                                    <span className="text-xs sm:text-sm">
                                                                        {!session ? 'Login' : isLiked(track) ? 'Curtido' : 'Curtir'}
                                                                    </span>
                                                                </button>


                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>


                            </div>
                        ))}

                        {/* Elemento de loading para infinite scroll */}
                        {enableInfiniteScroll && hasMore && (
                            <div
                                ref={loadingRef}
                                className="text-center py-8 px-4"
                            >
                                <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-300 text-sm font-medium">
                                        {infiniteScrollLoading || isLoadingMore ? 'Carregando mais mÃºsicas...' : 'Role para carregar mais'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Indicador de mais conteÃºdo responsivo - apenas para paginaÃ§Ã£o tradicional */}
                        {!enableInfiniteScroll && currentPage < totalPages && (
                            <div className="text-center py-8 px-4">
                                <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-gray-300 text-sm font-medium">
                                        HÃ¡ mais {totalPages - currentPage} pÃ¡gina(s) com mÃºsicas
                                    </span>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        )}

                        {/* Controles de paginaÃ§Ã£o responsivos - ocultos quando infinite scroll estÃ¡ ativo */}
                        {!enableInfiniteScroll && totalPages > 1 && (
                            <div className="mt-8 mb-4 px-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-gray-400 text-sm text-center sm:text-left">
                                        PÃ¡gina {currentPage} de {totalPages} â€¢ {Object.keys(paginatedGroups).length} de {Object.keys(groupedTracks).length} grupos
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={goToFirstPage}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
                                                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-gray-200'
                                                }`}
                                            title="Primeira pÃ¡gina"
                                        >
                                            Primeira
                                        </button>

                                        <button
                                            onClick={goToPreviousPage}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
                                                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-gray-200'
                                                }`}
                                            title="PÃ¡gina anterior"
                                        >
                                            Anterior
                                        </button>

                                        <span className="px-4 py-2 bg-gray-800/60 text-gray-300 text-sm font-medium rounded-lg">
                                            {currentPage}
                                        </span>

                                        <button
                                            onClick={loadMoreGroups}
                                            disabled={currentPage >= totalPages || isLoadingMore}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage >= totalPages
                                                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                                : isLoadingMore
                                                    ? 'bg-gray-600/60 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg'
                                                }`}
                                            title="Carregar mais grupos"
                                        >
                                            {currentPage >= totalPages ? 'Ãšltima' : isLoadingMore ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                    Carregando...
                                                </div>
                                            ) : 'Carregar Mais'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modal de ConfirmaÃ§Ã£o para Downloads Mobile */}
                        {showMobileConfirmModal && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
                                <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5 max-w-sm w-full mx-3">
                                    {/* Ãcone de Aviso */}
                                    <div className="flex justify-center mb-4">
                                        <div className="w-14 h-14 bg-yellow-500/20 border-2 border-yellow-500/30 rounded-full flex items-center justify-center">
                                            <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* TÃ­tulo */}
                                    <h3 className="text-white text-lg font-bold text-center mb-4">
                                        Aviso de Download
                                    </h3>

                                    {/* Mensagem */}
                                    <div className="text-gray-300 text-sm text-center mb-6 space-y-3">
                                        <p className="font-medium">
                                            {pendingDownloadAction?.type === 'new'
                                                ? `Baixar ${pendingDownloadAction.tracks.filter(t => !finalDownloadedTrackIds.includes(t.id)).length} mÃºsicas novas?`
                                                : `Baixar todas as ${pendingDownloadAction?.tracks.length} mÃºsicas?`
                                            }
                                        </p>

                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                            <p className="text-yellow-400 font-medium text-xs">
                                                âš ï¸ Celulares podem nÃ£o suportar muitos downloads simultÃ¢neos.
                                            </p>
                                            <p className="text-gray-300 text-xs mt-1">
                                                Recomendamos usar um computador para downloads em massa.
                                            </p>
                                        </div>

                                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                            <p className="text-purple-300 font-medium text-xs">
                                                ðŸ’Ž Para uma experiÃªncia premium, acesse nossa plataforma VIP!
                                            </p>
                                        </div>
                                    </div>

                                    {/* BotÃµes de AÃ§Ã£o */}
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
                                            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null
            ) : (
                // RenderizaÃ§Ã£o sem agrupamento por data (para community)
                tracks && tracks.length > 0 ? (
                    <div className="space-y-0 w-full overflow-x-hidden">
                        {/* Indicador de sincronizaÃ§Ã£o com Google Drive */}
                        <div className="flex items-center justify-center py-4 mb-6">
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800/30 px-3 py-1.5 rounded-full border border-gray-700/50">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <span>Sincronizado com Google Drive</span>
                            </div>
                        </div>
                        {/* Mobile: Grid de cards */}
                        <div className="block sm:hidden">
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                {tracks.map((track, index) => {
                                    const { initials, colors } = generateThumbnail(track);
                                    const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

                                    return (
                                        <div key={track.id} className="">
                                            <div className="group mb-3">
                                                <div className="bg-black border border-white/10 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 group relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    <div className="relative mb-2 sm:mb-2">
                                                        {/* Thumbnail responsivo */}
                                                        <div className="w-full aspect-square bg-black border border-gray-700 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden relative">
                                                            <OptimizedImage
                                                                track={track}
                                                                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                                                                fallbackClassName={`w-full h-full bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-lg shadow-lg border border-gray-700 rounded-lg sm:rounded-xl`}
                                                                fallbackContent={initials}
                                                            />

                                                            {/* Player sempre visÃ­vel na thumbnail - Mobile */}
                                                            <button
                                                                onClick={() => {
                                                                    if (!session) {
                                                                        showToast('ðŸ” Ative um plano', 'warning');
                                                                        return;
                                                                    }
                                                                    handlePlayPause(track);
                                                                }}
                                                                disabled={testingAudio.has(track.id)}
                                                                className="absolute inset-0 bg-black/50 rounded-lg sm:rounded-xl opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-20 hover:bg-black/70"
                                                                title={testingAudio.has(track.id) ? 'Testando compatibilidade...' : isCurrentlyPlaying ? 'Pausar' : 'Tocar'}
                                                            >
                                                                {testingAudio.has(track.id) ? (
                                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                ) : isCurrentlyPlaying ? (
                                                                    <Pause className="w-6 h-6 text-white" />
                                                                ) : (
                                                                    <Play className="w-6 h-6 text-white ml-1" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* InformaÃ§Ãµes da mÃºsica */}
                                                        <div className="px-1 sm:px-2">
                                                            <div className="text-white font-medium text-xs sm:text-sm truncate mb-1">
                                                                {track.songName}
                                                            </div>
                                                            <div className="text-gray-400 text-xs truncate">
                                                                {track.artist}
                                                            </div>
                                                        </div>

                                                        {/* BotÃµes de aÃ§Ã£o */}
                                                        <div className="flex items-center justify-between gap-1 mt-2 px-1 sm:px-2">
                                                            <button
                                                                onClick={() => handleDownload(track)}
                                                                disabled={downloadingTracks.has(track.id)}
                                                                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                                title={downloadedTrackIds.includes(track.id) ? 'JÃ¡ baixada' : 'Baixar mÃºsica'}
                                                            >
                                                                {downloadingTracks.has(track.id) ? (
                                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                                ) : downloadedTrackIds.includes(track.id) ? (
                                                                    'âœ…'
                                                                ) : (
                                                                    <Download className="w-3 h-3 mx-auto" />
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() => handleLike(track)}
                                                                disabled={liking === track.id}
                                                                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                                title={likedTrackIds.includes(track.id) ? 'Descurtir' : 'Curtir mÃºsica'}
                                                            >
                                                                {liking === track.id ? (
                                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                                ) : likedTrackIds.includes(track.id) ? (
                                                                    'â¤ï¸'
                                                                ) : (
                                                                    <Heart className="w-3 h-3 mx-auto" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop: Lista horizontal */}
                        <div className="hidden sm:block">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {tracks.map((track, index) => {
                                    const { initials, colors } = generateThumbnail(track);
                                    const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

                                    return (
                                        <div key={track.id} className="group">
                                            <div className="bg-black border border-white/10 rounded-xl p-3 group relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                <div className="relative">
                                                    {/* Thumbnail */}
                                                    <div className="w-full aspect-square bg-black border border-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative mb-3">
                                                        <OptimizedImage
                                                            track={track}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            fallbackClassName={`w-full h-full bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-lg shadow-lg border border-gray-700 rounded-lg`}
                                                            fallbackContent={initials}
                                                        />

                                                        {/* Player sempre visÃ­vel na thumbnail - Desktop */}
                                                        <button
                                                            onClick={() => {
                                                                if (!session) {
                                                                    showToast('ðŸ” Ative um plano', 'warning');
                                                                    return;
                                                                }
                                                                handlePlayPause(track);
                                                            }}
                                                            disabled={testingAudio.has(track.id)}
                                                            className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-20 hover:bg-black/70"
                                                            title={testingAudio.has(track.id) ? 'Testando compatibilidade...' : isCurrentlyPlaying ? 'Pausar' : 'Tocar'}
                                                        >
                                                            {testingAudio.has(track.id) ? (
                                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            ) : isCurrentlyPlaying ? (
                                                                <Pause className="w-6 h-6 text-white" />
                                                            ) : (
                                                                <Play className="w-6 h-6 text-white ml-1" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* InformaÃ§Ãµes da mÃºsica */}
                                                    <div className="mb-3">
                                                        <div className="text-white font-medium text-sm truncate mb-1">
                                                            {track.songName}
                                                        </div>
                                                        <div className="text-gray-400 text-xs truncate">
                                                            {track.artist}
                                                        </div>
                                                    </div>

                                                    {/* BotÃµes de aÃ§Ã£o */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDownload(track)}
                                                            disabled={downloadingTracks.has(track.id)}
                                                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                            title={downloadedTrackIds.includes(track.id) ? 'JÃ¡ baixada' : 'Baixar mÃºsica'}
                                                        >
                                                            {downloadingTracks.has(track.id) ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                            ) : downloadedTrackIds.includes(track.id) ? (
                                                                'âœ… JÃ¡ baixada'
                                                            ) : (
                                                                <Download className="w-4 h-4 mx-auto" />
                                                            )}
                                                        </button>

                                                        <button
                                                            onClick={() => handleLike(track)}
                                                            disabled={liking === track.id}
                                                            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                            title={likedTrackIds.includes(track.id) ? 'Descurtir' : 'Curtir mÃºsica'}
                                                        >
                                                            {liking === track.id ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                            ) : likedTrackIds.includes(track.id) ? (
                                                                'â¤ï¸ Curtida'
                                                            ) : (
                                                                <Heart className="w-4 h-4 mx-auto" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-lg">Nenhuma mÃºsica encontrada</div>
                    </div>
                )
            )}
        </div>
    );
}


