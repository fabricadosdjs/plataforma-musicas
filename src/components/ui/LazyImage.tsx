"use client";

import React, { useState, useCallback } from 'react';
import { useLazyImage } from '@/hooks/useLazyImage';
import { generateGradientColors, generateInitials } from '@/utils/imageUtils';

interface LazyImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    placeholder?: string;
    fallbackText?: string;
    onLoad?: () => void;
    onError?: () => void;
    priority?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    width = 64,
    height = 64,
    className = '',
    placeholder,
    fallbackText,
    onLoad,
    onError,
    priority = false
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
        onLoad?.();
    }, [onLoad]);

    const handleImageError = useCallback(() => {
        setImageError(true);
        onError?.();
    }, [onError]);

    // Se priority for true, carregar imediatamente
    const { src: currentSrc, isLoading, hasError, ref } = useLazyImage({
        src: priority ? src : '',
        placeholder: placeholder || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0i${width}IiBoZWlnaHQ9Ii${height}IiB2aWV3Qm94PSIwIDAg${width} ${height}"IGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI${width}IiBoZWlnaHQ9Ii${height}IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFY0MEgyNFYyNFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+`,
        onLoad: handleImageLoad,
        onError: handleImageError
    });

    // Se priority for true, usar src diretamente
    const finalSrc = priority ? src : currentSrc;
    const finalIsLoading = priority ? !imageLoaded : isLoading;
    const finalHasError = priority ? imageError : hasError;

    // Gerar cores do gradiente baseado no texto
    const gradientColors = ['#3b82f6', '#8b5cf6']; // Cores padrão
    const initials = alt.charAt(0).toUpperCase();

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Imagem real */}
            {!finalHasError && (
                <img
                    src={finalSrc}
                    alt={alt}
                    width={width}
                    height={height}
                    className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading={priority ? 'eager' : 'lazy'}
                />
            )}

            {/* Loading placeholder */}
            {finalIsLoading && !finalHasError && (
                <div className="absolute inset-0 bg-gray-600 animate-pulse flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Error fallback */}
            {finalHasError && (
                <div
                    className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                    style={{
                        background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`
                    }}
                >
                    {fallbackText || initials}
                </div>
            )}
        </div>
    );
};

export default LazyImage;
