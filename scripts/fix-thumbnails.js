#!/usr/bin/env node

/**
 * Script para corrigir thumbnails das músicas
 * 
 * Este script atualiza todas as músicas que não têm thumbnail
 * com uma imagem padrão.
 * 
 * Uso:
 * node scripts/fix-thumbnails.js
 * 
 * Ou para executar com Node.js:
 * npm run fix-thumbnails
 */

const DEFAULT_THUMBNAIL = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';

// Função para atualizar thumbnail de uma música
async function updateTrackThumbnail(trackId, imageUrl) {
    try {
        const response = await fetch('/api/admin/update-track-thumbnail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trackId,
                imageUrl
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`❌ Erro ao atualizar música ${trackId}:`, error);
        return null;
    }
}

// Função para atualizar múltiplas músicas em lote
async function updateMultipleTrackThumbnails(trackIds, imageUrl) {
    try {
        const response = await fetch('/api/admin/update-track-thumbnail', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trackIds,
                imageUrl
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('❌ Erro ao atualizar músicas em lote:', error);
        return null;
    }
}

// Função para obter todas as músicas (simulada)
async function getAllTracks() {
    try {
        // Aqui você pode implementar a lógica para buscar todas as músicas
        // Por enquanto, vamos simular com IDs de exemplo
        const response = await fetch('/api/admin/tracks');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tracks = await response.json();
        return tracks;
    } catch (error) {
        console.error('❌ Erro ao buscar músicas:', error);
        // Retornar array vazio em caso de erro
        return [];
    }
}

// Função principal para corrigir thumbnails
async function fixThumbnails() {
    console.log('🎵 Iniciando correção de thumbnails...');
    console.log(`📸 Usando imagem padrão: ${DEFAULT_THUMBNAIL}`);

    try {
        // Obter todas as músicas
        const tracks = await getAllTracks();

        if (tracks.length === 0) {
            console.log('⚠️ Nenhuma música encontrada');
            return;
        }

        console.log(`📊 Total de músicas encontradas: ${tracks.length}`);

        // Filtrar músicas sem thumbnail
        const tracksWithoutThumbnail = tracks.filter(track =>
            !track.imageUrl ||
            track.imageUrl === '' ||
            track.imageUrl === null ||
            track.imageUrl === 'undefined'
        );

        console.log(`🔍 Músicas sem thumbnail: ${tracksWithoutThumbnail.length}`);

        if (tracksWithoutThumbnail.length === 0) {
            console.log('✅ Todas as músicas já têm thumbnail!');
            return;
        }

        // Atualizar em lotes de 10
        const batchSize = 10;
        const batches = [];

        for (let i = 0; i < tracksWithoutThumbnail.length; i += batchSize) {
            batches.push(tracksWithoutThumbnail.slice(i, i + batchSize));
        }

        console.log(`📦 Processando em ${batches.length} lotes de ${batchSize}`);

        let totalUpdated = 0;
        let totalErrors = 0;

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`\n📦 Processando lote ${i + 1}/${batches.length} (${batch.length} músicas)`);

            const trackIds = batch.map(track => track.id);

            try {
                const result = await updateMultipleTrackThumbnails(trackIds, DEFAULT_THUMBNAIL);

                if (result && result.success) {
                    console.log(`✅ Lote ${i + 1} atualizado com sucesso`);
                    totalUpdated += batch.length;
                } else {
                    console.log(`❌ Erro no lote ${i + 1}`);
                    totalErrors += batch.length;
                }
            } catch (error) {
                console.error(`❌ Erro no lote ${i + 1}:`, error);
                totalErrors += batch.length;
            }

            // Aguardar um pouco entre os lotes para não sobrecarregar o servidor
            if (i < batches.length - 1) {
                console.log('⏳ Aguardando 1 segundo...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Resumo final
        console.log('\n📊 RESUMO FINAL:');
        console.log(`✅ Total atualizado: ${totalUpdated}`);
        console.log(`❌ Total com erro: ${totalErrors}`);
        console.log(`📸 Thumbnail padrão aplicada: ${DEFAULT_THUMBNAIL}`);

        if (totalUpdated > 0) {
            console.log('\n🎉 Correção de thumbnails concluída com sucesso!');
        } else {
            console.log('\n⚠️ Nenhuma thumbnail foi atualizada');
        }

    } catch (error) {
        console.error('❌ Erro durante a correção de thumbnails:', error);
    }
}

// Função para corrigir thumbnail de uma música específica
async function fixSingleTrackThumbnail(trackId) {
    console.log(`🎵 Corrigindo thumbnail da música ${trackId}...`);

    try {
        const result = await updateTrackThumbnail(trackId, DEFAULT_THUMBNAIL);

        if (result && result.success) {
            console.log(`✅ Thumbnail da música ${trackId} atualizada com sucesso!`);
            console.log(`📸 Nova imagem: ${DEFAULT_THUMBNAIL}`);
        } else {
            console.log(`❌ Falha ao atualizar música ${trackId}`);
        }
    } catch (error) {
        console.error(`❌ Erro ao corrigir música ${trackId}:`, error);
    }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length > 0) {
    const trackId = parseInt(args[0]);

    if (isNaN(trackId)) {
        console.log('❌ ID da música deve ser um número');
        console.log('Uso: node scripts/fix-thumbnails.js [trackId]');
        process.exit(1);
    }

    // Corrigir música específica
    fixSingleTrackThumbnail(trackId);
} else {
    // Corrigir todas as músicas
    fixThumbnails();
}

// Exportar funções para uso em outros scripts
module.exports = {
    fixThumbnails,
    fixSingleTrackThumbnail,
    updateTrackThumbnail,
    updateMultipleTrackThumbnails,
    DEFAULT_THUMBNAIL
};
