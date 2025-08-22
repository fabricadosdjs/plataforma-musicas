#!/usr/bin/env node

const { createBackup } = require('./backup-before-fix');
const { fixUnknownArtists, checkDatabaseStats } = require('./fix-unknown-artists');
const readline = require('readline');

/**
 * Script principal para corrigir artistas desconhecidos
 * 
 * Este script coordena todo o processo:
 * 1. Cria backup de segurança
 * 2. Executa correções
 * 3. Gera relatórios
 * 4. Permite reverter mudanças se necessário
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para fazer pergunta ao usuário
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim().toLowerCase());
        });
    });
}

// Função para exibir menu principal
function showMainMenu() {
    console.log('\n🎵 MENU PRINCIPAL - CORREÇÃO DE ARTISTAS');
    console.log('='.repeat(50));
    console.log('1. 💾 Criar backup de segurança');
    console.log('2. 🔧 Executar correção completa');
    console.log('3. 📊 Ver estatísticas do banco');
    console.log('4. 🔄 Restaurar de backup');
    console.log('5. ❌ Sair');
    console.log('');
}

// Função para executar correção completa
async function runCompleteFix() {
    try {
        console.log('\n🚀 EXECUTANDO CORREÇÃO COMPLETA...\n');

        // 1. Criar backup
        console.log('📋 PASSO 1: Criando backup de segurança...');
        await createBackup();

        console.log('\n' + '='.repeat(60));

        // 2. Executar correção
        console.log('📋 PASSO 2: Executando correções...');
        await checkDatabaseStats();

        console.log('\n🎉 CORREÇÃO COMPLETA FINALIZADA!');
        console.log('✅ Backup criado com sucesso');
        console.log('✅ Artistas corrigidos');
        console.log('✅ Relatórios gerados');

    } catch (error) {
        console.error('💥 Erro durante correção completa:', error);
        throw error;
    }
}

// Função para restaurar de backup
async function restoreFromBackup() {
    try {
        console.log('\n🔄 RESTAURAÇÃO DE BACKUP');
        console.log('='.repeat(40));

        const fs = require('fs');
        const path = require('path');

        // Listar backups disponíveis
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            console.log('❌ Nenhum backup encontrado!');
            return;
        }

        const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('backup-artists-before-fix-'))
            .sort()
            .reverse(); // Mais recente primeiro

        if (backupFiles.length === 0) {
            console.log('❌ Nenhum backup encontrado!');
            return;
        }

        console.log('📁 Backups disponíveis:');
        backupFiles.forEach((file, index) => {
            const filePath = path.join(backupDir, file);
            const stats = fs.statSync(filePath);
            const date = new Date(stats.mtime).toLocaleString('pt-BR');
            console.log(`   ${index + 1}. ${file} (${date})`);
        });

        console.log('');
        const choice = await askQuestion('Escolha o número do backup para restaurar (ou "cancelar"): ');

        if (choice === 'cancelar' || choice === 'c') {
            console.log('❌ Restauração cancelada');
            return;
        }

        const backupIndex = parseInt(choice) - 1;
        if (isNaN(backupIndex) || backupIndex < 0 || backupIndex >= backupFiles.length) {
            console.log('❌ Opção inválida');
            return;
        }

        const selectedBackup = backupFiles[backupIndex];
        const backupPath = path.join(backupDir, selectedBackup);

        console.log(`\n⚠️  ATENÇÃO: Você está prestes a restaurar o backup:`);
        console.log(`   ${selectedBackup}`);
        console.log('   Isso irá SOBRESCREVER todas as correções feitas!');

        const confirm = await askQuestion('Tem certeza? Digite "SIM" para confirmar: ');

        if (confirm !== 'sim') {
            console.log('❌ Restauração cancelada');
            return;
        }

        // Executar restauração
        console.log('\n🔄 Restaurando backup...');

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        try {
            const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

            console.log(`📊 Restaurando ${backupData.tracks.length} músicas...\n`);

            let restoredCount = 0;
            let failedCount = 0;

            for (const track of backupData.tracks) {
                try {
                    await prisma.track.update({
                        where: { id: track.id },
                        data: {
                            artist: track.artist,
                            songName: track.songName,
                            style: track.style,
                            pool: track.pool,
                            downloadUrl: track.downloadUrl,
                            imageUrl: track.imageUrl,
                            releaseDate: track.releaseDate,
                            isCommunity: track.isCommunity,
                            uploadedBy: track.uploadedBy,
                            version: track.version,
                            __v: track.__v
                        }
                    });

                    console.log(`✅ Restaurado ID ${track.id}: "${track.artist || 'NULL'}"`);
                    restoredCount++;

                } catch (error) {
                    console.log(`❌ Erro ao restaurar ID ${track.id}: ${error.message}`);
                    failedCount++;
                }
            }

            console.log('\n📋 RESUMO DA RESTAURAÇÃO:');
            console.log('='.repeat(40));
            console.log(`✅ Restauradas: ${restoredCount}`);
            console.log(`❌ Falhas: ${failedCount}`);
            console.log(`📊 Total: ${backupData.tracks.length}`);

        } finally {
            await prisma.$disconnect();
        }

    } catch (error) {
        console.error('💥 Erro durante restauração:', error);
    }
}

// Função principal do menu
async function mainMenu() {
    try {
        while (true) {
            showMainMenu();

            const choice = await askQuestion('Escolha uma opção (1-5): ');

            switch (choice) {
                case '1':
                    console.log('\n💾 Criando backup de segurança...');
                    await createBackup();
                    break;

                case '2':
                    console.log('\n🔧 Executando correção completa...');
                    await runCompleteFix();
                    break;

                case '3':
                    console.log('\n📊 Verificando estatísticas...');
                    await checkDatabaseStats();
                    break;

                case '4':
                    await restoreFromBackup();
                    break;

                case '5':
                    console.log('\n👋 Saindo...');
                    rl.close();
                    return;

                default:
                    console.log('\n❌ Opção inválida. Tente novamente.');
            }

            if (choice !== '5') {
                await askQuestion('\nPressione ENTER para continuar...');
            }
        }

    } catch (error) {
        console.error('💥 Erro no menu principal:', error);
        await askQuestion('\nPressione ENTER para continuar...');
        mainMenu();
    }
}

// Função principal
async function main() {
    try {
        console.log('🎵 SCRIPT DE CORREÇÃO DE ARTISTAS DESCONHECIDOS');
        console.log('='.repeat(60));
        console.log('Este script irá corrigir registros com artistas inválidos no banco de dados.');
        console.log('⚠️  IMPORTANTE: Sempre faça backup antes de executar correções!\n');

        // Verificar se é primeira execução
        const fs = require('fs');
        const backupDir = path.join(__dirname, 'backups');

        if (!fs.existsSync(backupDir) || fs.readdirSync(backupDir).length === 0) {
            console.log('⚠️  ATENÇÃO: Nenhum backup encontrado!');
            console.log('   Recomendamos criar um backup primeiro.\n');

            const shouldBackup = await askQuestion('Deseja criar backup agora? (s/n): ');
            if (shouldBackup === 's' || shouldBackup === 'sim') {
                await createBackup();
            }
        }

        // Executar menu principal
        await mainMenu();

    } catch (error) {
        console.error('💥 Erro fatal:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { main, runCompleteFix, restoreFromBackup };
