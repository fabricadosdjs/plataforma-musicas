// test-vip-user.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createVipUser() {
    try {
        // Criar um usuário VIP de teste
        const vipUser = await prisma.user.create({
            data: {
                email: 'vip@test.com',
                name: 'VIP Test User',
                is_vip: true,
            },
        });

        console.log('✅ Usuário VIP criado:', vipUser);

        // Criar um usuário normal de teste
        const normalUser = await prisma.user.create({
            data: {
                email: 'normal@test.com',
                name: 'Normal Test User',
                is_vip: false,
            },
        });

        console.log('✅ Usuário normal criado:', normalUser);

        // Listar todos os usuários
        const allUsers = await prisma.user.findMany();
        console.log('\n📋 Todos os usuários:', allUsers);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createVipUser();
