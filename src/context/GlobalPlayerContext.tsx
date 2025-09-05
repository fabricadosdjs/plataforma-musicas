'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Track } from '@/types/track';
import { useSession } from 'next-auth/react';
import { useToastContext } from '@/context/ToastContext';
import AudioDebugger, { debugAudioUrl } from '@/utils/audioDebugger';

interface GlobalPlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    playlist: Track[];
    currentTrackIndex: number;
    currentMusicList: Track[]; // Lista de músicas atual (MusicList)
    currentMusicListIndex: number; // Índice na lista de músicas
    playTrack: (track: Track, newPlaylist?: Track[], musicList?: Track[]) => Promise<void>;
    pauseTrack: () => void;
    stopTrack: () => void;
    togglePlayPause: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
    nextMusicListTrack: () => void; // Próxima música da lista
    previousMusicListTrack: () => void; // Música anterior da lista
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
    const [currentMusicList, setCurrentMusicList] = useState<Track[]>([]);
    const [currentMusicListIndex, setCurrentMusicListIndex] = useState(-1);
    const audioRef = useRef<HTMLAudioElement>(null);

    const getSecureAudioUrl = async (track: Track): Promise<string | null> => {
        // Verificar se há sessão ativa antes de fazer a requisição
        if (!session?.user) {
            AudioDebugger.log('warn', 'Usuário não autenticado, não é possível obter URL de áudio', { trackId: track.id, songName: track.songName });
            showToast('🔒 Faça login para ouvir as músicas', 'error');
            return null;
        }

        // Usar a API de audio-track para obter a URL de áudio segura (assinada)
        try {
            AudioDebugger.log('info', 'Solicitando URL de áudio via audio-track API', { trackId: track.id, songName: track.songName });

            // Verificar conectividade básica antes de fazer a requisição
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

            const response = await fetch('/api/audio-track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                AudioDebugger.log('error', 'Erro ao obter URL de áudio da API audio-track', {
                    status: response.status,
                    error: errorData.error || 'Erro desconhecido',
                    trackId: track.id,
                    songName: track.songName
                });
                showToast(`❌ Erro ao obter URL de áudio: ${errorData.error || 'Tente novamente.'}`, 'error');
                return null;
            }

            const data = await response.json();
            if (data.audioUrl) {
                AudioDebugger.log('info', 'URL de áudio obtida com sucesso da API audio-track', {
                    url: data.audioUrl.substring(0, 100) + '...',
                    trackId: track.id,
                    songName: track.songName
                });
                return data.audioUrl;
            } else {
                AudioDebugger.log('warn', 'API audio-track não retornou URL de áudio', {
                    trackId: track.id,
                    songName: track.songName
                });
                showToast('❌ A API não retornou uma URL de áudio válida.', 'error');
                return null;
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                AudioDebugger.log('error', 'Timeout ao chamar a API audio-track', {
                    trackId: track.id,
                    songName: track.songName
                });
                showToast('⏱️ Timeout ao obter URL de áudio. Tente novamente.', 'error');
            } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                AudioDebugger.log('error', 'Erro de conexão ao chamar a API audio-track', {
                    error: error.message,
                    trackId: track.id,
                    songName: track.songName
                });
                showToast('🌐 Erro de conexão. Verifique sua internet.', 'error');
            } else {
                AudioDebugger.log('error', 'Erro de rede ao chamar a API audio-track', {
                    error: error instanceof Error ? error.message : String(error),
                    trackId: track.id,
                    songName: track.songName
                });
                showToast('❌ Erro de rede ao tentar obter URL de áudio.', 'error');
            }
            return null;
        }
    };

    const playTrack = async (track: Track, newPlaylist?: Track[], musicList?: Track[]) => {
        console.log('🎵 GlobalPlayer: playTrack called with:', {
            id: track.id,
            songName: track.songName,
            downloadUrl: track.downloadUrl,
            previewUrl: track.previewUrl,
            url: track.url,
            imageUrl: track.imageUrl,
            musicList: musicList?.length || 0
        });

        // Obter URL segura se necessário
        const secureUrl = await getSecureAudioUrl(track);
        if (!secureUrl) {
            console.error('🎵 GlobalPlayer: Invalid audio URL:', secureUrl);
            showToast('❌ URL de áudio inválida para esta faixa', 'error');
            return;
        }

        // Se uma nova playlist foi fornecida, atualize a playlist
        if (newPlaylist) {
            console.log('🎵 GlobalPlayer: Atualizando playlist', {
                newPlaylistLength: newPlaylist.length,
                trackId: track.id,
                trackName: track.songName,
                newPlaylistTracks: newPlaylist.map(t => ({ id: t.id, name: t.songName })),
                timestamp: new Date().toISOString()
            });
            setPlaylist(newPlaylist);
            const index = newPlaylist.findIndex(t => t.id === track.id);
            console.log('🎵 GlobalPlayer: Índice encontrado na playlist:', index);
            setCurrentTrackIndex(index);

            // Verificar se a playlist foi definida corretamente
            setTimeout(() => {
                console.log('🎵 GlobalPlayer: Verificação da playlist após setState:', {
                    playlistLength: newPlaylist.length,
                    currentTrackIndex: index,
                    currentTrack: track.songName,
                    timestamp: new Date().toISOString()
                });
            }, 100);

            // Log adicional para verificar se a playlist foi realmente atualizada
            setTimeout(() => {
                console.log('🎵 GlobalPlayer: Playlist atualizada após setState:', {
                    playlistLength: newPlaylist.length,
                    currentTrackIndex: index,
                    currentTrack: track.songName
                });
            }, 100);
        } else {
            // Se não há playlist nova, criar uma playlist com apenas esta música
            // para permitir que nextTrack/previousTrack funcionem
            if (playlist.length === 0 || !playlist.find(t => t.id === track.id)) {
                setPlaylist([track]);
                setCurrentTrackIndex(0);
            } else {
                // Se a música já está na playlist atual, apenas atualizar o índice
                const index = playlist.findIndex(t => t.id === track.id);
                setCurrentTrackIndex(index >= 0 ? index : 0);
            }
        }

        // Se uma lista de músicas foi fornecida, atualize a lista atual
        if (musicList) {
            setCurrentMusicList(musicList);
            const index = musicList.findIndex(t => t.id === track.id);
            setCurrentMusicListIndex(index >= 0 ? index : -1);
        }

        setCurrentTrack(track);

        // Configurar áudio imediatamente
        if (audioRef.current) {
            const audio = audioRef.current;
            console.log('🎵 GlobalPlayer: Configurando áudio para nova track', {
                secureUrl: secureUrl.substring(0, 100) + '...',
                trackName: track.songName
            });

            // Pausar qualquer reprodução atual
            if (!audio.paused) {
                console.log('🎵 GlobalPlayer: Pausando reprodução atual');
                audio.pause();
            }

            // Handlers para eventos de áudio (declarar antes de usar)
            const handleCanPlay = () => {
                console.log('🎵 GlobalPlayer: Áudio pronto para reprodução', {
                    duration: audio.duration,
                    trackName: track.songName
                });
                audio.play().then(() => {
                    console.log('🎵 GlobalPlayer: Áudio iniciado com sucesso');
                    setIsPlaying(true);
                }).catch((error) => {
                    console.error('🎵 GlobalPlayer: Erro ao reproduzir áudio:', error);
                    setIsPlaying(false);
                });
            };

            const handleLoadedMetadata = () => {
                console.log('🎵 GlobalPlayer: Metadata carregada', {
                    duration: audio.duration,
                    trackName: track.songName
                });
            };

            const handleError = async (error: Event) => {
                console.error('🎵 GlobalPlayer: Erro no carregamento do áudio:', error, 'URL:', audio.src);
                setIsPlaying(false);

                // Obter mais detalhes sobre o erro
                const audioElement = error.target as HTMLAudioElement;
                const errorCode = audioElement.error?.code;
                const errorMessage = audioElement.error?.message || 'Erro desconhecido';

                console.error('🎵 GlobalPlayer: Detalhes do erro de áudio:', {
                    code: errorCode,
                    message: errorMessage,
                    networkState: audioElement.networkState,
                    readyState: audioElement.readyState,
                    src: audioElement.src
                });

                // Testar conectividade da URL
                try {
                    const resp = await fetch(audio.src, { method: 'HEAD' });
                    console.log('🎵 GlobalPlayer: Teste de conectividade:', {
                        status: resp.status,
                        statusText: resp.statusText,
                        headers: Object.fromEntries(resp.headers.entries())
                    });

                    if (!resp.ok) {
                        showToast(`❌ Erro ao carregar áudio: servidor respondeu ${resp.status}`, 'error');
                    } else {
                        showToast(`❌ Erro ao carregar áudio (${errorMessage}). URL acessível mas formato pode estar incorreto.`, 'error');
                    }
                } catch (err) {
                    console.error('🎵 GlobalPlayer: Erro no teste de conectividade:', err);
                    showToast('❌ Erro ao carregar áudio: não foi possível acessar a URL.', 'error');
                }
            };

            // Limpar listeners anteriores
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);

            // Validar URL antes de definir
            if (!secureUrl || secureUrl.trim() === '') {
                console.error('🎵 GlobalPlayer: URL de áudio inválida ou vazia');
                showToast('❌ URL de áudio inválida', 'error');
                return;
            }

            // Definir a nova fonte
            audio.src = secureUrl;
            audio.load();

            // Adicionar listeners
            audio.addEventListener('canplay', handleCanPlay, { once: true });
            audio.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
            audio.addEventListener('error', handleError, { once: true });

            // Timeout para evitar carregamento infinito
            const timeoutId = setTimeout(() => {
                if (audio.readyState < 2) { // HAVE_CURRENT_DATA
                    console.warn('🎵 GlobalPlayer: Timeout no carregamento do áudio');
                    audio.removeEventListener('canplay', handleCanPlay);
                    audio.removeEventListener('error', handleError);
                    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
                    showToast('❌ Timeout ao carregar áudio. Tente novamente.', 'error');
                    setIsPlaying(false);
                }
            }, 10000); // 10 segundos

            // Limpar timeout quando o áudio carregar
            const handleLoadComplete = () => {
                clearTimeout(timeoutId);
            };

            audio.addEventListener('canplay', handleLoadComplete, { once: true });
            audio.addEventListener('error', handleLoadComplete, { once: true });
        } else {
            console.log('🎵 GlobalPlayer: Nenhum elemento de áudio disponível');
            setIsPlaying(true);
        }
    };

    const pauseTrack = () => {
        console.log('🎵 GlobalPlayer: Pausing track');
        setIsPlaying(false);
        if (audioRef.current) {
            const audio = audioRef.current;
            if (!audio.paused) {
                console.log('🎵 GlobalPlayer: Pausando elemento de áudio');
                audio.pause();
            } else {
                console.log('🎵 GlobalPlayer: Áudio já estava pausado');
            }
        } else {
            console.log('🎵 GlobalPlayer: Nenhum elemento de áudio disponível para pausar');
        }
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
        console.log('🎵 GlobalPlayer: nextTrack chamado', {
            playlistLength: playlist.length,
            currentTrackIndex,
            currentTrack: currentTrack?.songName,
            playlist: playlist.map(t => ({ id: t.id, name: t.songName })),
            timestamp: new Date().toISOString()
        });

        if (playlist.length === 0) {
            console.log('🎵 GlobalPlayer: Playlist vazia, não é possível avançar');
            return;
        }

        if (currentTrackIndex === -1) {
            console.log('🎵 GlobalPlayer: Índice inválido, não é possível avançar');
            return;
        }

        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        const nextTrackToPlay = playlist[nextIndex];

        if (nextTrackToPlay) {
            console.log('🎵 GlobalPlayer: Avançando para próxima track:', {
                from: currentTrack?.songName,
                to: nextTrackToPlay.songName,
                fromIndex: currentTrackIndex,
                toIndex: nextIndex,
                playlistLength: playlist.length,
                nextTrackId: nextTrackToPlay.id
            });

            // Verificar se a próxima track é diferente da atual
            if (nextTrackToPlay.id === currentTrack?.id) {
                console.log('🎵 GlobalPlayer: Próxima track é a mesma da atual, pulando para a seguinte');
                const nextNextIndex = (nextIndex + 1) % playlist.length;
                const nextNextTrack = playlist[nextNextIndex];
                if (nextNextTrack && nextNextTrack.id !== currentTrack?.id) {
                    console.log('🎵 GlobalPlayer: Pulando para a track seguinte:', nextNextTrack.songName);
                    playTrack(nextNextTrack, playlist);
                } else {
                    console.log('🎵 GlobalPlayer: Não há outras tracks na playlist');
                }
            } else {
                // Usar playTrack para carregar o novo áudio, mantendo a playlist atual
                playTrack(nextTrackToPlay, playlist);
            }
        } else {
            console.log('🎵 GlobalPlayer: Próxima track não encontrada');
        }
    };

    const previousTrack = () => {
        console.log('🎵 GlobalPlayer: previousTrack chamado', {
            playlistLength: playlist.length,
            currentTrackIndex,
            currentTrack: currentTrack?.songName,
            playlist: playlist.map(t => ({ id: t.id, name: t.songName })),
            timestamp: new Date().toISOString()
        });

        if (playlist.length === 0) {
            console.log('🎵 GlobalPlayer: Playlist vazia, não é possível voltar');
            return;
        }

        if (currentTrackIndex === -1) {
            console.log('🎵 GlobalPlayer: Índice inválido, não é possível voltar');
            return;
        }

        const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
        const prevTrackToPlay = playlist[prevIndex];

        if (prevTrackToPlay) {
            console.log('🎵 GlobalPlayer: Voltando para track anterior:', {
                from: currentTrack?.songName,
                to: prevTrackToPlay.songName,
                fromIndex: currentTrackIndex,
                toIndex: prevIndex,
                playlistLength: playlist.length,
                prevTrackId: prevTrackToPlay.id
            });

            // Verificar se a track anterior é diferente da atual
            if (prevTrackToPlay.id === currentTrack?.id) {
                console.log('🎵 GlobalPlayer: Track anterior é a mesma da atual, voltando para a anterior');
                const prevPrevIndex = prevIndex === 0 ? playlist.length - 1 : prevIndex - 1;
                const prevPrevTrack = playlist[prevPrevIndex];
                if (prevPrevTrack && prevPrevTrack.id !== currentTrack?.id) {
                    console.log('🎵 GlobalPlayer: Voltando para a track anterior:', prevPrevTrack.songName);
                    playTrack(prevPrevTrack, playlist);
                } else {
                    console.log('🎵 GlobalPlayer: Não há outras tracks na playlist');
                }
            } else {
                // Usar playTrack para carregar o novo áudio, mantendo a playlist atual
                playTrack(prevTrackToPlay, playlist);
            }
        } else {
            console.log('🎵 GlobalPlayer: Track anterior não encontrada');
        }
    };

    const togglePlayPause = () => {
        if (!currentTrack) return;

        console.log('🎵 GlobalPlayer: togglePlayPause chamado, isPlaying atual:', isPlaying);

        if (isPlaying) {
            console.log('🎵 GlobalPlayer: Pausando música...');
            pauseTrack();
        } else {
            console.log('🎵 GlobalPlayer: Reproduzindo música...');
            if (audioRef.current) {
                const audio = audioRef.current;

                if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
                    console.log('🎵 GlobalPlayer: Audio ready, starting playback');
                    audio.play().then(() => {
                        console.log('🎵 GlobalPlayer: Áudio iniciado com sucesso');
                        setIsPlaying(true);
                    }).catch((error) => {
                        console.error('🎵 GlobalPlayer: Error playing audio:', error);
                        setIsPlaying(false);
                    });
                } else {
                    console.log('🎵 GlobalPlayer: Audio not ready, waiting for data');
                    const handleCanPlay = () => {
                        console.log('🎵 GlobalPlayer: Audio can play now');
                        audio.play().then(() => {
                            console.log('🎵 GlobalPlayer: Áudio iniciado após canplay');
                            setIsPlaying(true);
                        }).catch((error) => {
                            console.error('🎵 GlobalPlayer: Error playing audio after canplay:', error);
                            setIsPlaying(false);
                        });
                        audio.removeEventListener('canplay', handleCanPlay);
                    };
                    audio.addEventListener('canplay', handleCanPlay);
                }
            } else {
                console.log('🎵 GlobalPlayer: Nenhum elemento de áudio disponível');
                setIsPlaying(true);
            }
        }
    };

    const nextMusicListTrack = () => {
        console.log('🎵 GlobalPlayer: nextMusicListTrack chamado', {
            musicListLength: currentMusicList.length,
            currentMusicListIndex,
            currentTrack: currentTrack?.songName
        });

        if (currentMusicList.length === 0) {
            console.log('🎵 GlobalPlayer: Lista de músicas vazia, não é possível avançar');
            return;
        }

        if (currentMusicListIndex === -1) {
            console.log('🎵 GlobalPlayer: Índice inválido na lista de músicas, não é possível avançar');
            return;
        }

        const nextIndex = (currentMusicListIndex + 1) % currentMusicList.length;
        const nextTrackToPlay = currentMusicList[nextIndex];

        if (nextTrackToPlay) {
            console.log('🎵 GlobalPlayer: Avançando para próxima música da lista:', {
                from: currentTrack?.songName,
                to: nextTrackToPlay.songName,
                index: nextIndex
            });
            // Usar playTrack para carregar o novo áudio
            playTrack(nextTrackToPlay, undefined, currentMusicList);
        } else {
            console.log('🎵 GlobalPlayer: Próxima música da lista não encontrada');
        }
    };

    const previousMusicListTrack = () => {
        console.log('🎵 GlobalPlayer: previousMusicListTrack chamado', {
            musicListLength: currentMusicList.length,
            currentMusicListIndex,
            currentTrack: currentTrack?.songName
        });

        if (currentMusicList.length === 0) {
            console.log('🎵 GlobalPlayer: Lista de músicas vazia, não é possível voltar');
            return;
        }

        if (currentMusicListIndex === -1) {
            console.log('🎵 GlobalPlayer: Índice inválido na lista de músicas, não é possível voltar');
            return;
        }

        const prevIndex = currentMusicListIndex === 0 ? currentMusicList.length - 1 : currentMusicListIndex - 1;
        const prevTrackToPlay = currentMusicList[prevIndex];

        if (prevTrackToPlay) {
            console.log('🎵 GlobalPlayer: Voltando para música anterior da lista:', {
                from: currentTrack?.songName,
                to: prevTrackToPlay.songName,
                index: prevIndex
            });
            // Usar playTrack para carregar o novo áudio
            playTrack(prevTrackToPlay, undefined, currentMusicList);
        } else {
            console.log('🎵 GlobalPlayer: Música anterior da lista não encontrada');
        }
    };

    // Event listeners para o áudio
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        const handleEnded = () => {
            console.log('🎵 GlobalPlayer: Track ended, auto-advancing to next track');

            // Se temos uma lista de músicas específica (MusicList), usar ela
            if (currentMusicList.length > 0 && currentMusicListIndex >= 0) {
                console.log('🎵 GlobalPlayer: Auto-advancing to next track in MusicList');
                nextMusicListTrack();
            }
            // Se não, usar a playlist geral
            else if (playlist.length > 0 && currentTrackIndex >= 0) {
                console.log('🎵 GlobalPlayer: Auto-advancing to next track in playlist');
                nextTrack();
            } else {
                console.log('🎵 GlobalPlayer: No more tracks to play, stopping');
                setIsPlaying(false);
            }
        };

        const handleError = (e: Event) => {
            const target = e.target as HTMLAudioElement;
            const audioError = target.error;

            if (audioError) {
                console.warn('🎵 GlobalPlayer: Audio error in useEffect', {
                    code: audioError.code,
                    message: audioError.message,
                    track: currentTrack?.songName || 'Unknown'
                });
            }

            setIsPlaying(false);
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [playlist, currentTrackIndex, currentTrack, currentMusicList, currentMusicListIndex]);

    return (
        <GlobalPlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                playlist,
                currentTrackIndex,
                currentMusicList,
                currentMusicListIndex,
                playTrack,
                pauseTrack,
                stopTrack,
                togglePlayPause,
                nextTrack,
                previousTrack,
                nextMusicListTrack,
                previousMusicListTrack,
                audioRef,
            }}
        >
            {children}
            <audio
                ref={audioRef}
                style={{ display: 'none' }}
                preload="metadata"
                crossOrigin="anonymous"
                playsInline
                webkit-playsinline="true"
                x-webkit-airplay="allow"
                controlsList="nodownload nofullscreen noremoteplayback"
                onContextMenu={(e) => e.preventDefault()}
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
