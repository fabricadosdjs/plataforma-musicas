// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;

export const safeQuery = async <T>(
    queryFn: () => Promise<T>,
    fallbackValue: T,
    maxRetries: number = 3
): Promise<T> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await queryFn();
            return result;
        } catch (error) {
            console.error(`❌ Query attempt ${attempt + 1} failed:`, error);
            if (error instanceof Error) {
                console.error('🔎 Erro detalhado:', error.message, error.stack);
            } else {
                console.error('🔎 Erro não identificado:', error);
            }
            if (attempt === maxRetries - 1) {
                console.warn('🔄 Using fallback value due to database error');
                return fallbackValue;
            }
            if (
                error instanceof Error &&
                (
                    error.message.includes('Engine is not yet connected') ||
                    error.message.includes('Connection refused') ||
                    error.message.includes('timeout')
                )
            ) {
                console.log(`🔄 Attempt ${attempt + 2}: Reconnecting to database...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }
    return fallbackValue;
};