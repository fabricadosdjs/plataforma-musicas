'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    priority?: boolean;
    fallback?: React.ReactNode;
}

export const SafeImage: React.FC<SafeImageProps> = ({
    src,
    alt,
    width = 400,
    height = 400,
    className = '',
    style = {},
    priority = false,
    fallback
}) => {
    const [isClient, setIsClient] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Se não estamos no cliente, renderizar um placeholder
    if (!isClient) {
        return (
            <div
                className={`bg-gray-800 animate-pulse ${className}`}
                style={{ width, height, ...style }}
            >
                {fallback}
            </div>
        );
    }

    // Se há erro, mostrar fallback
    if (hasError && fallback) {
        return <>{fallback}</>;
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            priority={priority}
            onError={() => setHasError(true)}
            onLoad={() => setHasError(false)}
        />
    );
};
