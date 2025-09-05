"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Track } from '@/types/track';

interface FullscreenMusicPlayerProps {
    track: Track;
    isPlaying: boolean;
    onPlayPause: (track: Track) => void;
    isVisible: boolean;
    onClose: () => void;
}

const FullscreenMusicPlayer: React.FC<FullscreenMusicPlayerProps> = ({
    track,
    isPlaying,
    onPlayPause,
    isVisible,
    onClose
}) => {
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const waveformRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();

    // Criar dados simulados de waveform
    const generateWaveformData = () => {
        const data = [];
        for (let i = 0; i < 120; i++) {
            data.push(Math.random() * 0.8 + 0.2);
        }
        return data;
    };
    const [waveformData] = useState(generateWaveformData());

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

        if (isVisible) {
            animate();
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isVisible, isPlaying, currentTime, duration, waveformData]);

    const animateProgress = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            animationFrameId.current = requestAnimationFrame(animateProgress);
        }
    };

    useEffect(() => {
        if (isPlaying && isVisible) {
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
    }, [isPlaying, isVisible]);

    // Gerenciar áudio
    useEffect(() => {
        if (!audioRef.current || !track?.previewUrl) return;

        const audio = audioRef.current;

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

        const handleLoadedMetadataEvent = () => {
            setDuration(audio.duration);
        };

        const handleEndedEvent = () => {
            // Parar quando a música terminar
            onPlayPause(track);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadataEvent);
        audio.addEventListener('ended', handleEndedEvent);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadataEvent);
            audio.removeEventListener('ended', handleEndedEvent);
        };
    }, [track, onPlayPause]);

    // Atualizar volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Controlar play/pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying && isVisible) {
            audioRef.current.play().catch((error) => {
                console.error('🎵 FullscreenMusicPlayer: Play error', {
                    error: error?.message || 'Erro desconhecido',
                    errorName: error?.name,
                    trackName: track.songName
                });
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, isVisible]);

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
            audioRef.current.volume = isMuted ? 0 : newVolume;
        }
    };

    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (audioRef.current) {
            audioRef.current.volume = newMutedState ? 0 : volume;
        }
    };

    const handlePlayPause = () => {
        onPlayPause(track);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex items-center justify-center">
            <div className="w-full max-w-4xl mx-4 bg-gray-900/90 rounded-2xl border border-gray-700/50 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <img
                            src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                            alt={track.songName}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-600"
                        />
                        <div>
                            <h2 className="text-xl font-bold text-white">{track.songName}</h2>
                            <p className="text-gray-300">{track.artist}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Player Content */}
                <div className="p-8">
                    <audio
                        ref={audioRef}
                        src={track.previewUrl || track.downloadUrl}
                        style={{ display: "none" }}
                    />

                    {/* Waveform */}
                    <div className="mb-8">
                        <canvas
                            ref={waveformRef}
                            width={800}
                            height={80}
                            className="w-full h-20 cursor-pointer rounded-lg"
                            onClick={handleWaveformClick}
                        />
                    </div>

                    {/* Controles principais */}
                    <div className="flex items-center justify-center gap-6 mb-8">
                        <button
                            onClick={handlePlayPause}
                            className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                        </button>
                    </div>

                    {/* Tempo e volume */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleMute}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                                }}
                            />
                            <span className="text-sm text-gray-400 w-12">
                                {Math.round((isMuted ? 0 : volume) * 100)}%
                            </span>
                        </div>
                        <div className="text-sm text-gray-400">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullscreenMusicPlayer; 