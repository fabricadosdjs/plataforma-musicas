import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useRef } from 'react';

interface UseOptimizedNavigationOptions {
    onNavigateStart?: () => void;
    onNavigateComplete?: () => void;
    onNavigateError?: (error: Error) => void;
}

export const useOptimizedNavigation = (options: UseOptimizedNavigationOptions = {}) => {
    const router = useRouter();
    const pathname = usePathname();
    const isNavigatingRef = useRef(false);
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Função otimizada para navegação
    const navigateTo = useCallback(async (path: string, navOptions: {
        replace?: boolean;
        scroll?: boolean;
        shallow?: boolean;
    } = {}) => {
        // Evitar navegações duplicadas
        if (isNavigatingRef.current) {
            console.log('🚫 Navegação já em andamento, ignorando...');
            return;
        }

        // Se já estamos na página, não navegar
        if (pathname === path) {
            console.log('📍 Já estamos na página:', path);
            return;
        }

        try {
            isNavigatingRef.current = true;
            if (typeof options.onNavigateStart === 'function') options.onNavigateStart();

            // Limpar timeout anterior
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }

            // Timeout de segurança para navegação
            navigationTimeoutRef.current = setTimeout(() => {
                console.warn('⚠️ Timeout de navegação - forçando reset');
                isNavigatingRef.current = false;
                if (typeof options.onNavigateError === 'function') options.onNavigateError(new Error('Timeout de navegação'));
            }, 10000); // 10 segundos

            console.log(`🚀 Navegando para: ${path}`);

            // Usar replace se especificado, senão push
            if (navOptions.replace) {
                router.replace(path);
            } else {
                router.push(path);
            }

            // Aguardar um pouco para a navegação ser processada
            await new Promise(resolve => setTimeout(resolve, 100));

            // Limpar timeout
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
                navigationTimeoutRef.current = null;
            }

            options.onNavigateComplete?.();

        } catch (error) {
            console.error('❌ Erro na navegação:', error);
            options.onNavigateError?.(error as Error);
        } finally {
            // Reset do estado após um delay
            setTimeout(() => {
                isNavigatingRef.current = false;
            }, 500);
        }
    }, [router, pathname, options]);

    // Funções específicas para navegação comum
    const navigateToGenre = useCallback((genreName: string) => {
        navigateTo(`/genre/${encodeURIComponent(genreName)}`);
    }, [navigateTo]);

    const navigateToPool = useCallback((poolName: string) => {
        navigateTo(`/pool/${encodeURIComponent(poolName)}`);
    }, [navigateTo]);

    const navigateToFolder = useCallback((folderName: string) => {
        navigateTo(`/folder/${encodeURIComponent(folderName)}`);
    }, [navigateTo]);

    const navigateToArtist = useCallback((artistName: string) => {
        navigateTo(`/artist/${encodeURIComponent(artistName)}`);
    }, [navigateTo]);

    const navigateToHome = useCallback(() => {
        navigateTo('/');
    }, [navigateTo]);

    const navigateToNew = useCallback(() => {
        navigateTo('/new');
    }, [navigateTo]);

    const navigateToTrending = useCallback(() => {
        navigateTo('/trending');
    }, [navigateTo]);

    const navigateToCommunity = useCallback(() => {
        navigateTo('/community');
    }, [navigateTo]);

    const navigateToPlans = useCallback(() => {
        navigateTo('/plans');
    }, [navigateTo]);

    // Função para voltar
    const goBack = useCallback(() => {
        if (isNavigatingRef.current) return;

        try {
            isNavigatingRef.current = true;
            options.onNavigateStart?.();

            router.back();

            setTimeout(() => {
                isNavigatingRef.current = false;
                if (typeof options.onNavigateComplete === 'function') options.onNavigateComplete();
            }, 500);

        } catch (error) {
            console.error('❌ Erro ao voltar:', error);
            isNavigatingRef.current = false;
            if (typeof options.onNavigateError === 'function') options.onNavigateError(error as Error);
        }
    }, [router, options]);

    // Função para refresh
    const refresh = useCallback(() => {
        if (isNavigatingRef.current) return;

        try {
            isNavigatingRef.current = true;
            options.onNavigateStart?.();

            router.refresh();

            setTimeout(() => {
                isNavigatingRef.current = false;
                options.onNavigateComplete?.();
            }, 500);

        } catch (error) {
            console.error('❌ Erro ao refresh:', error);
            isNavigatingRef.current = false;
            options.onNavigateError?.(error as Error);
        }
    }, [router, options]);

    return {
        navigateTo,
        navigateToGenre,
        navigateToPool,
        navigateToFolder,
        navigateToArtist,
        navigateToHome,
        navigateToNew,
        navigateToTrending,
        navigateToCommunity,
        navigateToPlans,
        goBack,
        refresh,
        isNavigating: isNavigatingRef.current,
        currentPath: pathname
    };
};

