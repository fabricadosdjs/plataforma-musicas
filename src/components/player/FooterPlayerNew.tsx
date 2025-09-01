"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import clsx from 'clsx';
import Image from 'next/image';

// --- Subcomponente: Barra de Progresso (Refinada) ---
interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    isDragging: boolean;
    setIsDragging: (drag: boolean) => void;
}
const ProgressBar = ({ currentTime, duration, onSeek, isDragging, setIsDragging }: ProgressBarProps) => {
    const progressBarRef = useRef<HTMLDivElement>(null);
    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!progressBarRef.current || duration === 0) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        onSeek(percentage * duration);
    }, [duration, onSeek]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => isDragging && handleSeek(e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>);
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleSeek, setIsDragging]);

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex w-full max-w-lg items-center gap-3">
            <span className="text-xs text-red-400 font-mono w-10 text-right">{formatTime(currentTime)}</span>
            <div
                ref={progressBarRef}
                className="group relative h-1.5 w-full cursor-pointer rounded-full bg-red-900/50"
                onMouseDown={(e) => { setIsDragging(true); handleSeek(e); }}
            >
                <div className="absolute h-full rounded-full bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${progressPercentage}%` }} />
                <div className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-red-400 shadow-lg opacity-0 transition-opacity group-hover:opacity-100" style={{ left: `calc(${progressPercentage}% - 7px)` }} />
            </div>
            <span className="text-xs text-red-400 font-mono w-10">{formatTime(duration)}</span>
        </div>
    );
};

// --- Subcomponente: Controle de Volume (Refinado) ---
interface VolumeControlProps {
    volume: number;
    onVolumeChange: (volume: number) => void;
    isMuted: boolean;
    toggleMute: () => void;
}
const VolumeControl = ({ volume, onVolumeChange, isMuted, toggleMute }: VolumeControlProps) => {
    return (
        <div className="group flex items-center gap-2">
            <button onClick={toggleMute} className="p-2 text-red-400 transition hover:text-red-300" title={isMuted ? "Ativar som" : "Silenciar"}>
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="relative w-24 h-1.5 rounded-full bg-red-900/50 cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                onVolumeChange(newVolume);
            }}>
                <div className="absolute h-full rounded-full bg-red-500" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                <div className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-red-400 shadow-lg opacity-0 transition-opacity group-hover:opacity-100" style={{ left: `calc(${isMuted ? 0 : volume * 100}% - 7px)` }} />
            </div>
        </div>
    );
};


// --- Componente Principal: FooterPlayer ---
const FooterPlayer = () => {
    const { currentTrack, isPlaying, togglePlayPause, stopTrack, nextTrack, previousTrack, audioRef, playlist, currentTrackIndex, nextMusicListTrack, previousMusicListTrack, currentMusicList, currentMusicListIndex } = useGlobalPlayer();

    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateState = () => {
            if (!isDragging) setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
        };
        const handleEnded = () => nextTrack();
        const handlePlay = () => console.log('🎵 FooterPlayerNew: Áudio começou a tocar');
        const handlePause = () => console.log('🎵 FooterPlayerNew: Áudio pausado');

        audio.addEventListener('timeupdate', updateState);
        audio.addEventListener('loadedmetadata', updateState);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', updateState);
            audio.removeEventListener('loadedmetadata', updateState);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [isDragging, nextTrack, audioRef]);

    // Removido useEffect conflitante que causava despausar automático

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted, audioRef]);

    const handleSeek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, [audioRef]);

    const handleVolumeChange = useCallback((newVolume: number) => {
        setVolume(newVolume);
        if (isMuted) setIsMuted(false);
    }, [isMuted]);

    const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);
    const handlePrevious = useCallback(() => {
        if (!audioRef.current) return;
        if (audioRef.current.currentTime > 3) {
            handleSeek(0);
        } else {
            previousTrack();
        }
    }, [audioRef, previousTrack, handleSeek]);

    if (!currentTrack) return null;

    // Detectar se é dispositivo móvel (apenas no cliente)
    const isMobile = typeof window !== 'undefined' && typeof navigator !== 'undefined' 
        ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        : false;

    // Em mobile, não mostrar o footer player - apenas o play/pause da thumbnail é suficiente
    if (isMobile) return null;

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Debug: verificar se a capa está sendo recebida
    console.log('🎵 FooterPlayerNew Debug:', {
        currentTrack: currentTrack,
        imageUrl: currentTrack.imageUrl,
        songName: currentTrack.songName,
        artist: currentTrack.artist
    });

    return (
        <footer
            className={clsx(
                "fixed bottom-0 left-0 right-0 z-[9997] transform-gpu transition-all duration-500 ease-in-out",
                isMinimized ? 'h-16' : 'h-[88px]'
            )}
        >
            {/* Efeito de brilho para destacar o player */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-red-900/30 to-transparent blur-2xl" />

            <div className="relative h-full rounded-t-xl border-t border-red-800/50 bg-[#0a0a0a]/90 backdrop-blur-xl">
                {/* Layout responsivo: mobile = coluna, desktop = grid */}
                <div className="flex flex-col sm:grid h-full sm:grid-cols-[1fr_auto_1fr] items-center px-2 sm:px-4 py-2 gap-2 sm:gap-0">
                    {/* Música e info */}
                    <div className="flex items-center gap-2 min-w-0 justify-center sm:justify-start w-full sm:w-auto order-1">
                        {/* Imagem só aparece em desktop */}
                        <div className="hidden sm:block">
                            <Image
                                src={currentTrack.imageUrl || "/placeholder.png"}
                                alt={currentTrack.songName || "Capa da música"}
                                width={48} height={48}
                                className={clsx("rounded-md object-cover shadow-md transition-all duration-300 border border-red-500/30", isMinimized ? "h-10 w-10" : "h-12 w-12")}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.endsWith('/placeholder.png')) {
                                        target.src = '/placeholder.png';
                                    }
                                }}
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-bold text-white text-xs sm:text-sm max-w-[200px] sm:max-w-none text-center sm:text-left">{currentTrack.songName}</p>
                            <p className="truncate text-[11px] sm:text-xs text-red-300 max-w-[200px] sm:max-w-none text-center sm:text-left">{currentTrack.artist}</p>
                        </div>
                    </div>

                    {/* Controles centrais */}
                    <div className="flex flex-col items-center justify-center gap-1 w-full order-3 sm:order-2">
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    console.log('🎵 FooterPlayerNew: Botão anterior clicado');
                                    console.log('🎵 FooterPlayerNew: Estado atual:', {
                                        currentTrack: currentTrack?.songName,
                                        musicList: currentMusicList.length,
                                        currentMusicListIndex
                                    });
                                    previousMusicListTrack();
                                }}
                                className="p-2 text-red-400 transition active:scale-90 hover:text-red-300"
                                title="Música anterior da lista"
                            >
                                <SkipBack size={20} fill="currentColor" />
                            </button>
                            <button
                                onClick={() => {
                                    console.log('🎵 FooterPlayerNew: Botão play/pause clicado, isPlaying atual:', isPlaying);
                                    togglePlayPause();
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition active:scale-90 hover:scale-105 hover:bg-red-700"
                                title={isPlaying ? "Pausar" : "Tocar"}
                            >
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
                            </button>
                            <button
                                onClick={() => {
                                    console.log('🎵 FooterPlayerNew: Botão próximo clicado');
                                    console.log('🎵 FooterPlayerNew: Estado atual:', {
                                        currentTrack: currentTrack?.songName,
                                        musicList: currentMusicList.length,
                                        currentMusicListIndex
                                    });
                                    nextMusicListTrack();
                                }}
                                className="p-2 text-red-400 transition active:scale-90 hover:text-red-300"
                                title="Próxima música da lista"
                            >
                                <SkipForward size={20} fill="currentColor" />
                            </button>
                        </div>
                        {/* Barra de progresso: sempre centralizada e com padding extra no mobile */}
                        <div className={clsx("w-full px-2 sm:px-0 transition-all duration-300", isMinimized ? 'invisible h-0 opacity-0' : 'visible h-auto opacity-100')}>
                            <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} isDragging={isDragging} setIsDragging={setIsDragging} />
                        </div>
                    </div>

                    {/* Volume e ações */}
                    <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto order-2 sm:order-3">
                        <div className={clsx("flex items-center gap-2 transition-all duration-300", isMinimized && 'invisible w-0 opacity-0')}>
                            <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} isMuted={isMuted} toggleMute={toggleMute} />
                            <button
                                onClick={() => {
                                    console.log('🎵 FooterPlayerNew: Fechando player, parando música...');
                                    stopTrack();
                                }}
                                className="p-2 text-red-400 transition active:scale-90 hover:text-red-300"
                                title="Fechar player"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-red-400 transition active:scale-90 hover:text-red-300" title={isMinimized ? "Maximizar" : "Minimizar"}>
                            {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>

                {/* Barra de progresso fina para o modo compacto */}
                <div className={clsx("absolute bottom-0 left-0 w-full h-1 bg-red-900/50 transition-opacity duration-300", isMinimized ? 'opacity-100' : 'opacity-0')}>
                    <div className="h-full bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
        </footer>
    );
};

export default FooterPlayer;