// Teste de conexão com o banco de dados
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testando conexão com o banco de dados...');
    
    // Teste 1: Contar tracks
    const trackCount = await prisma.track.count();
    console.log(`✅ Tracks no banco: ${trackCount}`);
    
    // Teste 2: Buscar algumas tracks
    const tracks = await prisma.track.findMany({
      take: 5,
      select: {
        id: true,
        songName: true,
        artist: true,
        releaseDate: true
      }
    });
    
    console.log('✅ Primeiras 5 tracks:', tracks);
    
    // Teste 3: Verificar se há tracks com previewUrl
    const tracksWithPreview = await prisma.track.findMany({
      where: {
        OR: [
          { previewUrl: { not: null } },
          { downloadUrl: { not: null } }
        ]
      },
      take: 3,
      select: {
        id: true,
        songName: true,
        previewUrl: true,
        downloadUrl: true
      }
    });
    
    console.log('✅ Tracks com URLs:', tracksWithPreview);
    
  } catch (error) {
    console.error('❌ Erro na conexão com o banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
