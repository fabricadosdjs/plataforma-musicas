import React, { useState, useEffect } from 'react';
import MusicList from './MusicList';
import { useSimplePagination } from '@/hooks/useSimplePagination';
import { Track } from '@/types/track';

interface PaginatedMusicListProps {
    endpoint: string;
    pageSize?: number;
    showDate?: boolean;
}

export default function PaginatedMusicList({ endpoint, pageSize = 60, showDate = true }: PaginatedMusicListProps) {
    const {
        tracks,
        currentPage,
        totalPages,
        isLoading,
        error,
        loadPage,
        hasNextPage,
        hasPreviousPage,
        nextPage,
        previousPage,
        totalCount,
    } = useSimplePagination({ endpoint, pageSize });

    // Estado para downloads e likes
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [likedTrackIds, setLikedTrackIds] = useState<number[]>([]);
    const [forceUpdateKey, setForceUpdateKey] = useState(0);

    // Log para debug
    console.log('🎵 PaginatedMusicList - Estado atual:', {
        tracksLength: tracks.length,
        currentPage,
        totalPages,
        isLoading,
        firstTrackId: tracks[0]?.id,
        firstTrackName: tracks[0]?.songName,
        forceUpdateKey
    });

    // Forçar update quando tracks mudarem ou página mudar
    React.useEffect(() => {
        console.log('📊 PaginatedMusicList - Tracks ou página mudaram, forçando update:', {
            tracksLength: tracks.length,
            currentPage,
            firstTrackId: tracks[0]?.id
        });
        setForceUpdateKey(prev => prev + 1);
    }, [tracks, currentPage]); // Adicionar currentPage às dependências

    return (
        <div>
            {error && (
                <div className="mb-4 text-red-400">{(error as Error).message}</div>
            )}
            <MusicList
                key={`musiclist-page-${currentPage}-tracks-${tracks.length}-update-${forceUpdateKey}-first-${tracks[0]?.id || 'empty'}`}
                tracks={tracks as Track[]}
                downloadedTrackIds={downloadedTrackIds}
                setDownloadedTrackIds={setDownloadedTrackIds}
                likedTrackIds={likedTrackIds}
                setLikedTrackIds={setLikedTrackIds}
                showDate={showDate}
                itemsPerPage={pageSize}
                isLoading={isLoading}
            />
        </div>
    );
}
