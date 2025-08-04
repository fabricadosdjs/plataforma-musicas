"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Play,
    Pause,
    Download,
    Heart,
    Volume2,
    VolumeX,
    X,
    SkipBack,
    SkipForward
} from 'lucide-react';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useSession } from 'next-auth/react';

const FooterPlayerNew = () => {
    const { data: session } = useSession();
    const {
        currentTrack,
        isPlaying,
        togglePlayPause,
        stopTrack,
        nextTrack,
        previousTrack,
        audioRef
    } = useGlobalPlayer();

    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [liked, setLiked] = useState(false);
    const [liking, setLiking] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // Verificar status de like quando currentTrack muda
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (!currentTrack?.id || !session) {
                setLiked(false);
                return;
            }

            try {
                const response = await fetch(`/api/tracks/like?trackId=${currentTrack.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setLiked(data.liked);
                } else {
                    setLiked(false);
                }
            } catch (error) {
                console.error('Erro ao verificar status de like:', error);
                setLiked(false);
            }
        };

        checkLikeStatus();
    }, [currentTrack, session]);

    // Gerenciar áudio
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        // Reset estados quando muda a música
        if (currentTrack?.previewUrl) {
            audio.volume = isMuted ? 0 : volume;
            setCurrentTime(0);
            setDuration(0);
        }

        const handleLoadedMetadata = () => {
            setDuration(audio.duration || 0);
        };

        const handleTimeUpdate = () => {
            if (!isDragging) {
                setCurrentTime(audio.currentTime);
            }
        };

        const handleEnded = () => {
            setCurrentTime(0);
        };

        // Adicionar eventos
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrack, volume, isMuted, isDragging]);

    // Progress bar click handler
    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !progressBarRef.current || duration === 0) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }, [duration]);

    // Progress bar drag handlers
    const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        handleProgressClick(e);
    }, [handleProgressClick]);

    const handleProgressMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !audioRef.current || !progressBarRef.current || duration === 0) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }, [isDragging, duration]);

    const handleProgressMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleProgressMouseMove);
            document.addEventListener('mouseup', handleProgressMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleProgressMouseMove);
                document.removeEventListener('mouseup', handleProgressMouseUp);
            };
        }
    }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

    const formatTime = useCallback((time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : newVolume;
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (audioRef.current) {
            audioRef.current.volume = newMutedState ? 0 : volume;
        }
    }, [isMuted, volume]);

    const handleClose = useCallback(() => {
        stopTrack();
        setCurrentTime(0);
    }, [stopTrack]);

    // Like handler - tempo real
    const handleLikeClick = useCallback(async () => {
        if (liking || !currentTrack?.id || !session) return;

        setLiking(true);

        try {
            const response = await fetch('/api/tracks/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: currentTrack.id,
                    action: liked ? 'unlike' : 'like'
                }),
            });

            if (response.ok) {
                setLiked(!liked);
            } else {
                console.error('Erro ao curtir música');
            }
        } catch (error) {
            console.error('Erro ao curtir música:', error);
        } finally {
            setLiking(false);
        }
    }, [liked, liking, currentTrack, session]);

    // Download handler - forçar download sem nova aba
    const handleDownloadClick = useCallback(() => {
        if (!currentTrack?.downloadUrl) return;

        // Forçar download sem abrir nova aba
        fetch(currentTrack.downloadUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${currentTrack.artist || ''} - ${currentTrack.songName || ''}.mp3`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Erro no download:', {
                    error: error?.message || 'Erro desconhecido',
                    track: currentTrack?.songName,
                    downloadUrl: currentTrack?.downloadUrl
                });
                // Fallback para método anterior
                if (currentTrack.downloadUrl) {
                    const link = document.createElement('a');
                    link.href = currentTrack.downloadUrl;
                    link.download = `${currentTrack.artist || ''} - ${currentTrack.songName || ''}.mp3`;
                    link.target = '_self';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
    }, [currentTrack]);

    const handlePrevious = useCallback(() => {
        if (!audioRef.current) return;

        if (audioRef.current.currentTime > 3) {
            // Se já tocou mais de 3 segundos, volta para o início da música atual
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        } else {
            // Navegar para música anterior
            previousTrack();
        }
    }, [previousTrack]);

    const handleNext = useCallback(() => {
        // Navegar para próxima música
        nextTrack();
    }, [nextTrack]);

    // Não mostrar player se não houver música
    if (!currentTrack) {
        return null;
    }

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-700/50 backdrop-blur-lg shadow-2xl">
            <div className="container mx-auto px-4 py-3">
                {/* Progress Bar - Estilo Spotify */}
                <div className="w-full mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <div
                            ref={progressBarRef}
                            className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group relative"
                            onMouseDown={handleProgressMouseDown}
                            onClick={handleProgressClick}
                        >
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full relative transition-all duration-150"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg"></div>
                            </div>
                        </div>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Player Controls - Estilo Spotify */}
                <div className="flex items-center justify-between">
                    {/* Track Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                            src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                            alt={currentTrack.songName}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-600/50 shadow-lg"
                        />
                        <div className="min-w-0">
                            <div className="text-white font-semibold text-sm truncate hover:text-green-400 transition-colors cursor-pointer">
                                {currentTrack.songName}
                            </div>
                            <div className="text-gray-400 text-xs truncate hover:text-white transition-colors cursor-pointer">
                                {currentTrack.artist}
                            </div>
                        </div>
                        <button
                            onClick={handleLikeClick}
                            className={`p-2 rounded-full transition-all duration-200 ${liked ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-white'
                                }`}
                            title={liked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            disabled={liking}
                        >
                            <Heart size={16} className={liked ? 'fill-current' : ''} />
                        </button>
                    </div>

                    {/* Center Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                            title="Anterior"
                        >
                            <SkipBack size={20} />
                        </button>

                        <button
                            onClick={togglePlayPause}
                            className="p-3 bg-white text-black rounded-full hover:scale-105 transition-all duration-200 shadow-lg"
                            title={isPlaying ? "Pausar" : "Tocar"}
                        >
                            {isPlaying ? (
                                <Pause size={16} fill="currentColor" />
                            ) : (
                                <Play size={16} className="ml-0.5" fill="currentColor" />
                            )}
                        </button>

                        <button
                            onClick={handleNext}
                            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                            title="Próxima"
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <button
                            onClick={handleDownloadClick}
                            className="p-2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                            title="Download"
                        >
                            <Download size={16} />
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMute}
                                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                                title={isMuted ? "Ativar som" : "Silenciar"}
                            >
                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-green-500"
                            />
                        </div>

                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                            title="Fechar player"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FooterPlayerNew;