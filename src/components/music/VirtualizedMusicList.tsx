"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Track } from '@/types/track';
import { useToastContext } from '@/context/ToastContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useSession } from 'next-auth/react';
import { useNotificationContext } from '@/context/NotificationContext';
import { Play, Pause, Download, Heart, Plus, Calendar } from 'lucide-react';
import { formatDateBrazil, formatDateShortBrazil, formatDateExtendedBrazil, getDateKeyBrazil, isTodayBrazil, isYesterdayBrazil } from '@/utils/dateUtils';
import { useRouter, usePathname } from 'next/navigation';
import { useMobileAudio } from '@/hooks/useMobileAudio';
import { useDownloadsCache } from '@/hooks/useDownloadsCache';
import { useMusicImageLoader } from '@/hooks/useImageLoader';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ImageErrorBoundary } from '@/components/ui/ImageErrorBoundary';
import { generateGradientColors, generateInitials } from '@/utils/imageUtils';

interface VirtualizedMusicListProps {
    selectedGenre?: string;
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
    // Filtros ativos
    hasActiveFilters?: boolean;
}

interface GroupedTracks {
    [key: string]: {
        label: string;
        tracks: Track[];
        date: Date;
    };
}

// Componente individual do item da música (memoizado)
const MusicItem = React.memo(({
    track,
    index,
    isPlaying,
    isActive,
    hasDownloadedBefore,
    isLiked,
    onPlayPause,
    onDownload,
    onLike,
    onActivate,
    getDownloadButtonText,
    formatTimeLeft,
    downloadedTracksTime,
    session
}: {
    track: Track;
    index: number;
    isPlaying: boolean;
    isActive: boolean;
    hasDownloadedBefore: boolean;
    isLiked: boolean;
    onPlayPause: (track: Track) => void;
    onDownload: (track: Track) => void;
    onLike: (track: Track) => void;
    onActivate: (track: Track) => void;
    getDownloadButtonText: (track: Track) => string;
    formatTimeLeft: (seconds: number) => string;
    downloadedTracksTime: Record<number, number>;
    session: any;
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
        setImageError(true);
        setImageLoaded(false);
    }, []);

    const handlePlayPause = useCallback(() => {
        onPlayPause(track);
    }, [track, onPlayPause]);

    const handleDownload = useCallback(() => {
        onDownload(track);
    }, [track, onDownload]);

    const handleLike = useCallback(() => {
        onLike(track);
    }, [track, onLike]);

    const handleActivate = useCallback(() => {
        onActivate(track);
    }, [track, onActivate]);

    return (
        <div
            className={`group relative bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 ${isActive ? 'ring-2 ring-blue-500 bg-blue-900/20' : ''
                }`}
            style={{ minHeight: '120px' }}
        >
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div>

            <div className="relative z-10 flex items-center gap-4">
                {/* Thumbnail da música */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg flex-shrink-0 group-hover:shadow-blue-500/50 transition-all duration-300">
                    <ImageErrorBoundary>
                        {!imageError ? (
                            <img
                                src={track.imageUrl}
                                alt={`Capa de ${track.songName}`}
                                width={64}
                                height={64}
                                className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                    } group-hover:scale-110`}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {track.songName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </ImageErrorBoundary>

                    {/* Loading placeholder */}
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-gray-600 animate-pulse flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Informações da música */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base truncate group-hover:text-blue-300 transition-colors duration-300">
                        {track.songName}
                    </h3>
                    <p className="text-gray-400 text-sm truncate group-hover:text-gray-200 transition-colors duration-300">
                        {track.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        {track.style && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                                {track.style}
                            </span>
                        )}
                        {track.pool && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">
                                {track.pool}
                            </span>
                        )}
                    </div>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-2">
                    {/* Botão de play/pause */}
                    <button
                        onClick={handlePlayPause}
                        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/50"
                        title={isPlaying ? 'Pausar' : 'Tocar'}
                    >
                        {isPlaying ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                    </button>

                    {/* Botão de download */}
                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 transform hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/50"
                        title={getDownloadButtonText(track)}
                    >
                        <Download className="h-4 w-4" />
                    </button>

                    {/* Botão de like */}
                    {session?.user && (
                        <button
                            onClick={handleLike}
                            className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 group-hover:shadow-lg ${isLiked
                                    ? 'bg-red-600 hover:bg-red-700 text-white group-hover:shadow-red-500/50'
                                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300 group-hover:shadow-gray-500/50'
                                }`}
                            title={isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

MusicItem.displayName = 'MusicItem';

const VirtualizedMusicList = React.memo(function VirtualizedMusicList({
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
}: VirtualizedMusicListProps) {
    const { showToast } = useToastContext();
    const { playTrack, currentTrack, isPlaying, togglePlayPause, stopTrack } = useGlobalPlayer();
    const { data: session } = useSession();
    const { addDownloadNotification, addMusicNotification } = useNotificationContext();
    const router = useRouter();
    const pathname = usePathname();
    const { isMobile, hasUserInteracted, canPlayAudio, requestAudioPermission } = useMobileAudio();

    // Hook para cache de downloads
    const downloadsCache = useDownloadsCache();

    // Estados para funcionalidades
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [liking, setLiking] = useState<number | null>(null);
    const [showNotificationPermission, setShowNotificationPermission] = useState(false);
    const [stableTracks, setStableTracks] = useState<Track[]>([]);
    const [isStable, setIsStable] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [testingAudio, setTestingAudio] = useState<Set<number>>(new Set());

    // Estados para modal de confirmação mobile
    const [showMobileConfirmModal, setShowMobileConfirmModal] = useState(false);
    const [pendingDownloadAction, setPendingDownloadAction] = useState<{
        type: 'new' | 'all';
        tracks: Track[];
        callback: () => void;
    } | null>(null);

    // Cache para URLs que falharam (evitar tentativas repetidas)
    const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

    // Virtualização - apenas renderizar itens visíveis
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const containerRef = useRef<HTMLDivElement>(null);
    const itemHeight = 120; // altura estimada de cada item

    // Calcular itens visíveis baseado no scroll
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const scrollTop = containerRef.current.scrollTop;
        const containerHeight = containerRef.current.clientHeight;

        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(
            start + Math.ceil(containerHeight / itemHeight) + 5, // buffer de 5 itens
            tracks.length
        );

        setVisibleRange({ start, end });
    }, [tracks.length, itemHeight]);

    // Debounce do scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let timeoutId: NodeJS.Timeout;
        const debouncedHandleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleScroll, 16); // ~60fps
        };

        container.addEventListener('scroll', debouncedHandleScroll);
        return () => {
            container.removeEventListener('scroll', debouncedHandleScroll);
            clearTimeout(timeoutId);
        };
    }, [handleScroll]);

    // Itens visíveis para renderização
    const visibleTracks = useMemo(() => {
        return tracks.slice(visibleRange.start, visibleRange.end);
    }, [tracks, visibleRange]);

    // Altura total da lista para scrollbar
    const totalHeight = tracks.length * itemHeight;

    // Funções de callback otimizadas
    const handlePlayPause = useCallback((track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlayPause();
        } else {
            playTrack(track);
        }
    }, [currentTrack, togglePlayPause, playTrack]);

    const handleDownload = useCallback((track: Track) => {
        // Implementar lógica de download
        console.log('Download track:', track.id);
    }, []);

    const handleLike = useCallback((track: Track) => {
        // Implementar lógica de like
        console.log('Like track:', track.id);
    }, []);

    const handleActivate = useCallback((track: Track) => {
        // Implementar lógica de ativação
        console.log('Activate track:', track.id);
    }, []);

    const getDownloadButtonText = useCallback((track: Track) => {
        return downloadedTrackIds.includes(track.id) ? 'Baixado' : 'Baixar';
    }, [downloadedTrackIds]);

    const formatTimeLeft = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    const downloadedTracksTime: Record<number, number> = {};

    if (tracks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                    <div className="text-gray-400 text-lg">Nenhuma música encontrada</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Container com scroll virtualizado */}
            <div
                ref={containerRef}
                className="h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                style={{ height: '600px' }}
            >
                {/* Spacer para altura total */}
                <div style={{ height: totalHeight, position: 'relative' }}>
                    {/* Itens visíveis */}
                    <div
                        style={{
                            transform: `translateY(${visibleRange.start * itemHeight}px)`,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0
                        }}
                    >
                        {visibleTracks.map((track, index) => (
                            <div key={track.id} style={{ height: itemHeight, marginBottom: '16px' }}>
                                <MusicItem
                                    track={track}
                                    index={visibleRange.start + index}
                                    isPlaying={currentTrack?.id === track.id && isPlaying}
                                    isActive={currentTrack?.id === track.id}
                                    hasDownloadedBefore={downloadedTrackIds.includes(track.id)}
                                    isLiked={likedTrackIds.includes(track.id)}
                                    onPlayPause={handlePlayPause}
                                    onDownload={handleDownload}
                                    onLike={handleLike}
                                    onActivate={handleActivate}
                                    getDownloadButtonText={getDownloadButtonText}
                                    formatTimeLeft={formatTimeLeft}
                                    downloadedTracksTime={downloadedTracksTime}
                                    session={session}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default VirtualizedMusicList;
