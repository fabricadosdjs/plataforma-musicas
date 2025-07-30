// Script para atualizar pools das músicas existentes
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingPools() {
    try {
        console.log('🔄 Iniciando atualização de pools...');

        // Buscar todas as músicas que não têm pool definido
        const tracksWithoutPool = await prisma.track.findMany({
            where: {
                OR: [
                    { pool: null },
                    { pool: '' }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                pool: true
            }
        });

        console.log(`📊 Encontradas ${tracksWithoutPool.length} músicas sem pool definido`);

        if (tracksWithoutPool.length === 0) {
            console.log('✅ Todas as músicas já têm pool definido!');
            return;
        }

        // Atualizar todas as músicas sem pool
        const updateResult = await prisma.track.updateMany({
            where: {
                OR: [
                    { pool: null },
                    { pool: '' }
                ]
            },
            data: {
                pool: 'Nexor Records'
            }
        });

        console.log(`✅ Atualizadas ${updateResult.count} músicas com pool "Nexor Records"`);

        // Verificar o resultado
        const updatedTracks = await prisma.track.findMany({
            where: {
                pool: 'Nexor Records'
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                pool: true
            }
        });

        console.log(`📈 Total de músicas com pool "Nexor Records": ${updatedTracks.length}`);

        // Mostrar algumas músicas como exemplo
        console.log('\n🎵 Exemplos de músicas atualizadas:');
        updatedTracks.slice(0, 5).forEach(track => {
            console.log(`  - ${track.artist} - ${track.songName} (Pool: ${track.pool})`);
        });

        console.log('\n✅ Atualização concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao atualizar pools:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
updateExistingPools(); 