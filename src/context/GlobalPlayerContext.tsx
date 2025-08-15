'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/useToast';

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
    playTrack: (track: Track, newPlaylist?: Track[]) => Promise<void>;
    pauseTrack: () => void;
    stopTrack: () => void;
    togglePlayPause: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
    audioRef: React.RefObject<HTMLAudioElement>;
}

const GlobalPlayerContext = createContext<GlobalPlayerContextType | undefined>(undefined);

export const GlobalPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const audioRef = useRef<HTMLAudioElement>(null);

    const getSecureAudioUrl = async (track: Track): Promise<string | null> => {
        const audioUrl = track.downloadUrl || track.previewUrl || track.url;
        if (!audioUrl) return null;

        // Se a URL já é uma URL segura (assinada), use-a
        if (audioUrl.includes('X-Amz-Signature')) {
            return audioUrl;
        }

        // Se é uma URL do Contabo, tente obter uma URL segura
        if (audioUrl.includes('contabostorage.com')) {
            try {
                // Extrair o caminho completo do arquivo da URL
                // Exemplo: https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/community/DEORRO%20Y%20VOCES%20DEL%20RANCHO%20-%20CAMARON%20PELAO%20MAIN.mp3
                // Precisamos extrair: community/DEORRO%20Y%20VOCES%20DEL%20RANCHO%20-%20CAMARON%20PELAO%20MAIN.mp3

                // Encontrar o índice após "plataforma-de-musicas/"
                const bucketPattern = 'plataforma-de-musicas/';
                const bucketIndex = audioUrl.indexOf(bucketPattern);
                if (bucketIndex !== -1) {
                    const key = audioUrl.substring(bucketIndex + bucketPattern.length);
                    console.log('🎵 GlobalPlayer: Extraindo chave do arquivo:', {
                        originalUrl: audioUrl,
                        extractedKey: key,
                        bucketPattern,
                        bucketIndex
                    });

                    const response = await fetch(`/api/audio-url?key=${encodeURIComponent(key)}`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('🎵 GlobalPlayer: URL segura obtida:', data.url);
                        return data.url;
                    } else {
                        console.error('🎵 GlobalPlayer: Erro na API audio-url:', response.status, response.statusText);
                        const errorText = await response.text();
                        console.error('🎵 GlobalPlayer: Resposta de erro:', errorText);
                        // Retornar a URL original como fallback
                        return audioUrl;
                    }
                } else {
                    console.error('🎵 GlobalPlayer: Padrão do bucket não encontrado na URL:', audioUrl);
                    // Retornar a URL original como fallback
                    return audioUrl;
                }
            } catch (error) {
                console.error('🎵 GlobalPlayer: Erro ao obter URL segura:', error);
                // Retornar a URL original como fallback
                return audioUrl;
            }
        }

        return audioUrl;
    };

    const playTrack = async (track: Track, newPlaylist?: Track[]) => {
        // Verificar se o usuário está logado
        if (!session?.user) {
            showToast('🔒 Faça login para reproduzir músicas', 'error');
            return;
        }

        console.log('🎵 GlobalPlayer: playTrack called with:', {
            id: track.id,
            songName: track.songName,
            downloadUrl: track.downloadUrl,
            previewUrl: track.previewUrl,
            url: track.url
        });

        // Obter URL segura se necessário
        const secureUrl = await getSecureAudioUrl(track);
        if (!secureUrl) {
            console.error('🎵 GlobalPlayer: No valid audio URL found for track:', track);
            showToast('❌ URL de áudio inválida para esta faixa', 'error');
            return;
        }

        // Verificar se a URL é válida
        try {
            new URL(secureUrl);
        } catch (error) {
            console.error('🎵 GlobalPlayer: Invalid audio URL:', secureUrl);
            showToast('❌ URL de áudio inválida para esta faixa', 'error');
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

        // Função para tentar reproduzir o áudio de forma segura
        const playAudioSafely = async () => {
            try {
                // Verificar se o áudio está em um estado válido
                if (audio.error) {
                    console.error('🎵 GlobalPlayer: Audio has error state, cannot play');
                    handlePlayError(new Error('Áudio em estado de erro'));
                    return;
                }

                // Verificar se o áudio está pronto para reprodução
                if (audio.readyState >= 2) { // HAVE_CURRENT_DATA ou superior
                    console.log('🎵 GlobalPlayer: Audio ready, starting playback');
                    await audio.play();
                } else {
                    console.log('🎵 GlobalPlayer: Audio not ready, waiting for canplay event');
                    // Aguardar o evento canplay antes de tentar reproduzir
                    const canPlayHandler = () => {
                        // Verificar novamente se não há erro antes de reproduzir
                        if (audio.error) {
                            console.error('🎵 GlobalPlayer: Audio error detected while waiting for canplay');
                            handlePlayError(new Error('Erro no áudio detectado durante carregamento'));
                            return;
                        }

                        audio.play().catch((error: any) => {
                            console.error('🎵 GlobalPlayer: Audio play error after canplay:', {
                                error: error?.message || 'Erro desconhecido',
                                errorName: error?.name,
                                currentTrack: currentTrack?.songName || currentTrack?.title
                            });
                            handlePlayError(error);
                        });
                        audio.removeEventListener('canplay', canPlayHandler);
                    };

                    // Adicionar timeout para evitar espera infinita
                    const timeoutId = setTimeout(() => {
                        console.error('🎵 GlobalPlayer: Timeout waiting for canplay event');
                        audio.removeEventListener('canplay', canPlayHandler);
                        handlePlayError(new Error('Timeout aguardando carregamento do áudio'));
                    }, 10000); // 10 segundos de timeout

                    audio.addEventListener('canplay', canPlayHandler);

                    // Limpar timeout quando o evento canplay for disparado
                    const timeoutClearedHandler = () => {
                        clearTimeout(timeoutId);
                        audio.removeEventListener('canplay', timeoutClearedHandler);
                    };
                    audio.addEventListener('canplay', timeoutClearedHandler);
                }
            } catch (error: any) {
                console.error('🎵 GlobalPlayer: Audio play error:', {
                    error: error?.message || 'Erro desconhecido',
                    errorName: error?.name,
                    currentTrack: currentTrack?.songName || currentTrack?.title
                });
                handlePlayError(error);
            }
        };

        // Função para tratar erros de reprodução
        const handlePlayError = (error: any) => {
            // Tratar erros específicos
            if (error?.name === 'NotAllowedError') {
                console.error('🎵 GlobalPlayer: User interaction required to play audio');
                // Mostrar toast informativo para o usuário
                if (showToast) {
                    showToast('Clique no botão de play para reproduzir o áudio', 'info');
                }
            } else if (error?.name === 'NotSupportedError') {
                console.error('🎵 GlobalPlayer: Audio format not supported');
                if (showToast) {
                    showToast('Formato de áudio não suportado', 'error');
                }
            } else if (error?.name === 'NetworkError') {
                console.error('🎵 GlobalPlayer: Network error loading audio');
                if (showToast) {
                    showToast('Erro de rede ao carregar o áudio', 'error');
                }
            } else {
                console.error('🎵 GlobalPlayer: Unknown audio error:', error);
                if (showToast) {
                    showToast('Erro desconhecido ao reproduzir áudio', 'error');
                }
            }
            setIsPlaying(false);
        };

        // Só carrega nova URL se for diferente
        if (audio.src !== audioUrl) {
            console.log('🎵 GlobalPlayer: Loading new audio URL:', audioUrl);
            audio.src = audioUrl;
            audio.load();
        }

        if (isPlaying) {
            console.log('🎵 GlobalPlayer: Attempting to start audio playback');
            playAudioSafely();
        } else {
            console.log('🎵 GlobalPlayer: Pausing audio');
            audio.pause();
        }
    }, [currentTrack, isPlaying, showToast]);

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

            // Tratar diferentes tipos de erro com mensagens mais informativas
            if (audioError) {
                let errorMessage = '';
                switch (audioError.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        console.error('🎵 GlobalPlayer: Audio loading aborted');
                        errorMessage = 'Carregamento do áudio foi interrompido';
                        break;
                    case MediaError.MEDIA_ERR_NETWORK:
                        console.error('🎵 GlobalPlayer: Network error loading audio');
                        errorMessage = 'Erro de rede ao carregar o áudio';
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        console.error('🎵 GlobalPlayer: Audio decode error');
                        errorMessage = 'Erro ao decodificar o áudio';
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        console.error('🎵 GlobalPlayer: Audio format not supported');
                        errorMessage = 'Formato de áudio não suportado';
                        break;
                    default:
                        console.error('🎵 GlobalPlayer: Unknown audio error');
                        errorMessage = 'Erro desconhecido no áudio';
                }

                // Mostrar toast informativo para o usuário
                if (showToast && errorMessage) {
                    showToast(errorMessage, 'error');
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

    // Atualizar a URL do áudio quando a faixa atual mudar
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        // Obter URL segura para a faixa atual
        getSecureAudioUrl(currentTrack).then(secureUrl => {
            if (secureUrl && audio.src !== secureUrl) {
                console.log('🎵 GlobalPlayer: Atualizando URL do áudio:', secureUrl);
                audio.src = secureUrl;
                audio.load(); // Recarregar o áudio com a nova URL
            }
        }).catch(error => {
            console.error('🎵 GlobalPlayer: Erro ao obter URL segura para áudio:', error);
        });
    }, [currentTrack]);

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

                    // Mostrar mensagem de erro para o usuário
                    if (audioError?.code === MediaError.MEDIA_ERR_NETWORK) {
                        showToast('❌ Erro de rede ao carregar o áudio', 'error');
                    } else if (audioError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                        showToast('❌ Formato de áudio não suportado', 'error');
                    } else {
                        showToast('❌ Erro ao carregar o áudio', 'error');
                    }
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
