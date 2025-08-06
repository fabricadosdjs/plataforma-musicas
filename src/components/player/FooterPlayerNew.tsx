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
            <span className="text-xs text-gray-400 font-mono w-10 text-right">{formatTime(currentTime)}</span>
            <div
                ref={progressBarRef}
                className="group relative h-1.5 w-full cursor-pointer rounded-full bg-zinc-700/80"
                onMouseDown={(e) => { setIsDragging(true); handleSeek(e); }}
            >
                <div className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${progressPercentage}%` }} />
                <div className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100" style={{ left: `calc(${progressPercentage}% - 7px)` }} />
            </div>
            <span className="text-xs text-gray-400 font-mono w-10">{formatTime(duration)}</span>
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
            <button onClick={toggleMute} className="p-2 text-gray-400 transition hover:text-white" title={isMuted ? "Ativar som" : "Silenciar"}>
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="relative w-24 h-1.5 rounded-full bg-zinc-700/80 cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                onVolumeChange(newVolume);
            }}>
                <div className="absolute h-full rounded-full bg-white" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                <div className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100" style={{ left: `calc(${isMuted ? 0 : volume * 100}% - 7px)` }} />
            </div>
        </div>
    );
};


// --- Componente Principal: FooterPlayer ---
const FooterPlayer = () => {
    const { currentTrack, isPlaying, togglePlayPause, stopTrack, nextTrack, previousTrack, audioRef } = useGlobalPlayer();

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

        audio.addEventListener('timeupdate', updateState);
        audio.addEventListener('loadedmetadata', updateState);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateState);
            audio.removeEventListener('loadedmetadata', updateState);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [isDragging, nextTrack, audioRef]);

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
        (audioRef.current.currentTime > 3) ? handleSeek(0) : previousTrack();
    }, [audioRef, previousTrack, handleSeek]);

    if (!currentTrack) return null;

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <footer className={clsx(
            "fixed bottom-0 left-0 right-0 z-50 transform-gpu transition-all duration-500 ease-in-out",
            isMinimized ? 'h-16' : 'h-[88px]' // 88px = h-22
        )}>
            {/* Efeito de brilho para destacar o player */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent blur-2xl" />

            <div className="relative h-full rounded-t-xl border-t border-zinc-800 bg-[#1A1B1C]/80 backdrop-blur-xl">
                {/* --- Layout Principal --- */}
                <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center px-4">

                    {/* Coluna Esquerda: Informações da Música */}
                    <div className="flex items-center gap-3 min-w-0 justify-start">
                        <Image
                            // @ts-expect-error: Garantir compatibilidade temporária
                            src={currentTrack.imageUrl || "/placeholder.png"}
                            alt={currentTrack.songName || "Capa da música"}
                            width={56} height={56}
                            className={clsx("rounded-md object-cover shadow-md transition-all duration-300", isMinimized ? "h-12 w-12" : "h-14 w-14")}
                        />
                        <div className="min-w-0">
                            <p className="truncate font-bold text-white text-sm">{currentTrack.songName}</p>
                            <p className="truncate text-xs text-gray-400">{currentTrack.artist}</p>
                        </div>
                    </div>

                    {/* Coluna Central: Controles e Progresso */}
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-4">
                            <button onClick={handlePrevious} className="p-2 text-gray-400 transition active:scale-90 hover:text-white" title="Anterior"><SkipBack size={20} fill="currentColor" /></button>
                            <button onClick={togglePlayPause} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition active:scale-90 hover:scale-105" title={isPlaying ? "Pausar" : "Tocar"}>
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
                            </button>
                            <button onClick={nextTrack} className="p-2 text-gray-400 transition active:scale-90 hover:text-white" title="Próxima"><SkipForward size={20} fill="currentColor" /></button>
                        </div>
                        {/* A barra de progresso some e aparece com uma transição suave */}
                        <div className={clsx("w-full transition-all duration-300", isMinimized ? 'invisible h-0 opacity-0' : 'visible h-auto opacity-100')}>
                            <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} isDragging={isDragging} setIsDragging={setIsDragging} />
                        </div>
                    </div>

                    {/* Coluna Direita: Volume e Ações */}
                    <div className="flex items-center justify-end gap-2">
                        <div className={clsx("flex items-center gap-2 transition-all duration-300", isMinimized && 'invisible w-0 opacity-0')}>
                            <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} isMuted={isMuted} toggleMute={toggleMute} />
                            <button onClick={stopTrack} className="p-2 text-gray-400 transition active:scale-90 hover:text-red-500" title="Fechar player"><X size={20} /></button>
                        </div>
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-gray-400 transition active:scale-90 hover:text-white" title={isMinimized ? "Maximizar" : "Minimizar"}>
                            {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>

                {/* Barra de progresso fina para o modo compacto */}
                <div className={clsx("absolute bottom-0 left-0 w-full h-1 bg-zinc-700/50 transition-opacity duration-300", isMinimized ? 'opacity-100' : 'opacity-0')}>
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
        </footer>
    );
};

export default FooterPlayer;