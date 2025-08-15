#!/usr/bin/env node

/**
 * 🎵 Contabo Music Downloader - Script Local (CommonJS)
 * 
 * Este script baixa músicas do Contabo e cria automaticamente
 * pastas organizadas por estilo no seu PC.
 * 
 * Como usar:
 * 1. Instale as dependências: npm install axios fs-extra
 * 2. Execute: node scripts/contabo-downloader.cjs
 * 3. Configure a pasta de destino e outras opções
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

// Configurações
const config = {
    apiUrl: 'http://localhost:3000/api',
    downloadDir: path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'MusicasContabo'),
    batchSize: 5,
    delayBetweenBatches: 2000,
    timeout: 30000,
    maxRetries: 3
};

// Interface para leitura de input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para fazer perguntas
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Função para verificar se o usuário está logado e é VIP/Admin
async function checkUserAuth() {
    try {
        console.log('🔐 Verificando autenticação do usuário...');

        // Verificar se existe um arquivo de sessão
        const sessionFile = path.join(__dirname, 'user-session.json');
        if (await fs.pathExists(sessionFile)) {
            const sessionData = await fs.readJson(sessionFile);
            const now = Date.now();

            // Verificar se a sessão ainda é válida (24 horas)
            if (sessionData.expiresAt > now) {
                console.log('✅ Sessão válida encontrada!');
                return {
                    isAuthenticated: true,
                    user: sessionData.user,
                    isVip: sessionData.user.isVip || sessionData.user.isAdmin,
                    isAdmin: sessionData.user.isAdmin
                };
            }
        }

        // Se não há sessão válida, solicitar login
        console.log('❌ Nenhuma sessão válida encontrada.');
        console.log('🔑 Por favor, faça login na plataforma web primeiro.');

        const email = await askQuestion('📧 Digite seu email: ');
        const password = await askQuestion('🔒 Digite sua senha: ');

        // Tentar fazer login via API
        const loginResponse = await axios.post(`${config.apiUrl}/auth/login`, {
            email,
            password
        }, { timeout: config.timeout });

        if (loginResponse.data.success) {
            const user = loginResponse.data.user;
            const isVip = user.isVip || user.isAdmin;

            if (!isVip) {
                console.log('❌ Acesso negado! Você precisa ser VIP ou Admin para usar este script.');
                return { isAuthenticated: false };
            }

            // Salvar sessão
            const sessionData = {
                user,
                expiresAt: now + (24 * 60 * 60 * 1000) // 24 horas
            };
            await fs.writeJson(sessionFile, sessionData, { spaces: 2 });

            console.log(`✅ Login realizado com sucesso! Olá, ${user.name || user.email}`);
            console.log(`👑 Status: ${user.isAdmin ? 'Admin' : 'VIP'}`);

            return {
                isAuthenticated: true,
                user,
                isVip,
                isAdmin: user.isAdmin
            };
        } else {
            console.log('❌ Falha no login. Verifique suas credenciais.');
            return { isAuthenticated: false };
        }

    } catch (error) {
        console.log('❌ Erro ao verificar autenticação:', error.message);
        console.log('💡 Certifique-se de que a plataforma web está rodando em http://localhost:3000');
        return { isAuthenticated: false };
    }
}

// Função para baixar uma música individual
async function downloadTrack(track, downloadDir) {
    try {
        const fileName = `${track.title} - ${track.artist}.mp3`;
        const filePath = path.join(downloadDir, fileName);

        // Verificar se o arquivo já existe
        if (await fs.pathExists(filePath)) {
            const stats = await fs.stat(filePath);
            if (stats.size > 1000) { // Arquivo maior que 1KB
                console.log(`⏭️  ${fileName} já existe, pulando...`);
                return { success: true, skipped: true, fileName };
            }
        }

        console.log(`⬇️  Baixando: ${fileName}`);

        const response = await axios({
            method: 'GET',
            url: `${config.apiUrl}/admin/download-track`,
            params: { trackId: track.id },
            responseType: 'stream',
            timeout: config.timeout
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`✅ ${fileName} baixado com sucesso!`);
                resolve({ success: true, skipped: false, fileName });
            });
            writer.on('error', reject);
        });

    } catch (error) {
        console.log(`❌ Erro ao baixar ${track.title}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Função para baixar músicas de um estilo específico
async function downloadStyleTracks(style, tracks, downloadDir) {
    const styleDir = path.join(downloadDir, style.toUpperCase());
    await fs.ensureDir(styleDir);

    console.log(`\n🎵 Baixando ${tracks.length} músicas do estilo: ${style.toUpperCase()}`);
    console.log(`📁 Pasta: ${styleDir}`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Baixar em lotes
    for (let i = 0; i < tracks.length; i += config.batchSize) {
        const batch = tracks.slice(i, i + config.batchSize);
        console.log(`\n📦 Processando lote ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(tracks.length / config.batchSize)}`);

        const batchPromises = batch.map(track => downloadTrack(track, styleDir));
        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
            if (result.success) {
                if (result.skipped) {
                    skipCount++;
                } else {
                    successCount++;
                }
            } else {
                errorCount++;
            }
        });

        // Aguardar entre lotes
        if (i + config.batchSize < tracks.length) {
            console.log(`⏳ Aguardando ${config.delayBetweenBatches / 1000}s antes do próximo lote...`);
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
        }
    }

    console.log(`\n📊 Resumo do estilo ${style.toUpperCase()}:`);
    console.log(`✅ Baixados: ${successCount}`);
    console.log(`⏭️  Pulados: ${skipCount}`);
    console.log(`❌ Erros: ${errorCount}`);

    return { successCount, skipCount, errorCount };
}

// Função para baixar músicas de um estilo específico em pasta personalizada
async function downloadStyleTracksCustom(style, tracks, customDownloadDir) {
    const styleDir = path.join(customDownloadDir, style.toUpperCase());
    await fs.ensureDir(styleDir);

    console.log(`\n🎵 Baixando ${tracks.length} músicas do estilo: ${style.toUpperCase()}`);
    console.log(`📁 Pasta: ${styleDir}`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Baixar em lotes
    for (let i = 0; i < tracks.length; i += config.batchSize) {
        const batch = tracks.slice(i, i + config.batchSize);
        console.log(`\n📦 Processando lote ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(tracks.length / config.batchSize)}`);

        const batchPromises = batch.map(track => downloadTrack(track, styleDir));
        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
            if (result.success) {
                if (result.skipped) {
                    skipCount++;
                } else {
                    successCount++;
                }
            } else {
                errorCount++;
            }
        });

        // Aguardar entre lotes
        if (i + config.batchSize < tracks.length) {
            console.log(`⏳ Aguardando ${config.delayBetweenBatches / 1000}s antes do próximo lote...`);
            await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
        }
    }

    console.log(`\n📊 Resumo do estilo ${style.toUpperCase()}:`);
    console.log(`✅ Baixados: ${successCount}`);
    console.log(`⏭️  Pulados: ${skipCount}`);
    console.log(`❌ Erros: ${errorCount}`);

    return { successCount, skipCount, errorCount };
}

// Função principal
async function main() {
    try {
        console.log('🎵 Extrator de Músicas Contabo - Script Local');
        console.log('='.repeat(50));

        // Verificar autenticação
        const auth = await checkUserAuth();
        if (!auth.isAuthenticated) {
            console.log('\n❌ Falha na autenticação. Encerrando...');
            rl.close();
            return;
        }

        console.log('\n📋 Escolha uma opção:');
        console.log('1. Baixar músicas de um estilo específico');
        console.log('2. Baixar todos os estilos');
        console.log('3. Sair');

        const choice = await askQuestion('\n🔢 Digite sua escolha (1-3): ');

        if (choice === '1') {
            // Buscar estilos disponíveis
            const stylesResponse = await axios.get(`${config.apiUrl}/admin/tracks-by-style`);
            const styles = Object.keys(stylesResponse.data);

            console.log('\n🎭 Estilos disponíveis:');
            styles.forEach((style, index) => {
                const count = stylesResponse.data[style].length;
                console.log(`${index + 1}. ${style.toUpperCase()} (${count} músicas)`);
            });

            const styleChoice = await askQuestion('\n🎵 Escolha o estilo (número): ');
            const styleIndex = parseInt(styleChoice) - 1;

            if (styleIndex >= 0 && styleIndex < styles.length) {
                const selectedStyle = styles[styleIndex];
                const tracks = stylesResponse.data[selectedStyle];

                await downloadStyleTracks(selectedStyle, tracks, config.downloadDir);
            } else {
                console.log('❌ Opção inválida!');
            }

        } else if (choice === '2') {
            console.log('\n📁 Escolha a pasta de destino:');
            console.log('1. Pasta padrão (Downloads/MusicasContabo)');
            console.log('2. Pasta personalizada');

            const folderChoice = await askQuestion('\n📂 Digite sua escolha (1-2): ');

            let downloadDir = config.downloadDir;

            if (folderChoice === '2') {
                const customPath = await askQuestion('📁 Digite o caminho completo da pasta: ');
                downloadDir = customPath.trim();

                // Verificar se a pasta existe ou pode ser criada
                try {
                    await fs.ensureDir(downloadDir);
                    console.log(`✅ Pasta configurada: ${downloadDir}`);
                } catch (error) {
                    console.log(`❌ Erro ao criar/acessar a pasta: ${error.message}`);
                    rl.close();
                    return;
                }
            }

            // Buscar todos os estilos
            const stylesResponse = await axios.get(`${config.apiUrl}/admin/tracks-by-style`);
            const styles = Object.keys(stylesResponse.data);

            console.log(`\n🚀 Iniciando download de ${styles.length} estilos...`);
            console.log(`📁 Pasta de destino: ${downloadDir}`);

            let totalSuccess = 0;
            let totalSkip = 0;
            let totalError = 0;

            for (const style of styles) {
                const tracks = stylesResponse.data[style];
                const result = await downloadStyleTracksCustom(style, tracks, downloadDir);

                totalSuccess += result.successCount;
                totalSkip += result.skipCount;
                totalError += result.errorCount;

                // Aguardar entre estilos
                if (style !== styles[styles.length - 1]) {
                    console.log(`\n⏳ Aguardando 3s antes do próximo estilo...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            console.log('\n🎉 Download concluído!');
            console.log('='.repeat(50));
            console.log(`📊 Resumo Geral:`);
            console.log(`✅ Total baixados: ${totalSuccess}`);
            console.log(`⏭️  Total pulados: ${totalSkip}`);
            console.log(`❌ Total erros: ${totalError}`);
            console.log(`📁 Músicas organizadas em: ${downloadDir}`);

        } else if (choice === '3') {
            console.log('👋 Até logo!');
        } else {
            console.log('❌ Opção inválida!');
        }

    } catch (error) {
        console.log('❌ Erro:', error.message);
    } finally {
        rl.close();
    }
}

// Executar se for o arquivo principal
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { downloadStyleTracks, downloadStyleTracksCustom, downloadTrack };
