"use client";

import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

// --- Tipos ---
type Track = {
  id: number;
  songName: string;
  artist: string;
  imageUrl: string;
  previewUrl: string;
  downloadUrl: string;
  style: string;
  version: string;
  releaseDate: string;
};

interface AppContextType {
  currentTrack: Track | null;
  playTrack: (track: Track, trackList?: Track[]) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  likedTracks: number[];
  downloadedTracks: number[];
  handleLike: (trackId: number) => void;
  handleDownload: (track: Track) => void;
  alertMessage: string;
  closeAlert: () => void;
  isUserDataLoaded: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  
  const [likedTracks, setLikedTracks] = useState<number[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<number[]>([]);
  const [downloadCount, setDownloadCount] = useState(0);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  const showAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 4000);
  }, []);
  
  useEffect(() => {
    if (isLoaded && user) {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user-data');
          if (!response.ok) throw new Error('Falha ao buscar dados do usuário');
          const data = await response.json();
          setLikedTracks(data.likedTrackIds || []);
          setDownloadedTracks(data.downloadedTrackIds || []);
          setDownloadCount(data.downloadCount || 0);
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          // CORREÇÃO: Adicionada notificação de erro para o usuário.
          showAlert("Não foi possível carregar seus dados. Tente recarregar a página.");
        } finally {
          setIsUserDataLoaded(true);
        }
      };
      fetchUserData();
    } else if (isLoaded && !user) {
      setLikedTracks([]);
      setDownloadedTracks([]);
      setDownloadCount(0);
      setIsUserDataLoaded(true);
    }
  }, [user, isLoaded, showAlert]);

  const playTrack = useCallback((track: Track, trackList: Track[] = []) => {
    setCurrentTrack(track);
    setPlaylist(trackList.length > 0 ? trackList : [track]);
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
  }, [currentTrack, playlist]);

  const previousTrack = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrack(playlist[prevIndex]);
  }, [currentTrack, playlist]);
  
  const handleLike = useCallback((trackId: number) => {
    if (!user) { showAlert("Faça login para curtir músicas."); return; }
    const newLikedTracks = likedTracks.includes(trackId)
        ? likedTracks.filter(id => id !== trackId)
        : [...likedTracks, trackId];
    setLikedTracks(newLikedTracks);
    fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId }) });
  }, [user, likedTracks, showAlert]);

  const handleDownload = useCallback((track: Track) => {
    if (!user) { showAlert("Faça login para baixar músicas."); return; }
    const hasActivePlan = false; 
    const DOWNLOAD_LIMIT = 5;
    if (hasActivePlan || downloadedTracks.includes(track.id)) {
      window.open(track.downloadUrl, '_blank');
    } else {
      if (downloadCount < DOWNLOAD_LIMIT) {
        const newCount = downloadCount + 1;
        const newDownloadedTracks = [...downloadedTracks, track.id];
        setDownloadCount(newCount);
        setDownloadedTracks(newDownloadedTracks);
        fetch('/api/downloads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId: track.id }) });
        window.open(track.downloadUrl, '_blank');
        showAlert(`Download realizado! Você tem ${DOWNLOAD_LIMIT - newCount} downloads restantes.`);
      } else {
        showAlert(`Você atingiu seu limite de ${DOWNLOAD_LIMIT} downloads gratuitos.`);
      }
    }
  }, [user, downloadCount, downloadedTracks, showAlert]);

  const value = useMemo(() => ({
    currentTrack,
    playTrack,
    nextTrack,
    previousTrack,
    likedTracks,
    downloadedTracks,
    handleLike,
    handleDownload,
    alertMessage,
    closeAlert: () => setAlertMessage(''),
    isUserDataLoaded,
  }), [currentTrack, playTrack, nextTrack, previousTrack, likedTracks, downloadedTracks, handleLike, handleDownload, alertMessage, isUserDataLoaded]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
