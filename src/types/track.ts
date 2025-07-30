// src/types/track.ts
export interface Track {
    id: number;
    songName: string;
    artist: string;
    style: string;
    version?: string;
    pool?: string;  // Campo pool adicionado
    imageUrl: string;
    previewUrl: string;
    downloadUrl: string;
    releaseDate: string;
    createdAt: string;
    updatedAt: string;
    isCommunity?: boolean;
    uploadedBy?: string;
    _count?: {
        downloads: number;
        likes: number;
        plays: number;
    };
    downloadCount?: number;
    likeCount?: number;
    playCount?: number;
}
