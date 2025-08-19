// src/lib/prisma-config.ts
// Configuração centralizada para logs do Prisma

export const prismaLogConfig = {
    // Em produção: apenas erros e warnings
    production: ['error', 'warn'],

    // Em desenvolvimento: apenas erros e warnings (sem queries)
    development: ['error', 'warn'],

    // Em teste: apenas erros
    test: ['error'],
};

// Função para obter a configuração de log baseada no ambiente
export const getPrismaLogConfig = () => {
    const env = process.env.NODE_ENV || 'development';

    switch (env) {
        case 'production':
            return prismaLogConfig.production;
        case 'test':
            return prismaLogConfig.test;
        default:
            return prismaLogConfig.development;
    }
};

// Configuração padrão para o cliente Prisma
export const defaultPrismaConfig = {
    log: getPrismaLogConfig(),
    // Desabilitar logs de queries para melhor performance
    // e reduzir ruído no console
};
