// test-db-connection.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Conexão com o banco de dados bem-sucedida!');
        // Testa se existe a tabela track
        const tracks = await prisma.track.findMany({ take: 1 });
        console.log(`Tabela 'track' acessível. Exemplo de registro:`, tracks[0] || 'Nenhum registro encontrado.');
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
