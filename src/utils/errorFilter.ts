// Filtro para ignorar erros conhecidos e não críticos
export const errorFilter = {
    shouldIgnoreError: (error: any, errorInfo?: any): boolean => {
        if (typeof error === 'string') {
            // Ignorar erros de extensões do Chrome
            if (error.includes('runtime.lastError') ||
                error.includes('message port closed') ||
                error.includes('Extension context invalidated')) {
                return true;
            }

            // Ignorar erros de carregamento de recursos que são esperados
            if (error.includes('Failed to load resource') &&
                (error.includes('500') || error.includes('404'))) {
                return true;
            }

            // Ignorar erros de CORS esperados
            if (error.includes('CORS') || error.includes('cross-origin')) {
                return true;
            }
        }

        if (error instanceof Error) {
            // Ignorar erros de rede temporários
            if (error.message.includes('NetworkError') ||
                error.message.includes('fetch') ||
                error.message.includes('AbortError')) {
                return true;
            }

            // Ignorar erros de áudio específicos
            if (error.message.includes('HTMLMediaElement') ||
                error.message.includes('audio')) {
                return true;
            }
        }

        return false;
    },

    logFilteredError: (error: any, context: string = 'Unknown') => {
        // Log simplificado para erros filtrados
        console.debug(`🔇 ${context}: Erro ignorado:`, {
            type: typeof error,
            message: error?.message || error,
            stack: error?.stack?.substring(0, 200) || 'N/A'
        });
    }
};

// Interceptador global de erros mais inteligente
if (typeof window !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
        const errorMessage = args.join(' ');

        if (errorFilter.shouldIgnoreError(errorMessage)) {
            errorFilter.logFilteredError(errorMessage, 'Console');
            return;
        }

        // Para outros erros, usar o console.error original
        originalConsoleError.apply(console, args);
    };

    // Interceptar erros de window
    const originalWindowError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        if (errorFilter.shouldIgnoreError(message)) {
            errorFilter.logFilteredError(message, 'Window');
            return true; // Previne o comportamento padrão
        }

        if (originalWindowError) {
            return originalWindowError(message, source, lineno, colno, error);
        }

        return false;
    };
}
