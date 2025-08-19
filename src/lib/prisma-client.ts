// src/lib/prisma-client.ts
// Cliente Prisma personalizado com logs controlados

import { PrismaClient } from '@prisma/client';
import { envConfig, shouldEnableLogs } from './env-config';

// Configuração de logs que desabilita completamente as queries
const prismaClientConfig = {
    log: [
        // Apenas erros e warnings, sem queries
        ...(shouldEnableLogs('error') ? [{ emit: 'event', level: 'error' }] : []),
        ...(shouldEnableLogs('warn') ? [{ emit: 'event', level: 'warn' }] : []),
    ],
    // Desabilitar logs de query para reduzir ruído no console
    // e melhorar performance
};

// Cliente Prisma com configuração personalizada
const prismaClient = new PrismaClient(prismaClientConfig);

// Configurar listeners para logs (opcional)
if (process.env.NODE_ENV === 'development') {
    prismaClient.$on('error', (e) => {
        console.error('❌ Prisma Error:', e);
    });

    prismaClient.$on('warn', (e) => {
        console.warn('⚠️ Prisma Warning:', e);
    });
}

export default prismaClient;
