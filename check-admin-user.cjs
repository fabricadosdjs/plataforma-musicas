const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndUpdateAdminUser() {
  try {
    // Verificar usuário admin existente
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@nexorrecords.com.br'
      }
    });

    if (adminUser) {
      console.log('Usuário admin encontrado:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin,
        is_vip: adminUser.is_vip,
        isPro: adminUser.isPro
      });

      // Atualizar para garantir que isAdmin seja true
      const updatedUser = await prisma.user.update({
        where: {
          id: adminUser.id
        },
        data: {
          isAdmin: true,
          is_vip: true,
          isPro: true,
          status: 'ativo',
          valor: 50,
          deemix: true
        }
      });

      console.log('Usuário admin atualizado com sucesso:', {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isAdmin: updatedUser.isAdmin,
        is_vip: updatedUser.is_vip,
        isPro: updatedUser.isPro
      });
    } else {
      console.log('Usuário admin não encontrado!');
    }
  } catch (error) {
    console.error('Erro ao verificar/atualizar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateAdminUser(); 