// src/types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            is_vip: boolean;
            vencimento?: string | null;
            isAdmin?: boolean;
            whatsapp?: string;
            valor?: number;
        } & DefaultSession['user'];
    }
}
