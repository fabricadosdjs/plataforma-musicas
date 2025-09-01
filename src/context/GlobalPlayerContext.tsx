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
    let audioUrl: string = String(track.downloadUrl || track.previewUrl || track.url || '');
        if (!audioUrl || typeof audioUrl !== 'string') {
            AudioDebugger.log('warn', 'URL de áudio não encontrada ou inválida', {
                trackId: track.id,
                songName: track.songName,
                downloadUrl: track.downloadUrl,
                previewUrl: track.previewUrl,
                url: track.url
            });
            return null;
        }

        debugAudioUrl(audioUrl, `Track ${track.id} - ${track.songName}`);

        // Detectar se é dispositivo móvel (apenas no cliente)
        let isMobile = false;
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
            isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }

        // PARA REPRODUÇÃO: sempre usar URL direta da Contabo (sem assinatura)
        if (audioUrl.includes('contabostorage.com')) {
            try {
                // Corrigir qualquer hash/prefixo antes de 'plataforma-de-musicas/'
                audioUrl = String(audioUrl).replace(/https?:\/\/[^/]*contabostorage\.com\/.*?(plataforma-de-musicas\/)/, 'https://usc1.contabostorage.com/$1');
                // Se ainda não corrigiu, tentar remover qualquer prefixo antes de 'plataforma-de-musicas/'
                if (!audioUrl.startsWith('https://usc1.contabostorage.com/plataforma-de-musicas/')) {
                    const idx = audioUrl.indexOf('plataforma-de-musicas/');
                    if (idx !== -1) {
                        audioUrl = 'https://usc1.contabostorage.com/' + audioUrl.substring(idx);
                    }
                }
                AudioDebugger.log('info', 'Convertendo para URL direta da Contabo (sanitizada)', {
                    sanitized: audioUrl.substring(0, 100) + '...',
                    isMobile,
                    trackId: track.id
                });
                return audioUrl;
            } catch (error) {
                AudioDebugger.log('error', 'Erro ao sanitizar URL direta da Contabo', {
                    error: error instanceof Error ? error.message : error,
                    originalUrl: String(audioUrl).substring(0, 100) + '...',
                    trackId: track.id
                });
                return String(audioUrl);
            }
        }

        AudioDebugger.log('info', 'Usando URL original (não é Contabo)', {
            url: audioUrl.substring(0, 100) + '...',
            trackId: track.id
        });

        return audioUrl;
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
            setPlaylist(newPlaylist);
            const index = newPlaylist.findIndex(t => t.id === track.id);
            setCurrentTrackIndex(index);
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

        // Aguardar o próximo tick para garantir que o áudio esteja configurado
        setTimeout(() => {
            if (audioRef.current) {
                const audio = audioRef.current;
                console.log('🎵 GlobalPlayer: Configurando áudio para nova track');

                // Pausar qualquer reprodução atual
                if (!audio.paused) {
                    audio.pause();
                }

                // Definir a nova fonte
                audio.src = secureUrl;
                audio.load();

                // Aguardar o carregamento antes de reproduzir
                audio.addEventListener('canplay', () => {
                    console.log('🎵 GlobalPlayer: Áudio pronto para reprodução');
                    audio.play().then(() => {
                        console.log('🎵 GlobalPlayer: Áudio iniciado com sucesso');
                        setIsPlaying(true);
                    }).catch((error) => {
                        console.error('🎵 GlobalPlayer: Erro ao reproduzir áudio:', error);
                        setIsPlaying(false);
                    });
                }, { once: true });

                audio.addEventListener('error', async (error) => {
                    console.error('🎵 GlobalPlayer: Erro no carregamento do áudio:', error, 'URL:', audio.src);
                    setIsPlaying(false);

                    // Testar conectividade da URL
                    try {
                        const resp = await fetch(audio.src, { method: 'HEAD' });
                        if (!resp.ok) {
                            showToast(`❌ Erro ao carregar áudio: servidor respondeu ${resp.status}`, 'error');
                        } else {
                            showToast('❌ Erro ao carregar áudio, mas a URL está acessível. Verifique o formato do arquivo.', 'error');
                        }
                    } catch (err) {
                        showToast('❌ Erro ao carregar áudio: não foi possível acessar a URL.', 'error');
                    }
                });
            } else {
                console.log('🎵 GlobalPlayer: Nenhum elemento de áudio disponível');
                setIsPlaying(true);
            }
        }, 0);
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
            currentTrack: currentTrack?.songName
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
                index: nextIndex
            });
            // Usar playTrack para carregar o novo áudio
            playTrack(nextTrackToPlay);
        } else {
            console.log('🎵 GlobalPlayer: Próxima track não encontrada');
        }
    };

    const previousTrack = () => {
        console.log('🎵 GlobalPlayer: previousTrack chamado', {
            playlistLength: playlist.length,
            currentTrackIndex,
            currentTrack: currentTrack?.songName
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
                index: prevIndex
            });
            // Usar playTrack para carregar o novo áudio
            playTrack(prevTrackToPlay);
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
