import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOptimizedTracksFetchOptions {
    endpoint: string;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
    onLoadingChange?: (loading: boolean) => void;
    cacheKey?: string;
    cacheDuration?: number; // em milissegundos
}

interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export const useOptimizedTracksFetch = (options: UseOptimizedTracksFetchOptions) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const cacheKey = options.cacheKey || options.endpoint;

    const fetchData = useCallback(async () => {
        // Verificar cache primeiro
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < (options.cacheDuration || 30000)) {
            console.log(`🚀 Usando dados do cache para: ${options.endpoint}`);
            setData(cached.data);
            options.onSuccess?.(cached.data);
            setLoading(false);
            return;
        }

        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Criar novo controller
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            console.log(`🚀 Fazendo requisição para: ${options.endpoint}`);

            const response = await fetch(options.endpoint, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Cache-Control': 'max-age=30', // Cache de 30 segundos
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!isMountedRef.current) return;

            // Armazenar no cache
            cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            setData(result);
            options.onSuccess?.(result);
            console.log(`✅ Requisição bem-sucedida para: ${options.endpoint}`);

        } catch (err) {
            if (!isMountedRef.current) return;

            if (err instanceof Error && err.name === 'AbortError') {
                console.log('🔄 Requisição cancelada');
                return;
            }

            const error = err instanceof Error ? err : new Error('Erro desconhecido');
            setError(error);
            options.onError?.(error);
            console.error(`❌ Erro na requisição para ${options.endpoint}:`, error);

        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                options.onLoadingChange?.(false);
            }
        }
    }, [options.endpoint, cacheKey, options.cacheDuration]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchData();

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData]);

    const refetch = useCallback(() => {
        // Limpar cache antes de refazer a requisição
        cache.delete(cacheKey);
        fetchData();
    }, [fetchData, cacheKey]);

    const clearCache = useCallback(() => {
        cache.delete(cacheKey);
    }, [cacheKey]);

    return {
        data,
        loading,
        error,
        refetch,
        clearCache
    };
};

