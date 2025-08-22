import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface UserData {
    dailyDownloadLimit: number;
    dailyDownloadCount: number;
    downloadedTrackIds: number[];
    likedTrackIds: number[];
    isVip: boolean;
}

interface UseUserDataReturn {
    userData: UserData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updateLikedTrack: (trackId: number, isLiked: boolean) => void;
    updateDownloadedTrack: (trackId: number) => void;
}

export const useUserData = (): UseUserDataReturn => {
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lastFetchRef = useRef<string | null>(null);
    const isFetchingRef = useRef(false);
    const lastFetchTimeRef = useRef<number>(0);
    const CACHE_DURATION = 30000; // 30 segundos

    const fetchUserData = useCallback(async () => {
        // Evitar chamadas simultâneas
        if (isFetchingRef.current) return;

        // Verificar se o usuário mudou
        const currentUserEmail = session?.user?.email;
        if (lastFetchRef.current === currentUserEmail) {
            // Verificar se o cache ainda é válido
            const now = Date.now();
            if (now - lastFetchTimeRef.current < CACHE_DURATION) {
                return;
            }
        }

        if (!currentUserEmail) {
            setUserData(null);
            lastFetchRef.current = null;
            return;
        }

        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/user-data');
            if (!res.ok) {
                throw new Error('Erro ao buscar dados do usuário');
            }

            const data = await res.json();
            setUserData(data);
            lastFetchRef.current = currentUserEmail;
            lastFetchTimeRef.current = Date.now();
        } catch (err) {
            console.error('Erro ao buscar dados do usuário:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [session?.user?.email]);

    // Atualizar track curtida localmente
    const updateLikedTrack = useCallback((trackId: number, isLiked: boolean) => {
        console.log('🔍 updateLikedTrack chamado:', { trackId, isLiked });
        console.log('🔍 Estado anterior:', userData);
        
        setUserData(prev => {
            if (!prev) {
                console.log('❌ updateLikedTrack: userData é null');
                return prev;
            }

            const newLikedTrackIds = isLiked
                ? [...prev.likedTrackIds, trackId]
                : prev.likedTrackIds.filter(id => id !== trackId);

            console.log('🔍 Novos likedTrackIds:', newLikedTrackIds);
            
            const newState = {
                ...prev,
                likedTrackIds: newLikedTrackIds
            };
            
            console.log('🔍 Novo estado:', newState);
            return newState;
        });
    }, [userData]);

    // Atualizar track baixada localmente
    const updateDownloadedTrack = useCallback((trackId: number) => {
        setUserData(prev => {
            if (!prev) return prev;

            const newDownloadedTrackIds = [...prev.downloadedTrackIds, trackId];
            const newDailyDownloadCount = prev.dailyDownloadCount + 1;

            return {
                ...prev,
                downloadedTrackIds: newDownloadedTrackIds,
                dailyDownloadCount: newDailyDownloadCount
            };
        });
    }, []);

    // Buscar dados apenas quando o status da sessão mudar para 'authenticated'
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            fetchUserData();
        } else if (status === 'unauthenticated') {
            setUserData(null);
            lastFetchRef.current = null;
        }
    }, [status, session?.user?.email, fetchUserData]);

    return {
        userData,
        isLoading,
        error,
        refetch: fetchUserData,
        updateLikedTrack,
        updateDownloadedTrack
    };
}; 