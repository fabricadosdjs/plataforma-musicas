// src/components/player/FooterPlayer.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useSession } from 'next-auth/react';

const FooterPlayer = () => {
    const { data: session } = useSession();
    const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } = useAppContext();
    const [volume, setVolume] = useState(1.0); // Começar com 100%
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isHidden, setIsHidden] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const waveformRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const lastUpdateRef = useRef<number>(0);

    // Criar dados simulados de waveform
    const generateWaveformData = () => {
        const data = [];
        for (let i = 0; i < 100; i++) {
            data.push(Math.random() * 0.8 + 0.2);
        }
        return data;
    };

    const [waveformData] = useState(generateWaveformData());

    // Throttled time update para melhor performance
    const throttledTimeUpdate = useCallback(() => {
        const now = Date.now();
        if (now - lastUpdateRef.current > 100) { // Atualiza a cada 100ms
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
            }
            lastUpdateRef.current = now;
        }
    }, []);

    // Desenhar waveform
    const drawWaveform = useCallback(() => {
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
            ctx.fillStyle = isPlayed ? '#FF7F00' : '#4A5568'; // Orange for played, gray for unplayed

            ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
        });
    }, [currentTime, duration, waveformData]);

    // Atualizar canvas quando necessário
    useEffect(() => {
        let animationId: number;

        const animate = () => {
            drawWaveform();
            if (isPlaying) {
                animationId = requestAnimationFrame(animate);
            }
        };

        if (currentTrack) {
            animate();
        }

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [currentTrack, isPlaying, drawWaveform]);

    // Gerenciar áudio com melhor controle
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        // Reset estados quando muda a música
        if (currentTrack?.previewUrl) {
            audio.src = currentTrack.previewUrl;
            audio.volume = isMuted ? 0 : volume;
            setCurrentTime(0);
            setDuration(0);
        }

        const handleLoadedMetadata = () => {
            setDuration(audio.duration || 0);
        };

        const handleTimeUpdate = () => {
            throttledTimeUpdate();
        };

        const handleEnded = () => {
            setCurrentTime(0);
            // Auto-next quando terminar
            nextTrack();
        };

        const handleCanPlay = () => {
            // Garantir que o áudio está pronto para tocar
            if (isPlaying && audio.paused) {
                audio.play().catch(console.error);
            }
        };

        // Limpar eventos anteriores
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('canplay', handleCanPlay);

        // Adicionar eventos
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [currentTrack, volume, isMuted, isPlaying, throttledTimeUpdate, nextTrack]);

    // Controlar play/pause com melhor responsividade
    useEffect(() => {
        if (!audioRef.current || !currentTrack?.previewUrl) return;

        const audio = audioRef.current;

        if (isPlaying) {
            if (audio.paused) {
                audio.play().catch((error) => {
                    console.error('Erro ao tocar áudio:', error);
                });
            }
        } else {
            if (!audio.paused) {
                audio.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    // Buscar posição no waveform com melhor precisão
    const handleWaveformClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!audioRef.current || !waveformRef.current || duration === 0) return;

        const canvas = waveformRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / canvas.width));
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }, [duration]);

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
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsHidden(true);
    }, []);

    const handlePrevious = useCallback(() => {
        if (!audioRef.current) return;

        if (audioRef.current.currentTime > 3) {
            // Se já tocou mais de 3 segundos, volta para o início da música atual
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        } else {
            // Senão, vai para a música anterior
            previousTrack();
        }
    }, [previousTrack]);

    const handleNext = useCallback(() => {
        // Chama a função nextTrack do contexto para ir para a próxima música
        nextTrack();
    }, [nextTrack]);

    // Não mostrar player se usuário não estiver logado ou não houver música
    if (!session || !currentTrack || isHidden) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-700/50 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center gap-3">
                    {/* Track Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                            src={currentTrack.imageUrl || "https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"}
                            alt={currentTrack.songName}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-600/50"
                        />
                        <div className="min-w-0">
                            <div className="text-white font-semibold text-sm truncate">
                                {currentTrack.songName}
                            </div>
                            <div className="text-gray-400 text-xs truncate">
                                {currentTrack.artist}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            className="p-1.5 text-gray-300 hover:text-white transition-colors"
                            title="Anterior"
                        >
                            <SkipBack size={16} />
                        </button>

                        <button
                            onClick={togglePlayPause}
                            className="p-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-full transition-all duration-200 shadow-lg"
                            title={isPlaying ? "Pausar" : "Tocar"}
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>

                        <button
                            onClick={handleNext}
                            className="p-1.5 text-gray-300 hover:text-white transition-colors"
                            title="Próxima"
                        >
                            <SkipForward size={16} />
                        </button>
                    </div>

                    {/* Waveform & Progress */}
                    <div className="flex-1 max-w-md mx-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>/</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <canvas
                            ref={waveformRef}
                            width={300}
                            height={30}
                            className="w-full h-8 cursor-pointer rounded-lg"
                            onClick={handleWaveformClick}
                        />
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-gray-300 hover:text-white transition-colors">
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-12 accent-orange-600"
                        />
                        <span className="text-xs text-gray-400 w-6">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                    </div>

                    {/* Botão Fechar */}
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-700/50 transition-colors"
                        title="Fechar player"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Audio Element com configurações otimizadas */}
            <audio
                ref={audioRef}
                preload="metadata"
                crossOrigin="anonymous"
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default FooterPlayer;
