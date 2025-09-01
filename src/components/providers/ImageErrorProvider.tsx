'use client';

import { createContext, useContext, useCallback, ReactNode, useState } from 'react';

interface ImageErrorData {
    url: string;
    error: any;
    metadata?: any;
    timestamp: Date;
    count: number;
}

interface ImageErrorContextType {
    reportImageError: (url: string, error: any, metadata?: any) => void;
    getErrorCount: (url: string) => number;
    clearErrors: () => void;
}

const ImageErrorContext = createContext<ImageErrorContextType | null>(null);

export const useImageErrorReporter = (): ImageErrorContextType => {
    const context = useContext(ImageErrorContext);
    if (!context) {
        // Fallback implementation
        return {
            reportImageError: (url: string, error: any, metadata?: any) => {
                console.warn('ImageErrorProvider não está disponível. Erro de imagem:', { url, error, metadata });
            },
            getErrorCount: () => 0,
            clearErrors: () => { }
        };
    }
    return context;
};

interface ImageErrorProviderProps {
    children: ReactNode;
    onError?: (url: string, error: any, metadata?: any) => void;
}

export const ImageErrorProvider: React.FC<ImageErrorProviderProps> = ({ children, onError }) => {
    const [errors, setErrors] = useState<Map<string, ImageErrorData[]>>(new Map());

    const reportImageError = useCallback((url: string, error: any, metadata?: any) => {
        setErrors(prev => {
            const newErrors = new Map(prev);
            const urlErrors: ImageErrorData[] = newErrors.get(url) || [];

            const newError: ImageErrorData = {
                url,
                error,
                metadata,
                timestamp: new Date(),
                count: 1
            };

            // Verificar se já existe um erro similar para esta URL
            const existingErrorIndex = urlErrors.findIndex(e =>
                e.error?.message === error?.message ||
                e.error?.name === error?.name
            );

            if (existingErrorIndex >= 0) {
                // Incrementar contador se for o mesmo tipo de erro
                urlErrors[existingErrorIndex].count++;
                urlErrors[existingErrorIndex].timestamp = new Date();
            } else {
                // Adicionar novo erro
                urlErrors.push(newError);
            }

            newErrors.set(url, urlErrors);

            // Chamar callback personalizado se fornecido
            if (onError) {
                onError(url, error, metadata);
            }

            return newErrors;
        });
    }, [onError]);

    const getErrorCount = useCallback((url: string): number => {
        const urlErrors = errors.get(url);
        return urlErrors ? urlErrors.reduce((sum, error) => sum + error.count, 0) : 0;
    }, [errors]);

    const clearErrors = useCallback(() => {
        setErrors(new Map());
    }, []);

    const contextValue: ImageErrorContextType = {
        reportImageError,
        getErrorCount,
        clearErrors
    };

    return (
        <ImageErrorContext.Provider value={contextValue}>
            {children}
        </ImageErrorContext.Provider>
    );
};

export const useImageErrorProvider = () => {
    const context = useContext(ImageErrorContext);
    if (!context) {
        throw new Error('useImageErrorProvider deve ser usado dentro de um ImageErrorProvider');
    }
    return context;
};
