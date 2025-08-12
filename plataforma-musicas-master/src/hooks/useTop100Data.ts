import { useState, useEffect } from 'react';

interface Top100Track {
    id: number;
    position: number;
    previousPosition?: number;
    change: 'up' | 'down' | 'new' | 'stable';
    changeAmount?: number;
    trend: 'hot' | 'rising' | 'stable' | 'falling';
    songName: string;
    artist: string;
    style: string;
    genre: string;
    imageUrl: string;
    previewUrl: string;
    downloadUrl: string;
    releaseDate: string;
    createdAt: string;
    updatedAt: string;
    views: number;
    plays: number;
    likes: number;
    downloads: number;
    pool: string;
    isCommunity: boolean;
    isExclusive: boolean;
    isNew: boolean;
    isFeatured: boolean;
}

export const useTop100Data = () => {
    const [tracks, setTracks] = useState<Top100Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/top-100');

            if (!response.ok) {
                throw new Error('Erro ao carregar dados do Top 100');
            }

            const data = await response.json();
            setTracks(data.tracks);
            setLastUpdate(new Date(data.lastUpdate));
        } catch (err) {
            setError('Erro ao carregar dados do Top 100');
            console.error('Erro ao carregar Top 100:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateData = async () => {
        try {
            const response = await fetch('/api/top-100');

            if (response.ok) {
                const data = await response.json();
                setTracks(data.tracks);
                setLastUpdate(new Date(data.lastUpdate));
            }
        } catch (err) {
            console.error('Erro ao atualizar Top 100:', err);
        }
    };

    useEffect(() => {
        loadData();

        // Atualizar dados a cada 30 segundos
        const interval = setInterval(updateData, 30000);

        return () => clearInterval(interval);
    }, []);

    const getTrackById = (id: number) => {
        return tracks.find(track => track.id === id);
    };

    const getTracksByGenre = (genre: string) => {
        return tracks.filter(track => track.genre === genre);
    };

    const getTrendingTracks = () => {
        return tracks.filter(track => track.trend === 'hot' || track.trend === 'rising');
    };

    const getNewTracks = () => {
        return tracks.filter(track => track.change === 'new');
    };

    const getExclusiveTracks = () => {
        return tracks.filter(track => track.isExclusive);
    };

    const getTopTracks = (limit: number = 10) => {
        return tracks.slice(0, limit);
    };

    const searchTracks = (query: string) => {
        const lowercaseQuery = query.toLowerCase();
        return tracks.filter(track =>
            track.songName.toLowerCase().includes(lowercaseQuery) ||
            track.artist.toLowerCase().includes(lowercaseQuery) ||
            track.genre.toLowerCase().includes(lowercaseQuery)
        );
    };

    const sortTracks = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        const sortedTracks = [...tracks];

        switch (sortBy) {
            case 'position':
                sortedTracks.sort((a, b) => sortOrder === 'asc' ? a.position - b.position : b.position - a.position);
                break;
            case 'views':
                sortedTracks.sort((a, b) => sortOrder === 'asc' ? a.views - b.views : b.views - a.views);
                break;
            case 'plays':
                sortedTracks.sort((a, b) => sortOrder === 'asc' ? a.plays - b.plays : b.plays - a.plays);
                break;
            case 'likes':
                sortedTracks.sort((a, b) => sortOrder === 'asc' ? a.likes - b.likes : b.likes - a.likes);
                break;
            case 'downloads':
                sortedTracks.sort((a, b) => sortOrder === 'asc' ? a.downloads - b.downloads : b.downloads - a.downloads);
                break;
            default:
                break;
        }

        return sortedTracks;
    };

    return {
        tracks,
        loading,
        error,
        lastUpdate,
        getTrackById,
        getTracksByGenre,
        getTrendingTracks,
        getNewTracks,
        getExclusiveTracks,
        getTopTracks,
        searchTracks,
        sortTracks,
        reloadData: loadData
    };
}; 