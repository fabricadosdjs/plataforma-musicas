import { useState, useCallback, useEffect } from 'react';

interface UseTurnstileReturn {
    token: string;
    isLoading: boolean;
    isVerified: boolean;
    error: string | null;
    isClient: boolean;
    handleVerify: (token: string) => void;
    handleError: () => void;
    handleExpire: () => void;
    reset: () => void;
}

export function useTurnstile(): UseTurnstileReturn {
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState<boolean>(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleVerify = useCallback((newToken: string) => {
        setToken(newToken);
        setIsVerified(true);
        setIsLoading(false);
        setError(null);
    }, []);

    const handleError = useCallback(() => {
        setError('Erro na verificação do captcha');
        setIsLoading(false);
        setIsVerified(false);
        setToken('');
    }, []);

    const handleExpire = useCallback(() => {
        setError('Captcha expirado. Tente novamente.');
        setIsLoading(false);
        setIsVerified(false);
        setToken('');
    }, []);

    const reset = useCallback(() => {
        setToken('');
        setIsLoading(false);
        setIsVerified(false);
        setError(null);
    }, []);

    return {
        token,
        isLoading,
        isVerified,
        error,
        isClient,
        handleVerify,
        handleError,
        handleExpire,
        reset
    };
}
