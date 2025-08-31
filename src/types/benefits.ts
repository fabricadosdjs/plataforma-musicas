export interface UserBenefits {
    plan: string;
    packRequestsPerWeek: number;
    playlistsPerWeek: number;
    downloadsPerDay: number;
    directDownload: boolean;
    deemixAccess: boolean;
    trackRequest: boolean;
    exclusiveGenres: boolean;
    prioritySupport: boolean;
    adminAccess?: boolean;
    imageAdminAccess?: boolean;
}
