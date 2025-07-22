// script para verificar dados do banco
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexão com o banco...');

    // Verificar usuários
    const userCount = await prisma.user.count();
    console.log(`👥 Usuários encontrados: ${userCount}`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      console.log('🎯 Últimos 3 usuários:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Status: ${user.status} - VIP: ${user.is_vip ? 'Sim' : 'Não'}`);
        if (user.valor) {
          console.log(`  💰 Valor: R$ ${Number(user.valor).toFixed(2)}`);
        }
        if (user.vencimento) {
          console.log(`  📅 Vencimento: ${user.vencimento.toLocaleDateString('pt-BR')}`);
        }
      });
    }

    // Verificar tracks
    const trackCount = await prisma.track.count();
    console.log(`🎵 Tracks encontradas: ${trackCount}`);

    if (trackCount > 0) {
      const tracks = await prisma.track.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      console.log('🎯 Últimas 3 tracks:');
      tracks.forEach(track => {
        console.log(`- ${track.songName} by ${track.artist} (${track.style})`);
      });
    }

    // Verificar likes
    const likeCount = await prisma.like.count();
    console.log(`❤️ Likes encontrados: ${likeCount}`);

    // Verificar downloads
    const downloadCount = await prisma.download.count();
    console.log(`⬇️ Downloads encontrados: ${downloadCount}`);

    // Estatísticas VIP
    const vipCount = await prisma.user.count({ where: { is_vip: true } });
    const activeCount = await prisma.user.count({ where: { status: 'ativo' } });
    console.log(`👑 Usuários VIP: ${vipCount}`);
    console.log(`✅ Usuários Ativos: ${activeCount}`);

    // Receita total
    const vipUsers = await prisma.user.findMany({
      where: {
        is_vip: true,
        valor: { not: null }
      },
      select: { valor: true }
    });

    const totalRevenue = vipUsers.reduce((acc, user) => acc + Number(user.valor || 0), 0);
    console.log(`💰 Receita Total: R$ ${totalRevenue.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
