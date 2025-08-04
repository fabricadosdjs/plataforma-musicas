'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Track {
    id: number;
    title?: string;
    songName?: string;
    artist?: string;
    artistName?: string;
    url?: string;
    downloadUrl?: string;
    previewUrl?: string;
}

interface GlobalPlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    playlist: Track[];
    currentTrackIndex: number;
    playTrack: (track: Track, newPlaylist?: Track[]) => void;
    pauseTrack: () => void;
    stopTrack: () => void;
    togglePlayPause: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
    audioRef: React.RefObject<HTMLAudioElement>;
}

const GlobalPlayerContext = createContext<GlobalPlayerContextType | undefined>(undefined);

export const GlobalPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const audioRef = useRef<HTMLAudioElement>(null);

    const playTrack = (track: Track, newPlaylist?: Track[]) => {
        console.log('🎵 GlobalPlayer: playTrack called with:', {
            id: track.id,
            songName: track.songName,
            downloadUrl: track.downloadUrl,
            previewUrl: track.previewUrl,
            url: track.url
        });

        // Verificar se há uma URL de áudio válida
        const audioUrl = track.downloadUrl || track.previewUrl || track.url;
        if (!audioUrl) {
            console.error('🎵 GlobalPlayer: No valid audio URL found for track:', track);
            return;
        }

        // Verificar se a URL é válida
        try {
            new URL(audioUrl);
        } catch (error) {
            console.error('🎵 GlobalPlayer: Invalid audio URL:', audioUrl);
            return;
        }

        // Se uma nova playlist foi fornecida, atualize a playlist
        if (newPlaylist) {
            setPlaylist(newPlaylist);
            const index = newPlaylist.findIndex(t => t.id === track.id);
            setCurrentTrackIndex(index);
        } else {
            // Se não há playlist nova, procure na playlist atual
            const index = playlist.findIndex(t => t.id === track.id);
            setCurrentTrackIndex(index >= 0 ? index : 0);
        }

        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const pauseTrack = () => {
        console.log('🎵 GlobalPlayer: Pausing track');
        setIsPlaying(false);
    };

    const stopTrack = () => {
        console.log('🎵 GlobalPlayer: Stopping and resetting track');
        setIsPlaying(false);
        setCurrentTrack(null);
        setCurrentTrackIndex(-1);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const nextTrack = () => {
        if (playlist.length === 0 || currentTrackIndex === -1) return;

        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        const nextTrackToPlay = playlist[nextIndex];

        if (nextTrackToPlay) {
            setCurrentTrackIndex(nextIndex);
            setCurrentTrack(nextTrackToPlay);
            setIsPlaying(true);
        }
    };

    const previousTrack = () => {
        if (playlist.length === 0 || currentTrackIndex === -1) return;

        const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
        const prevTrackToPlay = playlist[prevIndex];

        if (prevTrackToPlay) {
            setCurrentTrackIndex(prevIndex);
            setCurrentTrack(prevTrackToPlay);
            setIsPlaying(true);
        }
    };

    const togglePlayPause = () => {
        if (!currentTrack) return;

        if (isPlaying) {
            pauseTrack();
        } else {
            // Verificar se o áudio está pronto antes de reproduzir
            if (audioRef.current) {
                const audio = audioRef.current;

                // Verificar se o áudio tem dados carregados
                if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
                    console.log('🎵 GlobalPlayer: Audio ready, starting playback');
                    setIsPlaying(true);
                } else {
                    console.log('🎵 GlobalPlayer: Audio not ready, waiting for data');
                    // Aguardar o carregamento do áudio
                    const handleCanPlay = () => {
                        console.log('🎵 GlobalPlayer: Audio can play now');
                        setIsPlaying(true);
                        audio.removeEventListener('canplay', handleCanPlay);
                    };
                    audio.addEventListener('canplay', handleCanPlay);
                }
            } else {
                setIsPlaying(true);
            }
        }
    };

    // Effect para controlar o áudio
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        const audio = audioRef.current;
        // Priorizar downloadUrl que é o mesmo link do botão download
        const audioUrl = currentTrack.downloadUrl || currentTrack.previewUrl || currentTrack.url;

        console.log('🎵 GlobalPlayer: Audio effect triggered', {
            trackId: currentTrack.id,
            trackName: currentTrack.songName || currentTrack.title,
            audioUrl,
            isPlaying,
            hasDownloadUrl: !!currentTrack.downloadUrl,
            hasPreviewUrl: !!currentTrack.previewUrl,
            hasUrl: !!currentTrack.url
        });

        if (!audioUrl) {
            console.error('🎵 GlobalPlayer: No audio URL found for track');
            setIsPlaying(false);
            return;
        }

        // Verificar se a URL é válida
        try {
            new URL(audioUrl);
        } catch (error) {
            console.error('🎵 GlobalPlayer: Invalid audio URL:', audioUrl);
            setIsPlaying(false);
            return;
        }

        // Verificar se a URL não está vazia ou é apenas espaços
        if (!audioUrl.trim()) {
            console.error('🎵 GlobalPlayer: Empty audio URL');
            setIsPlaying(false);
            return;
        }

        // Só carrega nova URL se for diferente
        if (audio.src !== audioUrl) {
            console.log('🎵 GlobalPlayer: Loading new audio URL:', audioUrl);
            audio.src = audioUrl;
            audio.load();
        }

        if (isPlaying) {
            console.log('🎵 GlobalPlayer: Starting audio playback');
            audio.play().catch((error) => {
                console.error('🎵 GlobalPlayer: Audio play error:', {
                    error: error?.message || 'Erro desconhecido',
                    errorName: error?.name,
                    currentTrack: currentTrack?.songName || currentTrack?.title
                });
                // Tratar erros específicos
                if (error?.name === 'NotAllowedError') {
                    console.error('🎵 GlobalPlayer: User interaction required to play audio');
                } else if (error?.name === 'NotSupportedError') {
                    console.error('🎵 GlobalPlayer: Audio format not supported');
                } else if (error?.name === 'NetworkError') {
                    console.error('🎵 GlobalPlayer: Network error loading audio');
                }
                setIsPlaying(false);
            });
        } else {
            console.log('🎵 GlobalPlayer: Pausing audio');
            audio.pause();
        }
    }, [currentTrack, isPlaying]);

    // Event listeners para o áudio
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        const handleEnded = () => {
            console.log('🎵 GlobalPlayer: Track ended, auto-advancing to next track');
            // Automaticamente avança para a próxima música
            if (playlist.length > 0 && currentTrackIndex >= 0) {
                nextTrack();
            } else {
                setIsPlaying(false);
            }
        };

        const handleError = (e: Event) => {
            const target = e.target as HTMLAudioElement;
            const audioError = target.error;

            console.error('🎵 GlobalPlayer: Audio error event triggered', {
                error: audioError || e,
                errorCode: audioError?.code,
                errorMessage: audioError?.message || 'Erro ao carregar o áudio',
                networkState: target.networkState,
                readyState: target.readyState,
                src: target.src,
                currentTrack: currentTrack?.songName || currentTrack?.title
            });

            // Tratar diferentes tipos de erro
            if (audioError) {
                switch (audioError.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        console.error('🎵 GlobalPlayer: Audio loading aborted');
                        break;
                    case MediaError.MEDIA_ERR_NETWORK:
                        console.error('🎵 GlobalPlayer: Network error loading audio');
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        console.error('🎵 GlobalPlayer: Audio decode error');
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        console.error('🎵 GlobalPlayer: Audio format not supported');
                        break;
                    default:
                        console.error('🎵 GlobalPlayer: Unknown audio error');
                }
            }

            setIsPlaying(false);
        };

        const handleLoadedData = () => {
            console.log('🎵 GlobalPlayer: Audio loaded successfully');
        };

        const handleLoadStart = () => {
            console.log('🎵 GlobalPlayer: Audio loading started');
        };

        const handleCanPlay = () => {
            console.log('🎵 GlobalPlayer: Audio can play');
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('loadeddata', handleLoadedData);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('loadeddata', handleLoadedData);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [playlist, currentTrackIndex]);

    return (
        <GlobalPlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                playlist,
                currentTrackIndex,
                playTrack,
                pauseTrack,
                stopTrack,
                togglePlayPause,
                nextTrack,
                previousTrack,
                audioRef,
            }}
        >
            {children}
            {/* Audio element global com logs de debug */}
            <audio
                ref={audioRef}
                preload="metadata"
                crossOrigin="anonymous"
                onLoadStart={() => console.log('🎵 GlobalPlayer: Audio loadstart')}
                onLoadedData={() => console.log('🎵 GlobalPlayer: Audio loadeddata')}
                onCanPlay={() => console.log('🎵 GlobalPlayer: Audio canplay')}
                onPlay={() => console.log('🎵 GlobalPlayer: Audio play event')}
                onPause={() => console.log('🎵 GlobalPlayer: Audio pause event')}
                onError={(e) => {
                    const target = e.target as HTMLAudioElement;
                    const audioError = target.error;

                    console.error('🎵 GlobalPlayer: Audio error event', {
                        error: audioError || e,
                        errorCode: audioError?.code,
                        errorMessage: audioError?.message || 'Erro ao carregar o áudio',
                        networkState: target.networkState,
                        readyState: target.readyState,
                        src: target.src,
                        currentTrack: currentTrack?.songName || currentTrack?.title
                    });
                }}
                onEnded={() => console.log('🎵 GlobalPlayer: Audio ended')}
                onAbort={() => console.log('🎵 GlobalPlayer: Audio loading aborted')}
                onSuspend={() => console.log('🎵 GlobalPlayer: Audio loading suspended')}
                onStalled={() => console.log('🎵 GlobalPlayer: Audio stalled')}
                onWaiting={() => console.log('🎵 GlobalPlayer: Audio waiting for data')}
            />
        </GlobalPlayerContext.Provider>
    );
};

export const useGlobalPlayer = () => {
    const context = useContext(GlobalPlayerContext);
    if (context === undefined) {
        throw new Error('useGlobalPlayer must be used within a GlobalPlayerProvider');
    }
    return context;
};
