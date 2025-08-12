const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserToVip() {
    try {
        const user = await prisma.user.update({
            where: { email: 'vipuser@example.com' },
            data: {
                is_vip: true,
                isPro: true,
                status: 'ativo'
            }
        });
        console.log('✅ Usuário atualizado para VIP:', {
            email: user.email,
            is_vip: user.is_vip,
            isPro: user.isPro,
            status: user.status
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserToVip();
