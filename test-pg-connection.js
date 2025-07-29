const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://usuario:senha@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech:5432/dbname';

async function testPgConnection() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Conexão PostgreSQL bem-sucedida:', res.rows[0]);
  } catch (err) {
    console.error('❌ Falha na conexão PostgreSQL:', err);
  } finally {
    await client.end();
  }
}

testPgConnection();
