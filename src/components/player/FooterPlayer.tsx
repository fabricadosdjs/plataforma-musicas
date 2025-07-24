// src/components/player/FooterPlayer.tsx
"use client";

import { useAppContext } from '@/context/AppContext';
import { useGoogleDrivePlayer } from '@/hooks/useGoogleDrivePlayer';
import { isGoogleDriveUrl, isMediaFireUrl, optimizeUrlForPlayback } from '@/utils/mediaUtils';
import { ChevronDown, ChevronUp, Download, Pause, Play, SkipBack, SkipForward, ThumbsUp, Volume2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

const FooterPlayer = memo(function FooterPlayer() {
    const { data: session } = useSession();
    const {
        currentTrack,
        isPlaying,
        togglePlayPause,
        nextTrack,
        previousTrack,
        handleLike,
        handleDownload,
        likedTracks,
        downloadedTracks,
        setIsPlaying,
        playlist
    } = useAppContext();

    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<any>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);

    // Verificar se o usuário está logado e é VIP
    const isUserLoggedAndVip = session?.user && session.user.is_vip;

    // Hook para Google Drive player
    const googleDriveHook = useGoogleDrivePlayer({
        url: currentTrack?.previewUrl || '',
        isPlaying: isPlaying && !!currentTrack && isGoogleDriveUrl(currentTrack.previewUrl || ''),
        volume,
        onTimeUpdate: (time: number) => setCurrentTime(time),
        onDurationChange: (dur: number) => setDuration(dur),
        onEnded: () => {
            if (playlist && playlist.length > 1) {
                nextTrack();
            } else {
                setIsPlaying(false);
            }
        },
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false)
    });

    // Determinar que tipo de mídia usar
    const isGoogleDriveTrack = currentTrack && isGoogleDriveUrl(currentTrack.previewUrl || '');
    const isMediaFireTrack = currentTrack && isMediaFireUrl(currentTrack.previewUrl || '');
    const shouldUseSpecialPlayer = isGoogleDriveTrack; // Só Google Drive precisa de tratamento especial

    // Se não estiver logado ou não for VIP, não renderizar o player
    if (!isUserLoggedAndVip || !currentTrack) return null;

    const initializeWavesurfer = useCallback(async () => {
        // Se for Google Drive, usar o hook especializado
        if (shouldUseSpecialPlayer) {
            if (wavesurfer.current) {
                wavesurfer.current.destroy();
                wavesurfer.current = null;
            }
            // Usar dados do Google Drive hook
            setCurrentTime(googleDriveHook.currentTime);
            setDuration(googleDriveHook.duration);
            return;
        }

        if (waveformRef.current && currentTrack) {
            const WaveSurfer = (await import('wavesurfer.js')).default;

            if (wavesurfer.current) wavesurfer.current.destroy();

            wavesurfer.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#3b82f6', // Azul similar ao SoundCloud
                progressColor: '#1d4ed8', // Azul mais escuro para o progresso
                cursorColor: '#ffffff',
                cursorWidth: 2,
                barWidth: 3,
                barGap: 1,
                barRadius: 3,
                height: 60,
                hideScrollbar: true,
                interact: true,
                autoplay: false,
                normalize: true,
                backend: 'WebAudio',
            });

            // Event listeners
            wavesurfer.current.on('play', () => setIsPlaying(true));
            wavesurfer.current.on('pause', () => setIsPlaying(false));
            wavesurfer.current.on('finish', () => {
                // Auto-play próxima música
                if (playlist && playlist.length > 1) {
                    nextTrack();
                } else {
                    setIsPlaying(false);
                }
            });
            wavesurfer.current.on('audioprocess', () => {
                setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
            });
            wavesurfer.current.on('ready', () => {
                setDuration(wavesurfer.current?.getDuration() || 0);
                wavesurfer.current.setVolume(volume);
            });

            try {
                // Otimizar URL para MediaFire se necessário
                let audioUrl = currentTrack.previewUrl;

                if (isMediaFireTrack) {
                    console.log('🎵 Detectada URL do MediaFire:', audioUrl);
                    audioUrl = optimizeUrlForPlayback(audioUrl);
                    console.log('🔄 URL otimizada para MediaFire:', audioUrl);
                }

                await wavesurfer.current.load(audioUrl);

                // Auto-play se estava tocando
                if (isPlaying) {
                    setTimeout(() => {
                        wavesurfer.current?.play();
                    }, 100);
                }
            } catch (error) {
                console.error('Erro ao carregar áudio:', error);
            }

        } else if (!currentTrack && wavesurfer.current) {
            wavesurfer.current.destroy();
            setIsPlaying(false);
        }
    }, [currentTrack, nextTrack, setIsPlaying, isPlaying, volume, playlist, shouldUseSpecialPlayer, googleDriveHook.currentTime, googleDriveHook.duration]);

    useEffect(() => {
        initializeWavesurfer();
        return () => wavesurfer.current?.destroy();
    }, [currentTrack, initializeWavesurfer]);

    // Efeito para controlar play/pause a partir do contexto
    useEffect(() => {
        if (shouldUseSpecialPlayer) {
            // Player especial é controlado pelo hook
            return;
        }

        if (wavesurfer.current) {
            if (isPlaying) {
                wavesurfer.current.play();
            } else {
                wavesurfer.current.pause();
            }
        }
    }, [isPlaying, shouldUseSpecialPlayer]);

    // Formatador de tempo
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        if (shouldUseSpecialPlayer) {
            // Volume é controlado pelo hook especial
            return;
        }

        if (wavesurfer.current) {
            wavesurfer.current.setVolume(newVolume);
        }
    };

    const isLiked = likedTracks.includes(currentTrack.id);
    const isDownloaded = downloadedTracks.includes(currentTrack.id);

    return (
        <footer className={`fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 text-zinc-200 z-20 shadow-2xl transition-all duration-300 ease-in-out ${isMinimized ? 'h-16' : 'h-32'}`}>
            <div className="container mx-auto px-6 py-2 flex flex-col justify-center h-full">
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="absolute top-2 right-4 p-1 text-zinc-400 hover:text-blue-400 transition-colors z-30"
                    title={isMinimized ? "Maximizar Player" : "Minimizar Player"}
                >
                    {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <div className={`flex items-center gap-4 transition-opacity duration-300 ${isMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                    {/* Info da música */}
                    <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
                        <img src={currentTrack.imageUrl} alt={currentTrack.songName} className="w-16 h-16 rounded-lg shadow-lg flex-shrink-0 object-cover" />
                        <div className="min-w-0">
                            <h3 className="text-white font-normal truncate max-w-48" style={{ fontSize: '13px', fontWeight: 400 }}>{currentTrack.songName}</h3>
                            <p className="text-zinc-400 font-light truncate max-w-48" style={{ fontSize: '11px', fontWeight: 300 }}>{currentTrack.artist}</p>
                            <div className="text-zinc-500 text-xs mt-1">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>
                    </div>

                    {/* Controles de reprodução */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button onClick={previousTrack} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors">
                            <SkipBack size={18} className="text-zinc-300" />
                        </button>

                        {shouldUseSpecialPlayer ? (
                            // Botão especial para serviços externos
                            <button
                                onClick={() => {
                                    if (isGoogleDriveTrack) {
                                        const urlObj = new URL(currentTrack.previewUrl);
                                        const fileId = urlObj.searchParams.get('id');
                                        if (fileId) {
                                            window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
                                        }
                                    } else if (isMediaFireTrack) {
                                        // Para MediaFire, tentar reproduzir diretamente
                                        window.open(currentTrack.previewUrl, '_blank');
                                    }
                                }}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg"
                                title={isGoogleDriveTrack ? "Abrir no Google Drive para reproduzir" : "Abrir arquivo externo"}
                            >
                                <Play size={24} />
                            </button>
                        ) : (
                            // Botão normal
                            <button onClick={togglePlayPause} className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg">
                                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </button>
                        )}

                        <button onClick={nextTrack} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors">
                            <SkipForward size={18} className="text-zinc-300" />
                        </button>
                    </div>

                    {/* Waveform - SoundCloud style ou barra de progresso para Google Drive */}
                    <div className="flex-grow min-w-0 px-4">
                        {shouldUseSpecialPlayer ? (
                            // Interface especial para serviços externos
                            <div className="w-full">
                                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                                    <span>
                                        {isGoogleDriveTrack ? '🔗 Google Drive Audio' :
                                            isMediaFireTrack ? '🔗 MediaFire Audio' : '🔗 Arquivo Externo'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (isGoogleDriveTrack) {
                                                const urlObj = new URL(currentTrack.previewUrl);
                                                const fileId = urlObj.searchParams.get('id');
                                                if (fileId) {
                                                    window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
                                                }
                                            } else {
                                                window.open(currentTrack.previewUrl, '_blank');
                                            }
                                        }}
                                        className="text-blue-400 hover:text-blue-300 underline text-xs"
                                    >
                                        {isGoogleDriveTrack ? 'Abrir no Google Drive ↗' : 'Abrir arquivo ↗'}
                                    </button>
                                </div>
                                <div className="w-full bg-zinc-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                                {googleDriveHook.isLoading && (
                                    <div className="text-center text-xs text-zinc-400 mt-1">
                                        Carregando Google Drive...
                                    </div>
                                )}
                                {googleDriveHook.error && (
                                    <div className="text-center text-xs text-red-400 mt-1">
                                        ⚠️ Use o link acima para reproduzir no Google Drive
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Waveform normal para outras URLs
                            <div ref={waveformRef} className="w-full"></div>
                        )}
                    </div>

                    {/* Controles do lado direito */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Controle de volume */}
                        <div className="flex items-center gap-2">
                            <Volume2 size={18} className="text-zinc-400" />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                            />
                        </div>

                        {/* Botões de ação */}
                        <button onClick={() => handleLike(currentTrack.id)} className="p-2 rounded-full hover:bg-zinc-800 transition-colors" title="Like">
                            <ThumbsUp size={18} className={`transition-colors ${isLiked ? 'text-blue-500' : 'text-zinc-400'}`} />
                        </button>
                        <button onClick={() => handleDownload(currentTrack)} className="p-2 rounded-full hover:bg-zinc-800 transition-colors" title="Download">
                            <Download size={18} className={`transition-colors ${isDownloaded ? 'text-green-500' : 'text-blue-500'}`} />
                        </button>
                    </div>
                </div>

                {isMinimized && (
                    <div className="flex items-center justify-between h-full px-4">
                        <div className="flex items-center gap-3">
                            <img src={currentTrack.imageUrl} alt={currentTrack.songName} className="w-10 h-10 rounded-md flex-shrink-0 object-cover" />
                            <div className="flex flex-col min-w-0">
                                <p className="font-normal text-zinc-200 truncate max-w-[150px] tracking-wide" style={{ fontSize: '13px', fontWeight: 400 }}>{currentTrack.songName}</p>
                                <p className="font-light text-zinc-400 truncate max-w-[150px] tracking-wide" style={{ fontSize: '11px', fontWeight: 300 }}>{currentTrack.artist}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={previousTrack} className="p-1 rounded-full text-zinc-400 hover:text-blue-400"><SkipBack size={16} /></button>
                            <button onClick={togglePlayPause} className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button onClick={nextTrack} className="p-1 rounded-full text-zinc-400 hover:text-blue-400"><SkipForward size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
});

export default FooterPlayer;