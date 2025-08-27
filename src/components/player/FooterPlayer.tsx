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
    Waves,
    Heart,
    Download
} from 'lucide-react';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useSession } from 'next-auth/react';
import { useToastContext } from '@/context/ToastContext';
import { useDownloadsCache } from '@/hooks/useDownloadsCache';

const FooterPlayer = () => {
    const {
        currentTrack,
        isPlaying,
        togglePlayPause,
        nextTrack,
        previousTrack,
        audioRef
    } = useGlobalPlayer();
    const { data: session } = useSession();
    const { showToast } = useToastContext();
    const downloadsCache = useDownloadsCache();
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
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

    // Sincronizar com o áudio do contexto global
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        const audio = audioRef.current;

        // Event listeners para sincronização
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            console.log('🎵 FooterPlayer: Metadata carregado, duração:', audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            console.log('🎵 FooterPlayer: Música terminou');
            // Não chamar togglePlayPause aqui, deixar o contexto global gerenciar
        };

        const handlePlay = () => {
            console.log('🎵 FooterPlayer: Áudio começou a tocar');
        };

        const handlePause = () => {
            console.log('🎵 FooterPlayer: Áudio pausado');
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [currentTrack, audioRef]);

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
            ctx.fillStyle = isPlayed ? '#3b82f6' : '#4A5568';

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

    // Atualizar volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted, audioRef]);

    // Sincronizar volume quando mudar
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted, audioRef]);

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

    const handleLike = () => {
        if (!session) {
            showToast('🔐 Faça login para curtir músicas', 'warning');
            return;
        }

        if (!currentTrack) return;

        const currentLiked = downloadsCache.isLiked(currentTrack.id);

        if (currentLiked) {
            downloadsCache.markAsUnliked(currentTrack.id);
            showToast('💔 Música removida dos favoritos', 'info');
        } else {
            downloadsCache.markAsLiked(currentTrack.id);
            showToast('❤️ Música adicionada aos favoritos', 'success');
        }

        console.log('🎵 FooterPlayer: Like toggled for track:', currentTrack.songName);
    };

    const handleDownload = () => {
        if (!session) {
            showToast('🔐 Faça login para baixar músicas', 'warning');
            return;
        }

        if (!currentTrack) return;

        // Verificar se já foi baixado
        const isDownloaded = downloadsCache.isDownloaded(currentTrack.id);

        if (isDownloaded) {
            showToast('✅ Música já foi baixada', 'info');
            return;
        }

        // Aqui você pode implementar a lógica de download
        // Por enquanto, apenas mostra uma mensagem
        showToast('📥 Iniciando download...', 'info');
        console.log('🎵 FooterPlayer: Download iniciado para:', currentTrack.songName);
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

            {/* O elemento audio é gerenciado pelo GlobalPlayerContext */}
            <div className="w-full max-w-3xl flex flex-col items-center px-4 py-2">
                {/* Controles centrais acima do waveform */}
                <div className="flex items-center w-full justify-between mb-4">
                    {/* Informações da música (esquerda) */}
                    {!isMinimized && (
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex-shrink-0 w-12 h-12">
                                <img
                                    src={currentTrack.imageUrl}
                                    alt={currentTrack.songName}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-700 shadow-md"
                                    style={{ minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }}
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-white font-semibold text-sm truncate max-w-[150px]">
                                    {currentTrack.songName}
                                </span>
                                <span className="text-gray-300 text-xs truncate max-w-[150px]">
                                    {currentTrack.artist}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Controles de reprodução (centro) */}
                    <div className="flex items-center gap-2 flex-shrink-0">
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

                    {/* Botões de Like e Download (direita) */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Botão de Like - CORES CHAMATIVAS PARA DEBUG */}
                        <button
                            onClick={handleLike}
                            className="group p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm border bg-gradient-to-br from-red-500/40 to-red-600/50 text-red-300 border-red-500/60 hover:from-red-500/50 hover:to-red-600/60 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
                            title="Curtir música"
                        >
                            <Heart
                                size={20}
                                className="group-hover:scale-110 transition-transform duration-200"
                            />
                        </button>

                        {/* Botão de Download - CORES CHAMATIVAS PARA DEBUG */}
                        <button
                            onClick={handleDownload}
                            className="group p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm border bg-gradient-to-br from-green-500/40 to-green-600/50 text-green-300 border-green-500/60 hover:from-green-500/50 hover:to-green-600/60 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
                            title="Baixar música"
                        >
                            <Download
                                size={20}
                                className="group-hover:scale-110 transition-transform duration-200"
                            />
                        </button>
                    </div>
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