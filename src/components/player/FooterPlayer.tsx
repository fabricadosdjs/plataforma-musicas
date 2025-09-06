"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Download, Heart, ArrowDownToLine, HeartHandshake } from 'lucide-react';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { generateGradientColors, generateInitials } from '@/utils/imageUtils';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Track } from '@/types/track';
import { useTrackStates } from '@/hooks/useTrackStates';

export default function FooterPlayer() {
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack, audioRef, stopTrack, playlist, currentTrackIndex } = useGlobalPlayer();
    const { data: session } = useSession();
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isClosed, setIsClosed] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Hook personalizado para estados de download e like
    const {
        isDownloaded,
        isDownloading,
        isLiked,
        isLiking,
        markAsDownloaded,
        markAsDownloading,
        markAsNotDownloading,
        markAsLiked,
        markAsNotLiked,
        markAsLiking,
        markAsNotLiking,
        loadUserStates
    } = useTrackStates();

    // Atualizar tempo real da música
    useEffect(() => {
        if (!audioRef.current || !currentTrack) {
            console.log('🎵 FooterPlayer: Sem áudio ou track, resetando tempo');
            setCurrentTime(0);
            setDuration(0);
            setProgress(0);
            return;
        }

        const audio = audioRef.current;
        console.log('🎵 FooterPlayer: Configurando listeners de tempo', {
            track: currentTrack.songName,
            currentSrc: audio.src.substring(0, 50) + '...'
        });

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration && !isNaN(audio.duration)) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            console.log('🎵 FooterPlayer: Metadata carregada', {
                duration: audio.duration,
                durationFormatted: audio.duration ? `${Math.floor(audio.duration / 60)}:${Math.floor(audio.duration % 60).toString().padStart(2, '0')}` : 'N/A',
                track: currentTrack.songName,
                trackId: currentTrack.id,
                audioSrc: audio.src.substring(0, 100) + '...',
                readyState: audio.readyState,
                networkState: audio.networkState
            });
            if (audio.duration && !isNaN(audio.duration)) {
                setDuration(audio.duration);
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            } else {
                console.warn('🎵 FooterPlayer: Duração inválida ou não disponível', {
                    duration: audio.duration,
                    isNaN: isNaN(audio.duration),
                    track: currentTrack.songName,
                    trackId: currentTrack.id
                });
            }
        };

        const handleDurationChange = () => {
            console.log('🎵 FooterPlayer: Duração mudou', {
                duration: audio.duration,
                durationFormatted: audio.duration ? `${Math.floor(audio.duration / 60)}:${Math.floor(audio.duration % 60).toString().padStart(2, '0')}` : 'N/A',
                track: currentTrack.songName,
                trackId: currentTrack.id,
                readyState: audio.readyState,
                networkState: audio.networkState
            });
            if (audio.duration && !isNaN(audio.duration)) {
                setDuration(audio.duration);
            } else {
                console.warn('🎵 FooterPlayer: Duração inválida no evento durationchange', {
                    duration: audio.duration,
                    isNaN: isNaN(audio.duration),
                    track: currentTrack.songName,
                    trackId: currentTrack.id
                });
            }
        };

        // Limpar listeners anteriores
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('durationchange', handleDurationChange);

        // Adicionar novos listeners
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('durationchange', handleDurationChange);

        // Atualizar imediatamente se já carregado
        if (audio.duration && !isNaN(audio.duration)) {
            console.log('🎵 FooterPlayer: Áudio já carregado, atualizando imediatamente', {
                duration: audio.duration,
                durationFormatted: `${Math.floor(audio.duration / 60)}:${Math.floor(audio.duration % 60).toString().padStart(2, '0')}`,
                currentTime: audio.currentTime,
                track: currentTrack.songName,
                trackId: currentTrack.id,
                readyState: audio.readyState,
                networkState: audio.networkState
            });
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        } else {
            console.log('🎵 FooterPlayer: Áudio ainda não carregado, aguardando metadata', {
                duration: audio.duration,
                isNaN: isNaN(audio.duration),
                track: currentTrack.songName,
                trackId: currentTrack.id,
                readyState: audio.readyState,
                networkState: audio.networkState
            });
        }

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('durationchange', handleDurationChange);
        };
    }, [currentTrack, audioRef]);

    // Controlar volume do áudio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Resetar estado de fechado quando nova música toca
    useEffect(() => {
        if (currentTrack) {
            setIsClosed(false);
        }
    }, [currentTrack]);

    // Carregar estados iniciais de downloads e likes
    useEffect(() => {
        if (!session?.user || !currentTrack) return;

        loadUserStates([currentTrack.id]);
    }, [session?.user, currentTrack, loadUserStates]);

    const handleClose = () => {
        setIsClosed(true);
        stopTrack();
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    // Função de download
    const handleDownload = async (track: Track) => {
        if (!session?.user) {
            toast.error('Faça login para baixar músicas');
            return;
        }

        if (isDownloading(track.id)) {
            return; // Já está baixando
        }

        markAsDownloading(track.id);

        try {
            // 1. Registrar download no banco
            const downloadResponse = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id })
            });

            if (!downloadResponse.ok) {
                throw new Error('Erro ao registrar download');
            }

            const downloadData = await downloadResponse.json();
            console.log('🎵 Download registrado:', downloadData);

            // 2. Baixar arquivo
            const response = await fetch(downloadData.downloadUrl);
            if (!response.ok) {
                throw new Error('Erro ao baixar arquivo');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${track.artist} - ${track.songName}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            markAsDownloaded(track.id);
            toast.success('Música baixada com sucesso!');
        } catch (error) {
            console.error('Erro ao baixar música:', error);
            toast.error('Erro ao baixar música');
        } finally {
            markAsNotDownloading(track.id);
        }
    };

    // Função para lidar com likes
    const handleLike = async (track: Track) => {
        if (!session?.user) {
            toast.error('Faça login para curtir músicas');
            return;
        }

        if (isLiking(track.id)) {
            return; // Já está processando
        }

        markAsLiking(track.id);

        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: track.id
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao curtir música');
            }

            const data = await response.json();
            console.log('🎵 Like response:', data);

            if (data.liked) {
                markAsLiked(track.id);
                toast.success('Música curtida!');
            } else {
                markAsNotLiked(track.id);
                toast.success('Música descurtida');
            }
        } catch (error) {
            console.error('Erro ao curtir música:', error);
            toast.error('Erro ao curtir música');
        } finally {
            markAsNotLiking(track.id);
        }
    };

    if (!currentTrack || isClosed) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;

        // Log da duração formatada para debug
        if (seconds > 0) {
            console.log('🎵 FooterPlayer: formatTime chamado', {
                seconds,
                formatted,
                track: currentTrack?.songName,
                trackId: currentTrack?.id
            });
        }

        return formatted;
    };


    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 z-50 shadow-2xl">
            <div className="max-w-6xl mx-auto px-6 py-3">
                <div className="flex items-center justify-between font-inter">
                    {/* Botão de fechar modernizado */}
                    <button
                        onClick={handleClose}
                        className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 mr-4 group"
                        title="Fechar player"
                    >
                        <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    </button>

                    {/* Informações da música */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Thumbnail minimalista */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {/* Borda sutil quando está tocando */}
                            {isPlaying && (
                                <div className="absolute inset-0 border border-emerald-400 rounded-lg"></div>
                            )}

                            <OptimizedImage
                                track={currentTrack}
                                className="w-full h-full object-cover"
                                fallbackClassName={`w-full h-full bg-gradient-to-br ${generateGradientColors(currentTrack.songName, currentTrack.artist)} flex items-center justify-center text-white font-bold text-xs`}
                                fallbackContent={generateInitials(currentTrack.songName, currentTrack.artist)}
                            />
                        </div>

                        {/* Nome da música e artista */}
                        <div className="min-w-0 flex-1">
                            <h4 className="text-white font-inter font-medium text-sm truncate leading-tight">
                                {currentTrack.songName}
                            </h4>
                            <p className="text-gray-300/80 font-inter text-xs truncate leading-tight mt-0.5">
                                {currentTrack.artist}
                            </p>
                        </div>
                    </div>

                    {/* Controles centrais */}
                    <div className="flex items-center gap-2">
                        {/* Botão anterior */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                previousTrack();
                            }}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                            title="Música anterior"
                        >
                            <SkipBack className="w-4 h-4" />
                        </button>

                        {/* Botão play/pause */}
                        <button
                            onClick={togglePlayPause}
                            className="p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-all duration-200"
                            title={isPlaying ? 'Pausar' : 'Tocar'}
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4" />
                            ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                            )}
                        </button>

                        {/* Botão próxima */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                nextTrack();
                            }}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                            title="Próxima música"
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>
                    </div>


                    {/* Tempo e volume */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        {/* Tempo */}
                        <div className="flex items-center gap-1">
                            <span className="text-white/80 font-inter text-xs">
                                {formatTime(currentTime)}
                            </span>
                            <span className="text-white/40 text-xs">/</span>
                            <span className="text-white/60 font-inter text-xs">
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMute}
                                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-all duration-200"
                                title={isMuted ? 'Ativar som' : 'Silenciar'}
                            >
                                {isMuted ? (
                                    <VolumeX className="w-3.5 h-3.5" />
                                ) : (
                                    <Volume2 className="w-3.5 h-3.5" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer hover:bg-white/30 transition-colors duration-200"
                                style={{
                                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                                }}
                                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                            />
                        </div>

                        {/* Botões de Download e Like */}
                        <div className="flex items-center gap-1.5 ml-3">
                            {/* Botão Download */}
                            <button
                                onClick={() => handleDownload(currentTrack)}
                                disabled={isDownloading(currentTrack.id)}
                                className={`p-1.5 rounded-lg font-inter text-xs font-medium transition-all duration-200 flex items-center gap-1 ${isDownloaded(currentTrack.id)
                                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                    : isDownloading(currentTrack.id)
                                        ? 'bg-yellow-600/20 text-yellow-400'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                    }`}
                                title={
                                    isDownloaded(currentTrack.id)
                                        ? 'Já baixado'
                                        : isDownloading(currentTrack.id)
                                            ? 'Baixando...'
                                            : 'Download'
                                }
                            >
                                {isDownloading(currentTrack.id) ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Download className="w-3 h-3" />
                                )}
                            </button>

                            {/* Botão Like */}
                            <button
                                onClick={() => handleLike(currentTrack)}
                                disabled={isLiking(currentTrack.id)}
                                className={`p-1.5 rounded-lg font-inter text-xs font-medium transition-all duration-200 flex items-center gap-1 ${isLiked(currentTrack.id)
                                    ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                    }`}
                                title={isLiked(currentTrack.id) ? 'Descurtir' : 'Curtir'}
                            >
                                {isLiking(currentTrack.id) ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Heart className="w-3 h-3" fill={isLiked(currentTrack.id) ? "currentColor" : "none"} stroke="currentColor" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}