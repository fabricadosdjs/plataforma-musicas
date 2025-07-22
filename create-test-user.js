// script para criar usuário de teste
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        console.log('🔧 Criando usuário de teste...');

        // Verificar se já existe
        const existingUser = await prisma.user.findUnique({
            where: { email: 'teste@nexorrecords.com.br' }
        });

        if (existingUser) {
            console.log('✅ Usuário de teste já existe!');
            console.log(`📧 Email: teste@nexorrecords.com.br`);
            console.log(`🔑 Senha: 123456`);
            console.log(`👑 VIP: ${existingUser.is_vip ? 'Sim' : 'Não'}`);
            return;
        }

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                name: 'Usuário Teste',
                email: 'teste@nexorrecords.com.br',
                is_vip: true, // Criar como VIP para testar downloads
            },
        });

        console.log('✅ Usuário de teste criado com sucesso!');
        console.log('📋 Dados para login:');
        console.log(`📧 Email: teste@nexorrecords.com.br`);
        console.log(`🔑 Senha: 123456`);
        console.log(`👑 VIP: Sim`);
        console.log(`🆔 ID: ${user.id}`);

    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
