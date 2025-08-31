"use client";

import { useAppContext } from '@/context/AppContext';
import { useEffect } from 'react';

interface UseDynamicTitleProps {
    baseTitle?: string;
    showCurrentTrack?: boolean;
    separator?: string;
}

export function useDynamicTitle({
    baseTitle = "DJ Pool Platform",
    showCurrentTrack = true,
    separator = " • "
}: UseDynamicTitleProps = {}) {
    const { currentTrack, isPlaying } = useAppContext();

    useEffect(() => {
        if (typeof document === 'undefined') return;

        let title = baseTitle;

        if (showCurrentTrack && currentTrack) {
            const trackInfo = `${currentTrack.artist} - ${currentTrack.songName}`;
            const playingIndicator = isPlaying ? "🎵 " : "⏸️ ";
            title = `${playingIndicator}${trackInfo}${separator}${baseTitle}`;
        }

        document.title = title;

        // Cleanup function para restaurar o título original quando o componente for desmontado
        return () => {
            if (typeof document !== 'undefined' && !currentTrack) {
                document.title = baseTitle;
            }
        };
    }, [currentTrack, isPlaying, baseTitle, showCurrentTrack, separator]);

    // Função para definir título customizado manualmente
    const setCustomTitle = (customTitle: string) => {
        if (typeof document !== 'undefined') {
            document.title = customTitle;
        }
    };

    return { setCustomTitle };
}

// Hook específico para páginas de música
export function useMusicPageTitle(pageTitle: string) {
    const { currentTrack, isPlaying } = useAppContext();

    useEffect(() => {
        if (typeof document === 'undefined') return;

        let title = pageTitle;

        if (currentTrack) {
            const trackInfo = `${currentTrack.artist} - ${currentTrack.songName}`;
            const playingIndicator = isPlaying ? "🎵 " : "⏸️ ";
            title = `${playingIndicator}${trackInfo} • ${pageTitle}`;
        }

        document.title = title;
    }, [currentTrack, isPlaying, pageTitle]);
}

// Hook para notificações no título (piscar)
export function useNotificationTitle(message: string, duration: number = 3000) {
    useEffect(() => {
        if (typeof document === 'undefined' || !message) return;

        const originalTitle = document.title;
        const interval: NodeJS.Timeout = setInterval(() => {
            document.title = document.title === originalTitle ? message : originalTitle;
        }, 1000);

        // Restaurar após duração especificada
        const timeout: NodeJS.Timeout = setTimeout(() => {
            clearInterval(interval);
            document.title = originalTitle;
        }, duration);

        // Piscar o título
        interval = setInterval(() => {
            document.title = document.title === originalTitle ? message : originalTitle;
        }, 1000);

        // Restaurar após duração especificada
        timeout = setTimeout(() => {
            clearInterval(interval);
            document.title = originalTitle;
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
            document.title = originalTitle;
        };
    }, [message, duration]);
}
