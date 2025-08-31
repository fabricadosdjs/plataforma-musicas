import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '@/types/track';

interface UseProgressiveTracksFetchOptions {
    endpoint: string;
    batchSize?: number;
    delayBetweenBatches?: number;
    onProgress?: (loaded: number, total: number) => void;
    onBatchLoaded?: (batch: Track[], batchIndex: number) => void;
    onComplete?: (allTracks: Track[]) => void;
    onError?: (error: Error) => void;
}

interface ProgressiveTracksData {
    tracks: Track[];
    totalCount: number;
    loadedCount: number;
    isLoading: boolean;
    isComplete: boolean;
    error: Error | null;
    retry: () => void;
    loadMore: () => void;
}

export const useProgressiveTracksFetch = (options: UseProgressiveTracksFetchOptions): ProgressiveTracksData => {
    const {
        endpoint,
        batchSize = 20,
        delayBetweenBatches = 100,
        onProgress,
        onBatchLoaded,
        onComplete,
        onError
    } = options;

    const [tracks, setTracks] = useState<Track[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loadedCount, setLoadedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const currentBatchRef = useRef(0);
    const isLoadingMoreRef = useRef(false);

    // Função para carregar um lote específico
    const loadBatch = useCallback(async (batchIndex: number, isInitial = false) => {
        if (isLoadingMoreRef.current) return;

        try {
            isLoadingMoreRef.current = true;

            const batchEndpoint = `${endpoint}?page=${batchIndex + 1}&limit=${batchSize}`;
            console.log(`🔄 Carregando lote ${batchIndex + 1}: ${batchEndpoint}`);

            const response = await fetch(batchEndpoint, {
                signal: abortControllerRef.current?.signal,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!isMountedRef.current) return;

            const newTracks = result.tracks || result.data || [];

            if (isInitial) {
                setTracks(newTracks);
                setTotalCount(result.totalCount || result.total || newTracks.length);
                setLoadedCount(newTracks.length);
                currentBatchRef.current = 1;
            } else {
                setTracks(prev => [...prev, ...newTracks]);
                setLoadedCount(prev => prev + newTracks.length);
                currentBatchRef.current = batchIndex + 1;
            }

            // Notificar progresso
            onProgress?.(isInitial ? newTracks.length : tracks.length + newTracks.length, totalCount);
            onBatchLoaded?.(newTracks, batchIndex);

            // Verificar se é o último lote
            if (newTracks.length < batchSize) {
                setIsComplete(true);
                onComplete?.(isInitial ? newTracks : [...tracks, ...newTracks]);
            }

            // Delay entre lotes para não sobrecarregar o servidor
            if (!isInitial && delayBetweenBatches > 0) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
            }

        } catch (err) {
            if (!isMountedRef.current) return;

            if (err instanceof Error && err.name === 'AbortError') {
                console.log('🔄 Lote cancelado');
                return;
            }

            const error = err instanceof Error ? err : new Error('Erro desconhecido');
            setError(error);
            onError?.(error);
            console.error(`❌ Erro ao carregar lote ${batchIndex + 1}:`, error);

        } finally {
            if (isMountedRef.current) {
                isLoadingMoreRef.current = false;
                if (isInitial) {
                    setIsLoading(false);
                }
            }
        }
    }, [endpoint, batchSize, delayBetweenBatches, tracks.length, totalCount, onProgress, onBatchLoaded, onComplete, onError]);

    // Função para carregar mais músicas
    const loadMore = useCallback(() => {
        if (isComplete || isLoadingMoreRef.current) return;

        loadBatch(currentBatchRef.current, false);
    }, [isComplete, loadBatch]);

    // Função para recarregar tudo
    const retry = useCallback(() => {
        setError(null);
        setIsComplete(false);
        setLoadedCount(0);
        currentBatchRef.current = 0;
        setIsLoading(true);
        loadBatch(0, true);
    }, [loadBatch]);

    // Carregamento inicial
    useEffect(() => {
        isMountedRef.current = true;
        setIsLoading(true);
        setError(null);
        setIsComplete(false);
        setLoadedCount(0);
        currentBatchRef.current = 0;

        // Criar novo controller para cancelar requisições anteriores
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Carregar primeiro lote
        loadBatch(0, true);

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [endpoint]);

    return {
        tracks,
        totalCount,
        loadedCount,
        isLoading,
        isComplete,
        error,
        retry,
        loadMore
    };
};
