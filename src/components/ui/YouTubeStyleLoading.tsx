"use client";

import React, { useEffect, useState } from 'react';

interface YouTubeStyleLoadingProps {
    isLoading?: boolean;
    color?: string;
    height?: number;
    duration?: number;
}

export const YouTubeStyleLoading: React.FC<YouTubeStyleLoadingProps> = ({
    isLoading = true,
    color = '#ff0000',
    height = 3,
    duration = 2000
}) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setIsVisible(true);
            setProgress(0);

            // Simular progresso de carregamento
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + Math.random() * 15;
                });
            }, 100);

            return () => clearInterval(interval);
        } else {
            // Animação de conclusão
            setProgress(100);
            setTimeout(() => {
                setIsVisible(false);
                setProgress(0);
            }, 300);
        }
    }, [isLoading]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed top-0 left-0 w-full z-[9999] transition-opacity duration-300"
            style={{
                height: `${height}px`,
                backgroundColor: color,
                opacity: isVisible ? 1 : 0
            }}
        >
            {/* Barra de progresso animada */}
            <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                    background: `linear-gradient(90deg, ${color} 0%, #ffffff 50%, ${color} 100%)`,
                    backgroundSize: '200% 100%',
                    animation: progress < 100 ? 'shimmer 1.5s ease-in-out infinite' : 'none'
                }}
            />

            {/* Efeito de brilho */}
            <div
                className="absolute top-0 h-full w-20 opacity-30"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                    transform: `translateX(${progress * 2}px)`,
                    transition: 'transform 0.3s ease-out'
                }}
            />

            <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </div>
    );
};

// Hook para controlar o loading global
export const useGlobalLoading = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

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

    return {
        isLoading,
        loadingMessage,
        startLoading,
        stopLoading,
        setLoadingMessageText
    };
};
