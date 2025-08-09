/**
 * Script para atualizar TODAS as tracks do banco com uma imagem específica
 * Este script substitui todas as imagens existentes pela imagem genérica fornecida
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// URL da imagem que será aplicada a todas as tracks
const GENERIC_IMAGE_URL = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';

/**
 * Busca todas as tracks do banco de dados
 */
async function getAllTracks() {
    try {
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                imageUrl: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        console.log(`📊 Encontradas ${tracks.length} tracks no banco de dados`);
        return tracks;
    } catch (error) {
        console.error('❌ Erro ao buscar tracks:', error);
        return [];
    }
}

/**
 * Atualiza uma track com a nova imagem
 */
async function updateTrackImage(trackId, newImageUrl) {
    try {
        await prisma.track.update({
            where: { id: trackId },
            data: { imageUrl: newImageUrl }
        });
        return true;
    } catch (error) {
        console.error(`❌ Erro ao atualizar track ${trackId}:`, error);
        return false;
    }
}

/**
 * Atualiza múltiplas tracks em lote
 */
async function updateTracksInBatch(trackIds, newImageUrl) {
    try {
        const result = await prisma.track.updateMany({
            where: {
                id: {
                    in: trackIds
                }
            },
            data: {
                imageUrl: newImageUrl
            }
        });

        return result.count;
    } catch (error) {
        console.error('❌ Erro ao atualizar lote de tracks:', error);
        return 0;
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('🖼️ Iniciando atualização global de imagens das tracks...\n');

    const args = process.argv.slice(2);
    const useBatch = !args.includes('--no-batch');
    const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1]) || 50;
    const dryRun = args.includes('--dry-run');
    const maxTracks = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1]) || null;

    console.log(`⚙️ Configurações:`);
    console.log(`   - Imagem alvo: ${GENERIC_IMAGE_URL}`);
    console.log(`   - Modo lote: ${useBatch ? 'Sim' : 'Não'}`);
    console.log(`   - Tamanho do lote: ${batchSize}`);
    console.log(`   - Modo teste (dry-run): ${dryRun ? 'Sim' : 'Não'}`);
    console.log(`   - Limite de tracks: ${maxTracks || 'Sem limite'}\n`);

    try {
        // Busca todas as tracks
        let tracks = await getAllTracks();

        if (tracks.length === 0) {
            console.log('❌ Nenhuma track encontrada no banco de dados!');
            return;
        }

        // Aplica limite se especificado
        if (maxTracks && maxTracks < tracks.length) {
            tracks = tracks.slice(0, maxTracks);
            console.log(`📊 Limitando processamento a ${maxTracks} tracks`);
        }

        console.log(`🔄 Processando ${tracks.length} tracks...\n`);

        if (dryRun) {
            console.log('🔍 === MODO TESTE (DRY RUN) ===');
            console.log('📝 Tracks que seriam atualizadas:');
            tracks.slice(0, 10).forEach((track, index) => {
                console.log(`   ${index + 1}. ID ${track.id}: ${track.artist} - ${track.songName}`);
                console.log(`      Atual: ${track.imageUrl}`);
                console.log(`      Nova:  ${GENERIC_IMAGE_URL}\n`);
            });

            if (tracks.length > 10) {
                console.log(`   ... e mais ${tracks.length - 10} tracks`);
            }

            console.log('\n⚠️ Para executar a atualização real, remova --dry-run');
            return;
        }

        let updatedCount = 0;
        let errorCount = 0;

        if (useBatch) {
            // Processamento em lote (mais rápido)
            console.log(`📦 Processando em lotes de ${batchSize} tracks...`);

            for (let i = 0; i < tracks.length; i += batchSize) {
                const batch = tracks.slice(i, i + batchSize);
                const batchNum = Math.floor(i / batchSize) + 1;
                const totalBatches = Math.ceil(tracks.length / batchSize);

                console.log(`📦 Processando lote ${batchNum}/${totalBatches} (${batch.length} tracks)`);

                const trackIds = batch.map(track => track.id);
                const batchUpdated = await updateTracksInBatch(trackIds, GENERIC_IMAGE_URL);

                if (batchUpdated === batch.length) {
                    updatedCount += batchUpdated;
                    console.log(`✅ Lote ${batchNum}: ${batchUpdated} tracks atualizadas`);
                } else {
                    console.log(`⚠️ Lote ${batchNum}: ${batchUpdated}/${batch.length} tracks atualizadas`);
                    updatedCount += batchUpdated;
                    errorCount += batch.length - batchUpdated;
                }

                // Pequena pausa entre lotes para não sobrecarregar o banco
                if (i + batchSize < tracks.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        } else {
            // Processamento individual (mais detalhado)
            console.log(`🔄 Processando tracks individualmente...`);

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];

                if (i % 50 === 0) {
                    console.log(`📊 Progresso: ${i + 1}/${tracks.length} (${((i / tracks.length) * 100).toFixed(1)}%)`);
                }

                const success = await updateTrackImage(track.id, GENERIC_IMAGE_URL);

                if (success) {
                    updatedCount++;
                } else {
                    errorCount++;
                    console.log(`❌ Falha ao atualizar: ID ${track.id} - ${track.artist} - ${track.songName}`);
                }
            }
        }

        console.log('\n📈 === RESUMO FINAL ===');
        console.log(`✅ Tracks atualizadas: ${updatedCount}`);
        console.log(`❌ Erros: ${errorCount}`);
        console.log(`📊 Total processadas: ${tracks.length}`);
        console.log(`🎯 Taxa de sucesso: ${((updatedCount / tracks.length) * 100).toFixed(1)}%`);

        if (updatedCount > 0) {
            console.log(`\n🎉 ${updatedCount} tracks agora usam a imagem genérica especificada!`);
            console.log(`🖼️ URL da imagem: ${GENERIC_IMAGE_URL}`);
        }

        if (errorCount > 0) {
            console.log(`\n⚠️ ${errorCount} tracks tiveram problemas na atualização`);
        }

    } catch (error) {
        console.error('❌ Erro geral na execução:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Função para mostrar ajuda
function showHelp() {
    console.log(`
🖼️ Script para Atualização Global de Imagens

USO:
    node set-all-track-images.js [opções]

OPÇÕES:
    --dry-run           Modo teste - mostra o que seria feito sem executar
    --no-batch          Processa individualmente ao invés de em lote
    --batch=N           Tamanho do lote (padrão: 50)
    --limit=N           Processa apenas N tracks
    --help              Mostra esta ajuda

EXEMPLOS:
    # Modo teste - ver o que seria feito
    node set-all-track-images.js --dry-run
    
    # Atualizar apenas 100 tracks
    node set-all-track-images.js --limit=100
    
    # Processamento individual detalhado
    node set-all-track-images.js --no-batch
    
    # Lotes menores
    node set-all-track-images.js --batch=25

ATENÇÃO:
    Este script substitui a imagem de TODAS as tracks do banco!
    Use --dry-run primeiro para verificar o que será alterado.
`);
}

// Executa o script
if (process.argv.includes('--help')) {
    showHelp();
} else {
    main()
        .then(() => {
            console.log('\n✅ Script finalizado!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erro fatal:', error);
            process.exit(1);
        });
}

export {
    main,
    getAllTracks,
    updateTrackImage,
    updateTracksInBatch
};
