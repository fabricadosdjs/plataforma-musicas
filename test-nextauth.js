// Teste da configuração do NextAuth
import { PrismaClient } from '@prisma/client';

async function testNextAuth() {
    console.log('🔍 Testando configuração do NextAuth...');

    // Verificar variáveis de ambiente
    console.log('\n📋 Variáveis de ambiente:');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NÃO DEFINIDA');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'DEFINIDA' : 'NÃO DEFINIDA');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NÃO DEFINIDA');
    console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? 'DEFINIDA' : 'NÃO DEFINIDA');

    try {
        // Testar conexão com banco
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log('✅ Conexão com banco de dados OK');

        // Testar query simples
        const userCount = await prisma.user.count();
        console.log(`✅ Usuários no banco: ${userCount}`);

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Erro na conexão com banco:', error.message);
    }

    console.log('\n🎯 Para resolver o erro "Failed to fetch":');
    console.log('1. Crie um arquivo .env.local na raiz do projeto');
    console.log('2. Adicione as variáveis de ambiente necessárias');
    console.log('3. Reinicie o servidor de desenvolvimento');
}

testNextAuth();
