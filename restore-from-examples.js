import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreFromExamples() {
  try {
    console.log('🔧 RESTAURANDO DADOS DE EXEMPLO...');
    
    // 1. Criar usuário admin de exemplo
    console.log('\n👤 Criando usuário admin de exemplo...');
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@plataforma.com',
        name: 'Administrador',
        isVip: true,
        vipPlan: 'Premium',
        vipExpiry: new Date('2025-12-31')
      }
    });
    
    console.log('✅ Usuário admin criado:', adminUser.email);
    
    // 2. Criar algumas músicas de exemplo
    console.log('\n🎵 Criando músicas de exemplo...');
    
    const exampleTracks = [
      {
        songName: 'Deep House Vibes',
        artist: 'DJ Community',
        style: 'Deep House',
        version: 'Original Mix',
        bitrate: 320,
        pool: 'Nexor Records',
        imageUrl: 'https://i.ibb.co/VqKJ8Lp/deep-house.jpg',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        releaseDate: new Date('2025-01-15')
      },
      {
        songName: 'Tech House Groove',
        artist: 'Community Producer',
        style: 'Tech House',
        version: 'Extended Mix',
        bitrate: 256,
        pool: 'Nexor Records',
        imageUrl: 'https://i.ibb.co/VqKJ8Lp/tech-house.jpg',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        releaseDate: new Date('2025-01-20')
      },
      {
        songName: 'Progressive Trance',
        artist: 'Trance Master',
        style: 'Progressive Trance',
        version: 'Club Mix',
        bitrate: 320,
        pool: 'Nexor Records',
        imageUrl: 'https://i.ibb.co/VqKJ8Lp/progressive.jpg',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        releaseDate: new Date('2025-01-25')
      }
    ];
    
    for (const trackData of exampleTracks) {
      const track = await prisma.track.create({
        data: trackData
      });
      console.log(`✅ Música criada: ${track.songName} - ${track.artist}`);
    }
    
    // 3. Verificar se funcionou
    console.log('\n📊 Verificando dados criados...');
    
    const userCount = await prisma.user.count();
    const trackCount = await prisma.track.count();
    
    console.log(`👥 Usuários: ${userCount}`);
    console.log(`🎵 Músicas: ${trackCount}`);
    
    // 4. Mostrar as músicas criadas
    const tracks = await prisma.track.findMany();
    
    console.log('\n📝 Músicas disponíveis:');
    tracks.forEach(track => {
      console.log(`  - ${track.songName} (${track.artist})`);
      console.log(`    Estilo: ${track.style}, Bitrate: ${track.bitrate}kbps`);
      console.log(`    Pool: ${track.pool}, Versão: ${track.version}`);
      console.log('');
    });
    
    console.log('🎉 Dados de exemplo restaurados com sucesso!');
    console.log('🔑 Login admin: admin@plataforma.com');
    
  } catch (error) {
    console.error('❌ Erro ao restaurar dados:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restoreFromExamples();
