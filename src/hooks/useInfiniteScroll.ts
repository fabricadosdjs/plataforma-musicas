import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    threshold?: number; // Distância do final para começar a carregar (em pixels)
    rootMargin?: string; // Margem do root para o Intersection Observer
}

export const useInfiniteScroll = ({
    hasMore,
    isLoading,
    onLoadMore,
    threshold = 200,
    rootMargin = '0px 0px 200px 0px'
}: UseInfiniteScrollOptions) => {
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadingRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];

        if (target.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
            console.log('🔄 Infinite scroll: Carregando mais itens...');
            setIsLoadingMore(true);
            onLoadMore();
        }
    }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

    useEffect(() => {
        const currentLoadingRef = loadingRef.current;

        if (!currentLoadingRef) return;

        // Criar observer
        observerRef.current = new IntersectionObserver(handleIntersection, {
            root: null,
            rootMargin,
            threshold: 0.1
        });

        // Observar o elemento
        observerRef.current.observe(currentLoadingRef);

        return () => {
            if (observerRef.current && currentLoadingRef) {
                observerRef.current.unobserve(currentLoadingRef);
            }
        };
    }, [handleIntersection, rootMargin]);

    // Reset loading state quando a prop isLoading mudar
    useEffect(() => {
        if (!isLoading) {
            setIsLoadingMore(false);
        }
    }, [isLoading]);

    // Cleanup observer
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return {
        loadingRef,
        isLoadingMore
    };
};


