// simple-test.js
console.log('✅ Node.js está funcionando!');
console.log('📅 Data atual:', new Date().toISOString());
console.log('📁 Diretório de trabalho:', process.cwd());

// Teste simples do Prisma
try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    console.log('✅ Prisma Client carregado com sucesso!');

    // Fechar conexão
    prisma.$disconnect().then(() => {
        console.log('✅ Teste completado!');
    });
} catch (error) {
    console.error('❌ Erro com Prisma:', error.message);
}
