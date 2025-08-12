const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@nexorrecords.com.br'
      }
    });

    if (existingAdmin) {
      console.log('Usuário admin já existe!');
      return;
    }

    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@nexorrecords.com.br',
        name: 'Administração',
        isAdmin: true,
        is_vip: true,
        status: 'ativo',
        valor: 50,
        deemix: true,
        isPro: true
      }
    });

    console.log('Usuário admin criado com sucesso:', adminUser);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
