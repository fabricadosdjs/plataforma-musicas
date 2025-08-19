// src/lib/env-config.ts
// Configuração de ambiente para controlar logs

export const envConfig = {
    // Configurações de log do Prisma
    prisma: {
        // Desabilitar logs de query em todos os ambientes
        disableQueryLogs: true,
        // Nível de log padrão
        logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        // Desabilitar logs de debug
        disableDebugLogs: true,
    },

    // Configurações gerais de debug
    debug: {
        // Desabilitar logs de debug do Prisma
        prisma: false,
        // Desabilitar logs de debug do Next.js
        nextjs: false,
        // Desabilitar logs de debug gerais
        general: false,
    },

    // Configurações de ambiente
    environment: {
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isTest: process.env.NODE_ENV === 'test',
    },
};

// Função para verificar se logs devem ser habilitados
export const shouldEnableLogs = (type: 'query' | 'error' | 'warn' | 'info') => {
    if (type === 'query') return false; // Sempre desabilitar queries
    if (type === 'error') return true;  // Sempre habilitar erros
    if (type === 'warn') return !envConfig.environment.isProduction;
    if (type === 'info') return false;  // Sempre desabilitar info

    return false;
};
