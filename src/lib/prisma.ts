// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';
import prismaClient from './prisma-client';
import './prisma-debug'; // Importar para executar configuração de debug

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = prismaClient;
} else {
    if (!globalThis.prisma) {
        globalThis.prisma = prismaClient;
    }
    prisma = globalThis.prisma;
}

// Função para conectar ao banco de dados
const connectToDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Prisma conectado ao banco de dados');
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar Prisma:', error);
        return false;
    }
};

// Função para desconectar do banco de dados
const disconnectFromDatabase = async () => {
    try {
        await prisma.$disconnect();
        console.log('🔌 Prisma desconectado do banco de dados');
    } catch (error) {
        console.error('❌ Erro ao desconectar Prisma:', error);
    }
};

// Conectar automaticamente ao inicializar
connectToDatabase()
    .then((success) => {
        if (success) {
            console.log('🚀 Prisma inicializado com sucesso');
        } else {
            console.error('💥 Falha ao inicializar Prisma');
        }
    })
    .catch((error) => {
        console.error('💥 Erro crítico ao inicializar Prisma:', error);
    });

// Tratamento de sinais para desconexão limpa
process.on('beforeExit', async () => {
    await disconnectFromDatabase();
});

process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await disconnectFromDatabase();
    process.exit(0);
});

export { prisma, connectToDatabase, disconnectFromDatabase };
export default prisma;

export const safeQuery = async <T>(
    queryFn: () => Promise<T>,
    fallbackValue: T,
    maxRetries: number = 3
): Promise<T> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Verificar se o Prisma está conectado
            if (!prisma) {
                throw new Error('Prisma client não está disponível');
            }

            await prisma.$connect();

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
                    error.message.includes('timeout') ||
                    error.message.includes('Prisma client não está disponível')
                )
            ) {
                console.log(`🔄 Attempt ${attempt + 2}: Reconnecting to database...`);
                try {
                    await disconnectFromDatabase();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await connectToDatabase();
                } catch (reconnectError) {
                    console.error('❌ Erro ao reconectar:', reconnectError);
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }
    return fallbackValue;
};