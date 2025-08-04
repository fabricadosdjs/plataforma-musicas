// src/components/player/FooterPlayer.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useSession } from 'next-auth/react';
import { Track } from '@/types/track';

const FooterPlayer = () => {
    const { currentTrack, isPlaying, togglePlayPause, nextTrack } = useAppContext();
    const { data: session } = useSession();
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const waveformRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const [minimized, setMinimized] = useState(false);

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
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(() => { });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

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
            ctx.fillStyle = isPlayed ? '#FF7F00' : '#4A5568'; // Orange for played, gray for unplayed

            ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
        });
    };

    // Atualizar canvas quando necessário
    useEffect(() => {
        const animate = () => {
            drawWaveform();
            if (isPlaying) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        if (currentTrack) {
            animate();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [currentTrack, isPlaying, currentTime, duration, waveformData]);

    // Gerenciar áudio
    useEffect(() => {
        if (!audioRef.current || !currentTrack?.previewUrl) return;

        const audio = audioRef.current;
        audio.src = currentTrack.previewUrl;
        audio.volume = isMuted ? 0 : volume;

        const handleLoadedMetadataEvent = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdateEvent = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEndedEvent = () => {
            // Tocar próxima música automaticamente
            nextTrack();
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadataEvent);
        audio.addEventListener('timeupdate', handleTimeUpdateEvent);
        audio.addEventListener('ended', handleEndedEvent);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadataEvent);
            audio.removeEventListener('timeupdate', handleTimeUpdateEvent);
            audio.removeEventListener('ended', handleEndedEvent);
        };
    }, [currentTrack, volume, isMuted, nextTrack]);

    // Controlar play/pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch(console.error);
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

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
        if (audioRef.current) {
            // Não reinicia a música, só ajusta volume
            audioRef.current.volume = isMuted ? 0 : newVolume;
        }
    };

    const toggleMute = () => {
        setIsMuted((prev) => {
            if (audioRef.current) {
                audioRef.current.volume = prev ? volume : 0;
            }
            return !prev;
        });
    };

    const handlePrevious = () => {
        if (audioRef.current) {
            if (audioRef.current.currentTime > 3) {
                // Se já tocou mais de 3 segundos, volta para o início
                audioRef.current.currentTime = 0;
            } else {
                // Senão, simplesmente volta ao início (implementação simples)
                audioRef.current.currentTime = 0;
            }
        }
    };

    const handleNext = () => {
        // Chama a função nextTrack do contexto
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

    if (!currentTrack) return null;

    return (
        <div className={`fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 shadow-2xl z-50 flex flex-col items-center transition-all duration-300 ${minimized ? 'h-12' : 'h-auto'}`}>
            <audio
                id="footer-audio"
                ref={audioRef}
                src={currentTrack.previewUrl || currentTrack.downloadUrl}
                autoPlay={isPlaying}
                style={{ display: "none" }}
            />
            <div className="w-full max-w-3xl flex flex-col items-center px-4 py-2">
                <div className="flex items-center w-full justify-between mb-1">
                    {/* Minimizar/Restaurar/Fechar */}
                    <div className="flex flex-col items-center justify-center mr-2">
                        <button
                            onClick={() => setMinimized(!minimized)}
                            className="text-gray-400 hover:text-white p-1 rounded-full border border-gray-700 bg-gray-900/70"
                            title={minimized ? 'Restaurar player' : 'Minimizar player'}
                        >
                            {minimized ? <Play size={16} /> : <Pause size={16} />}
                        </button>
                        <button
                            onClick={() => setMinimized(true)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full border border-gray-700 mt-1"
                            title="Fechar player"
                        >
                            ×
                        </button>
                    </div>
                    {!minimized && (
                        <>
                            <div className="flex items-center gap-3">
                                <img
                                    src={currentTrack.imageUrl}
                                    alt={currentTrack.songName}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-700 shadow-md"
                                />
                                <div className="flex flex-col">
                                    <span className="text-white font-semibold text-sm truncate max-w-[180px]">
                                        {currentTrack.songName}
                                    </span>
                                    <span className="text-gray-300 text-xs truncate max-w-[180px]">
                                        {currentTrack.artist}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrevious}
                                    className="p-2 rounded-full hover:bg-gray-700/60 text-gray-200 hover:text-white transition"
                                    title="Anterior"
                                >
                                    <SkipBack size={24} />
                                </button>
                                <button
                                    onClick={togglePlayPause}
                                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
                                    title={isPlaying ? "Pausar" : "Tocar"}
                                >
                                    {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                                </button>
                                <button
                                    onClick={nextTrack}
                                    className="p-2 rounded-full hover:bg-gray-700/60 text-gray-200 hover:text-white transition"
                                    title="Próxima"
                                >
                                    <SkipForward size={24} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
                {!minimized && (
                    <div className="w-full flex flex-col items-center">
                        <canvas
                            ref={waveformRef}
                            width={400}
                            height={40}
                            className="w-full h-10 cursor-pointer rounded-lg"
                            onClick={handleWaveformClick}
                        />
                        <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <button onClick={toggleMute} className="text-gray-300 hover:text-white transition-colors">
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-16 accent-orange-600"
                            />
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
