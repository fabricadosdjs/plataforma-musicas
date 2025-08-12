const { PrismaClient } = require('@prisma/client');

async function checkDeezerFields() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando campos do Deezer Premium na tabela User...');
    
    // Tentar buscar um usuário com os campos do Deezer
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        deezerPremium: true,
        deezerEmail: true,
        deezerPassword: true
      },
      take: 5
    });
    
    console.log('✅ Campos do Deezer Premium encontrados!');
    console.log('📋 Estrutura dos campos:');
    console.log('- deezerPremium: Boolean (padrão: false)');
    console.log('- deezerEmail: String (opcional)');
    console.log('- deezerPassword: String (opcional)');
    
    console.log('\n📊 Amostra de usuários:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Deezer Premium: ${user.deezerPremium || false}`);
      console.log(`   Deezer Email: ${user.deezerEmail || 'Não definido'}`);
      console.log(`   Deezer Password: ${user.deezerPassword ? '***' : 'Não definido'}`);
      console.log('');
    });
    
    // Verificar se há usuários com Deezer Premium ativo
    const usersWithDeezer = await prisma.user.count({
      where: {
        deezerPremium: true
      }
    });
    
    console.log(`📈 Usuários com Deezer Premium ativo: ${usersWithDeezer}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar campos do Deezer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDeezerFields(); 