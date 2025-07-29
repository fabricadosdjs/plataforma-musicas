// src/context/AppContext.tsx
"use client"; // Esta linha DEVE ser a primeira!

import { Track } from '@/types/track';
import forceDownload from '@/utils/downloadUtils';
import { useSession } from 'next-auth/react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert'; // Importar o componente Alert

// Simplificando: agora DownloadedTrackInfo é apenas um ID, para indicar que foi baixado alguma vez
// A lógica de "próximo download permitido" será tratada internamente em handleDownload e não no estado visível.
type DownloadedTrackInfo = number;

interface AppContextType {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playTrack: (track: Track, trackList?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  likedTracks: number[];
  downloadedTracks: DownloadedTrackInfo[]; // Volta a ser array de IDs
  handleLike: (trackId: number) => Promise<void>;
  handleDownload: (track: Track) => Promise<void>;

  // FUNÇÕES DE ALERTA RESTAURADAS DIRETAMENTE NO CONTEXTO
  alertMessage: string;
  alertType: 'default' | 'vip' | 'access-check';
  showAlert: (message: string, duration?: number) => void;
  showVipAlert: (message: string) => void;
  showAccessCheckAlert: (message: string) => void;
  closeAlert: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== 'loading';

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  // ESTADOS PARA O SISTEMA DE ALERTA LOCAL DO CONTEXTO
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'default' | 'vip' | 'access-check'>('default');

  // Removido audioElement - agora o controle é direto na thumbnail
  // const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [likedTracks, setLikedTracks] = useState<number[]>([]);
  // Estado para downloadedTracks agora armazena apenas IDs
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrackInfo[]>([]);
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

  // Removido - controle direto na thumbnail
  // useEffect(() => {
  //   // Inicialização do áudio movida para thumbnail
  // }, [currentTrack, playStartTime]);

  // FUNÇÕES DE ALERTA RESTAURADAS NO CONTEXTO
  const showAlert = useCallback((message: string, duration: number = 5000) => {
    setAlertMessage(message);
    setAlertType('default');
    setTimeout(() => setAlertMessage(''), duration);
  }, []);

  const showVipAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setAlertType('vip');
    setTimeout(() => setAlertMessage(''), 15000); // 15 segundos para alertas VIP
  }, []);

  const showAccessCheckAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setAlertType('access-check');
    setTimeout(() => setAlertMessage(''), 15000); // 15 segundos para verificação de perfil
  }, []);

  const closeAlert = () => {
    setAlertMessage('');
  };

  // Função para buscar dados do usuário, populando downloadedTracks apenas com IDs
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      const likesResponse = await fetch('/api/likes');
      if (likesResponse.ok) {
        const likesData = await likesResponse.json();
        setLikedTracks(likesData.likedTracks || []);
      }

      const userResponse = await fetch('/api/user-data');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const downloadedIds = userData.downloadedTrackIds || [];
        console.log('--- DEBUG: AppContext -> downloadedIds from API:', downloadedIds);
        console.log('--- DEBUG: AppContext -> downloadedIds type:', typeof downloadedIds);
        console.log('--- DEBUG: AppContext -> downloadedIds is array:', Array.isArray(downloadedIds));
        setDownloadedTracks(downloadedIds); // Agora é um array de números
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showAlert("Erro ao carregar dados do usuário."); // Usando a função de alerta restaurada
    } finally {
      setIsUserDataLoaded(true);
    }
  }, [user, showAlert]); // Dependência showAlert adicionada

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, fetchUserData]);

  // Atualizar título da aba do navegador quando música muda
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const baseTitle = 'DJ Pool Platform';

    if (currentTrack) {
      const trackInfo = `${currentTrack.artist} - ${currentTrack.songName}`;
      const playingIndicator = isPlaying ? "🎵 " : "⏸️ ";
      document.title = `${playingIndicator}${trackInfo} • ${baseTitle}`;
    } else {
      const currentPath = window.location.pathname;
      switch (currentPath) {
        case '/new':
          document.title = `Novas Músicas • ${baseTitle}`;
          break;
        case '/trending':
          document.title = `Trending • ${baseTitle}`;
          break;
        case '/charts':
          document.title = `Charts • ${baseTitle}`;
          break;
        case '/featured':
          document.title = `Featured • ${baseTitle}`;
          break;
        case '/pro':
          document.title = `Pro • ${baseTitle}`;
          break;
        default:
          document.title = baseTitle;
      }
    }
  }, [currentTrack, isPlaying]);

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
    if (!user || !user.is_vip) {
      showVipAlert('Apenas usuários VIP logados podem reproduzir músicas.'); // Usando função restaurada
      console.warn('Player restrito a usuários VIP logados');
      return;
    }

    setCurrentTrack(track);
    if (trackList.length > 0) {
      setPlaylist(trackList);
    } else {
      setPlaylist([track]);
    }

    logPlayStart(track);

    // Definir como playing para controle direto
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    // Controle direto na thumbnail
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (playlist.length === 0) return;

    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrackData = playlist[nextIndex];
    setCurrentTrack(nextTrackData);

    // Controle direto na thumbnail
  };

  const previousTrack = () => {
    if (!currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (playlist.length === 0) return;

    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevTrackData = playlist[prevIndex];
    setCurrentTrack(prevTrackData);

    // Controle direto na thumbnail
  };

  const handleLike = async (trackId: number) => {
    if (!user) {
      showAlert('Você precisa estar logado para curtir músicas.'); // Usando função restaurada
      return;
    }

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
        if (isCurrentlyLiked) {
          setLikedTracks(prev => [...prev, trackId]);
        } else {
          setLikedTracks(prev => prev.filter(id => id !== trackId));
        }
        throw new Error('Failed to like track');
      }

      const data = await response.json();

      const track = playlist.find(t => t.id === trackId) || currentTrack;
      const trackName = track ? `${track.artist} - ${track.songName}` : 'Música';

      if (data.liked) {
        setLikedTracks(prev => {
          if (!prev.includes(trackId)) {
            return [...prev, trackId];
          }
          return prev;
        });
        showAlert(`Música "${trackName}" curtida!`); // Usando função restaurada
      } else {
        setLikedTracks(prev => prev.filter(id => id !== trackId));
        showAlert(`Música "${trackName}" descurtida.`); // Usando função restaurada
      }
    } catch (error) {
      console.error("Error liking track:", error);
      showAlert('Erro ao curtir a música.'); // Usando função restaurada
    }
  };

  const handleDownload = async (track: Track) => {
    if (!user) {
      showAlert('Você precisa estar logado para baixar músicas.'); // Usando função restaurada
      return;
    }

    if (!user.is_vip) {
      showVipAlert('Apenas usuários VIP podem baixar músicas.'); // Usando função restaurada
      return;
    }

    try {
      showAccessCheckAlert('Verificando permissões de download...'); // Usando função restaurada

      const checkResponse = await fetch(`/api/downloads/control?trackId=${track.id}`);
      const checkData = await checkResponse.json();

      if (!checkData.canDownload) {
        const nextAllowed = new Date(checkData.nextAllowedDownload);
        const now = new Date();
        const diffTime = nextAllowed.getTime() - now.getTime();
        const hoursLeft = Math.ceil(diffTime / (1000 * 60 * 60));

        const errorMessage = checkData.error || `Você já baixou esta música recentemente. Poderá baixar novamente em ${hoursLeft} horas.`;

        // Usando o window.confirm nativo novamente, já que useNotifications foi removido
        const confirmed = window.confirm(
          `Download Restrito\n${errorMessage}\n\nDeseja baixar mesmo assim?`
        );

        if (!confirmed) {
          showAlert(`Download cancelado. Você poderá baixar novamente em ${hoursLeft} horas.`);
          closeAlert();
          return;
        }

        const confirmDownloadResponse = await fetch('/api/downloads/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId: track.id, confirm: true }),
        });

        if (!confirmDownloadResponse.ok) {
          const errorData = await confirmDownloadResponse.json();
          showAlert(errorData.error || 'Erro ao processar o re-download.');
          return;
        }

        const finalApiResponse = await confirmDownloadResponse.json();
        if (finalApiResponse.success) {
          setDownloadedTracks(prev => {
            if (!prev.includes(track.id)) {
              return [...prev, track.id];
            }
            return prev;
          });
          showVipAlert('✨ Download VIP autorizado! Seu arquivo está sendo preparado...');
          await forceDownload(track.downloadUrl, `${track.songName} - ${track.artist}.mp3`);
          showAlert(`Download de "${track.songName}" - "${track.artist}" concluído!`, 5000); // Alerta simples de sucesso
        } else {
          showAlert(finalApiResponse.error || 'Erro ao registrar o download.');
        }
        return; // Retorna após processar a confirmação
      }

      // Se pode baixar normalmente (não precisa de confirmação)
      const downloadResponse = await fetch('/api/downloads/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id }),
      });

      if (!downloadResponse.ok) {
        const errorData = await downloadResponse.json();
        showAlert(errorData.error || 'Erro ao registrar o download.');
        return;
      }

      const finalApiResponse = await downloadResponse.json();

      if (finalApiResponse.success) {
        setDownloadedTracks(prev => {
          if (!prev.includes(track.id)) {
            return [...prev, track.id];
          }
          return prev;
        });
        showVipAlert('✨ Download VIP autorizado! Seu arquivo está sendo preparado...');
        await forceDownload(track.downloadUrl, `${track.songName} - ${track.artist}.mp3`);
        showAlert(`Download de "${track.songName}" - "${track.artist}" concluído!`, 5000); // Alerta simples de sucesso
      } else {
        showAlert(finalApiResponse.error || 'Erro ao registrar o download.');
      }
    } catch (error) {
      console.error("Error downloading track:", error);
      showAlert('Erro ao iniciar o download.');
      closeAlert();
    }
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

    // Funções de alerta restauradas no contexto
    alertMessage,
    alertType,
    showAlert,
    showVipAlert,
    showAccessCheckAlert,
    closeAlert,

    isUserDataLoaded,
    setIsPlaying,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {/* Aqui é onde o Alert será renderizado. Ele é o único responsável pela exibição global. */}
      {/* Ele será fixo no canto inferior/superior direito. */}
      {alertMessage && <Alert message={alertMessage} type={alertType} onClose={closeAlert} />}
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