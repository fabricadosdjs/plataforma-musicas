import { PrismaClient } from '@prisma/client';

async function recoverFromNeon() {
  try {
    console.log('🟢 CONECTANDO AO NEON PARA RECUPERAR DADOS...');
    
    // URL do Neon fornecida pelo usuário
    const neonUrl = 'postgresql://neondb_owner:npg_vJKkzL4w0jcg@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    
    console.log('🔗 Conectando ao Neon...');
    
    // Criar cliente Prisma com URL do Neon
    const neonPrisma = new PrismaClient({
      datasources: {
        db: {
          url: neonUrl
        }
      }
    });
    
    try {
      // Testar conexão
      await neonPrisma.$connect();
      console.log('✅ Conectado ao Neon com sucesso!');
      
      // Verificar tabelas
      console.log('\n🔍 Verificando tabelas no Neon...');
      const tables = await neonPrisma.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('📋 Tabelas encontradas no Neon:', tables.map(t => t.table_name));
      
      // Verificar dados em cada tabela
      console.log('\n📊 VERIFICANDO DADOS NO NEON:');
      
      for (const table of tables) {
        try {
          const count = await neonPrisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
          console.log(`\n🔍 Tabela: ${table.table_name}`);
          console.log(`  📊 Total de registros: ${count[0].count}`);
          
          if (count[0].count > 0) {
            // Mostrar alguns exemplos
            const samples = await neonPrisma.$queryRawUnsafe(`SELECT * FROM "${table.table_name}" LIMIT 3`);
            console.log(`  📝 Exemplos de dados:`);
            samples.forEach((sample, index) => {
              console.log(`    ${index + 1}.`, JSON.stringify(sample, null, 2));
            });
            
            // Se for a tabela de músicas, mostrar mais detalhes
            if (table.table_name.toLowerCase().includes('music') || 
                table.table_name.toLowerCase().includes('track') || 
                table.table_name.toLowerCase().includes('song') ||
                table.table_name.toLowerCase().includes('todos')) {
              
              console.log(`  🎵 DETALHES DAS MÚSICAS:`);
              const musicSamples = await neonPrisma.$queryRawUnsafe(`SELECT * FROM "${table.table_name}" LIMIT 5`);
              musicSamples.forEach((music, index) => {
                console.log(`    ${index + 1}. ${music.songName || music.title || music.name || 'N/A'} - ${music.artist || 'N/A'}`);
                if (music.style || music.genre) console.log(`       Estilo: ${music.style || music.genre}`);
                if (music.pool || music.label) console.log(`       Pool: ${music.pool || music.label}`);
                if (music.releaseDate) console.log(`       Data: ${music.releaseDate}`);
              });
            }
          }
          
        } catch (error) {
          console.log(`  ❌ Erro ao verificar ${table.table_name}:`, error.message);
        }
      }
      
      // Verificar estrutura das tabelas principais
      console.log('\n🏗️ VERIFICANDO ESTRUTURA DAS TABELAS:');
      
      for (const table of tables) {
        try {
          const columns = await neonPrisma.$queryRawUnsafe(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = '${table.table_name}'
            ORDER BY ordinal_position;
          `);
          
          console.log(`\n📋 Estrutura da tabela ${table.table_name}:`);
          columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
          });
          
        } catch (error) {
          console.log(`  ❌ Erro ao verificar estrutura de ${table.table_name}:`, error.message);
        }
      }
      
      await neonPrisma.$disconnect();
      
      console.log('\n🎉 RECUPERAÇÃO CONCLUÍDA!');
      console.log('💡 Agora você pode:');
      console.log('1. Atualizar DATABASE_URL para apontar para o Neon');
      console.log('2. Ou criar uma variável NEON_DATABASE_URL separada');
      console.log('3. Executar as migrações do Prisma no Neon');
      
    } catch (error) {
      console.log('❌ Erro ao conectar ao Neon:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

recoverFromNeon();

