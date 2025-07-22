// script para verificar detalhes do usuário
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
    try {
        console.log('🔍 Verificando usuário de teste...');

        // Buscar usuário pelo email
        const user = await prisma.user.findUnique({
            where: { email: 'teste@nexorrecords.com.br' }
        });

        if (user) {
            console.log('✅ Usuário encontrado!');
            console.log('📋 Detalhes:');
            console.log(`🆔 ID: ${user.id}`);
            console.log(`👤 Nome: ${user.name}`);
            console.log(`📧 Email: ${user.email}`);
            console.log(`👑 VIP: ${user.is_vip ? 'Sim' : 'Não'}`);
            console.log(`📅 Criado em: ${user.createdAt}`);

            // Verificar se tem outros campos
            console.log('\n🔧 Todos os campos disponíveis:');
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log('❌ Usuário não encontrado!');
        }

    } catch (error) {
        console.error('❌ Erro ao verificar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
