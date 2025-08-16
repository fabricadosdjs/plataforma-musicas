const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_vJKkzL4w0jcg@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function testConnection() {
  try {
    console.log('🔌 Tentando conectar ao banco...');
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    console.log('📊 Verificando tabela Track...');
    const result = await client.query('SELECT COUNT(*) FROM "Track"');
    console.log('📈 Total de tracks na tabela:', result.rows[0].count);
    
    if (result.rows[0].count > 0) {
      console.log('🎵 Verificando estrutura da tabela...');
      const sampleTrack = await client.query('SELECT * FROM "Track" LIMIT 1');
      console.log('🔍 Campos disponíveis:', Object.keys(sampleTrack.rows[0]));
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('🔍 Detalhes:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

testConnection();
