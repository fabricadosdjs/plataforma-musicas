const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para corrigir registros com "Artista Desconhecido" no banco de dados
 * 
 * Este script:
 * 1. Identifica todas as músicas com artistas inválidos
 * 2. Tenta extrair o nome do artista do nome da música
 * 3. Atualiza o banco de dados com os nomes corretos
 * 4. Gera um relatório das correções feitas
 */

// Padrões para extrair nomes de artistas de nomes de músicas
const artistPatterns = [
    // Padrão: "ARTISTA - Nome da Música"
    /^([^-]+)\s*-\s*(.+)$/i,

    // Padrão: "ARTISTA ft. FEATURED - Nome da Música"
    /^([^-]+)\s+ft\.?\s*([^-]+)\s*-\s*(.+)$/i,

    // Padrão: "ARTISTA feat. FEATURED - Nome da Música"
    /^([^-]+)\s+feat\.?\s*([^-]+)\s*-\s*(.+)$/i,

    // Padrão: "ARTISTA & FEATURED - Nome da Música"
    /^([^-]+)\s*&\s*([^-]+)\s*-\s*(.+)$/i,

    // Padrão: "ARTISTA x FEATURED - Nome da Música"
    /^([^-]+)\s*x\s*([^-]+)\s*-\s*(.+)$/i,

    // Padrão: "ARTISTA vs FEATURED - Nome da Música"
    /^([^-]+)\s+vs\s*([^-]+)\s*-\s*(.+)$/i,

    // Padrão: "ARTISTA (feat. FEATURED) - Nome da Música"
    /^([^-]+)\s*\(feat\.?\s*([^)]+)\)\s*-\s*(.+)$/i,

    // Padrão: "ARTISTA [feat. FEATURED] - Nome da Música"
    /^([^-]+)\s*\[feat\.?\s*([^\]]+)\]\s*-\s*(.+)$/i,
];

// Valores inválidos que precisam ser corrigidos
const invalidArtistValues = [
    'Artista Desconhecido',
    'Artista Desconhecido',
    'Unknown Artist',
    'N/A',
    'Unknown',
    'Desconhecido',
    'Não Informado',
    'Sem Informação',
    'TBD',
    'To Be Determined'
];

// Função para extrair nome do artista do nome da música
function extractArtistFromSongName(songName) {
    if (!songName) return null;

    // Tentar cada padrão
    for (const pattern of artistPatterns) {
        const match = songName.match(pattern);
        if (match) {
            // Retornar o primeiro artista (antes do hífen)
            let artist = match[1].trim();

            // Limpar o nome do artista
            artist = artist
                .replace(/^\s+|\s+$/g, '') // Remove espaços extras
                .replace(/\s+/g, ' ') // Remove múltiplos espaços
                .replace(/^["']|["']$/g, ''); // Remove aspas

            // Verificar se o artista não é muito curto ou muito longo
            if (artist.length >= 2 && artist.length <= 100) {
                return artist;
            }
        }
    }

    return null;
}

// Função para limpar e normalizar nome do artista
function cleanArtistName(artistName) {
    if (!artistName) return null;

    return artistName
        .trim()
        .replace(/\s+/g, ' ') // Remove múltiplos espaços
        .replace(/^["']|["']$/g, '') // Remove aspas
        .replace(/^\s+|\s+$/g, ''); // Remove espaços extras
}

// Função principal para corrigir artistas
async function fixUnknownArtists() {
    console.log('🎵 Iniciando correção de artistas desconhecidos...\n');

    try {
        // 1. Buscar todas as músicas com artistas inválidos
        console.log('🔍 Buscando músicas com artistas inválidos...');

        const tracksWithInvalidArtists = await prisma.track.findMany({
            where: {
                OR: [
                    { artist: { in: invalidArtistValues } },
                    { artist: null },
                    { artist: '' }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true
            }
        });

        console.log(`📊 Encontradas ${tracksWithInvalidArtists.length} músicas com artistas inválidos\n`);

        if (tracksWithInvalidArtists.length === 0) {
            console.log('✅ Nenhuma música com artista inválido encontrada!');
            return;
        }

        // 2. Processar cada música
        let correctedCount = 0;
        let failedCount = 0;
        const corrections = [];
        const failures = [];

        console.log('🔄 Processando músicas...\n');

        for (const track of tracksWithInvalidArtists) {
            console.log(`🎵 Processando: "${track.songName}" (ID: ${track.id})`);

            try {
                // Tentar extrair artista do nome da música
                let newArtistName = extractArtistFromSongName(track.songName);

                // Se não conseguiu extrair, tentar outras estratégias
                if (!newArtistName) {
                    // Estratégia: usar o nome da música como artista (último recurso)
                    if (track.songName && track.songName.length > 0) {
                        newArtistName = track.songName.split(' ').slice(0, 3).join(' '); // Primeiras 3 palavras
                        console.log(`   ⚠️  Usando nome da música como artista: "${newArtistName}"`);
                    }
                }

                if (newArtistName) {
                    // Limpar e normalizar o nome
                    newArtistName = cleanArtistName(newArtistName);

                    if (newArtistName && newArtistName.length >= 2) {
                        // Atualizar no banco de dados
                        await prisma.track.update({
                            where: { id: track.id },
                            data: { artist: newArtistName }
                        });

                        corrections.push({
                            id: track.id,
                            oldArtist: track.artist || 'NULL/VAZIO',
                            newArtist: newArtistName,
                            songName: track.songName
                        });

                        correctedCount++;
                        console.log(`   ✅ Corrigido: "${track.artist || 'NULL'}" → "${newArtistName}"`);
                    } else {
                        throw new Error('Nome do artista muito curto após limpeza');
                    }
                } else {
                    throw new Error('Não foi possível extrair nome do artista');
                }

            } catch (error) {
                console.log(`   ❌ Erro: ${error.message}`);
                failures.push({
                    id: track.id,
                    songName: track.songName,
                    currentArtist: track.artist || 'NULL/VAZIO',
                    error: error.message
                });
                failedCount++;
            }

            console.log(''); // Linha em branco para separar
        }

        // 3. Gerar relatório
        console.log('📋 RELATÓRIO DE CORREÇÕES');
        console.log('='.repeat(50));
        console.log(`✅ Músicas corrigidas: ${correctedCount}`);
        console.log(`❌ Falhas: ${failedCount}`);
        console.log(`📊 Total processado: ${tracksWithInvalidArtists.length}`);
        console.log('');

        if (corrections.length > 0) {
            console.log('🎯 CORREÇÕES REALIZADAS:');
            console.log('-'.repeat(50));
            corrections.forEach((correction, index) => {
                console.log(`${index + 1}. ID ${correction.id}: "${correction.oldArtist}" → "${correction.newArtist}"`);
                console.log(`   Música: "${correction.songName}"`);
                console.log('');
            });
        }

        if (failures.length > 0) {
            console.log('⚠️  FALHAS:');
            console.log('-'.repeat(50));
            failures.forEach((failure, index) => {
                console.log(`${index + 1}. ID ${failure.id}: "${failure.songName}"`);
                console.log(`   Artista atual: "${failure.currentArtist}"`);
                console.log(`   Erro: ${failure.error}`);
                console.log('');
            });
        }

        // 4. Salvar relatório em arquivo
        const fs = require('fs');
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalProcessed: tracksWithInvalidArtists.length,
                corrected: correctedCount,
                failed: failedCount
            },
            corrections: corrections,
            failures: failures
        };

        const reportPath = `artist-correction-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`📄 Relatório salvo em: ${reportPath}`);

    } catch (error) {
        console.error('💥 Erro durante a execução:', error);
        throw error;
    }
}

// Função para verificar estatísticas antes e depois
async function checkDatabaseStats() {
    console.log('📊 VERIFICANDO ESTATÍSTICAS DO BANCO...\n');

    try {
        // Antes da correção
        const beforeStats = await prisma.track.groupBy({
            by: ['artist'],
            where: {
                OR: [
                    { artist: { in: invalidArtistValues } },
                    { artist: null },
                    { artist: '' }
                ]
            },
            _count: true
        });

        console.log('🔍 ANTES da correção:');
        beforeStats.forEach(stat => {
            console.log(`   "${stat.artist || 'NULL/VAZIO'}": ${stat._count} músicas`);
        });

        console.log('');

        // Executar correção
        await fixUnknownArtists();

        console.log('\n' + '='.repeat(60));

        // Depois da correção
        const afterStats = await prisma.track.groupBy({
            by: ['artist'],
            where: {
                OR: [
                    { artist: { in: invalidArtistValues } },
                    { artist: null },
                    { artist: '' }
                ]
            },
            _count: true
        });

        console.log('🔍 DEPOIS da correção:');
        if (afterStats.length === 0) {
            console.log('   ✅ Nenhuma música com artista inválido encontrada!');
        } else {
            afterStats.forEach(stat => {
                console.log(`   "${stat.artist || 'NULL/VAZIO'}": ${stat._count} músicas`);
            });
        }

    } catch (error) {
        console.error('💥 Erro ao verificar estatísticas:', error);
        throw error;
    }
}

// Função para executar o script
async function main() {
    try {
        console.log('🚀 SCRIPT DE CORREÇÃO DE ARTISTAS DESCONHECIDOS');
        console.log('='.repeat(60));
        console.log('Este script irá corrigir registros com artistas inválidos no banco de dados.');
        console.log('Certifique-se de ter um backup antes de executar!\n');

        // Verificar conexão com banco
        await prisma.$connect();
        console.log('✅ Conectado ao banco de dados\n');

        // Executar correção com estatísticas
        await checkDatabaseStats();

        console.log('\n🎉 Script executado com sucesso!');

    } catch (error) {
        console.error('💥 Erro fatal:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('🔌 Desconectado do banco de dados');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    fixUnknownArtists,
    checkDatabaseStats,
    extractArtistFromSongName,
    cleanArtistName
};
