// Hook para preload de dados
import { useEffect, useRef, useState } from 'react';
import { apiCache, getCacheKey } from '@/lib/cache';

interface PreloadOptions {
    enabled?: boolean;
    maxPages?: number;
    delay?: number;
}

export const useDataPreloader = (currentPage: number, options: PreloadOptions = {}) => {
    const { enabled = true, maxPages = 3, delay = 2000 } = options;
    const preloadedPages = useRef(new Set<number>());
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!enabled) return;

        // Limpar timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Preload com delay para não interferir na navegação atual
        timeoutRef.current = setTimeout(() => {
            const pagesToPreload = [];
            
            // Próximas páginas
            for (let i = 1; i <= maxPages; i++) {
                const nextPage = currentPage + i;
                if (!preloadedPages.current.has(nextPage)) {
                    pagesToPreload.push(nextPage);
                }
            }

            // Páginas anteriores (menos prioridade)
            for (let i = 1; i <= Math.min(maxPages, 2); i++) {
                const prevPage = currentPage - i;
                if (prevPage > 0 && !preloadedPages.current.has(prevPage)) {
                    pagesToPreload.push(prevPage);
                }
            }

            // Preload em paralelo
            pagesToPreload.forEach(page => {
                preloadPage(page);
            });
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentPage, enabled, maxPages, delay]);

    const preloadPage = async (page: number) => {
        try {
            // Verificar se já está no cache
            const cacheKey = getCacheKey('new_tracks', { page, limit: 60 });
            if (apiCache.get(cacheKey)) {
                preloadedPages.current.add(page);
                return;
            }

            // Fazer preload silencioso
            const response = await fetch(`/api/tracks/new?page=${page}&limit=60`, {
                headers: {
                    'X-Preload': 'true'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Cachear os dados
                apiCache.set(cacheKey, data, 120);
                preloadedPages.current.add(page);
                console.log(`🚀 Preload concluído para página ${page}`);
            }
        } catch (error) {
            console.warn(`⚠️ Erro no preload da página ${page}:`, error);
        }
    };
};

// Hook para debounce de busca
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
