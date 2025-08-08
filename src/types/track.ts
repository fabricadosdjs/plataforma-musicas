export interface Track {
    id: number;
    songName: string;
    artist: string;
    style: string;
    version?: string;
    pool?: string;
    imageUrl: string;
    previewUrl: string;
    downloadUrl: string;
    releaseDate: string; // ou Date, dependendo de como você formata
    createdAt: string; // ou Date
    updatedAt: string; // ou Date
    isCommunity?: boolean;
    uploadedBy?: string;
    // Adicione quaisquer outros campos que você espera do backend
    [key: string]: any;
}
