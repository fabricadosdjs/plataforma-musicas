// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        name: string;
        is_vip: boolean;
        valor: string;
        benefits: any;
        status: string;
        dailyDownloadCount: number;
        weeklyPackRequests: number;
        weeklyPlaylistDownloads: number;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            is_vip: boolean;
            valor: string;
            benefits: any;
            status: string;
            dailyDownloadCount: number;
            weeklyPackRequests: number;
            weeklyPlaylistDownloads: number;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        is_vip: boolean;
        valor: string;
        benefits: any;
        status: string;
        dailyDownloadCount: number;
        weeklyPackRequests: number;
        weeklyPlaylistDownloads: number;
    }
}
