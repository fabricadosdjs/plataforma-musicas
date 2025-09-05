"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Track } from '@/types/track';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react';

interface OptimizedAudioPlayerProps {
    track: Track | null;
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onTrackEnd?: () => void;
    className?: string;
}

const OptimizedAudioPlayer: React.FC<OptimizedAudioPlayerProps> = ({
    track,
    isPlaying,
    onPlayPause,
    onNext,
    onPrevious,
    onTrackEnd,
    className = ''
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Debounce para atualizações de tempo
    const timeUpdateTimeoutRef = useRef<NodeJS.Timeout>();

    // Memoizar handlers para evitar re-renders desnecessários
    const handleTimeUpdate = useCallback(() => {
        if (timeUpdateTimeoutRef.current) {
            clearTimeout(timeUpdateTimeoutRef.current);
        }

        timeUpdateTimeoutRef.current = setTimeout(() => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
            }
        }, 100); // Debounce de 100ms
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setIsLoading(false);
            setHasError(false);
        }
    }, []);

    const handleCanPlay = useCallback(() => {
        setIsLoading(false);
        setHasError(false);
    }, []);

    const handleLoadStart = useCallback(() => {
        setIsLoading(true);
        setHasError(false);
    }, []);

    const handleError = useCallback((event: Event) => {
        console.error('Audio error:', event);
        setIsLoading(false);
        setHasError(true);
    }, []);

    const handleEnded = useCallback(() => {
        setCurrentTime(0);
        onTrackEnd?.();
    }, [onTrackEnd]);

    const handlePlay = useCallback(() => {
        setIsLoading(false);
        setHasError(false);
    }, []);

    const handlePause = useCallback(() => {
        // Não fazer nada especial no pause
    }, []);

    // Configurar áudio quando track muda
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !track?.previewUrl) return;

        // Limpar timeout anterior
        if (timeUpdateTimeoutRef.current) {
            clearTimeout(timeUpdateTimeoutRef.current);
        }

        // Resetar estados
        setCurrentTime(0);
        setDuration(0);
        setIsLoading(true);
        setHasError(false);

        // Configurar src com validação
        const setupAudioSrc = async () => {
            try {
                const response = await fetch(track.previewUrl, { method: 'HEAD' });
                if (response.ok) {
                    audio.src = track.previewUrl;
                } else {
                    // Gerar nova URL se a atual não funcionar
                    const previewResponse = await fetch(`/api/tracks/preview?trackId=${track.id}`);
                    if (previewResponse.ok) {
                        const { previewUrl } = await previewResponse.json();
                        audio.src = previewUrl;
                    } else {
                        audio.src = track.previewUrl; // Fallback
                    }
                }
            } catch (error) {
                // Em caso de erro, tentar gerar nova URL
                try {
                    const previewResponse = await fetch(`/api/tracks/preview?trackId=${track.id}`);
                    if (previewResponse.ok) {
                        const { previewUrl } = await previewResponse.json();
                        audio.src = previewUrl;
                    } else {
                        audio.src = track.previewUrl; // Fallback
                    }
                } catch (previewError) {
                    audio.src = track.previewUrl; // Fallback
                }
            }
        };

        setupAudioSrc();
        audio.volume = isMuted ? 0 : volume;
        audio.load();

        // Adicionar event listeners
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [track?.previewUrl, volume, isMuted, handleTimeUpdate, handleLoadedMetadata, handleCanPlay, handleLoadStart, handleError, handleEnded, handlePlay, handlePause]);

    // Controlar play/pause
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                setHasError(true);
            });
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Controlar volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeUpdateTimeoutRef.current) {
                clearTimeout(timeUpdateTimeoutRef.current);
            }
        };
    }, []);

    // Memoizar formatação de tempo
    const formatTime = useCallback((time: number) => {
        if (!isFinite(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // Memoizar progresso
    const progress = useMemo(() => {
        if (!duration || !isFinite(duration)) return 0;
        return (currentTime / duration) * 100;
    }, [currentTime, duration]);

    // Handler para seek
    const handleSeek = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(event.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }, []);

    // Handler para mudança de volume
    const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);
        if (newVolume > 0) {
            setIsMuted(false);
        }
    }, []);

    // Handler para toggle mute
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    if (!track) {
        return (
            <div className={`flex items-center justify-center p-4 bg-gray-800 rounded-lg ${className}`}>
                <span className="text-gray-400">Nenhuma música selecionada</span>
            </div>
        );
    }

    return (
        <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
            {/* Áudio element (hidden) */}
            <audio ref={audioRef} preload="metadata" />

            {/* Informações da música */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                        {track.songName.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{track.songName}</h3>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>
            </div>

            {/* Controles de reprodução */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <button
                    onClick={onPrevious}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200"
                    title="Anterior"
                >
                    <SkipBack className="h-5 w-5" />
                </button>

                <button
                    onClick={onPlayPause}
                    disabled={isLoading || hasError}
                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white transition-colors duration-200 flex items-center justify-center"
                    title={isPlaying ? 'Pausar' : 'Tocar'}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="h-5 w-5" />
                    ) : (
                        <Play className="h-5 w-5" />
                    )}
                </button>

                <button
                    onClick={onNext}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200"
                    title="Próxima"
                >
                    <SkipForward className="h-5 w-5" />
                </button>
            </div>

            {/* Barra de progresso */}
            <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #374151 ${progress}%, #374151 100%)`
                            }}
                        />
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controles de volume */}
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleMute}
                    className="p-1 rounded text-gray-400 hover:text-white transition-colors duration-200"
                    title={isMuted ? 'Ativar som' : 'Silenciar'}
                >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400 w-8">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
            </div>

            {/* Indicador de erro */}
            {hasError && (
                <div className="mt-2 text-center">
                    <span className="text-red-400 text-sm">Erro ao carregar áudio</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedAudioPlayer;
