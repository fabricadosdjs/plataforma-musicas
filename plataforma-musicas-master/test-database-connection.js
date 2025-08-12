// Script para testar a conexão com o banco de dados via Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Testa conexão executando uma query simples
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('Conexão bem-sucedida! Resultado:', result);

        // Testa se a tabela Profile existe
        const profiles = await prisma.profile.findMany({ take: 1 });
        console.log('Tabela Profile acessível. Exemplo:', profiles);
    } catch (error) {
        console.error('Erro ao testar o banco de dados:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
