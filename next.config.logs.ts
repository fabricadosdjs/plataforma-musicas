// next.config.logs.ts
// Configuração específica para controlar logs

export const logConfig = {
    // Desabilitar logs de debug do Next.js
    disableDebugLogs: true,

    // Configurações de log do Prisma
    prisma: {
        // Desabilitar logs de query
        disableQueryLogs: true,
        // Apenas erros e warnings
        logLevel: ['error', 'warn'],
    },

    // Configurações de ambiente
    environment: {
        // Desabilitar logs em desenvolvimento
        development: {
            disableQueryLogs: true,
            logLevel: ['error', 'warn'],
        },
        // Desabilitar logs em produção
        production: {
            disableQueryLogs: true,
            logLevel: ['error'],
        },
    },
};

export default logConfig;
