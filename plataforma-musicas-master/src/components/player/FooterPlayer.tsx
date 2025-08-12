// src/components/player/FooterPlayer.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Minimize2,
    X,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    Square,
    Circle,
    Waves
} from 'lucide-react';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext'; // Alterado de useAppContext para useGlobalPlayer
import { useSession } from 'next-auth/react';

const FooterPlayer = () => {
    // O hook foi alterado para useGlobalPlayer para consumir o estado correto
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } = useGlobalPlayer();
    const { data: session } = useSession();

    const [volume, setVolume] = useState(1.0); // Começar com 100%
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const waveformRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const [isChangingVolume, setIsChangingVolume] = useState(false);

    // Criar dados simulados de waveform
    const generateWaveformData = () => {
        const data = [];
        for (let i = 0; i < 100; i++) {
            data.push(Math.random() * 0.8 + 0.2);
        }
        return data;
    };
    const [waveformData] = useState(generateWaveformData());

    useEffect(() => {
        if (audioRef.current && !isChangingVolume) {
            if (isPlaying) {
                audioRef.current.play().catch(() => { });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack, isChangingVolume]);

    // Desenhar waveform
    const drawWaveform = () => {
        if (!waveformRef.current) return;

        const canvas = waveformRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / waveformData.length;
        const progress = duration > 0 ? currentTime / duration : 0;

        ctx.clearRect(0, 0, width, height);

        waveformData.forEach((amplitude, index) => {
            const barHeight = amplitude * height * 0.8;
            const x = index * barWidth;
            const y = (height - barHeight) / 2;

            // Cor baseada no progresso
            const isPlayed = index / waveformData.length <= progress;
            ctx.fillStyle = isPlayed ? '#3b82f6' : '#4A5568'; // Blue for played, gray for unplayed

            ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
        });
    };

    // Atualizar canvas quando necessário
    useEffect(() => {
        const animate = () => {
            drawWaveform();
            if (isPlaying) {
                animationFrameId.current = requestAnimationFrame(animate);
            }
        };

        if (currentTrack) {
            animate();
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [currentTrack, isPlaying, currentTime, duration, waveformData]);

    const animateProgress = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            animationFrameId.current = requestAnimationFrame(animateProgress);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            animationFrameId.current = requestAnimationFrame(animateProgress);
        } else {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isPlaying]);

    // Gerenciar áudio
    useEffect(() => {
        if (!audioRef.current || !currentTrack?.previewUrl) return;

        const audio = audioRef.current;
        audio.src = currentTrack.previewUrl;
        audio.volume = isMuted ? 0 : volume;
        audio.load();

        const handleLoadedMetadataEvent = () => {
            setDuration(audio.duration);
        };

        const handleEndedEvent = () => {
            // Parar quando a música terminar
            togglePlayPause();
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadataEvent);
        audio.addEventListener('ended', handleEndedEvent);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadataEvent);
            audio.removeEventListener('ended', handleEndedEvent);
        };
    }, [currentTrack, togglePlayPause]);

    // Atualizar volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Buscar posição no waveform
    const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!audioRef.current || !waveformRef.current || duration === 0) return;

        const canvas = waveformRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / canvas.width;
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsChangingVolume(true);

        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : newVolume;
        }

        // Reset flag após um delay para evitar interferências
        setTimeout(() => setIsChangingVolume(false), 100);
    };

    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (audioRef.current) {
            audioRef.current.volume = newMutedState ? 0 : volume;
        }
    };

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const handleClose = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsHidden(true);
    };

    const handlePrevious = () => {
        if (!audioRef.current) return;

        if (audioRef.current.currentTime > 3) {
            // Se já tocou mais de 3 segundos, volta para o início da música atual
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        } else {
            // Senão, vai para a música anterior
            previousTrack();
        }
    };

    const handleNext = () => {
        // Chama a função nextTrack do contexto para ir para a próxima música
        nextTrack();
    };

    // Verificar se o usuário está logado
    const isLoggedIn = !!session;

    // Bloquear player para usuários não logados
    if (!isLoggedIn) {
        return (
            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 shadow-2xl z-50 flex flex-col items-center">
                <div className="w-full max-w-3xl flex flex-col items-center px-4 py-4">
                    <div className="text-center text-gray-300 text-sm font-semibold">Faça login para acessar o player de músicas.</div>
                </div>
            </div>
        );
    }

    if (!currentTrack || isHidden) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-700/50 backdrop-blur-lg shadow-2xl z-50 flex flex-col items-center">
            {/* Header com controles */}
            <div className="w-full max-w-3xl flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMinimize}
                        className="group text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/5 hover:border-white/20"
                        title={isMinimized ? "Expandir" : "Minimizar"}
                    >
                        {isMinimized ? (
                            <Maximize2 size={14} className="group-hover:scale-110 transition-transform duration-200" />
                        ) : (
                            <Minimize2 size={14} className="group-hover:scale-110 transition-transform duration-200" />
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClose}
                        className="group text-gray-400 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/5 hover:border-red-400/20"
                        title="Fechar player"
                    >
                        <X size={14} className="group-hover:scale-110 transition-transform duration-200" />
                    </button>
                </div>
            </div>

            <audio
                id="footer-audio"
                ref={audioRef}
                src={currentTrack.previewUrl || currentTrack.downloadUrl}
                autoPlay={isPlaying}
                style={{ display: "none" }}
            />
            <div className="w-full max-w-3xl flex flex-col items-center px-4 py-2">
                {/* Controles centrais acima do waveform */}
                <div className="flex items-center w-full justify-between mb-4">
                    {!isMinimized && (
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-12 h-12">
                                <img
                                    src={currentTrack.imageUrl}
                                    alt={currentTrack.songName}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-700 shadow-md"
                                    style={{ minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }}
                                />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-white font-semibold text-sm truncate max-w-[180px]">
                                    {currentTrack.songName}
                                </span>
                                <span className="text-gray-300 text-xs truncate max-w-[180px]">
                                    {currentTrack.artist}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrevious}
                            className="group p-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/5 hover:border-white/20"
                            title="Anterior"
                        >
                            <ChevronLeft size={20} className="group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        <button
                            onClick={togglePlayPause}
                            className="group p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20"
                            title={isPlaying ? "Pausar" : "Tocar"}
                        >
                            {isPlaying ? (
                                <Square size={18} className="group-hover:scale-110 transition-transform duration-200" fill="currentColor" />
                            ) : (
                                <Play size={18} className="ml-0.5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" />
                            )}
                        </button>
                        <button
                            onClick={handleNext}
                            className="group p-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/5 hover:border-white/20"
                            title="Próxima"
                        >
                            <ChevronRight size={20} className="group-hover:scale-110 transition-transform duration-200" />
                        </button>
                    </div>
                    <div className="w-20"></div>
                </div>
                {/* Waveform centralizado e ocupando toda a linha */}
                {!isMinimized && (
                    <div className="w-full flex flex-col items-center">
                        <div className="relative w-full">
                            <canvas
                                ref={waveformRef}
                                width={800}
                                height={40}
                                className="w-full h-10 cursor-pointer rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors duration-200"
                                onClick={handleWaveformClick}
                            />
                            {/* Overlay com ícone de ondas quando não há música tocando */}
                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Waves size={20} className="text-gray-500 opacity-50" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            {/* Controles de volume */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleMute}
                                    className="group p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/5 hover:border-white/20"
                                    title={isMuted ? "Ativar som" : "Silenciar"}
                                >
                                    {isMuted ? (
                                        <VolumeX size={16} className="group-hover:scale-110 transition-transform duration-200" />
                                    ) : (
                                        <Volume2 size={16} className="group-hover:scale-110 transition-transform duration-200" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-24 h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer slider backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors duration-200"
                                    style={{
                                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                                    }}
                                />
                                <span className="text-xs text-gray-400 w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default FooterPlayer;