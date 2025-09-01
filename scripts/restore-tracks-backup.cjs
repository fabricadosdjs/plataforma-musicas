#!/usr/bin/env node

/**
 * Script para restaurar backup de músicas
 * 
 * Uso:
 * node scripts/restore-tracks-backup.js [arquivo-backup]
 * 
 * Exemplos:
 * node scripts/restore-tracks-backup.js
 * node scripts/restore-tracks-backup.js backups/tracks-backup-2024-01-15T10-30-45-123Z.json
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuração do Prisma
const prisma = new PrismaClient();

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

// Função para listar backups disponíveis
function listAvailableBackups() {
    try {
        const backupDir = path.join(__dirname, '..', 'backups');

        if (!fs.existsSync(backupDir)) {
            console.log('❌ Diretório de backups não encontrado');
            return [];
        }

        const files = fs.readdirSync(backupDir)
            .filter(file => file.endsWith('.json') && file.includes('tracks-backup'))
            .sort()
            .reverse(); // Mais recentes primeiro

        if (files.length === 0) {
            console.log('❌ Nenhum backup encontrado');
            return [];
        }

        console.log('📁 Backups disponíveis:');
        files.forEach((file, index) => {
            const filePath = path.join(backupDir, file);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024 / 1024).toFixed(2); // MB
            const date = stats.mtime.toLocaleString('pt-BR');
            console.log(`  ${index + 1}. ${file} (${size} MB) - ${date}`);
        });

        return files;
    } catch (error) {
        console.error('❌ Erro ao listar backups:', error);
        return [];
    }
}

// Função para selecionar backup
async function selectBackup() {
    const backups = listAvailableBackups();

    if (backups.length === 0) {
        return null;
    }

    if (backups.length === 1) {
        console.log(`\n✅ Usando único backup disponível: ${backups[0]}`);
        return path.join(__dirname, '..', 'backups', backups[0]);
    }

    const answer = await askQuestion(`\n🤔 Selecione o backup (1-${backups.length}) ou 'q' para sair: `);

    if (answer === 'q' || answer === 'quit') {
        return null;
    }

    const index = parseInt(answer) - 1;
    if (index >= 0 && index < backups.length) {
        return path.join(__dirname, '..', 'backups', backups[index]);
    } else {
        console.log('❌ Seleção inválida');
        return null;
    }
}

// Função para validar arquivo de backup
function validateBackupFile(backupFile) {
    try {
        if (!fs.existsSync(backupFile)) {
            throw new Error('Arquivo não encontrado');
        }

        const content = fs.readFileSync(backupFile, 'utf8');
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
            throw new Error('Formato inválido: deve ser um array');
        }

        if (data.length === 0) {
            throw new Error('Backup vazio');
        }

        // Validar estrutura básica
        const firstTrack = data[0];
        if (!firstTrack.id || !firstTrack.songName || !firstTrack.artist) {
            throw new Error('Estrutura inválida: campos obrigatórios ausentes');
        }

        return data;
    } catch (error) {
        throw new Error(`Arquivo de backup inválido: ${error.message}`);
    }
}

// Função para verificar conflitos
async function checkConflicts(tracks) {
    const conflicts = [];

    for (const track of tracks) {
        try {
            const existing = await prisma.track.findUnique({
                where: { id: track.id }
            });

            if (existing) {
                conflicts.push({
                    id: track.id,
                    songName: track.songName,
                    artist: track.artist,
                    conflict: 'ID já existe'
                });
            }
        } catch (error) {
            console.warn(`⚠️  Erro ao verificar conflito para ${track.songName}:`, error.message);
        }
    }

    return conflicts;
}

// Função para restaurar backup
async function restoreBackup(tracks, options = {}) {
    const { skipConflicts = false, updateExisting = false } = options;

    let restored = 0;
    let skipped = 0;
    let updated = 0;
    let errors = 0;

    console.log(`🔄 Restaurando ${tracks.length} músicas...`);

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const progress = ((i + 1) / tracks.length * 100).toFixed(1);

        try {
            // Verificar se já existe
            const existing = await prisma.track.findUnique({
                where: { id: track.id }
            });

            if (existing) {
                if (updateExisting) {
                    // Atualizar registro existente
                    await prisma.track.update({
                        where: { id: track.id },
                        data: {
                            songName: track.songName,
                            artist: track.artist,
                            style: track.style,
                            version: track.version,
                            pool: track.pool,
                            releaseDate: track.releaseDate,
                            downloadUrl: track.downloadUrl,
                            previewUrl: track.previewUrl,
                            imageUrl: track.imageUrl,
                            bitrate: track.bitrate,
                            releaseId: track.releaseId,
                            folder: track.folder,
                            filename: track.filename,
                            isCommunity: track.isCommunity,
                            uploadedBy: track.uploadedBy,
                            aiMeta: track.aiMeta,
                            updatedAt: new Date()
                        }
                    });
                    updated++;
                    console.log(`  [${progress}%] ✅ Atualizado: ${track.songName} - ${track.artist}`);
                } else if (skipConflicts) {
                    skipped++;
                    console.log(`  [${progress}%] ⏭️  Pulado: ${track.songName} - ${track.artist} (já existe)`);
                } else {
                    // Tentar criar com novo ID
                    const { id, ...trackData } = track;
                    await prisma.track.create({
                        data: trackData
                    });
                    restored++;
                    console.log(`  [${progress}%] ✅ Restaurado (novo ID): ${track.songName} - ${track.artist}`);
                }
            } else {
                // Criar novo registro
                await prisma.track.create({
                    data: track
                });
                restored++;
                console.log(`  [${progress}%] ✅ Restaurado: ${track.songName} - ${track.artist}`);
            }
        } catch (error) {
            errors++;
            console.error(`  [${progress}%] ❌ Erro: ${track.songName} - ${track.artist}: ${error.message}`);
        }
    }

    return { restored, skipped, updated, errors };
}

// Função principal
async function main() {
    try {
        console.log('🔄 SCRIPT DE RESTAURAÇÃO DE BACKUP 🔄');
        console.log('=====================================\n');

        // Obter arquivo de backup
        let backupFile = process.argv[2];

        if (!backupFile) {
            backupFile = await selectBackup();
            if (!backupFile) {
                console.log('❌ Nenhum backup selecionado');
                return;
            }
        }

        console.log(`📁 Arquivo selecionado: ${backupFile}\n`);

        // Validar arquivo
        console.log('🔍 Validando arquivo de backup...');
        const tracks = validateBackupFile(backupFile);
        console.log(`✅ Backup válido com ${tracks.length} músicas\n`);

        // Verificar conflitos
        console.log('🔍 Verificando conflitos...');
        const conflicts = await checkConflicts(tracks);

        if (conflicts.length > 0) {
            console.log(`⚠️  Encontrados ${conflicts.length} conflitos:`);
            conflicts.slice(0, 5).forEach(conflict => {
                console.log(`  - ${conflict.songName} - ${conflict.artist} (${conflict.conflict})`);
            });
            if (conflicts.length > 5) {
                console.log(`  ... e mais ${conflicts.length - 5} conflitos`);
            }
            console.log('');

            // Perguntar como lidar com conflitos
            const conflictHandling = await askQuestion('🤔 Como lidar com conflitos? (skip/update/abort): ');

            if (conflictHandling === 'abort') {
                console.log('❌ Restauração cancelada');
                return;
            }

            const options = {
                skipConflicts: conflictHandling === 'skip',
                updateExisting: conflictHandling === 'update'
            };

            console.log(`🔧 Opção selecionada: ${conflictHandling === 'skip' ? 'Pular conflitos' : 'Atualizar existentes'}\n`);
        }

        // Confirmação final
        const answer = await askQuestion('🤔 Confirmar restauração? (sim/não): ');
        if (answer !== 'sim') {
            console.log('❌ Restauração cancelada');
            return;
        }

        // Executar restauração
        const startTime = Date.now();
        const result = await restoreBackup(tracks, {
            skipConflicts: conflicts.length > 0 && await askQuestion('Pular conflitos? (sim/não): ') === 'sim',
            updateExisting: conflicts.length > 0 && await askQuestion('Atualizar existentes? (sim/não): ') === 'sim'
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // Mostrar resultados
        console.log('\n📊 RESULTADOS DA RESTAURAÇÃO:');
        console.log('==============================');
        console.log(`✅ Restauradas: ${result.restored}`);
        console.log(`⏭️  Puladas: ${result.skipped}`);
        console.log(`🔄 Atualizadas: ${result.updated}`);
        console.log(`❌ Erros: ${result.errors}`);
        console.log(`⏱️  Duração: ${duration}s`);
        console.log('==============================\n');

        if (result.errors > 0) {
            console.log('⚠️  Alguns erros ocorreram durante a restauração');
        }

        console.log('🎉 Restauração concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro fatal:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { restoreBackup, validateBackupFile, checkConflicts };
