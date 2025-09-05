"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Heart, AlertTriangle, Copyright } from 'lucide-react';
import { Track } from '@/types/track';

interface InlineMusicPlayerProps {
    track: Track;
    isPlaying: boolean;
    onPlayPause: (track: Track) => void;
    isActive: boolean;
    onActivate: (trackId: number) => void;
    onDownload: (track: Track) => void;
    onLike: (trackId: number) => void;
    onReport: (track: Track) => void;
    onCopyright: (track: Track) => void;
    hasDownloadedBefore: (trackId: number) => boolean;
    downloadedTracksTime: { [trackId: number]: number };
    likedTracksSet: Set<number>;
    session: any;
    getDownloadButtonText: (trackId: number) => string;
    formatTimeLeft: (seconds: number) => string;
}

const InlineMusicPlayer: React.FC<InlineMusicPlayerProps> = ({
    track,
    isPlaying,
    onPlayPause,
    isActive,
    onActivate,
    onDownload,
    onLike,
    onReport,
    onCopyright,
    hasDownloadedBefore,
    downloadedTracksTime,
    likedTracksSet,
    session,
    getDownloadButtonText,
    formatTimeLeft
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
        for (let i = 0; i < 80; i++) {
            data.push(Math.random() * 0.8 + 0.2);
        }
        return data;
    };
    const [waveformData] = useState(generateWaveformData());

    // Desenhar waveform
    const drawWaveform = () => {
        if (!waveformRef.current) {
            console.log('🔍 InlineMusicPlayer: No waveform ref');
            return;
        }

        const canvas = waveformRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log('🔍 InlineMusicPlayer: No canvas context');
            return;
        }

        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / waveformData.length;
        const progress = duration > 0 ? currentTime / duration : 0;

        console.log('🔍 InlineMusicPlayer: Drawing waveform', {
            width,
            height,
            barWidth,
            progress,
            currentTime,
            duration,
            isActive,
            isPlaying
        });

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

        if (isActive) {
            animate();
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isActive, isPlaying, currentTime, duration, waveformData]);

    const animateProgress = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            animationFrameId.current = requestAnimationFrame(animateProgress);
        }
    };

    useEffect(() => {
        if (isPlaying && isActive) {
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
    }, [isPlaying, isActive]);

    // Gerenciar áudio
    useEffect(() => {
        if (!audioRef.current || !track?.previewUrl) {
            console.log('🔍 InlineMusicPlayer: Audio ref or previewUrl not available', {
                audioRef: !!audioRef.current,
                previewUrl: track?.previewUrl,
                track: track
            });
            return;
        }

        console.log('🔍 InlineMusicPlayer: Setting up audio', {
            trackId: track.id,
            previewUrl: track.previewUrl,
            isActive,
            isPlaying
        });

        // Testar se a URL é válida e gerar nova se necessário
        const testAndSetupAudio = async () => {
            try {
                const response = await fetch(track.previewUrl, { method: 'HEAD' });
                console.log('🔍 InlineMusicPlayer: URL test result', {
                    status: response.status,
                    contentType: response.headers.get('content-type'),
                    url: track.previewUrl
                });

                if (response.ok) {
                    // URL válida, usar ela
                    audio.src = track.previewUrl;
                } else {
                    // URL inválida, gerar nova
                    console.log('🔍 InlineMusicPlayer: URL inválida, gerando nova...');
                    const previewResponse = await fetch(`/api/tracks/preview?trackId=${track.id}`);
                    if (previewResponse.ok) {
                        const { previewUrl } = await previewResponse.json();
                        console.log('🔍 InlineMusicPlayer: Nova URL gerada:', previewUrl);
                        audio.src = previewUrl;
                    } else {
                        console.error('🔍 InlineMusicPlayer: Falha ao gerar nova URL');
                        audio.src = track.previewUrl; // Fallback para URL original
                    }
                }
            } catch (error) {
                console.error('🔍 InlineMusicPlayer: URL test failed, tentando gerar nova...', {
                    error: (error as any)?.message || 'Erro desconhecido',
                    url: track.previewUrl
                });

                try {
                    const previewResponse = await fetch(`/api/tracks/preview?trackId=${track.id}`);
                    if (previewResponse.ok) {
                        const { previewUrl } = await previewResponse.json();
                        console.log('🔍 InlineMusicPlayer: Nova URL gerada após erro:', previewUrl);
                        audio.src = previewUrl;
                    } else {
                        audio.src = track.previewUrl; // Fallback
                    }
                } catch (previewError) {
                    console.error('🔍 InlineMusicPlayer: Falha ao gerar nova URL:', previewError);
                    audio.src = track.previewUrl; // Fallback
                }
            }
        };

        testAndSetupAudio();

        const audio = audioRef.current;
        audio.volume = isMuted ? 0 : volume;
        audio.load();

        // Adicionar listener para verificar se o áudio carregou
        const handleCanPlay = () => {
            console.log('🔍 InlineMusicPlayer: Audio can play', {
                trackId: track.id,
                duration: audio.duration,
                readyState: audio.readyState
            });
        };

        const handleLoadStart = () => {
            console.log('🔍 InlineMusicPlayer: Audio load started', {
                trackId: track.id,
                src: audio.src
            });
        };

        const handleLoadEnd = () => {
            console.log('🔍 InlineMusicPlayer: Audio load ended', {
                trackId: track.id,
                readyState: audio.readyState
            });
        };

        const handleLoadedMetadataEvent = () => {
            console.log('🔍 InlineMusicPlayer: Audio metadata loaded', {
                duration: audio.duration,
                trackId: track.id
            });
            setDuration(audio.duration);
        };

        const handleEndedEvent = () => {
            console.log('🔍 InlineMusicPlayer: Audio ended', { trackId: track.id });
            onPlayPause(track);
        };

        const handleErrorEvent = (event: Event) => {
            const target = event.target as HTMLAudioElement;
            const audioError = target.error;

            console.error('🔍 InlineMusicPlayer: Audio error', {
                error: audioError || event,
                errorCode: audioError?.code,
                errorMessage: audioError?.message || 'Erro ao carregar o áudio',
                trackId: track.id,
                previewUrl: track.previewUrl,
                networkState: target.networkState,
                readyState: target.readyState
            });
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('loadeddata', handleLoadEnd);
        audio.addEventListener('loadedmetadata', handleLoadedMetadataEvent);
        audio.addEventListener('ended', handleEndedEvent);
        audio.addEventListener('error', handleErrorEvent);

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('loadeddata', handleLoadEnd);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadataEvent);
            audio.removeEventListener('ended', handleEndedEvent);
            audio.removeEventListener('error', handleErrorEvent);
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
        if (!audioRef.current) {
            console.log('🔍 InlineMusicPlayer: No audio ref for play/pause');
            return;
        }

        console.log('🔍 InlineMusicPlayer: Play/pause effect', {
            isPlaying,
            isActive,
            trackId: track.id,
            currentTime: audioRef.current.currentTime,
            duration: audioRef.current.duration
        });

        if (isPlaying && isActive) {
            audioRef.current.play().catch((error) => {
                console.error('🔍 InlineMusicPlayer: Play error', {
                    error: error?.message || 'Erro desconhecido',
                    errorName: error?.name,
                    trackId: track.id,
                    trackName: track.songName
                });
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, isActive]);

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

    const handlePlayClick = () => {
        console.log('🔍 InlineMusicPlayer: Play button clicked', {
            trackId: track.id,
            trackName: track.songName,
            isActive,
            isPlaying
        });
        onActivate(track.id);
        onPlayPause(track);
    };

    return (
        <div className="w-full">
            {/* Botão de play que abre o acordeão */}
            <button
                onClick={handlePlayClick}
                className={`w-full p-3 rounded-lg transition-all duration-300 ${isActive
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20">
                            {isPlaying && isActive ? (
                                <Pause size={16} className="text-blue-400" />
                            ) : (
                                <Play size={16} className="text-blue-400 ml-0.5" />
                            )}
                        </div>
                        <span className="text-sm font-medium">
                            {isActive ? 'Tocando agora' : 'Tocar música'}
                        </span>
                    </div>
                    {isActive && (
                        <span className="text-xs text-gray-400">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    )}
                </div>
            </button>

            {/* Acordeão do player */}
            {isActive && (
                <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <audio
                        ref={audioRef}
                        src={track.previewUrl || track.downloadUrl}
                        style={{ display: "none" }}
                    />

                    {/* Waveform */}
                    <div className="mb-4">
                        <canvas
                            ref={waveformRef}
                            width={300}
                            height={30}
                            className="w-full h-8 cursor-pointer rounded-lg"
                            onClick={handleWaveformClick}
                        />
                    </div>

                    {/* Controles de volume */}
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={toggleMute}
                            className="text-gray-300 hover:text-white transition-colors"
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
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                            }}
                        />
                        <span className="text-xs text-gray-400 w-8">
                            {Math.round((isMuted ? 0 : volume) * 100)}%
                        </span>
                    </div>

                    {/* Botões de Ações */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Download */}
                        <button
                            onClick={() => onDownload(track)}
                            disabled={!session?.user?.is_vip && session?.user?.email !== 'edersonleonardo@nexorrecords.com.br' || (hasDownloadedBefore(track.id) && downloadedTracksTime[track.id] > 0)}
                            className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg
                                ${!session?.user?.is_vip && session?.user?.email !== 'edersonleonardo@nexorrecords.com.br'
                                    ? 'bg-[#374151] text-gray-400 opacity-50 cursor-not-allowed'
                                    : hasDownloadedBefore(track.id)
                                        ? downloadedTracksTime[track.id] > 0
                                            ? 'bg-blue-600 text-white border border-blue-500 shadow-blue-500/25 opacity-60 cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-red-700 border border-red-500 shadow-red-500/25'
                                        : 'bg-[#374151] text-white hover:bg-[#4b5563] border border-[#374151] shadow-[#374151]/25'
                                }`}
                            title={!session?.user?.is_vip && session?.user?.email !== 'edersonleonardo@nexorrecords.com.br' ? 'Apenas usuários VIP podem fazer downloads' : hasDownloadedBefore(track.id) ? downloadedTracksTime[track.id] > 0 ? `Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente` : 'Música já baixada' : "Download disponível"}
                        >
                            <Download size={16} />
                            <span className="ml-1">{getDownloadButtonText(track.id)}</span>
                        </button>

                        {/* Curtir */}
                        <button
                            onClick={() => onLike(track.id)}
                            disabled={!session?.user?.is_vip && session?.user?.email !== 'edersonleonardo@nexorrecords.com.br'}
                            className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg
                                ${likedTracksSet.has(track.id)
                                    ? 'bg-blue-600 text-white border border-blue-500 shadow-blue-500/25'
                                    : 'bg-gray-700 text-gray-200 hover:bg-blue-700 border border-gray-500 shadow-gray-500/25'
                                }`}
                            title={likedTracksSet.has(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                            <Heart size={16} className={likedTracksSet.has(track.id) ? 'fill-blue-400 text-blue-200' : 'text-gray-300'} />
                            <span className="ml-1">{likedTracksSet.has(track.id) ? 'Curtido' : 'Curtir'}</span>
                        </button>

                        {/* Reportar erro */}
                        <button
                            onClick={() => onReport(track)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-yellow-700 text-white hover:bg-yellow-800 border border-yellow-500 shadow-yellow-500/25 transform hover:scale-105 active:scale-95"
                            title="Reportar problema com a música"
                        >
                            <AlertTriangle size={16} />
                            <span className="ml-1">Reportar</span>
                        </button>

                        {/* Copyright */}
                        <button
                            onClick={() => onCopyright(track)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-gray-800 text-white hover:bg-purple-800 border border-purple-500 shadow-purple-500/25 transform hover:scale-105 active:scale-95"
                            title="Reportar copyright"
                        >
                            <Copyright size={16} />
                            <span className="ml-1">Copyright</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InlineMusicPlayer; 