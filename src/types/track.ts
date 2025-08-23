export interface Track {
    id: number;
    songName: string;
    artist: string;
    imageUrl?: string;
    style: string;
    version?: string;
    pool?: string;
    folder?: string; // Nova coluna para organizar músicas por pasta/álbum
    previewUrl: string;
    downloadUrl: string;
    releaseDate: string; // ou Date, dependendo de como você formata
    createdAt: string; // ou Date
    updatedAt: string; // ou Date
    isCommunity?: boolean;
    uploadedBy?: string;
    __v: number;
    duration?: number;
    bpm?: number;
    key?: string;
    mode?: string;
    bitrate?: number; // bitrate em kbps
    sampleRate?: number;
    channels?: number;
    bitDepth?: number;
    fileSize?: number;
    downloadCount?: number;
    likeCount?: number;
    isPrivate?: boolean;
    isDeleted?: boolean;
    isExplicit?: boolean;
    lyrics?: string;
    producerId?: number;
    artistId?: number;
    albumId?: number;
    labelId?: number;
    // Adicione quaisquer outros campos que você espera do backend
    [key: string]: any;
}
