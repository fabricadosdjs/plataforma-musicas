const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMediaFireTestTrack() {
  try {
    // URL de exemplo do MediaFire (substituir por uma URL real quando disponível)
    const mediaFireUrl = 'https://www.mediafire.com/file/example123/test-audio.mp3/file';

    const newTrack = await prisma.track.create({
      data: {
        songName: 'Test MediaFire Track',
        artist: 'MediaFire Test Artist',
        style: 'Electronic',
        version: 'Original Mix',
        imageUrl: 'https://via.placeholder.com/300x300.png?text=MediaFire+Test',
        previewUrl: mediaFireUrl,
        downloadUrl: mediaFireUrl,
        releaseDate: new Date('2024-01-01'),
      }
    });

    console.log('✅ Música de teste do MediaFire criada:');
    console.log('ID:', newTrack.id);
    console.log('Song Name:', newTrack.songName);
    console.log('URL:', newTrack.previewUrl);

    // Verificar se a detecção está funcionando
    const { isMediaFireUrl } = require('./src/utils/mediaUtils.ts');
    console.log('🔍 Detecção MediaFire:', isMediaFireUrl(newTrack.previewUrl) ? 'SIM' : 'NÃO');

  } catch (error) {
    console.error('❌ Erro ao criar música:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMediaFireTestTrack();
