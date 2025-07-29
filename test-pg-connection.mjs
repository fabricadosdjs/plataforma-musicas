import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgres://usuario:senha@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech:5432/dbname?sslmode=require';

async function testPgConnection() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
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
