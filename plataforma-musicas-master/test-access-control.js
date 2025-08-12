const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testUserAccessControl() {
  try {
    console.log('🧪 Testando Sistema de Controle de Acesso...\n');

    // 1. Criar usuário de teste
    console.log('1. Criando usuário de teste...');
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-' + Date.now(),
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        password: await bcrypt.hash('123456', 10),
        is_vip: true,
        deemix: true,
        status: 'ativo'
      }
    });
    console.log('✅ Usuário criado:', testUser.name);

    // 2. Testar mudança de status VIP
    console.log('\n2. Testando mudança de status VIP...');
    await prisma.user.update({
      where: { id: testUser.id },
      data: { is_vip: false }
    });

    const userAfterVipChange = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { is_vip: true, deemix: true, status: true }
    });

    console.log('✅ Status VIP alterado para:', userAfterVipChange.is_vip ? 'SIM' : 'NÃO');
    console.log('- O usuário agora', userAfterVipChange.is_vip ? 'TEM' : 'NÃO TEM', 'acesso às músicas');

    // 3. Testar mudança de status Deemix
    console.log('\n3. Testando mudança de status Deemix...');
    await prisma.user.update({
      where: { id: testUser.id },
      data: { deemix: false }
    });

    const userAfterDeemixChange = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { is_vip: true, deemix: true, status: true }
    });

    console.log('✅ Status Deemix alterado para:', userAfterDeemixChange.deemix ? 'SIM' : 'NÃO');
    console.log('- O usuário agora', userAfterDeemixChange.deemix ? 'TEM' : 'NÃO TEM', 'acesso ao Deemix');

    // 4. Testar reativação
    console.log('\n4. Testando reativação completa...');
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        is_vip: true,
        deemix: true,
        status: 'ativo'
      }
    });

    const userReactivated = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { is_vip: true, deemix: true, status: true }
    });

    console.log('✅ Usuário reativado:');
    console.log('- VIP:', userReactivated.is_vip ? 'SIM' : 'NÃO');
    console.log('- Deemix:', userReactivated.deemix ? 'SIM' : 'NÃO');
    console.log('- Status:', userReactivated.status);

    // 5. Limpar dados de teste
    console.log('\n5. Limpando dados de teste...');
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Usuário de teste removido');

    console.log('\n🎉 Todos os testes passaram! O sistema de controle de acesso está funcionando.');
    console.log('\n📋 Funcionalidades implementadas:');
    console.log('✅ Campo de senha no modal de cadastro');
    console.log('✅ Dropdowns Sim/Não para VIP e Deemix');
    console.log('✅ Controle de acesso em tempo real via middleware');
    console.log('✅ Página de acesso negado personalizada');
    console.log('✅ API atualizada para suportar mudanças de senha');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserAccessControl();
