#!/usr/bin/env node

/**
 * Script para remover TODAS as músicas do banco de dados
 * ⚠️ ATENÇÃO: Este script é DESTRUTIVO e irá remover TODAS as músicas!
 * 
 * Uso:
 * node scripts/clear-all-tracks.js
 * 
 * Opções:
 * --confirm: Confirma a execução sem perguntar
 * --backup: Cria um backup antes de remover
 * --dry-run: Mostra o que seria removido sem executar
 * --force: Força a execução mesmo com erros
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuração do Prisma
const prisma = new PrismaClient();

// Configurações do script
const config = {
    confirm: process.argv.includes('--confirm'),
    backup: process.argv.includes('--backup'),
    dryRun: process.argv.includes('--dry-run'),
    force: process.argv.includes('--force')
};

// Interface para leitura de input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para perguntar ao usuário
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.toLowerCase());
        });
    });
}

// Função para criar backup
async function createBackup() {
    try {
        console.log('📦 Criando backup das músicas...');

        // Buscar todas as músicas
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                version: true,
                pool: true,
                releaseDate: true,
                downloadUrl: true,
                previewUrl: true,
                imageUrl: true,
                bitrate: true,
                releaseId: true,
                folder: true,
                filename: true,
                isCommunity: true,
                uploadedBy: true,
                aiMeta: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (tracks.length === 0) {
            console.log('ℹ️  Nenhuma música encontrada para backup');
            return;
        }

        // Criar nome do arquivo com timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '..', 'backups');
        const backupFile = path.join(backupDir, `tracks-backup-${timestamp}.json`);

        // Criar diretório de backup se não existir
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Salvar backup
        fs.writeFileSync(backupFile, JSON.stringify(tracks, null, 2));

        console.log(`✅ Backup criado com sucesso: ${backupFile}`);
        console.log(`📊 Total de músicas no backup: ${tracks.length}`);

        return backupFile;
    } catch (error) {
        console.error('❌ Erro ao criar backup:', error);
        if (!config.force) {
            throw error;
        }
        return null;
    }
}

// Função para contar músicas
async function countTracks() {
    try {
        const count = await prisma.track.count();
        return count;
    } catch (error) {
        console.error('❌ Erro ao contar músicas:', error);
        return 0;
    }
}

// Função para mostrar estatísticas
async function showStats() {
    try {
        console.log('\n📊 ESTATÍSTICAS ATUAIS:');
        console.log('========================');

        const totalTracks = await prisma.track.count();
        console.log(`Total de músicas: ${totalTracks}`);

        if (totalTracks > 0) {
            // Estatísticas por estilo (style)
            const styleStats = await prisma.track.groupBy({
                by: ['style'],
                _count: {
                    style: true
                },
                orderBy: {
                    _count: {
                        style: 'desc'
                    }
                },
                take: 10
            });

            console.log('\nTop 10 estilos:');
            styleStats.forEach(stat => {
                console.log(`  ${stat.style || 'Sem estilo'}: ${stat._count.style}`);
            });

            // Estatísticas por artista
            const artistStats = await prisma.track.groupBy({
                by: ['artist'],
                _count: {
                    artist: true
                },
                orderBy: {
                    _count: {
                        artist: 'desc'
                    }
                },
                take: 10
            });

            console.log('\nTop 10 artistas:');
            artistStats.forEach(stat => {
                console.log(`  ${stat.artist || 'Sem artista'}: ${stat._count.artist}`);
            });
        }

        console.log('========================\n');
    } catch (error) {
        console.error('❌ Erro ao mostrar estatísticas:', error);
    }
}

// Função para executar a remoção
async function clearAllTracks() {
    try {
        console.log('🗑️  Iniciando remoção de todas as músicas...');

        if (config.dryRun) {
            console.log('🔍 MODO DRY-RUN: Nenhuma música será removida');
            await showStats();
            return;
        }

        // Contar músicas antes da remoção
        const initialCount = await countTracks();
        console.log(`📊 Total de músicas a serem removidas: ${initialCount}`);

        if (initialCount === 0) {
            console.log('ℹ️  Nenhuma música encontrada para remover');
            return;
        }

        // Criar backup se solicitado
        let backupFile = null;
        if (config.backup) {
            backupFile = await createBackup();
        }

        // Executar remoção
        console.log('🗑️  Removendo músicas...');
        const result = await prisma.track.deleteMany({});

        console.log(`✅ Remoção concluída com sucesso!`);
        console.log(`📊 Músicas removidas: ${result.count}`);

        if (backupFile) {
            console.log(`💾 Backup salvo em: ${backupFile}`);
        }

        // Verificar se todas foram removidas
        const finalCount = await countTracks();
        console.log(`📊 Músicas restantes: ${finalCount}`);

        if (finalCount === 0) {
            console.log('🎉 Todas as músicas foram removidas com sucesso!');
        } else {
            console.log('⚠️  Algumas músicas ainda permanecem no banco');
        }

    } catch (error) {
        console.error('❌ Erro durante a remoção:', error);

        if (!config.force) {
            console.log('\n💡 Dica: Use --force para continuar mesmo com erros');
            process.exit(1);
        }
    }
}

// Função principal
async function main() {
    try {
        console.log('🚨 SCRIPT DE REMOÇÃO DE MÚSICAS 🚨');
        console.log('=====================================');
        console.log('⚠️  ATENÇÃO: Este script irá remover TODAS as músicas do banco!');
        console.log('=====================================\n');

        // Mostrar configurações
        console.log('🔧 CONFIGURAÇÕES:');
        console.log(`  Confirmação automática: ${config.confirm ? 'Sim' : 'Não'}`);
        console.log(`  Backup: ${config.backup ? 'Sim' : 'Não'}`);
        console.log(`  Modo dry-run: ${config.dryRun ? 'Sim' : 'Não'}`);
        console.log(`  Forçar execução: ${config.force ? 'Sim' : 'Não'}`);
        console.log('');

        // Mostrar estatísticas atuais
        await showStats();

        // Confirmação do usuário
        if (!config.confirm) {
            console.log('⚠️  ATENÇÃO: Esta ação é IRREVERSÍVEL!');
            console.log('   Todas as músicas serão perdidas permanentemente.');

            const answer = await askQuestion('🤔 Tem certeza que deseja continuar? (digite "SIM" para confirmar): ');

            if (answer !== 'sim') {
                console.log('❌ Operação cancelada pelo usuário');
                process.exit(0);
            }

            // Confirmação adicional
            const finalAnswer = await askQuestion('🚨 ÚLTIMA CHANCE: Digite "REMOVER TUDO" para confirmar: ');

            if (finalAnswer !== 'remover tudo') {
                console.log('❌ Operação cancelada pelo usuário');
                process.exit(0);
            }
        }

        // Executar remoção
        await clearAllTracks();

        console.log('\n✅ Script executado com sucesso!');

    } catch (error) {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promessa rejeitada não tratada:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error);
    process.exit(1);
});

// Executar script
if (require.main === module) {
    main();
}

module.exports = { clearAllTracks, createBackup, countTracks };
