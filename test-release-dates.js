// Script simples para testar datas de lançamento
require('dotenv').config();

async function testReleaseDates() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Verificar se DATABASE_URL está definida
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não encontrada no .env');
      return;
    }
    
    console.log('✅ DATABASE_URL encontrada');
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔍 Conectando ao banco...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    
    // Buscar algumas músicas
    const tracks = await prisma.track.findMany({
      select: {
        id: true,
        songName: true,
        artist: true,
        releaseDate: true,
        createdAt: true,
      },
      take: 5,
    });
    
    console.log(`📊 Encontradas ${tracks.length} músicas:\n`);
    
    tracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.songName} - ${track.artist}`);
      console.log(`   Release Date: ${track.releaseDate}`);
      console.log(`   Created At: ${track.createdAt}`);
      console.log('');
    });
    
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testReleaseDates();
