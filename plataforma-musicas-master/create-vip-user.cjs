const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const email = 'vipuser@example.com';
const password = 'SenhaSuperVip2025';
const name = 'VIP User';

async function createVipUser() {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                isPro: true,
            },
        });
        console.log('Usuário VIP criado:', user);
        console.log('E-mail:', email);
        console.log('Senha:', password);
    } catch (error) {
        console.error('Erro ao criar usuário VIP:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createVipUser();
