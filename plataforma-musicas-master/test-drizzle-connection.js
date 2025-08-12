import 'dotenv/config';
// Script para testar a conexão com o banco de dados usando Drizzle e pg
import pkg from "pg";
const { Client } = pkg;

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        console.log("Conexão com o banco (NeonDB) via Drizzle/pg: SUCESSO");
        // Testa uma query simples
        const res = await client.query('SELECT 1 as result');
        console.log("Resultado da query:", res.rows);
        await client.end();
    } catch (error) {
        console.error("Erro ao conectar com o banco:", error);
        process.exit(1);
    }
}

main();
