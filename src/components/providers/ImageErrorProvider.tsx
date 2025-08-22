'use client';

import React, { createContext, useContext, useCallback, useRef } from 'react';

interface ImageError {
    url: string;
    timestamp: number;
    error: string;
    trackInfo?: {
        songName: string;
        artist: string;
    };
}

interface ImageErrorContextType {
    reportImageError: (error: ImageError) => void;
    getFailedImages: () => ImageError[];
    clearErrorHistory: () => void;
}

const ImageErrorContext = createContext<ImageErrorContextType | null>(null);

interface ImageErrorProviderProps {
    children: React.ReactNode;
    maxErrorHistory?: number;
}

export const ImageErrorProvider: React.FC<ImageErrorProviderProps> = ({
    children,
    maxErrorHistory = 50
}) => {
    const errorHistoryRef = useRef<ImageError[]>([]);

    const reportImageError = useCallback((error: ImageError) => {
        // Evitar duplicatas recentes (últimos 5 minutos)
        const recentDuplicate = errorHistoryRef.current.find(
            existingError =>
                existingError.url === error.url &&
                Date.now() - existingError.timestamp < 5 * 60 * 1000
        );

        if (recentDuplicate) {
            return;
        }

        // Adicionar novo erro
        errorHistoryRef.current.push(error);

        // Manter apenas os últimos N erros
        if (errorHistoryRef.current.length > maxErrorHistory) {
            errorHistoryRef.current = errorHistoryRef.current.slice(-maxErrorHistory);
        }

        // Log para desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.warn('🖼️ Erro de imagem reportado:', {
                url: error.url,
                error: error.error,
                track: error.trackInfo ? `${error.trackInfo.artist} - ${error.trackInfo.songName}` : 'N/A'
            });
        }
    }, [maxErrorHistory]);

    const getFailedImages = useCallback(() => {
        return [...errorHistoryRef.current];
    }, []);

    const clearErrorHistory = useCallback(() => {
        errorHistoryRef.current = [];
    }, []);

    const contextValue: ImageErrorContextType = {
        reportImageError,
        getFailedImages,
        clearErrorHistory
    };

    return (
        <ImageErrorContext.Provider value={contextValue}>
            {children}
        </ImageErrorContext.Provider>
    );
};

export const useImageError = (): ImageErrorContextType => {
    const context = useContext(ImageErrorContext);
    if (!context) {
        throw new Error('useImageError deve ser usado dentro de ImageErrorProvider');
    }
    return context;
};

// Hook para reportar erros de imagem facilmente
export const useImageErrorReporter = () => {
    const { reportImageError } = useImageError();

    return useCallback((
        url: string,
        error: string | Event,
        trackInfo?: { songName: string; artist: string }
    ) => {
        reportImageError({
            url,
            timestamp: Date.now(),
            error: typeof error === 'string' ? error : 'Erro ao carregar imagem',
            trackInfo
        });
    }, [reportImageError]);
};
