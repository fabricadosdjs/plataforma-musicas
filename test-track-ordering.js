// Teste de ordenação de músicas
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTrackOrdering() {
    try {
        console.log('🔍 Testando ordenação de músicas...');

        // Buscar últimas 10 músicas para verificar ordem
        const tracks = await prisma.track.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                songName: true,
                artist: true,
                createdAt: true,
                releaseDate: true
            }
        });

        console.log('\n📊 Últimas 10 músicas (ordenadas por data de criação):');
        tracks.forEach((track, index) => {
            const createdDate = new Date(track.createdAt).toLocaleString('pt-BR');
            const releaseDate = new Date(track.releaseDate).toLocaleDateString('pt-BR');
            console.log(`${index + 1}. ${track.songName} by ${track.artist}`);
            console.log(`   📅 Criada em: ${createdDate}`);
            console.log(`   🎵 Release: ${releaseDate}\n`);
        });

        // Verificar se está ordenado corretamente
        let isCorrectOrder = true;
        for (let i = 0; i < tracks.length - 1; i++) {
            if (new Date(tracks[i].createdAt) < new Date(tracks[i + 1].createdAt)) {
                isCorrectOrder = false;
                break;
            }
        }

        if (isCorrectOrder) {
            console.log('✅ Ordenação está correta! Músicas mais novas primeiro.');
        } else {
            console.log('❌ Ordenação está incorreta!');
        }

    } catch (error) {
        console.error('❌ Erro ao testar ordenação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testTrackOrdering();
