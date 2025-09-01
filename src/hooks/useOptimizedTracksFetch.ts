import { useState, useEffect, useCallback, useRef } from 'react';
import { Track } from '@/types/track';

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
}

interface UseOptimizedTracksFetchOptions {
    endpoint: string;
    initialPage?: number;
    pageSize?: number;
    onSuccess?: (data: { tracks: Track[]; pagination: PaginationInfo }) => void;
    onError?: (error: Error) => void;
    onLoadingChange?: (loading: boolean) => void;
    enableCache?: boolean;
}

interface UseOptimizedTracksFetchReturn {
    tracks: Track[];
    pagination: PaginationInfo | null;
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    loadMore: () => void;
    refresh: () => void;
    goToPage: (page: number) => void;
}

// Cache simples em memória
const tracksCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useOptimizedTracksFetch = ({
    endpoint,
    initialPage = 1,
    pageSize = 50,
    onSuccess,
    onError,
    onLoadingChange,
    enableCache = true
}: UseOptimizedTracksFetchOptions): UseOptimizedTracksFetchReturn => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    const fetchData = useCallback(async (page: number, append = false) => {
        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Criar novo controller
        abortControllerRef.current = new AbortController();

        const cacheKey = `${endpoint}?page=${page}&limit=${pageSize}`;

        // Verificar cache
        if (enableCache && tracksCache.has(cacheKey)) {
            const cached = tracksCache.get(cacheKey)!;
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log(`📦 Cache hit para ${cacheKey}`);
                const data = cached.data;

                if (!isMountedRef.current) return;

                if (append) {
                    setTracks(prev => [...prev, ...data.tracks]);
                } else {
                    setTracks(data.tracks);
                }
                setPagination(data.pagination);
                setError(null);
                onSuccess?.(data);
                return;
            } else {
                tracksCache.delete(cacheKey);
            }
        }

        setLoading(true);
        setError(null);
        onLoadingChange?.(true);

        try {
            console.log(`🚀 Fazendo requisição para: ${cacheKey}`);

            const response = await fetch(cacheKey, {
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!isMountedRef.current) return;

            // Salvar no cache
            if (enableCache) {
                tracksCache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }

            if (append) {
                setTracks(prev => [...prev, ...result.tracks]);
            } else {
                setTracks(result.tracks);
            }
            setPagination(result.pagination);
            setError(null);
            onSuccess?.(result);
            console.log(`✅ Requisição bem-sucedida para: ${cacheKey}`);

        } catch (err) {
            if (!isMountedRef.current) return;

            if (err instanceof Error && err.name === 'AbortError') {
                console.log('🔄 Requisição cancelada');
                return;
            }

            const error = err instanceof Error ? err : new Error('Erro desconhecido');
            setError(error);
            onError?.(error);
            console.error(`❌ Erro na requisição para ${cacheKey}:`, error);

        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                onLoadingChange?.(false);
            }
        }
    }, [endpoint, pageSize, onSuccess, onError, onLoadingChange, enableCache]);

    const loadMore = useCallback(() => {
        if (pagination?.hasNextPage && !loading) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchData(nextPage, true);
        }
    }, [pagination?.hasNextPage, loading, currentPage, fetchData]);

    const refresh = useCallback(() => {
        setCurrentPage(1);
        setTracks([]);
        fetchData(1, false);
    }, [fetchData]);

    const goToPage = useCallback((page: number) => {
        if (page !== currentPage && page >= 1) {
            setCurrentPage(page);
            fetchData(page, false);
        }
    }, [currentPage, fetchData]);

    useEffect(() => {
        isMountedRef.current = true;
        fetchData(initialPage, false);

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, initialPage]);

    return {
        tracks,
        pagination,
        loading,
        error,
        hasMore: pagination?.hasNextPage ?? false,
        loadMore,
        refresh,
        goToPage
    };
};