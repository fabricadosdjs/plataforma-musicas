// Script para criar usuário VIP no banco via Prisma
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'vip@admin.com';
  const password = 'vip123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: 'VIP Admin',
      password: hashedPassword,
      isPro: true,
    },
  });

  console.log('Usuário VIP criado:', user);
  console.log('Credenciais:');
  console.log('Email:', email);
  console.log('Senha:', password);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
