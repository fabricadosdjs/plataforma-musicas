import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkTracks() {
    try {
        console.log('🔍 Verificando tracks no banco...');

        const count = await prisma.track.count();
        console.log(`📊 Total de tracks: ${count}`);

        if (count > 0) {
            const tracks = await prisma.track.findMany({
                take: 5,
                select: {
                    id: true,
                    songName: true,
                    artist: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            console.log('\n🎵 Últimas 5 tracks:');
            tracks.forEach((track, i) => {
                console.log(`${i + 1}. ${track.songName} - ${track.artist} (ID: ${track.id})`);
            });
        } else {
            console.log('❌ Nenhuma track encontrada!');
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTracks(); 