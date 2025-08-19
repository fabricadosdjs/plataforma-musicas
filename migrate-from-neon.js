import { PrismaClient } from '@prisma/client';

async function migrateFromNeon() {
  try {
    console.log('🔄 MIGRANDO DADOS DO NEON PARA O BANCO ATUAL...');
    
    // URLs dos bancos
    const neonUrl = 'postgresql://neondb_owner:npg_vJKkzL4w0jcg@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    
    // Cliente Neon (origem)
    const neonPrisma = new PrismaClient({
      datasources: { db: { url: neonUrl } }
    });
    
    // Cliente atual (destino)
    const currentPrisma = new PrismaClient();
    
    try {
      // Conectar aos dois bancos
      await neonPrisma.$connect();
      await currentPrisma.$connect();
      
      console.log('✅ Conectado aos dois bancos!');
      
      // 1. MIGRAR USUÁRIOS
      console.log('\n👥 MIGRANDO USUÁRIOS...');
      
      const neonUsers = await neonPrisma.$queryRawUnsafe(`SELECT * FROM "User"`);
      console.log(`📊 ${neonUsers.length} usuários encontrados no Neon`);
      
      for (const neonUser of neonUsers) {
        try {
          // Verificar se usuário já existe
          const existingUser = await currentPrisma.user.findUnique({
            where: { email: neonUser.email }
          });
          
          if (!existingUser) {
            // Criar usuário no banco atual
            const newUser = await currentPrisma.user.create({
              data: {
                email: neonUser.email,
                name: neonUser.name,
                isVip: neonUser.is_vip || false,
                vipPlan: neonUser.is_vip ? 'Premium' : 'Free',
                vipExpiry: neonUser.vencimento || null
              }
            });
            console.log(`✅ Usuário criado: ${neonUser.name} (${neonUser.email})`);
          } else {
            console.log(`ℹ️ Usuário já existe: ${neonUser.name}`);
          }
        } catch (error) {
          console.log(`❌ Erro ao migrar usuário ${neonUser.email}:`, error.message);
        }
      }
      
      // 2. MIGRAR MÚSICAS
      console.log('\n🎵 MIGRANDO MÚSICAS...');
      
      const neonTracks = await neonPrisma.$queryRawUnsafe(`SELECT * FROM "Track"`);
      console.log(`📊 ${neonTracks.length} músicas encontradas no Neon`);
      
      let tracksMigrated = 0;
      for (const neonTrack of neonTracks) {
        try {
          // Verificar se música já existe
          const existingTrack = await currentPrisma.track.findFirst({
            where: {
              songName: neonTrack.songName,
              artist: neonTrack.artist,
              version: neonTrack.version
            }
          });
          
          if (!existingTrack) {
            // Criar música no banco atual
            const newTrack = await currentPrisma.track.create({
              data: {
                songName: neonTrack.songName,
                artist: neonTrack.artist,
                style: neonTrack.style,
                version: neonTrack.version,
                pool: neonTrack.pool,
                bitrate: 320, // Valor padrão para músicas existentes
                imageUrl: neonTrack.imageUrl,
                audioUrl: neonTrack.previewUrl, // Mapear previewUrl para audioUrl
                downloadUrl: neonTrack.downloadUrl,
                releaseDate: neonTrack.releaseDate
              }
            });
            tracksMigrated++;
            if (tracksMigrated % 100 === 0) {
              console.log(`  📈 ${tracksMigrated} músicas migradas...`);
            }
          }
        } catch (error) {
          console.log(`❌ Erro ao migrar música ${neonTrack.songName}:`, error.message);
        }
      }
      
      console.log(`✅ ${tracksMigrated} músicas migradas com sucesso!`);
      
      // 3. VERIFICAR RESULTADO
      console.log('\n📊 VERIFICANDO RESULTADO DA MIGRAÇÃO...');
      
      const currentUsers = await currentPrisma.user.count();
      const currentTracks = await currentPrisma.track.count();
      
      console.log(`👥 Usuários no banco atual: ${currentUsers}`);
      console.log(`🎵 Músicas no banco atual: ${currentTracks}`);
      
      // 4. MOSTRAR ALGUMAS MÚSICAS MIGRADAS
      console.log('\n📝 EXEMPLOS DE MÚSICAS MIGRADAS:');
      
      const migratedTracks = await currentPrisma.track.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      
      migratedTracks.forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.songName} - ${track.artist}`);
        console.log(`     Estilo: ${track.style}, Pool: ${track.pool}, Bitrate: ${track.bitrate}kbps`);
      });
      
      console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('💡 Seus dados foram recuperados do Neon!');
      
    } catch (error) {
      console.log('❌ Erro durante a migração:', error.message);
    } finally {
      await neonPrisma.$disconnect();
      await currentPrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

migrateFromNeon();

