"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { YouTubeStyleLoading } from '@/components/ui/YouTubeStyleLoading';

interface LoadingContextType {
    isLoading: boolean;
    loadingMessage: string;
    startLoading: (message?: string) => void;
    stopLoading: () => void;
    setLoadingMessage: (message: string) => void;
    startPageTransition: () => void;
    stopPageTransition: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isPageTransition, setIsPageTransition] = useState(false);
    const router = useRouter();

    // Detectar mudanças de rota
    useEffect(() => {
        const handleStart = () => {
            setIsPageTransition(true);
            setLoadingMessage('Carregando página...');
        };

        const handleComplete = () => {
            setTimeout(() => {
                setIsPageTransition(false);
                setLoadingMessage('');
            }, 500);
        };

        // Simular eventos de mudança de rota
        const handleRouteChange = () => {
            handleStart();
            setTimeout(handleComplete, 1000);
        };

        // Adicionar listener para mudanças de rota
        window.addEventListener('beforeunload', handleStart);

        return () => {
            window.removeEventListener('beforeunload', handleStart);
        };
    }, []);

    const startLoading = (message = '') => {
        setIsLoading(true);
        setLoadingMessage(message);
    };

    const stopLoading = () => {
        setIsLoading(false);
        setLoadingMessage('');
    };

    const setLoadingMessageText = (message: string) => {
        setLoadingMessage(message);
    };

    const startPageTransition = () => {
        setIsPageTransition(true);
        setLoadingMessage('Carregando página...');
    };

    const stopPageTransition = () => {
        setIsPageTransition(false);
        setLoadingMessage('');
    };

    // Loading global ou transição de página
    const shouldShowLoading = isLoading || isPageTransition;

    return (
        <LoadingContext.Provider
            value={{
                isLoading,
                loadingMessage,
                startLoading,
                stopLoading,
                setLoadingMessage: setLoadingMessageText,
                startPageTransition,
                stopPageTransition,
            }}
        >
            {/* Loading barra superior estilo YouTube */}
            <YouTubeStyleLoading
                isLoading={shouldShowLoading}
                color="#ff0000"
                height={4}
            />

            {children}
        </LoadingContext.Provider>
    );
};
