import { useState, useEffect, useCallback } from 'react';
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
    const { data: session } = useSession();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = useCallback(async () => {
        if (!session?.user?.email) {
            setUserData(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/user-data');
            if (!res.ok) {
                throw new Error('Erro ao buscar dados do usuário');
            }

            const data = await res.json();
            setUserData(data);
        } catch (err) {
            console.error('Erro ao buscar dados do usuário:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.email]);

    // Atualizar track curtida localmente
    const updateLikedTrack = useCallback((trackId: number, isLiked: boolean) => {
        setUserData(prev => {
            if (!prev) return prev;

            const newLikedTrackIds = isLiked
                ? [...prev.likedTrackIds, trackId]
                : prev.likedTrackIds.filter(id => id !== trackId);

            return {
                ...prev,
                likedTrackIds: newLikedTrackIds
            };
        });
    }, []);

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

    // Buscar dados quando o usuário mudar
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    return {
        userData,
        isLoading,
        error,
        refetch: fetchUserData,
        updateLikedTrack,
        updateDownloadedTrack
    };
}; 