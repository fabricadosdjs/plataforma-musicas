import { useState, useCallback } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        if (duration !== 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration || 4000);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Funções específicas para diferentes tipos de ações
    const showSuccessToast = useCallback((message: string, duration?: number) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const showErrorToast = useCallback((message: string, duration?: number) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const showWarningToast = useCallback((message: string, duration?: number) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    const showInfoToast = useCallback((message: string, duration?: number) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    // Funções específicas para ações de música
    const showLikeToast = useCallback((isLiked: boolean, trackName?: string) => {
        const message = isLiked
            ? `❤️ Música adicionada aos favoritos!`
            : `💔 Música removida dos favoritos!`;
        showToast(message, 'success', 3000);
    }, [showToast]);

    const showDownloadToast = useCallback((trackName: string) => {
        const message = `📥 "${trackName}" baixada com sucesso!`;
        showToast(message, 'success', 3000);
    }, [showToast]);

    const showPlayToast = useCallback((trackName: string) => {
        const message = `🎵 Tocando "${trackName}"`;
        showToast(message, 'info', 2000);
    }, [showToast]);

    const showLoginRequiredToast = useCallback((action: string) => {
        const message = `👤 Faça login para ${action}`;
        showToast(message, 'warning', 4000);
    }, [showToast]);

    const showVipRequiredToast = useCallback((action: string) => {
        const message = `⭐ Apenas usuários VIP podem ${action}`;
        showToast(message, 'warning', 4000);
    }, [showToast]);

    const showTimeLimitToast = useCallback((trackName: string, timeLeft: string) => {
        const message = `⏰ Você já baixou "${trackName}" nas últimas 24 horas. Aguarde ${timeLeft} para baixar novamente.`;
        showToast(message, 'warning', 5000);
    }, [showToast]);

    const showErrorToastWithDetails = useCallback((action: string, details?: string) => {
        const message = details
            ? `❌ Erro ao ${action}: ${details}`
            : `❌ Erro ao ${action}`;
        showToast(message, 'error', 5000);
    }, [showToast]);

    return {
        toasts,
        showToast,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast,
        showLikeToast,
        showDownloadToast,
        showPlayToast,
        showLoginRequiredToast,
        showVipRequiredToast,
        showTimeLimitToast,
        showErrorToastWithDetails,
        removeToast,
        clearToasts,
    };
}; 