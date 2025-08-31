// src/lib/prisma-client.ts
// Cliente Prisma simplificado para resolver problemas de inicialização

import { PrismaClient } from '@prisma/client';

// Cliente Prisma básico sem configurações complexas
const prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
});

export default prismaClient;
