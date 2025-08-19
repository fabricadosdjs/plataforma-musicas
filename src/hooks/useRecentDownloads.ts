"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Track } from '@/types/track';

interface RecentDownloadsResult {
    downloadedTrackIds: Record<number, boolean>;
    loading: boolean;
    error: string | null;
    checkDownloads: (trackIds: number[]) => Promise<void>;
}

export function useRecentDownloads(): RecentDownloadsResult {
    const { data: session } = useSession();
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkDownloads = useCallback(async (trackIds: number[]) => {
        if (!session?.user || trackIds.length === 0) {
            setDownloadedTrackIds({});
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/tracks/check-downloads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trackIds }),
            });

            if (response.ok) {
                const data = await response.json();
                setDownloadedTrackIds(data.downloadedTrackIds || {});
                console.log(`📊 Downloads recentes verificados: ${data.recentDownloads} de ${trackIds.length} tracks`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Erro ao verificar downloads');
                setDownloadedTrackIds({});
            }
        } catch (err) {
            console.error('Erro ao verificar downloads recentes:', err);
            setError('Erro de conexão');
            setDownloadedTrackIds({});
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Função para verificar se uma track específica foi baixada recentemente
    const isRecentlyDownloaded = useCallback((trackId: number): boolean => {
        return downloadedTrackIds[trackId] === true;
    }, [downloadedTrackIds]);

    // Função para verificar múltiplas tracks
    const checkTracksDownloaded = useCallback((tracks: Track[]) => {
        const trackIds = tracks.map(track => track.id);
        checkDownloads(trackIds);
    }, [checkDownloads]);

    return {
        downloadedTrackIds,
        loading,
        error,
        checkDownloads,
        isRecentlyDownloaded,
        checkTracksDownloaded,
    } as RecentDownloadsResult & {
        isRecentlyDownloaded: (trackId: number) => boolean;
        checkTracksDownloaded: (tracks: Track[]) => void;
    };
}
