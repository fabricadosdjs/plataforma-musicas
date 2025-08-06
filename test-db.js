// Teste da conexão com o banco
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testDB() {
    try {
        console.log('🔍 Testando conexão com o banco...');

        // Testar conexão
        await prisma.$connect();
        console.log('✅ Conexão com banco estabelecida');

        // Testar query simples
        const count = await prisma.track.count();
        console.log('📊 Total de tracks:', count);

        // Testar query com select
        const tracks = await prisma.track.findMany({
            take: 1,
            select: {
                id: true,
                songName: true,
                artist: true
            }
        });

        console.log('🎵 Primeira track:', tracks[0]);

    } catch (error) {
        console.error('❌ Erro no banco:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDB();
