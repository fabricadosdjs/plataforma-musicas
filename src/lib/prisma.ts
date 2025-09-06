// src/lib/prisma.ts
// Cliente Prisma simplificado

import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient() as any;

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export { prisma };
export default prisma;