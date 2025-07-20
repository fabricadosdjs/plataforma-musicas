// src/context/AppContext.tsx
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
  handleReportCopyright: (track: Track) => void;
  handleReportBug: (track: Track) => void; // NOVO: Função para reportar bug
  alertMessage: string;
  closeAlert: () => void;
  isUserDataLoaded: boolean;
  setIsPlaying: (state: boolean) => void;
  dailyDownloadCount: number;
  lastDownloadReset: Date | null;
  showReDownloadConfirmation: boolean;
  trackToConfirm: Track | null;
  confirmReDownload: () => Promise<void>;
  cancelReDownload: () => void;
  showReportConfirmation: boolean;
  trackToReport: Track | null;
  confirmReport: () => Promise<void>;
  cancelReport: () => void;
  showBugReportConfirmation: boolean; // NOVO: Estado para modal de bug
  trackToBugReport: Track | null;    // NOVO: Track para reportar bug
  confirmBugReport: () => Promise<void>; // NOVO: Confirma reporte de bug
  cancelBugReport: () => void;       // NOVO: Cancela reporte de bug
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  
  const [likedTracks, setLikedTracks] = useState<number[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<number[]>([]);
  const [dailyDownloadCount, setDailyDownloadCount] = useState(0);
  const [lastDownloadReset, setLastDownloadReset] = useState<Date | null>(null);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [showReDownloadConfirmation, setShowReDownloadConfirmation] = useState(false);
  const [trackToConfirm, setTrackToConfirm] = useState<Track | null>(null);

  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [trackToReport, setTrackToReport] = useState<Track | null>(null);

  // NOVO: Estados para o modal de confirmação de reporte de bug
  const [showBugReportConfirmation, setShowBugReportConfirmation] = useState(false);
  const [trackToBugReport, setTrackToBugReport] = useState<Track | null>(null);

  const showAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 5000);
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
          setDailyDownloadCount(data.dailyDownloadCount || 0);
          setLastDownloadReset(data.lastDownloadReset ? new Date(data.lastDownloadReset) : null);
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          showAlert("Não foi possível carregar seus dados. Tente recarregar a página.");
        } finally {
          setIsUserDataLoaded(true);
        }
      };
      fetchUserData();
    } else if (isLoaded && !user) {
      setLikedTracks([]);
      setDownloadedTracks([]);
      setDailyDownloadCount(0);
      setLastDownloadReset(null);
      setIsUserDataLoaded(true);
    }
  }, [user, isLoaded, showAlert]);

  const playTrack = useCallback((track: Track, trackList: Track[] = []) => {
    if (currentTrack?.id === track.id) {
        setIsPlaying(prev => !prev);
    } else {
        setCurrentTrack(track);
        setPlaylist(trackList.length > 0 ? trackList : [track]);
        setIsPlaying(true);
    }
  }, [currentTrack]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  }, [currentTrack, playlist]);

  const previousTrack = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  }, [currentTrack, playlist]);
  
  const handleLike = useCallback((trackId: number) => {
    if (!user) { showAlert("Faça login para curtir músicas."); return; }
    const newLikedTracks = likedTracks.includes(trackId)
        ? likedTracks.filter(id => id !== trackId)
        : [...likedTracks, trackId];
    setLikedTracks(newLikedTracks);
    fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId }) });
  }, [user, likedTracks, showAlert]);

  const initiateFileDownload = useCallback(async (track: Track) => {
    try {
        const fileResponse = await fetch(track.downloadUrl);
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${track.artist} - ${track.songName}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error("Erro ao iniciar download do arquivo:", error);
        showAlert("Erro ao baixar o arquivo da música.");
    }
  }, [showAlert]);

  const handleDownload = useCallback(async (track: Track) => {
    if (!user) { showAlert("Faça login para baixar músicas."); return; }
    const DOWNLOAD_LIMIT = 15;

    try {
        const response = await fetch('/api/downloads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: track.id }),
        });

        const data = await response.json();

        if (response.status === 202 && data.needsConfirmation) {
            setTrackToConfirm(track);
            setShowReDownloadConfirmation(true);
            showAlert(data.message);
            return;
        }

        if (!response.ok) {
            showAlert(data.message || 'Erro ao processar o download.');
            if (data.dailyDownloadCount !== undefined) setDailyDownloadCount(data.dailyDownloadCount);
            if (data.lastDownloadReset) setLastDownloadReset(new Date(data.lastDownloadReset));
            return;
        }

        if (data.downloadedTrackIds) {
            setDownloadedTracks(data.downloadedTrackIds);
        }
        setDailyDownloadCount(data.dailyDownloadCount);
        setLastDownloadReset(data.lastDownloadReset ? new Date(data.lastDownloadReset) : null);

        await initiateFileDownload(track);

        if (data.isExistingDownload) {
            showAlert(`Música "${track.songName}" já baixada anteriormente. Não contou para seu limite diário.`);
        } else {
            showAlert(`Download realizado! Você tem ${DOWNLOAD_LIMIT - data.dailyDownloadCount} downloads restantes hoje.`);
        }

    } catch (error) {
        console.error("Erro no processo de download:", error);
        showAlert('Erro interno ao tentar baixar a música.');
    }
  }, [user, showAlert, initiateFileDownload]);

  const confirmReDownload = useCallback(async () => {
    if (!user || !trackToConfirm) return;
    const DOWNLOAD_LIMIT = 15;

    setShowReDownloadConfirmation(false);
    setTrackToConfirm(null);

    try {
        const response = await fetch('/api/downloads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: trackToConfirm.id, confirmReDownload: true }),
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.message || 'Erro ao processar o re-download confirmado.');
            if (data.dailyDownloadCount !== undefined) setDailyDownloadCount(data.dailyDownloadCount);
            if (data.lastDownloadReset) setLastDownloadReset(new Date(data.lastDownloadReset));
            return;
        }

        if (data.downloadedTrackIds) {
            setDownloadedTracks(data.downloadedTrackIds);
        }
        setDailyDownloadCount(data.dailyDownloadCount);
        setLastDownloadReset(data.lastDownloadReset ? new Date(data.lastDownloadReset) : null);

        await initiateFileDownload(trackToConfirm);

        showAlert(`Re-download de "${trackToConfirm.songName}" realizado! Não contou para seu limite diário.`);

    } catch (error) {
        console.error("Erro no processo de re-download confirmado:", error);
        showAlert('Erro interno ao tentar re-baixar a música.');
    }
  }, [user, trackToConfirm, showAlert, initiateFileDownload]);

  const cancelReDownload = useCallback(() => {
    setShowReDownloadConfirmation(false);
    setTrackToConfirm(null);
    showAlert("Download cancelado.");
  }, [showAlert]);

  const handleReportCopyright = useCallback(async (track: Track) => {
    if (!user) { 
      showAlert("Faça login para denunciar músicas."); 
      return; 
    }
    setTrackToReport(track);
    setShowReportConfirmation(true);
  }, [user, showAlert]);

  const confirmReport = useCallback(async () => {
    if (!user || !trackToReport) return;

    setShowReportConfirmation(false);
    
    try {
      const response = await fetch('/api/report-copyright', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: trackToReport.id, trackName: trackToReport.songName, artistName: trackToReport.artist }),
      });

      if (response.ok) {
        showAlert(`A música "${trackToReport.songName}" foi denunciada com sucesso! Analisaremos sua denúncia.`);
      } else {
        const errorData = await response.json();
        showAlert(errorData.message || 'Erro ao enviar a denúncia de direitos autorais.');
      }
    } catch (error) {
      console.error("Erro ao denunciar música:", error);
      showAlert('Erro interno ao tentar denunciar a música.');
    } finally {
      setTrackToReport(null);
    }
  }, [user, trackToReport, showAlert]);

  const cancelReport = useCallback(() => {
    setShowReportConfirmation(false);
    setTrackToReport(null);
    showAlert("Denúncia cancelada.");
  }, [showAlert]);

  // NOVO: Lógica para handleReportBug usando o novo modal
  const handleReportBug = useCallback(async (track: Track) => {
    if (!user) {
      showAlert("Faça login para reportar problemas.");
      return;
    }
    setTrackToBugReport(track); // Define a música para o modal de bug
    setShowBugReportConfirmation(true); // Abre o modal de bug
  }, [user, showAlert]);

  const confirmBugReport = useCallback(async () => {
    if (!user || !trackToBugReport) return;

    setShowBugReportConfirmation(false); // Fecha o modal
    
    try {
      const response = await fetch('/api/report-bug', { // Nova rota de API
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: trackToBugReport.id, trackName: trackToBugReport.songName, artistName: trackToBugReport.artist, downloadUrl: trackToBugReport.downloadUrl }), // Envia mais detalhes
      });

      if (response.ok) {
        showAlert(`O problema com "${trackToBugReport.songName}" foi reportado com sucesso! Agradecemos sua ajuda.`);
      } else {
        const errorData = await response.json();
        showAlert(errorData.message || 'Erro ao enviar o reporte de problema.');
      }
    } catch (error) {
      console.error("Erro ao reportar bug na música:", error);
      showAlert('Erro interno ao tentar reportar o problema na música.');
    } finally {
      setTrackToBugReport(null); // Limpa trackToBugReport após o processo
    }
  }, [user, trackToBugReport, showAlert]);

  const cancelBugReport = useCallback(() => {
    setShowBugReportConfirmation(false);
    setTrackToBugReport(null);
    showAlert("Reporte de problema cancelado.");
  }, [showAlert]);


  const value = useMemo(() => ({
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
    handleReportCopyright,
    handleReportBug, // Adicionado aqui
    alertMessage,
    closeAlert: () => setAlertMessage(''),
    isUserDataLoaded,
    setIsPlaying,
    dailyDownloadCount,
    lastDownloadReset,
    showReDownloadConfirmation,
    trackToConfirm,
    confirmReDownload,
    cancelReDownload,
    showReportConfirmation,
    trackToReport,
    confirmReport,
    cancelReport,
    showBugReportConfirmation, // Adicionado
    trackToBugReport,          // Adicionado
    confirmBugReport,          // Adicionado
    cancelBugReport,           // Adicionado
  }), [currentTrack, playlist, isPlaying, playTrack, togglePlayPause, nextTrack, previousTrack, likedTracks, downloadedTracks, handleLike, handleDownload, handleReportCopyright, handleReportBug, alertMessage, isUserDataLoaded, dailyDownloadCount, lastDownloadReset, showReDownloadConfirmation, trackToConfirm, confirmReDownload, cancelReDownload, showReportConfirmation, trackToReport, confirmReport, cancelReport, showBugReportConfirmation, trackToBugReport, confirmBugReport, cancelBugReport]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};