import React, { useRef, useEffect } from 'react';
import { useMusicImageLoader } from '@/hooks/useImageLoader';
import { isValidImageUrl, optimizeImageUrl } from '@/utils/imageUtils';
import { protectImage, markImageAsBroken } from '@/utils/imageProtection';

interface OptimizedImageProps {
    track: {
        imageUrl?: string;
        songName: string;
        artist: string;
    };
    className?: string;
    fallbackClassName?: string;
    fallbackContent: React.ReactNode;
    alt?: string;
    style?: React.CSSProperties;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    track,
    className = '',
    fallbackClassName = '',
    fallbackContent,
    alt,
    style = {}
}) => {
    const { imageProps, hasError, isLoaded } = useMusicImageLoader(track);
    const imgRef = useRef<HTMLImageElement>(null);

    // Verificar se tem URL válida usando utilitário
    const hasValidUrl = isValidImageUrl(track.imageUrl);

    // Otimizar URL se válida
    const optimizedUrl = hasValidUrl ? optimizeImageUrl(track.imageUrl!, {
        width: 400,
        height: 400,
        quality: 85,
        format: 'webp'
    }) : '';

    // Efeito para limpar referências e prevenir vazamentos de memória
    useEffect(() => {
        // Proteger a imagem quando o componente montar
        if (imgRef.current) {
            protectImage(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                // Limpar referências para evitar que extensões do navegador tentem processar a imagem
                imgRef.current.src = '';
                imgRef.current.srcset = '';
                imgRef.current.removeAttribute('src');
                imgRef.current.removeAttribute('srcset');
            }
        };
    }, []);

    // Função para lidar com erros de imagem de forma mais robusta
    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const target = event.target as HTMLImageElement;

        // Usar utilitário de proteção para marcar a imagem como quebrada
        markImageAsBroken(target);

        // Chamar o handler original do hook
        if (imageProps.onError) {
            imageProps.onError(event);
        }
    };

    // Props personalizadas para melhor controle de erros
    const enhancedImageProps = {
        ...imageProps,
        onError: handleImageError,
        ref: imgRef,
        // Adicionar atributos para prevenir processamento por extensões
        'data-no-process': 'true',
        'data-optimized': 'true'
    };

    return (
        <>
            {hasValidUrl ? (
                <img
                    src={optimizedUrl}
                    alt={alt || `${track.artist} - ${track.songName}`}
                    className={className}
                    {...enhancedImageProps}
                    style={{
                        ...style,
                        ...imageProps.style,
                        display: hasError ? 'none' : 'block'
                    }}
                />
            ) : null}

            {/* Fallback content */}
            <div
                className={fallbackClassName}
                style={{
                    display: (!hasValidUrl || hasError) ? 'flex' : 'none',
                    opacity: (!hasValidUrl || hasError) ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out'
                }}
            >
                {fallbackContent}
            </div>
        </>
    );
};
