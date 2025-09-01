import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyImageOptions {
    src: string;
    placeholder?: string;
    threshold?: number;
    rootMargin?: string;
    onLoad?: () => void;
    onError?: () => void;
}

interface UseLazyImageReturn {
    src: string;
    isLoading: boolean;
    hasError: boolean;
    isInView: boolean;
    ref: React.RefObject<HTMLImageElement>;
}

export const useLazyImage = ({
    src,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFY0MEgyNFYyNFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+',
    threshold = 0.1,
    rootMargin = '50px',
    onLoad,
    onError
}: UseLazyImageOptions): UseLazyImageReturn => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(placeholder);

    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Função para carregar a imagem
    const loadImage = useCallback(() => {
        if (!src || hasError) return;

        setIsLoading(true);
        setHasError(false);

        const img = new Image();

        img.onload = () => {
            setCurrentSrc(src);
            setIsLoading(false);
            onLoad?.();
        };

        img.onerror = () => {
            setHasError(true);
            setIsLoading(false);
            onError?.();
        };

        img.src = src;
    }, [src, hasError, onLoad, onError]);

    // Configurar Intersection Observer
    useEffect(() => {
        const imgElement = imgRef.current;
        if (!imgElement) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        loadImage();
                        // Desconectar após carregar
                        if (observerRef.current) {
                            observerRef.current.unobserve(imgElement);
                        }
                    }
                });
            },
            {
                threshold,
                rootMargin
            }
        );

        observerRef.current.observe(imgElement);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadImage, threshold, rootMargin]);

    // Reset quando src muda
    useEffect(() => {
        setCurrentSrc(placeholder);
        setIsLoading(true);
        setHasError(false);
        setIsInView(false);
    }, [src, placeholder]);

    return {
        src: currentSrc,
        isLoading,
        hasError,
        isInView,
        ref: imgRef
    };
};
