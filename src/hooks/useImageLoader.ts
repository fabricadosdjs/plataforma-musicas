import { useState, useCallback, useRef } from 'react';
import { useImageErrorReporter } from '@/components/providers/ImageErrorProvider';

interface UseImageLoaderOptions {
    onLoad?: () => void;
    onError?: (error: Event) => void;
    fallbackDelay?: number;
}

interface ImageState {
    isLoading: boolean;
    hasError: boolean;
    isLoaded: boolean;
}

export const useImageLoader = (options: UseImageLoaderOptions = {}) => {
    const { onLoad, onError, fallbackDelay = 300 } = options;
    const imageRef = useRef<HTMLImageElement>(null);

    const [imageState, setImageState] = useState<ImageState>({
        isLoading: false,
        hasError: false,
        isLoaded: false
    });

    const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
        const target = event.target as HTMLImageElement;

        // Verificar se a imagem realmente carregou
        if (target.complete && target.naturalWidth > 0) {
            setImageState({
                isLoading: false,
                hasError: false,
                isLoaded: true
            });

            // Aplicar transição suave
            target.style.opacity = '1';

            if (onLoad) {
                onLoad();
            }
        } else {
            // Imagem não carregou corretamente
            handleImageError(event);
        }
    }, [onLoad]);

    const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
        const target = event.target as HTMLImageElement;

        setImageState({
            isLoading: false,
            hasError: true,
            isLoaded: false
        });

        // Limpar a imagem imediatamente para prevenir processamento por extensões
        try {
            // Remover atributos que podem ser processados por extensões
            target.removeAttribute('src');
            target.removeAttribute('srcset');
            target.removeAttribute('crossorigin');

            // Limpar propriedades
            target.src = '';
            target.srcset = '';

            // Adicionar atributos para prevenir processamento
            target.setAttribute('data-error', 'true');
            target.setAttribute('data-no-process', 'true');
        } catch (error) {
            console.warn('Erro ao limpar imagem:', error);
        }

        // Esconder imagem quebrada com delay para evitar flicker
        setTimeout(() => {
            try {
                if (target && target.parentElement) {
                    target.style.display = 'none';

                    // Mostrar fallback
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                        fallback.style.display = 'flex';
                        fallback.style.opacity = '1';
                    }
                }
            } catch (error) {
                console.warn('Erro ao mostrar fallback:', error);
            }
        }, fallbackDelay);

        if (onError) {
            onError(event.nativeEvent);
        }
    }, [onError, fallbackDelay]);

    const handleImageStart = useCallback(() => {
        setImageState({
            isLoading: true,
            hasError: false,
            isLoaded: false
        });
    }, []);

    const resetImageState = useCallback(() => {
        setImageState({
            isLoading: false,
            hasError: false,
            isLoaded: false
        });
    }, []);

    // Função para limpar imagem manualmente
    const clearImage = useCallback(() => {
        if (imageRef.current) {
            try {
                imageRef.current.removeAttribute('src');
                imageRef.current.removeAttribute('srcset');
                imageRef.current.src = '';
                imageRef.current.srcset = '';
                imageRef.current.style.display = 'none';
            } catch (error) {
                console.warn('Erro ao limpar imagem:', error);
            }
        }
    }, []);

    // Props para aplicar na tag img
    const imageProps = {
        onLoad: handleImageLoad,
        onError: handleImageError,
        onLoadStart: handleImageStart,
        loading: 'lazy' as const,
        crossOrigin: 'anonymous' as const,
        ref: imageRef,
        style: {
            opacity: imageState.isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
        }
    };

    return {
        imageState,
        imageProps,
        resetImageState,
        clearImage,
        isLoading: imageState.isLoading,
        hasError: imageState.hasError,
        isLoaded: imageState.isLoaded
    };
};

// Hook específico para imagens de música
export const useMusicImageLoader = (track: { imageUrl?: string; songName: string; artist: string }) => {
    // Sempre chamar o hook no topo
    const reportImageError = useImageErrorReporter();

    return useImageLoader({
        onError: (error) => {
            // Reportar erro se o sistema estiver disponível
            if (reportImageError && typeof reportImageError.reportImageError === 'function' && track.imageUrl) {
                reportImageError.reportImageError(track.imageUrl, error, {
                    songName: track.songName,
                    artist: track.artist
                });
            } else {
                // Fallback para console.warn
                console.warn(`Falha ao carregar imagem da música: ${track.artist} - ${track.songName}`, {
                    url: track.imageUrl,
                    error
                });
            }
        }
    });
};
