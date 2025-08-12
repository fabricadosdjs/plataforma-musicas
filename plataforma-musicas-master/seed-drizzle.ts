// seed-drizzle.ts - Popula a tabela tracks com alguns dados de exemplo usando Drizzle
// import { db } from './drizzle.config.js';
import { tracks } from './src/db/schema/tracks';


// Exemplo de função main corrigida para TypeScript
async function main() {
    try {
        // await db.insert(tracks).values([...]);
        console.log('Tabelas populadas com sucesso!');
        process.exit(0);
    } catch (e: any) {
        console.error('Erro ao popular tabelas:', e);
        process.exit(1);
    }
}

// Para rodar: descomente a linha abaixo
// main();

