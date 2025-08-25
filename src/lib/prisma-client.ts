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

    // Configuração de connection pooling para evitar "Too many database connections"
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    // Configurações de pool de conexões
    __internal: {
        engine: {
            // Limitar conexões simultâneas
            connectionLimit: 5,
            // Tempo de vida da conexão (em segundos)
            connectionTimeout: 30000,
            // Tempo de espera para obter conexão (em segundos)
            acquireTimeout: 60000,
            // Tempo de inatividade antes de fechar conexão (em segundos)
            idleTimeout: 300000,
        },
    },
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
