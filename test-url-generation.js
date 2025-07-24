// Teste para verificar se as URLs estão sendo geradas corretamente
import dotenv from 'dotenv';
import { ContaboStorage } from './src/lib/contabo-storage.js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testUrlGeneration() {
    console.log('🔍 Testando geração de URLs...\n');

    try {
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT || 'https://usc1.contabostorage.com',
            region: process.env.CONTABO_REGION || 'us-central-1',
            accessKeyId: process.env.CONTABO_ACCESS_KEY || '',
            secretAccessKey: process.env.CONTABO_SECRET_KEY || '',
            bucketName: process.env.CONTABO_BUCKET_NAME || '',
        });

        // Listar alguns arquivos de áudio
        const audioFiles = await storage.listAudioFiles();
        console.log(`📁 Encontrados ${audioFiles.length} arquivos de áudio`);

        if (audioFiles.length > 0) {
            console.log('\n🎵 URLs geradas:');
            audioFiles.slice(0, 3).forEach((file, index) => {
                console.log(`\n${index + 1}. ${file.filename}`);
                console.log(`   Key: ${file.key}`);
                console.log(`   URL: ${file.url}`);

                // Verificar se a URL não está codificada
                if (file.url.includes('%20') || file.url.includes('async%20')) {
                    console.log('   ❌ URL está incorretamente codificada!');
                } else {
                    console.log('   ✅ URL está correta');
                }
            });
        }

        // Testar geração manual de URL
        console.log('\n🔧 Teste de geração manual:');
        const testKey = 'plataforma-de-musicas/DV - LA DOLCE VITA (DJ IL CUBANO).mp3';
        const generatedUrl = storage.getPublicUrl(testKey);
        console.log(`Key de teste: ${testKey}`);
        console.log(`URL gerada: ${generatedUrl}`);

        // Verificar se a URL é acessível
        console.log('\n🌐 Testando acesso às URLs...');
        if (audioFiles.length > 0) {
            const firstFile = audioFiles[0];
            try {
                const response = await fetch(firstFile.url, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`✅ URL acessível: ${firstFile.filename}`);
                } else {
                    console.log(`❌ URL não acessível (${response.status}): ${firstFile.filename}`);
                }
            } catch (error) {
                console.log(`❌ Erro ao acessar URL: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

testUrlGeneration();
