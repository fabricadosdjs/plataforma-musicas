// Script para criar usuário VIP para login
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  const password = await bcrypt.hash('senha123', 10);
  await prisma.user.create({
    data: {
      email: 'vip@exemplo.com',
      name: 'Usuário VIP',
      password,
      is_vip: true,
      status: 'ativo',
      valor: 50
    }
  });
  await prisma.$disconnect();
  console.log('Usuário criado: vip@exemplo.com / senha123');
})();
