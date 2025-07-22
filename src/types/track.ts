// src/types/track.ts
export type Track = {
    id: number;
    songName: string;
    artist: string;
    style: string;
    version: string;
    imageUrl: string;
    previewUrl: string;
    downloadUrl: string;
    releaseDate: string;
    isLiked?: boolean;
};
