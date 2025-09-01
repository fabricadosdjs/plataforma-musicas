import { useState, useEffect, useCallback, useRef } from 'react';
import { Track } from '@/types/track';

interface UseSimplePaginationOptions {
    endpoint: string;
    pageSize?: number;
    initialPage?: number;
    onError?: (error: Error) => void;
    onPageChange?: (page: number) => void;
    scrollToTop?: boolean;
}

interface SimplePaginationData {
    tracks: Track[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    error: Error | null;
    loadPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    forceReload: () => void;
}

export const useSimplePagination = (options: UseSimplePaginationOptions): SimplePaginationData => {
    const {
        endpoint,
        pageSize = 60,
        initialPage = 1,
        onError,
        onPageChange,
        scrollToTop = true
    } = options;

    const [tracks, setTracks] = useState<Track[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Usar useRef para evitar múltiplas chamadas à API
    const hasInitialized = useRef(false);
    const abortController = useRef<AbortController | null>(null);
    const lastLoadedPage = useRef<number | null>(null);

    // Função para scroll para o topo
    const scrollToTopPage = useCallback(() => {
        if (scrollToTop && typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [scrollToTop]);

    // Função para carregar uma página específica
    const loadPage = useCallback(async (page: number, force = false) => {
        // Se já carregamos esta página e não é forçado, não recarregar
        if (!force && lastLoadedPage.current === page && tracks.length > 0) {
            return;
        }

        // Cancelar requisição anterior se existir
        if (abortController.current) {
            abortController.current.abort();
        }

        // Criar novo controller para esta requisição
        abortController.current = new AbortController();

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${endpoint}?page=${page}&limit=${pageSize}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                signal: abortController.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            setTracks(result.tracks || result.data || []);
            setTotalCount(result.totalCount || result.total || 0);
            setCurrentPage(page);
            setTotalPages(Math.ceil((result.totalCount || result.total || 0) / pageSize));
            lastLoadedPage.current = page;

            // Notificar mudança de página
            onPageChange?.(page);

            // Scroll para o topo após carregar nova página
            scrollToTopPage();
        } catch (err) {
            // Ignorar erros de abort
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }

            const error = err instanceof Error ? err : new Error('Erro desconhecido');
            setError(error);
            onError?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, pageSize, onError, onPageChange, scrollToTopPage, tracks.length]);

    // Função para forçar recarregamento
    const forceReload = useCallback(() => {
        loadPage(currentPage, true);
    }, [loadPage, currentPage]);

    // Carregar próxima página
    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            loadPage(currentPage + 1);
        }
    }, [currentPage, totalPages, loadPage]);

    // Carregar página anterior
    const previousPage = useCallback(() => {
        if (currentPage > 1) {
            loadPage(currentPage - 1);
        }
    }, [currentPage, loadPage]);

    // Calcular se há próxima/anterior página
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    // Carregar página inicial apenas uma vez
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            loadPage(initialPage);
        }
    }, [initialPage, loadPage]);

    // Detectar quando a página volta do histórico e recarregar se necessário
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && tracks.length === 0) {
                forceReload();
            }
        };

        const handleFocus = () => {
            if (tracks.length === 0) {
                forceReload();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [tracks.length, forceReload]);

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, []);

    return {
        tracks,
        totalCount,
        currentPage,
        totalPages,
        isLoading,
        error,
        loadPage,
        nextPage,
        previousPage,
        hasNextPage,
        hasPreviousPage,
        forceReload
    };
};
