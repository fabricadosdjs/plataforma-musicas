export interface Playlist {
    id: number;
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
    isFeatured: boolean;
    section?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    tracks?: PlaylistTrack[];
    trackCount?: number;
}

export interface PlaylistTrack {
    id: number;
    playlistId: number;
    trackId: number;
    order: number;
    addedAt: string;
    track?: {
        id: number;
        songName: string;
        artist: string;
        style?: string;
        version?: string;
        pool?: string;
        imageUrl?: string;
        previewUrl?: string;
        downloadUrl?: string;
        releaseDate?: string;
        duration?: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface CreatePlaylistData {
    name: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    section?: string;
    trackIds?: number[];
}

export interface UpdatePlaylistData {
    name?: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    section?: string;
    trackIds?: number[];
}

export interface PlaylistFilters {
    isPublic?: boolean;
    isFeatured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
