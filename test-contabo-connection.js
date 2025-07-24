// Script para testar a conexão com o Contabo Object Storage
import dotenv from 'dotenv';
import { ContaboStorage } from './src/lib/contabo-storage.js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testContaboConnection() {
    console.log('🔍 Testando conexão com Contabo Object Storage...\n');

    try {
        // Configuração de teste (substitua pelas suas credenciais)
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT || 'https://usc1.contabostorage.com',
            region: process.env.CONTABO_REGION || 'us-central-1',
            accessKeyId: process.env.CONTABO_ACCESS_KEY || '',
            secretAccessKey: process.env.CONTABO_SECRET_KEY || '',
            bucketName: process.env.CONTABO_BUCKET_NAME || '',
        });

        // Teste 1: Listar arquivos
        console.log('📁 Teste 1: Listando arquivos do bucket...');
        const files = await storage.listFiles();
        console.log(`✅ Sucesso! Encontrados ${files.length} arquivos`);

        if (files.length > 0) {
            console.log('📋 Primeiros 5 arquivos:');
            files.slice(0, 5).forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.filename} (${(file.size / 1024).toFixed(1)} KB)`);
            });
        }

        // Teste 2: Listar apenas áudios
        console.log('\n🎵 Teste 2: Listando apenas arquivos de áudio...');
        const audioFiles = await storage.listAudioFiles();
        console.log(`✅ Sucesso! Encontrados ${audioFiles.length} arquivos de áudio`);

        if (audioFiles.length > 0) {
            console.log('🎧 Arquivos de áudio encontrados:');
            audioFiles.slice(0, 3).forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.filename}`);
                console.log(`      URL: ${file.url}`);
                console.log(`      Tamanho: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            });
        }

        // Teste 3: Estrutura de pastas
        console.log('\n📂 Teste 3: Analisando estrutura de pastas...');
        const fileTree = await storage.getFileTree();
        console.log('✅ Estrutura de pastas mapeada com sucesso!');
        console.log('📊 Pastas principais:', Object.keys(fileTree));

        // Resumo final
        console.log('\n📈 RESUMO DA CONEXÃO:');
        console.log(`   🗂️  Total de arquivos: ${files.length}`);
        console.log(`   🎵  Arquivos de áudio: ${audioFiles.length}`);
        console.log(`   🖼️  Outros arquivos: ${files.length - audioFiles.length}`);
        console.log(`   📁  Pastas: ${Object.keys(fileTree).length}`);

        // Verificar arquivos prontos para importação
        if (audioFiles.length > 0) {
            console.log('\n🔍 Analisando arquivos para importação...');

            // Simular análise de nomenclatura
            const importableCount = audioFiles.filter(file => {
                const name = file.filename.toLowerCase();
                return name.includes('-') || name.includes('(') || name.includes('[');
            }).length;

            console.log(`✅ ${importableCount} arquivos com nomenclatura estruturada para importação automática`);
        }

        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('💡 Sua integração com o Contabo está funcionando perfeitamente.');

    } catch (error) {
        console.error('\n❌ ERRO NA CONEXÃO:', error.message);
        console.log('\n🔧 DICAS PARA RESOLVER:');
        console.log('   1. Verifique se as credenciais estão corretas no .env.local');
        console.log('   2. Confirme se o endpoint está correto para sua região');
        console.log('   3. Teste as credenciais no painel da Contabo');
        console.log('   4. Verifique se o bucket existe e está acessível');
        console.log('\n📋 CONFIGURAÇÃO NECESSÁRIA NO .env.local:');
        console.log('   CONTABO_ENDPOINT=https://eu2.contabostorage.com');
        console.log('   CONTABO_REGION=eu-central-1');
        console.log('   CONTABO_ACCESS_KEY=sua_access_key_aqui');
        console.log('   CONTABO_SECRET_KEY=sua_secret_key_aqui');
        console.log('   CONTABO_BUCKET_NAME=nome-do-seu-bucket');
    }
}

// Executar teste
testContaboConnection();
