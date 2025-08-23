"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Track } from '@/types/track';
import { useToastContext } from '@/context/ToastContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useSession } from 'next-auth/react';
import { useNotificationContext } from '@/context/NotificationContext';
import { Play, Pause, Download, Heart, Plus, Calendar } from 'lucide-react';
import { formatDateBrazil, formatDateExtendedBrazil, getDateKeyBrazil, isTodayBrazil, isYesterdayBrazil } from '@/utils/dateUtils';
import { useRouter } from 'next/navigation';
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
}

interface GroupedTracks {
    [key: string]: {
        label: string;
        tracks: Track[];
        date: Date;
    };
}

export const MusicList = React.memo(({
    tracks,
    downloadedTrackIds,
    setDownloadedTrackIds,
    showDate = true,
    itemsPerPage = 4,
    hasMore = false,
    isLoading = false,
    onLoadMore = () => { },
    enableInfiniteScroll = false
}: MusicListProps) => {
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [testingAudio, setTestingAudio] = useState<Set<number>>(new Set());
    const [stableTracks, setStableTracks] = useState<Track[]>([]);
    const [isStable, setIsStable] = useState(false);
    const { showToast } = useToastContext();
    const { playTrack, currentTrack, isPlaying } = useGlobalPlayer();
    const { data: session } = useSession();
    const { addDownloadNotification } = useNotificationContext();
    const router = useRouter();
    const { isMobile, hasUserInteracted, canPlayAudio, requestAudioPermission } = useMobileAudio();

    // Hook para cache de downloads
    const downloadsCache = useDownloadsCache();

    // Estabilizar tracks para evitar piscamentos - Solução mais robusta
    useEffect(() => {
        if (tracks && tracks.length > 0) {
            // Só atualiza se realmente mudou significativamente
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

    // Usar cache se disponível, senão usar props
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

    // Agrupar músicas por data de postagem - Otimizado para evitar re-renderizações
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

    // Paginação dos grupos - Otimizada para evitar re-renderizações
    const paginatedGroups = useMemo(() => {
        const groupKeys = Object.keys(groupedTracks);

        if (groupKeys.length === 0) return {};

        if (enableInfiniteScroll) {
            // Para infinite scroll, mostrar todos os grupos até a página atual
            const endIndex = currentPage * itemsPerPage;
            const pageGroups = groupKeys.slice(0, endIndex);

            const result: GroupedTracks = {};
            pageGroups.forEach(key => {
                result[key] = groupedTracks[key];
            });

            return result;
        } else {
            // Paginação tradicional
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageGroups = groupKeys.slice(startIndex, endIndex);

            const result: GroupedTracks = {};
            pageGroups.forEach(key => {
                result[key] = groupedTracks[key];
            });

            return result;
        }
    }, [groupedTracks, currentPage, itemsPerPage, enableInfiniteScroll]);

    const totalPages = Math.ceil(Object.keys(groupedTracks).length / itemsPerPage);

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
            // Em dispositivos móveis, verificar permissões primeiro
            if (isMobile && !hasUserInteracted) {
                console.log('🎵 MusicList: Primeira interação em mobile - solicitando permissão');
                const permissionGranted = await requestAudioPermission();
                if (!permissionGranted) {
                    showToast('🔇 Toque novamente para ativar o áudio no seu dispositivo', 'warning');
                    return;
                }
            }

            // Passar a lista de músicas atual para permitir navegação
            await playTrack(track, undefined, tracks);
        } catch (error) {
            console.error('Erro ao tocar música:', error);

            // Mensagens específicas para mobile
            if (isMobile) {
                if (error instanceof Error && error.name === 'NotAllowedError') {
                    showToast('🔇 Toque no botão de play para ativar o áudio', 'warning');
                } else {
                    showToast('❌ Erro ao reproduzir música no dispositivo móvel', 'error');
                }
            } else {
                showToast('❌ Erro ao reproduzir música', 'error');
            }
        }
    };

    const handleDownload = async (track: Track) => {
        if (!session) {
            showToast('🔐 Faça login para baixar músicas', 'warning');
            return;
        }

        if (isDownloaded(track)) {
            showToast('✅ Música já foi baixada', 'info');
            return;
        }

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
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha no download');
            }

            const data = await response.json();

            if (!data.downloadUrl) {
                throw new Error('URL de download não disponível');
            }

            // Fazer download do arquivo
            const downloadResponse = await fetch(data.downloadUrl);
            if (!downloadResponse.ok) {
                throw new Error('Erro ao baixar arquivo');
            }

            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${track.artist} - ${track.songName}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            downloadsCache.markAsDownloaded(track.id);
            showToast('✅ Download concluído!', 'success');

            // Adicionar notificação de download
            addDownloadNotification(
                'Download Concluído',
                `"${track.songName}" de ${track.artist} foi baixada com sucesso!`,
                '/downloads',
                'Ver Downloads'
            );
        } catch (error) {
            console.error('Erro no download:', error);
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

            console.log('🔍 MusicList handleLike:', { trackId: track.id, action, isCurrentlyLiked });

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
                let errorMessage = 'Falha ao curtir/descurtir música';
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
                    console.error('❌ Erro ao fazer parse da resposta:', parseError);
                    errorMessage = 'Falha ao processar resposta da API';
                }

                console.error('❌ Response não ok:', { error: errorMessage });
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('🔍 Response result:', result);

            if (result.success) {
                if (isCurrentlyLiked) {
                    downloadsCache.markAsUnliked(track.id);
                    showToast('💔 Removido dos favoritos', 'info');
                } else {
                    downloadsCache.markAsLiked(track.id);
                    showToast('❤️ Adicionado aos favoritos!', 'success');
                }

                // O downloadsCache já gerencia o estado dos likes automaticamente
            } else {
                throw new Error('API retornou success: false');
            }
        } catch (error) {
            console.error('❌ Erro ao curtir música:', error);
            showToast('❌ Erro ao curtir música', 'error');
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

    // Função para renderizar artistas separados por background
    const renderArtists = (artistString: string | null | undefined) => {
        if (!artistString || artistString === 'N/A') return null;

        // Separar artistas por vírgula e limpar espaços
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
                // Para infinite scroll, carregar próxima página automaticamente
                const timeoutId = setTimeout(() => {
                    setCurrentPage(prev => prev + 1);
                    setIsLoadingMore(false);
                    console.log(`📄 Infinite scroll: Carregada página ${currentPage + 1} de ${totalPages}`);
                }, 300);

                return () => clearTimeout(timeoutId);
            } else {
                // Paginação tradicional
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
            showToast('🔐 Faça login para baixar músicas', 'warning');
            return;
        }

        const filteredTracks = includeDownloaded
            ? tracksToDownload
            : tracksToDownload.filter(track => !isDownloaded(track));

        if (filteredTracks.length === 0) {
            showToast('ℹ️ Nenhuma música nova para baixar', 'info');
            return;
        }

        const batchSize = 3;
        let downloadedCount = 0;
        let failedCount = 0;

        showToast(`📥 Iniciando download de ${filteredTracks.length} músicas...`, 'info');

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
                        throw new Error('URL de download não encontrada');
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
                    // Cleanup se necessário
                    return () => clearTimeout(timeoutId);
                });
            }
        }

        if (downloadedCount > 0) {
            showToast(`✅ ${downloadedCount} música(s) baixada(s) com sucesso!`, 'success');
        }

        if (failedCount > 0) {
            showToast(`❌ ${failedCount} download(s) falharam`, 'error');
        }
    };

    const downloadNewTracks = async (tracksToDownload: Track[]) => {
        await downloadTracksInBatches(tracksToDownload, false);
    };

    const downloadAllTracks = async (tracksToDownload: Track[]) => {
        await downloadTracksInBatches(tracksToDownload, true);
    };

    // Mostrar skeleton durante transições para evitar piscamentos
    if (!isStable || stableTracks.length === 0) {
        return (
            <div className="space-y-0 w-full overflow-x-hidden">
                <div className="animate-pulse">
                    <div className="h-32 bg-gray-800 rounded-lg mb-4"></div>
                    <div className="h-32 bg-gray-800 rounded-lg mb-4"></div>
                    <div className="h-32 bg-gray-800 rounded-lg mb-4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-0 w-full overflow-x-hidden">
            {Object.entries(paginatedGroups).map(([dateKey, group], groupIndex) => (
                <div key={dateKey} className={`space-y-4 ${groupIndex > 0 ? 'pt-8' : ''}`}>
                    {/* Cabeçalho de data alinhado com o título "Novidades" */}
                    <div className="relative mb-6">
                        <div className="mb-3">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex items-center justify-between lg:justify-start gap-2 lg:gap-4 flex-nowrap">
                                    <h2 className="text-lg lg:text-2xl text-white font-sans min-w-0 flex-1 break-words">
                                        {group.label === 'Hoje' || group.label === 'Em breve' ? (
                                            <span className="font-bold">{group.label}</span>
                                        ) : (
                                            <>
                                                <span className="font-bold">{group.label.split(',')[0]}</span>
                                                <span className="text-base lg:text-xl">, {group.label.split(',').slice(1).join(',')}</span>
                                            </>
                                        )}
                                    </h2>
                                    <span className="text-gray-400 text-xs lg:text-base font-medium bg-gray-800/50 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full whitespace-nowrap shrink-0 ml-1 lg:ml-2">
                                        {group.tracks.length} {group.tracks.length === 1 ? 'música' : 'músicas'}
                                    </span>
                                </div>

                                {/* Botões de download em massa responsivos */}
                                <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 w-full lg:w-auto">
                                    <button
                                        onClick={() => downloadNewTracks(group.tracks)}
                                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-3 lg:px-4 py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all duration-200 transform hover:scale-105 shadow-lg border border-blue-400/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                                        title={`Baixar ${group.tracks.filter(t => !downloadedTrackIds.includes(t.id)).length} músicas novas desta data`}
                                    >
                                        <Download className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Baixar Novas</span>
                                        <span className="sm:hidden">Novas</span>
                                        ({group.tracks.filter(t => !downloadedTrackIds.includes(t.id)).length})
                                    </button>

                                    <button
                                        onClick={() => downloadAllTracks(group.tracks)}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 lg:px-4 py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all duration-200 transform hover:scale-105 shadow-lg border border-green-400/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                                        title={`Baixar todas as ${group.tracks.length} músicas desta data`}
                                    >
                                        <Download className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span className="hidden sm:inline">Baixar Tudo</span>
                                        <span className="sm:hidden">Tudo</span>
                                        ({group.tracks.length})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Linha verde sutil */}
                        <div className="h-px bg-green-500/40 rounded-full"></div>
                    </div>

                    {/* Lista de músicas */}
                    <div className="">
                        {/* Mobile: Grid de 2 itens por linha */}
                        <div className="block sm:hidden">
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                {group.tracks.map((track, index) => {
                                    const { initials, colors } = generateThumbnail(track);
                                    const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

                                    return (
                                        <div key={track.id} className="">
                                            <div className="group mb-4">
                                                <div className="bg-black border border-gray-700/50 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 group relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    <div className="relative mb-1.5 sm:mb-2">
                                                        {/* Thumbnail com botão play centralizado */}
                                                        <div className="w-full aspect-square bg-black border border-gray-700 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden relative">
                                                            <OptimizedImage
                                                                track={track}
                                                                className="w-full h-full object-cover"
                                                                fallbackClassName={`w-full h-full bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-lg shadow-lg border border-gray-700`}
                                                                fallbackContent={initials}
                                                            />

                                                            {/* Badge do estilo da música */}
                                                            <div className="absolute top-1.5 left-1.5">
                                                                <button
                                                                    onClick={() => handleStyleClick(track.style)}
                                                                    disabled={!track.style || track.style === 'N/A'}
                                                                    className={`px-1.5 py-0.5 text-white text-[10px] font-semibold rounded-md backdrop-blur-sm border transition-all duration-200 ${track.style && track.style !== 'N/A'
                                                                        ? 'bg-emerald-500/90 border-emerald-400/40 cursor-pointer hover:bg-emerald-500 hover:scale-105'
                                                                        : 'bg-gray-600/90 border-gray-400/40 cursor-not-allowed opacity-60'
                                                                        }`}
                                                                    title={track.style && track.style !== 'N/A' ? `Filtrar por estilo: ${track.style}` : 'Estilo não disponível'}
                                                                >
                                                                    {track.style || 'N/A'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Informações da música - Nome e Artista apenas */}
                                                    <div className="space-y-1.5 sm:space-y-2">
                                                        <div className="overflow-hidden">
                                                            <h3
                                                                className="font-black text-white text-xs sm:text-base truncate cursor-pointer transition-all duration-500 ease-in-out tracking-tight -mt-0.5"
                                                                title={track.songName}
                                                                onClick={() => {
                                                                    const element = event?.target as HTMLElement;
                                                                    if (element) {
                                                                        element.classList.remove('truncate');
                                                                        element.classList.add('whitespace-nowrap', 'animate-scroll-text');
                                                                        element.style.animationDuration = '3s';

                                                                        // Reset após a animação com cleanup
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
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-300 relative z-10 -mt-1 font-medium">
                                                            {renderArtists(track.artist)}
                                                        </div>

                                                        {/* Botões de ação - Mobile */}
                                                        <div className="flex flex-col gap-2 mt-3">
                                                            {/* Botão Play/Pause */}
                                                            <button
                                                                onClick={() => handlePlayPause(track)}
                                                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isCurrentlyPlaying
                                                                    ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                                                    : 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                                                                    } font-sans`}
                                                            >
                                                                {isCurrentlyPlaying ? (
                                                                    <Pause className="h-3 w-3" />
                                                                ) : (
                                                                    <Play className="h-3 w-3" />
                                                                )}
                                                                <span>
                                                                    {isCurrentlyPlaying ? 'Pausar' : 'Tocar'}
                                                                </span>
                                                            </button>

                                                            {/* Botão Download */}
                                                            <button
                                                                onClick={() => handleDownload(track)}
                                                                disabled={downloadingTracks.has(track.id) || isDownloaded(track) || !session}
                                                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isDownloaded(track)
                                                                    ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-not-allowed'
                                                                    : !session
                                                                        ? 'bg-gray-600/40 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                                                                        : 'bg-gray-700/60 text-gray-300 border border-gray-600/50 hover:bg-gray-600/60 hover:text-gray-200'
                                                                    } font-sans`}
                                                                title={isDownloaded(track) ? 'Música já baixada' : !session ? 'Faça login para baixar' : 'Baixar música'}
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

                                                            {/* Botão Like */}
                                                            <button
                                                                onClick={() => {
                                                                    if (!session) {
                                                                        showToast('🔐 Faça login para curtir músicas', 'warning');
                                                                        return;
                                                                    }
                                                                    handleLike(track);
                                                                }}
                                                                disabled={!session}
                                                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${!session
                                                                    ? 'bg-gray-600/40 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                                                                    : isLiked(track)
                                                                        ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                                                        : 'bg-gray-700/60 text-gray-300 border border-gray-600/50 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30'
                                                                    } font-sans`}
                                                                title={!session ? 'Faça login para curtir' : isLiked(track) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
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



                                                    {/* Botão Play/Pause responsivo */}
                                                    <button
                                                        onClick={() => {
                                                            if (!session) {
                                                                showToast('🔐 Faça login para ouvir músicas', 'warning');
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

                                                {/* Informações da música responsivas */}
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <div className="flex items-center gap-2 mb-0.5 mt-0">
                                                        <h3 className="text-white font-bold text-xs sm:text-sm truncate tracking-wide font-sans">
                                                            {track.songName}
                                                        </h3>
                                                        {/* Indicador sutil de "tocando" */}
                                                        {currentTrack?.id === track.id && isPlaying && (
                                                            <span className="text-red-400 text-xs font-medium opacity-80">
                                                                (tocando)
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-gray-300 text-xs sm:text-sm font-medium mb-0.5 font-sans">
                                                        {renderArtists(track.artist)}
                                                    </div>

                                                    {/* Estilo, Pool e Bitrate - Responsivos */}
                                                    <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                                                        <button
                                                            onClick={() => handleStyleClick(track.style)}
                                                            disabled={!track.style || track.style === 'N/A'}
                                                            className={`flex items-center gap-1 lg:gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${track.style && track.style !== 'N/A'
                                                                ? 'bg-emerald-500/20 border border-emerald-500/30 cursor-pointer'
                                                                : 'bg-gray-600/20 border border-gray-600/30 cursor-not-allowed opacity-50'
                                                                }`}
                                                            title={track.style && track.style !== 'N/A' ? `Filtrar por estilo: ${track.style}` : 'Estilo não disponível'}
                                                        >
                                                            <span className="text-emerald-400 text-xs">🎭</span>
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
                                                            title={track.pool && track.pool !== 'N/A' ? `Filtrar por pool: ${track.pool}` : 'Pool não disponível'}
                                                        >
                                                            <span className="text-amber-500 text-xs">🏷️</span>
                                                            <span className="text-gray-200 text-xs font-medium">
                                                                {track.pool || 'N/A'}
                                                            </span>
                                                        </button>

                                                        <div className={`flex items-center gap-1 lg:gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${track.bitrate
                                                            ? 'bg-blue-500/20 border border-blue-500/30'
                                                            : 'bg-blue-500/20 border border-blue-500/30'
                                                            }`}
                                                            title={track.bitrate ? `Bitrate: ${track.bitrate} kbps` : 'Bitrate: 320 kbps'}
                                                        >
                                                            <span className="text-blue-400 text-xs">🎵</span>
                                                            <span className="text-gray-200 text-xs font-medium">
                                                                {track.bitrate ? `${track.bitrate} kbps` : '320 kbps'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Botões de ação responsivos */}
                                                <div className="flex items-start gap-1 sm:gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleDownload(track)}
                                                        disabled={downloadingTracks.has(track.id) || isDownloadedTrack || !session}
                                                        className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 justify-center ${isDownloadedTrack
                                                            ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-not-allowed'
                                                            : !session
                                                                ? 'bg-gray-600/40 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                                                                : 'bg-gray-700/60 text-gray-300 border border-gray-600/50 hover:bg-gray-600/60 hover:text-gray-200'
                                                            } font-sans`}
                                                        title={isDownloadedTrack ? 'Música já baixada' : !session ? 'Faça login para baixar' : 'Baixar música'}
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
                                                                showToast('🔐 Faça login para curtir músicas', 'warning');
                                                                return;
                                                            }
                                                            handleLike(track);
                                                        }}
                                                        disabled={!session}
                                                        className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${!session
                                                            ? 'bg-gray-600/40 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                                                            : isLiked(track)
                                                                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                                                : 'bg-gray-700/60 text-gray-300 border border-gray-600/50 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30'
                                                            } font-sans`}
                                                        title={!session ? 'Faça login para curtir' : isLiked(track) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                    >
                                                        <span className="flex justify-center w-full"><Heart className={`h-3 w-3 ${isLiked(track) ? 'fill-current' : ''}`} /></span>
                                                        <span className="hidden sm:inline">
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

                    {/* Mensagem para usuários não logados */}
                    {!session && groupIndex === 0 && (
                        <div className="w-full flex flex-col items-center justify-center my-6 px-0 sm:px-0">
                            <div className="w-full min-h-[60vh] sm:min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/80 via-gray-900/90 to-gray-800/90 border-2 border-blue-700/30 rounded-none sm:rounded-2xl shadow-xl p-4 sm:p-10 text-center animate-fade-in">
                                <span className="text-4xl sm:text-6xl mb-4">🔊</span>
                                <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-200 mb-4 font-sans">Bem-vindo à plataforma!</h2>
                                <p className="text-gray-200 text-base sm:text-xl mb-6 font-sans max-w-2xl mx-auto">
                                    Usuários não logados podem <span className="text-green-300 font-semibold">ouvir todas as músicas gratuitamente</span>.<br className="hidden sm:block" />
                                    Para <span className="text-yellow-300 font-semibold">baixar faixas individuais</span> ou <span className="text-yellow-300 font-semibold">fazer downloads em massa</span>, é necessário ter um <span className="text-pink-300 font-semibold">plano pago</span>.<br className="hidden sm:block" />
                                    <span className="text-blue-200 font-semibold">Faça login ou assine para liberar todos os recursos.</span>
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto justify-center">
                                    <a href="/login" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all duration-200 shadow-md w-full sm:w-auto">Entrar</a>
                                    <a href="/planos" className="px-6 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg transition-all duration-200 shadow-md w-full sm:w-auto">Ver Planos</a>
                                </div>
                            </div>
                        </div>
                    )}
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
                            {infiniteScrollLoading || isLoadingMore ? 'Carregando mais músicas...' : 'Role para carregar mais'}
                        </span>
                    </div>
                </div>
            )}

            {/* Indicador de mais conteúdo responsivo - apenas para paginação tradicional */}
            {!enableInfiniteScroll && currentPage < totalPages && (
                <div className="text-center py-8 px-4">
                    <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-300 text-sm font-medium">
                            Há mais {totalPages - currentPage} página(s) com músicas
                        </span>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            )}

            {/* Controles de paginação responsivos - ocultos quando infinite scroll está ativo */}
            {!enableInfiniteScroll && totalPages > 1 && (
                <div className="mt-8 mb-4 px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-gray-400 text-sm text-center sm:text-left">
                            Página {currentPage} de {totalPages} • {Object.keys(paginatedGroups).length} de {Object.keys(groupedTracks).length} grupos
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToFirstPage}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 hover:text-gray-200'
                                    }`}
                                title="Primeira página"
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
                                title="Página anterior"
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
                                {currentPage >= totalPages ? 'Última' : isLoadingMore ? (
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
        </div>
    );
});


