// src/lib/prisma-debug.ts
// Controle de logs de debug do Prisma

// Desabilitar logs de debug do Prisma
if (process.env.NODE_ENV === 'development') {
    // Desabilitar logs de query em desenvolvimento
    process.env.DEBUG = '';
    process.env.PRISMA_LOG_QUERIES = 'false';
    process.env.PRISMA_LOG_LEVEL = 'warn';

    // Log de configuração para confirmar
    console.log('🔧 Prisma: Logs de query desabilitados');
    console.log('🔧 Prisma: Apenas erros e warnings serão exibidos');
}

// Configuração para todos os ambientes
export const disablePrismaQueryLogs = () => {
    // Desabilitar logs de query do Prisma
    process.env.DEBUG = '';
    process.env.PRISMA_LOG_QUERIES = 'false';
    process.env.PRISMA_LOG_LEVEL = 'warn';

    // Desabilitar logs de debug do Node.js
    process.env.NODE_OPTIONS = process.env.NODE_OPTIONS?.replace(/--inspect[^ ]*/, '') || '';
};

// Executar imediatamente
disablePrismaQueryLogs();
