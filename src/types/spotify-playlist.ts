// Tipos para a página de playlist estilo Spotify

export type Track = {
    id: string;
    title: string;
    artists: string[];
    album: string;
    duration: string; // mm:ss
    addedAt: string;
    coverUrl?: string;
    previewUrl?: string;
};

export type Playlist = {
    id: string;
    title: string;
    description?: string;
    author: string;
    coverUrl: string;
    tracks: Track[];
    totalDuration: string;
    totalTracks: number;
    createdAt: string;
    isPublic: boolean;
    isFeatured: boolean;
};

export type PlaylistSortField = 'title' | 'duration' | 'addedAt';
export type SortOrder = 'asc' | 'desc';



