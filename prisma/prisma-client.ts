// prisma/prisma-client.ts
// Cliente Prisma otimizado para Neon PostgreSQL

import { PrismaClient } from '@prisma/client';

// Configurações específicas para Neon
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

// Configurações específicas para Neon
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Função para conectar ao banco
export async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log('✅ Prisma conectado ao Neon PostgreSQL');
    } catch (error) {
        console.error('❌ Erro ao conectar Prisma:', error);
        throw error;
    }
}

// Função para desconectar do banco
export async function disconnectDatabase() {
    try {
        await prisma.$disconnect();
        console.log('✅ Prisma desconectado do Neon PostgreSQL');
    } catch (error) {
        console.error('❌ Erro ao desconectar Prisma:', error);
    }
}

// Função para verificar saúde da conexão
export async function checkDatabaseHealth() {
    try {
        const result = await prisma.$queryRaw`SELECT 1 as health_check`;
        console.log('✅ Saúde do banco verificada:', result);
        return true;
    } catch (error) {
        console.error('❌ Erro na verificação de saúde:', error);
        return false;
    }
}

export default prisma;
