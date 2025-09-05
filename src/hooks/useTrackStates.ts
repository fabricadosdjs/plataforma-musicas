import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UseTrackStatesReturn {
    downloadedTracks: Set<number>;
    downloadingTracks: Set<number>;
    likedTracks: Set<number>;
    likingTracks: Set<number>;
    isDownloaded: (trackId: number) => boolean;
    isDownloading: (trackId: number) => boolean;
    isLiked: (trackId: number) => boolean;
    isLiking: (trackId: number) => boolean;
    markAsDownloaded: (trackId: number) => void;
    markAsDownloading: (trackId: number) => void;
    markAsNotDownloading: (trackId: number) => void;
    markAsLiked: (trackId: number) => void;
    markAsNotLiked: (trackId: number) => void;
    markAsLiking: (trackId: number) => void;
    markAsNotLiking: (trackId: number) => void;
    loadUserStates: (trackIds: number[]) => Promise<void>;
}

export const useTrackStates = (): UseTrackStatesReturn => {
    const { data: session } = useSession();
    const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set());
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());
    const [likingTracks, setLikingTracks] = useState<Set<number>>(new Set());

    // Carregar estados do localStorage na inicialização
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Carregar downloads do localStorage
        const savedDownloads = localStorage.getItem('downloadedTrackIds');
        if (savedDownloads) {
            try {
                const parsed = JSON.parse(savedDownloads);
                if (Array.isArray(parsed)) {
                    setDownloadedTracks(new Set(parsed));
                }
            } catch (error) {
                console.error('Erro ao carregar downloads do localStorage:', error);
            }
        }

        // Carregar likes do localStorage
        const savedLikes = localStorage.getItem('likedTrackIds');
        if (savedLikes) {
            try {
                const parsed = JSON.parse(savedLikes);
                if (Array.isArray(parsed)) {
                    setLikedTracks(new Set(parsed));
                }
            } catch (error) {
                console.error('Erro ao carregar likes do localStorage:', error);
            }
        }
    }, []);

    // Funções de verificação
    const isDownloaded = useCallback((trackId: number) => {
        return downloadedTracks.has(trackId);
    }, [downloadedTracks]);

    const isDownloading = useCallback((trackId: number) => {
        return downloadingTracks.has(trackId);
    }, [downloadingTracks]);

    const isLiked = useCallback((trackId: number) => {
        return likedTracks.has(trackId);
    }, [likedTracks]);

    const isLiking = useCallback((trackId: number) => {
        return likingTracks.has(trackId);
    }, [likingTracks]);

    // Funções de marcação
    const markAsDownloaded = useCallback((trackId: number) => {
        setDownloadedTracks(prev => {
            const newSet = new Set(prev);
            newSet.add(trackId);

            // Salvar no localStorage
            if (typeof window !== 'undefined') {
                const array = Array.from(newSet);
                localStorage.setItem('downloadedTrackIds', JSON.stringify(array));
            }

            return newSet;
        });
    }, []);

    const markAsDownloading = useCallback((trackId: number) => {
        setDownloadingTracks(prev => new Set(prev).add(trackId));
    }, []);

    const markAsNotDownloading = useCallback((trackId: number) => {
        setDownloadingTracks(prev => {
            const newSet = new Set(prev);
            newSet.delete(trackId);
            return newSet;
        });
    }, []);

    const markAsLiked = useCallback((trackId: number) => {
        setLikedTracks(prev => {
            const newSet = new Set(prev);
            newSet.add(trackId);

            // Salvar no localStorage
            if (typeof window !== 'undefined') {
                const array = Array.from(newSet);
                localStorage.setItem('likedTrackIds', JSON.stringify(array));
            }

            return newSet;
        });
    }, []);

    const markAsNotLiked = useCallback((trackId: number) => {
        setLikedTracks(prev => {
            const newSet = new Set(prev);
            newSet.delete(trackId);

            // Salvar no localStorage
            if (typeof window !== 'undefined') {
                const array = Array.from(newSet);
                localStorage.setItem('likedTrackIds', JSON.stringify(array));
            }

            return newSet;
        });
    }, []);

    const markAsLiking = useCallback((trackId: number) => {
        setLikingTracks(prev => new Set(prev).add(trackId));
    }, []);

    const markAsNotLiking = useCallback((trackId: number) => {
        setLikingTracks(prev => {
            const newSet = new Set(prev);
            newSet.delete(trackId);
            return newSet;
        });
    }, []);

    // Função para carregar estados do servidor
    const loadUserStates = useCallback(async (trackIds: number[]) => {
        if (!session?.user || trackIds.length === 0) return;

        try {
            // Carregar downloads do usuário
            const downloadsResponse = await fetch('/api/downloads/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackIds })
            });

            if (downloadsResponse.ok) {
                const downloadsData = await downloadsResponse.json();
                if (downloadsData.downloadedTracks && Array.isArray(downloadsData.downloadedTracks)) {
                    setDownloadedTracks(prev => {
                        const newSet = new Set(prev);
                        downloadsData.downloadedTracks.forEach((id: number) => newSet.add(id));

                        // Salvar no localStorage
                        if (typeof window !== 'undefined') {
                            const array = Array.from(newSet);
                            localStorage.setItem('downloadedTrackIds', JSON.stringify(array));
                        }

                        return newSet;
                    });
                }
            }

            // Carregar likes do usuário
            const likesResponse = await fetch('/api/likes', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (likesResponse.ok) {
                const likesData = await likesResponse.json();
                if (likesData.likedTracks && Array.isArray(likesData.likedTracks)) {
                    setLikedTracks(prev => {
                        const newSet = new Set(prev);
                        likesData.likedTracks.forEach((id: number) => newSet.add(id));

                        // Salvar no localStorage
                        if (typeof window !== 'undefined') {
                            const array = Array.from(newSet);
                            localStorage.setItem('likedTrackIds', JSON.stringify(array));
                        }

                        return newSet;
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao carregar estados do usuário:', error);
        }
    }, [session?.user]);

    return {
        downloadedTracks,
        downloadingTracks,
        likedTracks,
        likingTracks,
        isDownloaded,
        isDownloading,
        isLiked,
        isLiking,
        markAsDownloaded,
        markAsDownloading,
        markAsNotDownloading,
        markAsLiked,
        markAsNotLiked,
        markAsLiking,
        markAsNotLiking,
        loadUserStates
    };
};


