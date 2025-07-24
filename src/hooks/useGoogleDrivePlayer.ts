// src/hooks/useGoogleDrivePlayer.ts
"use client";

import { getAlternativeGoogleDriveUrls, isGoogleDriveUrl } from '@/utils/googleDriveUtils';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseGoogleDrivePlayerProps {
  url: string;
  isPlaying: boolean;
  volume: number;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export function useGoogleDrivePlayer({
  url,
  isPlaying,
  volume,
  onTimeUpdate,
  onDurationChange,
  onEnded,
  onPlay,
  onPause
}: UseGoogleDrivePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [alternativeUrls, setAlternativeUrls] = useState<string[]>([]);

  // Verificar se é URL do Google Drive
  const isGoogleDrive = isGoogleDriveUrl(url);

  // Inicializar audio element
  useEffect(() => {
    if (!audioRef.current && isGoogleDrive) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'metadata';

      // Event listeners
      audio.addEventListener('loadstart', () => {
        setIsLoading(true);
        setError(null);
      });

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        onDurationChange?.(audio.duration);
      });

      audio.addEventListener('canplay', () => {
        setIsLoading(false);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
        onTimeUpdate?.(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        onEnded?.();
      });

      audio.addEventListener('play', () => {
        onPlay?.();
      });

      audio.addEventListener('pause', () => {
        onPause?.();
      });

      audio.addEventListener('error', (e) => {
        console.error('Erro no audio:', e);

        // Se for Google Drive e ainda há URLs alternativas para tentar
        if (isGoogleDrive && currentUrlIndex < alternativeUrls.length - 1) {
          console.log(`🔄 Tentando URL alternativa ${currentUrlIndex + 1}/${alternativeUrls.length}`);
          setCurrentUrlIndex(prev => prev + 1);
          return;
        }

        setError('Erro ao carregar áudio do Google Drive');
        setIsLoading(false);
      });

      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    };
  }, [isGoogleDrive, onTimeUpdate, onDurationChange, onEnded, onPlay, onPause]);

  // Carregar URL
  useEffect(() => {
    if (audioRef.current && url && isGoogleDrive) {
      // Gerar URLs alternativas na primeira vez
      if (alternativeUrls.length === 0) {
        const urls = getAlternativeGoogleDriveUrls(url);
        setAlternativeUrls(urls);
        setCurrentUrlIndex(0);
        return;
      }

      if (currentUrlIndex >= alternativeUrls.length) {
        setError('Todas as URLs alternativas falharam');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const currentUrl = alternativeUrls[currentUrlIndex];
      console.log(`🎵 Tentando carregar Google Drive URL ${currentUrlIndex + 1}/${alternativeUrls.length}:`, currentUrl);

      audioRef.current.src = currentUrl;
      audioRef.current.load();
    }
  }, [url, isGoogleDrive, alternativeUrls, currentUrlIndex]);

  // Reset quando a URL principal muda
  useEffect(() => {
    if (url && isGoogleDrive) {
      setAlternativeUrls([]);
      setCurrentUrlIndex(0);
      setError(null);
    }
  }, [url, isGoogleDrive]);

  // Controlar play/pause
  useEffect(() => {
    if (audioRef.current && isGoogleDrive) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Erro ao reproduzir:', error);
            setError('Erro ao reproduzir áudio');
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isGoogleDrive]);

  // Controlar volume
  useEffect(() => {
    if (audioRef.current && isGoogleDrive) {
      audioRef.current.volume = volume;
    }
  }, [volume, isGoogleDrive]);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isGoogleDrive) {
      audioRef.current.currentTime = time;
    }
  }, [isGoogleDrive]);

  const play = useCallback(() => {
    if (audioRef.current && isGoogleDrive) {
      return audioRef.current.play();
    }
  }, [isGoogleDrive]);

  const pause = useCallback(() => {
    if (audioRef.current && isGoogleDrive) {
      audioRef.current.pause();
    }
  }, [isGoogleDrive]);

  return {
    isGoogleDrive,
    isLoading,
    error,
    currentTime,
    duration,
    seek,
    play,
    pause,
    audioElement: audioRef.current
  };
}
