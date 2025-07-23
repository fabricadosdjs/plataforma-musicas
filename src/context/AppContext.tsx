// src/context/AppContext.tsx
"use client";

import { Track } from '@/types/track';
import forceDownload from '@/utils/downloadUtils';
import { useSession } from 'next-auth/react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AppContextType {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  playTrack: (track: Track, trackList?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  likedTracks: number[];
  downloadedTracks: number[];
  handleLike: (trackId: number) => void;
  handleDownload: (track: Track) => void;
  alertMessage: string;
  closeAlert: () => void;
  isUserDataLoaded: boolean;
  setIsPlaying: (state: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== 'loading';

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [likedTracks, setLikedTracks] = useState<number[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<number[]>([]);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playStartTime, setPlayStartTime] = useState<number | null>(null);

  // Função para registrar conclusão da reprodução
  const logPlayEnd = async (track: Track, duration: number, completed: boolean) => {
    try {
      if (!user || !user.is_vip) return;

      await fetch('/api/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: track.id,
          duration: Math.round(duration),
          completed: completed,
          deviceInfo: navigator.userAgent
        }),
      });
    } catch (error) {
      console.error('Erro ao registrar conclusão da reprodução:', error);
    }
  };

  // Inicializar elemento de áudio
  useEffect(() => {
    const audio = new Audio();

    const handleEnded = () => {
      setIsPlaying(false);

      // Registrar conclusão da reprodução
      if (currentTrack && playStartTime) {
        const duration = (Date.now() - playStartTime) / 1000;
        logPlayEnd(currentTrack, duration, true);
      }

      setPlayStartTime(null);
      // Auto-próxima música será implementada depois
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setPlayStartTime(Date.now());
    };

    const handlePause = () => {
      setIsPlaying(false);

      // Registrar pausa da reprodução (não completada)
      if (currentTrack && playStartTime) {
        const duration = (Date.now() - playStartTime) / 1000;
        logPlayEnd(currentTrack, duration, false);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const showAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 5000);
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      // Buscar likes
      const likesResponse = await fetch('/api/likes');
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        setLikedTracks(likesData.likedTracks || []);
      }

      // Buscar dados do usuário (downloads, etc)
      const userResponse = await fetch('/api/user-data');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setDownloadedTracks(userData.downloads?.map((download: any) => download.trackId) || []);

        // Downloads são gerenciados pelo banco de dados, não precisamos de estado local
        const downloads = userData.downloads?.map((download: any) => download.trackId) || [];
        setDownloadedTracks(downloads);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsUserDataLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, fetchUserData]);

  // Função para registrar reprodução no banco
  const logPlayStart = async (track: Track) => {
    try {
      if (!user || !user.is_vip) return;

      await fetch('/api/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: track.id,
          deviceInfo: navigator.userAgent,
          completed: false
        }),
      });
    } catch (error) {
      console.error('Erro ao registrar reprodução:', error);
    }
  };

  const playTrack = (track: Track, trackList: Track[] = []) => {
    // Verificar se o usuário está logado e é VIP
    if (!user || !user.is_vip) {
      console.warn('Player restrito a usuários VIP logados');
      return;
    }

    setCurrentTrack(track);
    if (trackList.length > 0) {
      setPlaylist(trackList);
    } else {
      setPlaylist([track]);
    }

    // Registrar início da reprodução
    logPlayStart(track);

    if (audioElement) {
      audioElement.src = track.previewUrl;
      audioElement.play().catch(error => {
        console.error('Erro ao reproduzir:', error);
        setIsPlaying(false);
      });
    }
  };

  const togglePlayPause = () => {
    if (currentTrack && audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch(error => {
          console.error('Erro ao reproduzir:', error);
          setIsPlaying(false);
        });
      }
    }
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrackData = playlist[nextIndex];
    setCurrentTrack(nextTrackData);

    if (audioElement) {
      audioElement.src = nextTrackData.previewUrl;
      audioElement.play().catch(error => {
        console.error('Erro ao reproduzir:', error);
        setIsPlaying(false);
      });
    }
  };

  const previousTrack = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevTrackData = playlist[prevIndex];
    setCurrentTrack(prevTrackData);

    if (audioElement) {
      audioElement.src = prevTrackData.previewUrl;
      audioElement.play().catch(error => {
        console.error('Erro ao reproduzir:', error);
        setIsPlaying(false);
      });
    }
  };

  const handleLike = async (trackId: number) => {
    if (!user) {
      showAlert('Você precisa estar logado para curtir músicas.');
      return;
    }

    // Atualizar UI imediatamente para melhor experiência
    const isCurrentlyLiked = likedTracks.includes(trackId);
    if (isCurrentlyLiked) {
      setLikedTracks(prev => prev.filter(id => id !== trackId));
    } else {
      setLikedTracks(prev => [...prev, trackId]);
    }

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });

      if (!response.ok) {
        // Reverter mudança se falhou
        if (isCurrentlyLiked) {
          setLikedTracks(prev => [...prev, trackId]);
        } else {
          setLikedTracks(prev => prev.filter(id => id !== trackId));
        }
        throw new Error('Failed to like track');
      }

      const data = await response.json();

      // Confirmar o estado baseado na resposta da API
      if (data.liked) {
        setLikedTracks(prev => {
          if (!prev.includes(trackId)) {
            return [...prev, trackId];
          }
          return prev;
        });
        showAlert('Música curtida!');
      } else {
        setLikedTracks(prev => prev.filter(id => id !== trackId));
        showAlert('Música descurtida.');
      }
    } catch (error) {
      console.error("Error liking track:", error);
      showAlert('Erro ao curtir a música.');
    }
  };

  const handleDownload = async (track: Track) => {
    if (!user) {
      showAlert('Você precisa estar logado para baixar músicas.');
      return;
    }

    try {
      // Primeiro verificar se pode baixar via API
      const checkResponse = await fetch(`/api/downloads/control?trackId=${track.id}`);
      const checkData = await checkResponse.json();

      if (!checkData.canDownload) {
        const nextAllowed = new Date(checkData.nextAllowedDownload);
        const hoursLeft = Math.ceil((nextAllowed.getTime() - new Date().getTime()) / (1000 * 60 * 60));

        const confirmed = window.confirm(
          `Você já baixou esta música recentemente. ` +
          `Poderá baixar novamente em ${hoursLeft} horas. ` +
          'Deseja baixar mesmo assim?'
        );

        if (!confirmed) {
          showAlert(`Download cancelado. Você poderá baixar novamente em ${hoursLeft} horas.`);
          return;
        }

        // Se confirmou, tentar baixar com flag de confirmação
        const confirmResponse = await fetch('/api/downloads/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId: track.id, confirm: true }),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          showAlert(errorData.error || 'Erro ao processar download.');
          return;
        }
      } else {
        // Registrar o download normalmente
        const downloadResponse = await fetch('/api/downloads/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId: track.id }),
        });

        if (!downloadResponse.ok) {
          const errorData = await downloadResponse.json();
          showAlert(errorData.error || 'Erro ao processar download.');
          return;
        }
      }

      // Verificar permissão VIP na API original
      const vipResponse = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id }),
      });

      const vipData = await vipResponse.json();

      if (vipResponse.status === 403) {
        showAlert('Apenas usuários VIP podem baixar músicas.');
        return;
      }

      if (vipResponse.ok) {
        // Atualizar estado local
        if (!downloadedTracks.includes(track.id)) {
          setDownloadedTracks(prev => [...prev, track.id]);
        }

        showAlert('Download iniciado!');

        // Usar utilitário robusto de download
        await forceDownload(track.downloadUrl, `${track.songName} - ${track.artist}.mp3`);
      } else {
        showAlert(vipData.message || 'Erro ao registrar o download.');
      }
    } catch (error) {
      console.error("Error downloading track:", error);
      showAlert('Erro ao iniciar o download.');
    }
  }; const closeAlert = () => {
    setAlertMessage('');
  };

  const contextValue = {
    currentTrack,
    playlist,
    isPlaying,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    likedTracks,
    downloadedTracks,
    handleLike,
    handleDownload,
    alertMessage,
    closeAlert,
    isUserDataLoaded,
    setIsPlaying,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};