import { useLoading } from '@/context/LoadingContext';

export const usePageLoading = () => {
    const { startLoading, stopLoading, setLoadingMessage } = useLoading();

    const withLoading = async <T>(
        asyncFn: () => Promise<T>,
        loadingMessage: string = 'Carregando...'
    ): Promise<T> => {
        startLoading(loadingMessage);
        try {
            const result = await asyncFn();
            return result;
        } finally {
            stopLoading();
        }
    };

    const startPageLoading = (message: string = 'Carregando página...') => {
        startLoading(message);
    };

    const stopPageLoading = () => {
        stopLoading();
    };

    const updateLoadingMessage = (message: string) => {
        setLoadingMessage(message);
    };

    return {
        withLoading,
        startPageLoading,
        stopPageLoading,
        updateLoadingMessage,
        startLoading,
        stopLoading,
        setLoadingMessage
    };
};
