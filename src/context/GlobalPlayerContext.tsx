'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Track } from '@/types/track';
import { useSession } from 'next-auth/react';
import { useToastContext } from '@/context/ToastContext';

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
    const { showToast } = useToastContext();
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const audioRef = useRef<HTMLAudioElement>(null);

    const getSecureAudioUrl = async (track: Track): Promise<string | null> => {
        const audioUrl = track.downloadUrl || track.previewUrl || track.url;
        if (!audioUrl) return null;

        // Detectar se é dispositivo móvel
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Em mobile, usar URL direta da Contabo (sem assinatura)
        if (isMobile && audioUrl.includes('contabostorage.com')) {
            console.log('🎵 GlobalPlayer: Mobile detectado - usando URL direta da Contabo');
            return audioUrl;
        }

        // Se a URL já é uma URL segura (assinada), use-a
        if (audioUrl.includes('X-Amz-Signature')) {
            return audioUrl;
        }

        // Se é uma URL do Contabo e é desktop, tente obter uma URL segura
        if (audioUrl.includes('contabostorage.com') && !isMobile) {
            try {
                // Extrair o caminho completo do arquivo da URL
                // Exemplo: https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/community/DEORRO%20Y%20VOCES%20DEL%20RANCHO%20-%20CAMARON%20PELAO%20MAIN.mp3
                // Precisamos extrair: community/DEORRO%20Y%20VOCES%20DEL%20RANCHO%20-%20CAMARON%20PELAO%20MAIN.mp3

                // Encontrar o índice após "plataforma-de-musicas/"
                const bucketPattern = 'plataforma-de-musicas/';
                const bucketIndex = audioUrl.indexOf(bucketPattern);
                if (bucketIndex !== -1) {
                    const key = audioUrl.substring(bucketIndex + bucketPattern.length);
                    console.log('🎵 GlobalPlayer: Desktop - extraindo chave do arquivo:', {
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
        // Verificar se é dispositivo móvel
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Permitir reprodução para todos os usuários (logados e não logados)
        console.log('🎵 GlobalPlayer: Reprodução permitida para todos os usuários');

        // Em mobile, garantir que o áudio seja reproduzido apenas após interação do usuário
        if (isMobile) {
            console.log('🎵 GlobalPlayer: Mobile - garantindo interação do usuário para reprodução');
        }

        // Permitir reprodução para todos os usuários (logados e não logados)
        console.log('🎵 GlobalPlayer: playTrack called with:', {
            id: track.id,
            songName: track.songName,
            downloadUrl: track.downloadUrl,
            previewUrl: track.previewUrl,
            url: track.url,
            imageUrl: track.imageUrl
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

        // Verificar se é dispositivo móvel
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Permitir carregamento de áudio para todos os usuários
        console.log('🎵 GlobalPlayer: Carregando áudio para todos os usuários');

        const audio = audioRef.current;
        // Priorizar downloadUrl que é o mesmo link do botão download
        const audioUrl = currentTrack.downloadUrl || currentTrack.previewUrl || currentTrack.url;

        console.log('🎵 GlobalPlayer: Audio effect triggered', {
            trackId: currentTrack.id,
            trackName: currentTrack.songName || currentTrack.title,
        });

        // Função interna para reproduzir áudio de forma assíncrona
        const playAudioAsync = async () => {
            try {
                await audioRef.current?.play();
                setIsPlaying(true);
            } catch (err: any) {
                const url = audioRef.current?.src;
                let msg = "";
                if (err?.name === "NotAllowedError") {
                    msg = "O navegador bloqueou a reprodução automática. Toque para liberar o áudio.";
                } else if (err?.name === "NotSupportedError") {
                    msg = "O formato de áudio pode não ser compatível com seu dispositivo.";
                } else if (err?.name === "NetworkError") {
                    msg = "Erro de rede ao tentar carregar o áudio.";
                } else {
                    msg = "Erro ao tentar reproduzir a música.";
                }
                showToast(`${msg}\nURL: ${url || "(desconhecida)"}`, "error");
                setIsPlaying(false);
            }
        };

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

        // Verificar se a URL parece ser de um serviço de streaming conhecido
        const isStreamingService = /\.(mp3|wav|ogg|m4a|aac)$/i.test(audioUrl) ||
            audioUrl.includes('blob:') ||
            audioUrl.includes('data:audio');

        if (!isStreamingService && !audioUrl.startsWith('http')) {
            console.warn('🎵 GlobalPlayer: Potentially problematic audio URL format:', audioUrl);
        }

        // Chamar a função assíncrona após as verificações
        playAudioAsync();

        // Função para tentar reproduzir o áudio de forma segura
        const playAudioSafely = async (retryCount = 0) => {
            try {
                // Em mobile, tentar reprodução mais direta
                if (isMobile) {
                    console.log('🎵 GlobalPlayer: Mobile - tentando reprodução direta');

                    // Verificar se o áudio está em um estado válido
                    if (audio.error) {
                        console.error('🎵 GlobalPlayer: Mobile - áudio em erro, tentando reproduzir mesmo assim');
                        // Em mobile, tentar reproduzir mesmo com erro
                    }

                    // Tentar reproduzir imediatamente em mobile
                    try {
                        await audio.play();
                        console.log('🎵 GlobalPlayer: Mobile - reprodução iniciada com sucesso');
                        return;
                    } catch (playError) {
                        console.warn('🎵 GlobalPlayer: Mobile - reprodução direta falhou, tentando método padrão:', playError);

                        // Tratar erro específico de autoplay bloqueado em mobile
                        if (playError instanceof Error && playError.name === 'NotAllowedError') {
                            console.error('🎵 GlobalPlayer: Mobile - Autoplay bloqueado! Usuário precisa tocar no botão');
                            showToast('🔇 Toque no botão de play para ativar o áudio no seu dispositivo', 'warning');
                            return;
                        }
                    }
                }

                // Limitar tentativas de retry
                if (retryCount >= 2) {
                    console.error('🎵 GlobalPlayer: Max retry attempts reached');
                    handlePlayError(new Error('Máximo de tentativas de reprodução atingido'));
                    return;
                }

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
                            handlePlayError(new Error('Áudio em estado de erro'));
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

                    // Reduzir timeout para 5 segundos e melhorar tratamento
                    const timeoutId = setTimeout(() => {
                        console.warn('🎵 GlobalPlayer: Audio loading timeout, attempting fallback');
                        audio.removeEventListener('canplay', canPlayHandler);

                        // Tentar reproduzir mesmo sem o evento canplay
                        if (audio.readyState >= 1) { // HAVE_METADATA ou superior
                            console.log('🎵 GlobalPlayer: Attempting playback despite timeout');
                            audio.play().catch((error: any) => {
                                console.error('🎵 GlobalPlayer: Fallback play failed:', error);
                                // Tentar retry se ainda não atingiu o limite
                                if (retryCount < 2) {
                                    console.log('🎵 GlobalPlayer: Retrying audio playback...');
                                    setTimeout(() => playAudioSafely(retryCount + 1), 1000);
                                } else {
                                    handlePlayError(new Error('Falha ao reproduzir áudio após timeout'));
                                }
                            });
                        } else {
                            // Tentar retry se ainda não atingiu o limite
                            if (retryCount < 2) {
                                console.log('🎵 GlobalPlayer: Retrying audio loading...');
                                setTimeout(() => playAudioSafely(retryCount + 1), 1000);
                            } else {
                                handlePlayError(new Error('Áudio não carregou em tempo hábil'));
                            }
                        }
                    }, 5000); // Reduzido para 5 segundos

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
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    if (isMobile) {
                        showToast('🔇 Toque no botão de play para ativar o áudio no seu dispositivo', 'warning');
                    } else {
                        showToast('🔇 Clique no botão de play para reproduzir o áudio', 'info');
                    }
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
            } else if (error?.message?.includes('timeout') || error?.message?.includes('tempo hábil')) {
                console.error('🎵 GlobalPlayer: Audio loading timeout');
                if (showToast) {
                    showToast('Áudio demorou para carregar. Tente novamente.', 'warning');
                }
            } else if (error?.message?.includes('Falha ao reproduzir')) {
                console.error('🎵 GlobalPlayer: Audio playback failed after timeout');
                if (showToast) {
                    showToast('Falha ao reproduzir áudio. Verifique a conexão.', 'error');
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

            // Log adicional para debug
            console.log('🎵 GlobalPlayer: Audio element state after load:', {
                src: audio.src,
                readyState: audio.readyState,
                networkState: audio.networkState,
                error: audio.error,
                paused: audio.paused,
                ended: audio.ended
            });
        }

        // Em mobile, garantir que o volume está correto
        if (isMobile) {
            audio.volume = 1.0; // Volume máximo em mobile
            audio.muted = false; // Garantir que não está mutado
            console.log('🎵 GlobalPlayer: Mobile - volume configurado:', { volume: audio.volume, muted: audio.muted });
        }

        if (isPlaying) {
            console.log('🎵 GlobalPlayer: Attempting to start audio playback');
            if (isMobile) {
                console.log('🎵 GlobalPlayer: Mobile - iniciando reprodução com URL direta');
            }
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

            // Detectar se é dispositivo móvel
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            // Log mais limpo para evitar spam no console
            if (audioError) {
                console.warn('🎵 GlobalPlayer: Audio error in useEffect', {
                    code: audioError.code,
                    message: audioError.message,
                    track: currentTrack?.songName || 'Unknown'
                });
            }

            // Tratar erros específicos para mobile vs desktop
            if (isMobile) {
                if (audioError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                    showToast?.('⚠️ Formato de áudio pode não ser compatível com seu dispositivo', 'warning');
                } else if (audioError?.code === MediaError.MEDIA_ERR_NETWORK) {
                    showToast?.('📱 Verifique sua conexão de internet', 'warning');
                } else if (audioError?.code === MediaError.MEDIA_ERR_ABORTED) {
                    showToast?.('🔇 Áudio interrompido - toque no botão de play novamente', 'info');
                } else {
                    showToast?.('📱 Problema de compatibilidade de áudio em mobile', 'warning');
                }
            } else {
                // Para desktop, mensagens mais específicas
                if (audioError?.code === MediaError.MEDIA_ERR_NETWORK) {
                    showToast?.('❌ Erro de rede ao carregar o áudio', 'error');
                } else if (audioError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                    showToast?.('❌ Formato de áudio não suportado', 'error');
                } else if (audioError?.code === MediaError.MEDIA_ERR_DECODE) {
                    showToast?.('❌ Erro ao decodificar o áudio', 'error');
                } else {
                    showToast?.('❌ Erro ao carregar o áudio', 'error');
                }
            }

            setIsPlaying(false);
        };

        const handleLoadedData = () => {
            console.log('🎵 GlobalPlayer: Audio loadeddata event fired');
            console.log('🎵 GlobalPlayer: Audio state on loadeddata:', {
                readyState: audio.readyState,
                networkState: audio.networkState,
                error: audio.error,
                paused: audio.paused,
                ended: audio.ended,
                currentTime: audio.currentTime,
                duration: audio.duration
            });
        };

        const handleLoadStart = () => {
            console.log('🎵 GlobalPlayer: Audio loadstart event fired');
            console.log('🎵 GlobalPlayer: Audio state on loadstart:', {
                readyState: audio.readyState,
                networkState: audio.networkState,
                error: audio.error,
                paused: audio.paused,
                ended: audio.ended
            });
        };

        const handleCanPlay = () => {
            console.log('🎵 GlobalPlayer: Audio can play event fired');
            console.log('🎵 GlobalPlayer: Audio state on canplay:', {
                readyState: audio.readyState,
                networkState: audio.networkState,
                error: audio.error,
                paused: audio.paused,
                ended: audio.ended,
                currentTime: audio.currentTime,
                duration: audio.duration
            });
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
                onLoadedData={() => console.log('🎵 GlobalPlayer: Audio loadeddata')}
                onCanPlay={() => console.log('🎵 GlobalPlayer: Audio canplay')}
                onPlay={() => console.log('🎵 GlobalPlayer: Audio play event')}
                onPause={() => console.log('🎵 GlobalPlayer: Audio pause event')}
                onError={(e) => {
                    const target = e.target as HTMLAudioElement;
                    const audioError = target.error;
                    const url = target.src;
                    // Log mais limpo para evitar spam no console
                    if (audioError) {
                        console.warn('🎵 GlobalPlayer: Audio error detected', {
                            code: audioError.code,
                            message: audioError.message,
                            track: currentTrack?.songName || 'Unknown',
                            url
                        });
                    }
                    // Toast sempre mostra a URL
                    let msg = '';
                    if (audioError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                        msg = '⚠️ Formato de áudio pode não ser compatível com seu dispositivo';
                    } else if (audioError?.code === MediaError.MEDIA_ERR_NETWORK) {
                        msg = '❌ Erro de rede ao carregar o áudio';
                    } else if (audioError?.code === MediaError.MEDIA_ERR_ABORTED) {
                        msg = '🔇 Áudio interrompido - toque no botão de play novamente';
                    } else {
                        msg = '❌ Erro ao carregar o áudio';
                    }
                    showToast(`${msg}\nURL: ${url || '(desconhecida)'}`, audioError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ? 'warning' : 'error');
                    setIsPlaying(false);
                }}
                onEnded={() => console.log('🎵 GlobalPlayer: Audio ended')}
                onAbort={() => console.log('🎵 GlobalPlayer: Audio loading aborted')}
                onSuspend={() => console.log('🎵 GlobalPlayer: Audio loading suspended')}
                onStalled={() => console.log('🎵 GlobalPlayer: Audio stalled')}
                onWaiting={() => console.log('🎵 GlobalPlayer: Audio waiting for data')}
                onLoadStart={() => {
                    console.log('🎵 GlobalPlayer: Audio loadstart event');
                }}
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
