// src/context/AppContext.tsx
"use client";

import { Track } from '@/types/track';
import forceDownload from '@/utils/downloadUtils';
import { useSession } from 'next-auth/react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert';
import { NotificationProvider } from './NotificationContext';

interface AppContextType {
  // ... (outras propriedades do contexto permanecem iguais)
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track, trackList?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  stopMusic: () => void;
  // ...

  // ADICIONADO: Estado e funções para downloads
  dailyDownloadCount: number;
  dailyLimit: number;
  downloadedTracks: number[];
  downloadedTracksSet: Set<number>;
  handleDownload: (track: Track) => Promise<void>;

  // Toast global para feedback
  showToast: (message: string, type?: 'default' | 'success' | 'info' | 'warning' | 'error' | 'vip' | 'access-check', duration?: number) => void;

  // ... (outras propriedades como alerts)
  showAlert: (message: string, duration?: number) => void;
  showVipAlert: (message: string, duration?: number) => void;
  showAccessCheckAlert: (message: string, duration?: number) => void;
  alertMessage: string;
  alertType: 'default' | 'success' | 'info' | 'warning' | 'error' | 'vip' | 'access-check';
  closeAlert: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const user = session?.user;

  // ... (outros estados como currentTrack, isPlaying, etc.)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'default' | 'vip' | 'access-check' | 'success' | 'info' | 'warning' | 'error'>('default');
  // ADICIONADO: Estados centralizados para downloads
  const [dailyDownloadCount, setDailyDownloadCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(15); // Um valor padrão
  const [downloadedTracks, setDownloadedTracks] = useState<number[]>([]);
  // Set para facilitar checagem de músicas baixadas
  const downloadedTracksSet = new Set(downloadedTracks);
  // Toast global para feedback
  const showToast = useCallback((message: string, type: 'default' | 'success' | 'info' | 'warning' | 'error' | 'vip' | 'access-check' = 'default', duration: number = 5000) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(''), duration);
  }, []);

  // ... (outros hooks e funções como playTrack, handleLike)
  const showAlert = useCallback((message: string, duration: number = 5000) => {
    setAlertMessage(message);
    setAlertType('default');
    setTimeout(() => setAlertMessage(''), duration);
  }, []);

  const showVipAlert = useCallback((message: string, duration: number = 5000) => {
    setAlertMessage(message);
    setAlertType('vip');
    setTimeout(() => setAlertMessage(''), duration);
  }, []);

  const showAccessCheckAlert = useCallback((message: string, duration: number = 5000) => {
    setAlertMessage(message);
    setAlertType('access-check');
    setTimeout(() => setAlertMessage(''), duration);
  }, []);

  const closeAlert = () => setAlertMessage('');

  // ADICIONADO: Função para parar música
  const stopMusic = useCallback(() => {
    setIsPlaying(false);
    setCurrentTrack(null);
    setTrackList([]);
  }, []);

  // ALTERADO: fetchUserData agora busca tudo, incluindo contagem de downloads
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    // Evitar chamadas desnecessárias se já temos os dados
    if (downloadedTracks.length > 0 && dailyDownloadCount > 0) return;

    try {
      // Usando a rota GET que modificamos para pegar todos os dados iniciais
      const response = await fetch('/api/downloads');
      if (response.ok) {
        const data = await response.json();
        setDownloadedTracks(data.downloads || []);
        setDailyDownloadCount(data.dailyDownloadCount || 0);
        setDailyLimit(data.dailyLimit || 15);
      }
      // Você pode adicionar o fetch de likes aqui também se quiser unificar
    } catch (error) {
      console.error("Error fetching user data:", error);
      showAlert("Erro ao carregar dados do usuário.");
    }
  }, [user, showAlert, downloadedTracks.length, dailyDownloadCount]);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setDownloadedTracks([]);
      setDailyDownloadCount(0);
      setDailyLimit(15);
    }
  }, [status, user, fetchUserData]);

  // ADICIONADO: Lógica de download centralizada
  const handleDownload = async (track: Track, confirmReDownload = false) => {
    if (!user) return showAlert('Você precisa estar logado para baixar.');

    try {
      const response = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setDownloadedTracks(data.downloadedTrackIds || []);
        setDailyDownloadCount(data.dailyDownloadCount || 0);
        setDailyLimit(data.dailyLimit || 15);
        await forceDownload(track.downloadUrl, `${track.artist} - ${track.songName}.mp3`);
        showAlert(`Música "${track.songName}" baixada com sucesso!`);
      } else {
        const errorData = await response.json();
        showAlert(errorData.error || 'Erro ao baixar música');
      }
    } catch (error) {
      console.error('Error downloading track:', error);
      showAlert('Erro ao baixar música');
    }
  };

  // ... (outras funções como playTrack, nextTrack, etc.)
  const playTrack = (track: Track, list: Track[] = []) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (list.length > 0) {
      setTrackList(list);
    }
  };

  const nextTrack = () => {
    if (trackList.length === 0) {
      return;
    }
    const currentIndex = trackList.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % trackList.length;
    setCurrentTrack(trackList[nextIndex]);
    setIsPlaying(true);
  };

  const previousTrack = () => {
    if (trackList.length === 0) {
      return;
    }
    const currentIndex = trackList.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? trackList.length - 1 : currentIndex - 1;
    setCurrentTrack(trackList[prevIndex]);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    console.log('AppContext: togglePlayPause called, current isPlaying:', isPlaying);
    setIsPlaying(!isPlaying);
  };

  const contextValue: AppContextType = {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    stopMusic,
    dailyDownloadCount,
    dailyLimit,
    downloadedTracks,
    downloadedTracksSet,
    handleDownload,
    showAlert,
    showVipAlert,
    showAccessCheckAlert,
    showToast,
    closeAlert,
    alertMessage,
    alertType,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <NotificationProvider>
        {children}
        {alertMessage && (
          <Alert
            message={alertMessage}
            type={alertType}
            onClose={closeAlert}
          />
        )}
      </NotificationProvider>
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