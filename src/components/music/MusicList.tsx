"use client";

import React, { useState, useMemo } from 'react';
import { Track } from '@/types/track';
import { useToastContext } from '@/context/ToastContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useSession } from 'next-auth/react';
import { useNotificationContext } from '@/context/NotificationContext';
import { Play, Pause, Download, Heart } from 'lucide-react';
import { formatDateExtendedBrazil, getDateKeyBrazil } from '@/utils/dateUtils';
import { useMobileAudio } from '@/hooks/useMobileAudio';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { generateGradientColors, generateInitials } from '@/utils/imageUtils';

interface MusicListProps {
    tracks: Track[];
    downloadedTrackIds: number[];
    setDownloadedTrackIds: (ids: number[] | ((prev: number[]) => number[])) => void;
    showDate?: boolean;
    itemsPerPage?: number;
    isLoading?: boolean;
    likedTrackIds?: number[];
    setLikedTrackIds?: (ids: number[] | ((prev: number[]) => number[])) => void;
}

export default function MusicList({
    tracks,
    downloadedTrackIds = [],
    setDownloadedTrackIds,
    likedTrackIds = [],
    setLikedTrackIds,
    showDate = true,
    itemsPerPage = 60,
    isLoading = false
}: MusicListProps) {
    // Log para debug
    console.log('🎼 MusicList renderizando:', {
        tracksLength: tracks.length,
        firstTrackId: tracks[0]?.id,
        firstTrackName: tracks[0]?.songName,
        isLoading,
        showDate
    });

    const { showToast } = useToastContext();
    const { playTrack, currentTrack, isPlaying, togglePlayPause } = useGlobalPlayer();
    const { data: session } = useSession();
    const { addDownloadNotification } = useNotificationContext();
    const { isMobile, canPlayAudio, requestAudioPermission } = useMobileAudio();

    // Estados
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [liking, setLiking] = useState<number | null>(null);
    const [testingAudio, setTestingAudio] = useState<Set<number>>(new Set());

    // Garantir que downloadedTrackIds seja sempre um array
    const safeDownloadedTrackIds = Array.isArray(downloadedTrackIds) ? downloadedTrackIds : [];
    const safeLikedTrackIds = Array.isArray(likedTrackIds) ? likedTrackIds : [];

    // Determinar o grupo de data predominante baseado na primeira música
    const currentDateGroup = useMemo(() => {
        if (!tracks || tracks.length === 0) return '';
        
        const firstTrack = tracks[0];
        if (!firstTrack.releaseDate && !firstTrack.createdAt) return '';

        const trackDate = firstTrack.releaseDate || firstTrack.createdAt;
        const date = new Date(trackDate);
        const dateKey = getDateKeyBrazil(date);
        
        if (dateKey === 'today') {
            return 'Hoje';
        } else if (dateKey === 'yesterday') {
            return formatDateExtendedBrazil(date);
        } else if (dateKey === 'future') {
            return 'Em breve';
        } else {
            return formatDateExtendedBrazil(date);
        }
    }, [tracks]);

    // Função para gerar thumbnail
    const generateThumbnail = (track: Track) => {
        const initials = generateInitials(track.songName, track.artist);
        const colors = generateGradientColors(track.songName, track.artist);
        return { initials, colors };
    };

    // Função para tocar/pausar música
    const handlePlayPause = async (track: Track) => {
        if (!session) {
            showToast('🔒 Faça login para ouvir as músicas', 'warning');
            return;
        }

        if (isMobile && !canPlayAudio) {
            await requestAudioPermission();
        }

        setTestingAudio(prev => new Set(prev).add(track.id));

        try {
            if (currentTrack?.id === track.id && isPlaying) {
                togglePlayPause();
            } else {
                await playTrack(track);
            }
        } catch (error) {
            console.error('Erro ao reproduzir música:', error);
            showToast('❌ Erro ao reproduzir música', 'error');
        } finally {
            setTestingAudio(prev => {
                const newSet = new Set(prev);
                newSet.delete(track.id);
                return newSet;
            });
        }
    };

    // Função para baixar música
    const handleDownload = async (track: Track) => {
        if (!session) {
            showToast('🔒 Faça login para baixar músicas', 'warning');
            return;
        }

        if (safeDownloadedTrackIds.includes(track.id)) {
            showToast('✅ Música já foi baixada', 'info');
            return;
        }

        if (downloadingTracks.has(track.id)) {
            return;
        }

        setDownloadingTracks(prev => new Set(prev).add(track.id));

        try {
            const response = await fetch('/api/tracks/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: track.id,
                    userId: session.user?.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Erro no download');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${track.artist} - ${track.songName}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setDownloadedTrackIds(prev => [...prev, track.id]);
            addDownloadNotification(`${track.artist} - ${track.songName}`, 'download', 'Música baixada com sucesso!');
            showToast('✅ Download concluído!', 'success');

        } catch (error) {
            console.error('Erro no download:', error);
            showToast('❌ Erro no download', 'error');
        } finally {
            setDownloadingTracks(prev => {
                const newSet = new Set(prev);
                newSet.delete(track.id);
                return newSet;
            });
        }
    };

    // Função para curtir música
    const handleLike = async (track: Track) => {
        if (!session) {
            showToast('🔒 Faça login para curtir músicas', 'warning');
            return;
        }

        if (liking === track.id) return;

        setLiking(track.id);

        try {
            const isLiked = safeLikedTrackIds.includes(track.id);
            const response = await fetch('/api/tracks/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: track.id,
                    action: isLiked ? 'unlike' : 'like',
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao curtir música');
            }

            if (isLiked) {
                setLikedTrackIds?.(prev => prev.filter(id => id !== track.id));
                showToast('💔 Música descurtida', 'info');
            } else {
                setLikedTrackIds?.(prev => [...prev, track.id]);
                showToast('❤️ Música curtida!', 'success');
            }

        } catch (error) {
            console.error('Erro ao curtir música:', error);
            showToast('❌ Erro ao curtir música', 'error');
        } finally {
            setLiking(null);
        }
    };

    console.log('🎵 MusicList - Renderizando com:', {
        tracksLength: tracks.length,
        currentDateGroup,
        firstTrackId: tracks[0]?.id,
        firstTrackName: tracks[0]?.songName,
        isLoading
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-300">Carregando músicas...</span>
                </div>
            </div>
        );
    }

    if (!tracks || tracks.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 text-lg">Nenhuma música encontrada</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header com grupo de data atual */}
            {showDate && currentDateGroup && (
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {currentDateGroup}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {tracks.length} músicas
                    </p>
                </div>
            )}

            {/* Lista tradicional de músicas */}
            <div className="space-y-2">
                {tracks.map((track, index) => {
                    const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                    const { initials, colors } = generateThumbnail(track);

                    return (
                        <div 
                            key={track.id} 
                            className="flex items-center gap-4 bg-gray-900/50 hover:bg-gray-800/60 border border-gray-700/50 rounded-lg p-4 transition-all duration-200"
                        >
                            {/* Número da música */}
                            <div className="flex-shrink-0 w-8 text-gray-400 text-sm font-medium">
                                {index + 1}
                            </div>

                            {/* Thumbnail pequena */}
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                <OptimizedImage
                                    track={track}
                                    className="w-full h-full object-cover rounded-lg"
                                    fallbackClassName={`w-full h-full bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-xs`}
                                    fallbackContent={initials}
                                />
                                
                                {/* Play button overlay */}
                                <button
                                    onClick={() => handlePlayPause(track)}
                                    disabled={testingAudio.has(track.id)}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
                                    title={testingAudio.has(track.id) ? 'Testando...' : isCurrentlyPlaying ? 'Pausar' : 'Tocar'}
                                >
                                    {testingAudio.has(track.id) ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : isCurrentlyPlaying ? (
                                        <Pause className="w-4 h-4 text-white" />
                                    ) : (
                                        <Play className="w-4 h-4 text-white ml-0.5" />
                                    )}
                                </button>
                            </div>

                            {/* Informações da música */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-white font-medium text-sm truncate">
                                        {track.songName}
                                    </h3>
                                    {isCurrentlyPlaying && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-3 bg-green-500 animate-pulse"></div>
                                            <div className="w-1 h-4 bg-green-500 animate-pulse animation-delay-150"></div>
                                            <div className="w-1 h-2 bg-green-500 animate-pulse animation-delay-300"></div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-400 text-xs truncate">
                                    {track.artist}
                                </p>
                                {track.style && (
                                    <p className="text-gray-500 text-xs truncate">
                                        {track.style}
                                    </p>
                                )}
                            </div>

                            {/* Botões de ação */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Botão de like */}
                                <button
                                    onClick={() => handleLike(track)}
                                    disabled={liking === track.id}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        safeLikedTrackIds.includes(track.id)
                                            ? 'bg-pink-600 hover:bg-pink-700 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title={safeLikedTrackIds.includes(track.id) ? 'Descurtir' : 'Curtir música'}
                                >
                                    {liking === track.id ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Heart className={`w-4 h-4 ${safeLikedTrackIds.includes(track.id) ? 'fill-current' : ''}`} />
                                    )}
                                </button>

                                {/* Botão de download */}
                                <button
                                    onClick={() => handleDownload(track)}
                                    disabled={downloadingTracks.has(track.id) || safeDownloadedTrackIds.includes(track.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        safeDownloadedTrackIds.includes(track.id)
                                            ? 'bg-green-600 text-white cursor-default'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                                    title={safeDownloadedTrackIds.includes(track.id) ? 'Já baixada' : 'Baixar música'}
                                >
                                    {downloadingTracks.has(track.id) ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Baixando...</span>
                                        </div>
                                    ) : safeDownloadedTrackIds.includes(track.id) ? (
                                        <div className="flex items-center gap-2">
                                            <span>✅</span>
                                            <span>Baixada</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Download className="w-4 h-4" />
                                            <span>Baixar</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
