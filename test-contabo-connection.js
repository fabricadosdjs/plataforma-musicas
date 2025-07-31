// Script para testar a conexão com o Contabo Object Storage
import dotenv from 'dotenv';
const { ContaboStorage } = require('./src/lib/contabo-storage.ts');

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testContaboConnection() {
    try {
        console.log('🔍 Testando conexão com Contabo Storage...');

        // Verificar variáveis de ambiente
        console.log('\n📋 Variáveis de Ambiente:');
        console.log('CONTABO_ENDPOINT:', process.env.CONTABO_ENDPOINT ? '✅ Configurado' : '❌ Não configurado');
        console.log('CONTABO_REGION:', process.env.CONTABO_REGION ? '✅ Configurado' : '❌ Não configurado');
        console.log('CONTABO_ACCESS_KEY:', process.env.CONTABO_ACCESS_KEY ? '✅ Configurado' : '❌ Não configurado');
        console.log('CONTABO_SECRET_KEY:', process.env.CONTABO_SECRET_KEY ? '✅ Configurado' : '❌ Não configurado');
        console.log('CONTABO_BUCKET_NAME:', process.env.CONTABO_BUCKET_NAME ? '✅ Configurado' : '❌ Não configurado');

        // Testar listagem de arquivos
        console.log('\n🔄 Testando listagem de arquivos...');
        const files = await contaboStorage.listFiles();
        console.log(`✅ Conexão bem-sucedida! Encontrados ${files.length} arquivos.`);

        // Testar upload de arquivo pequeno
        console.log('\n📤 Testando upload de arquivo...');
        const testBuffer = Buffer.from('test file content');
        const testKey = 'test/connection-test.txt';

        const uploadUrl = await contaboStorage.uploadFile(testKey, testBuffer, 'text/plain');
        console.log('✅ Upload bem-sucedido!');
        console.log('URL:', uploadUrl);

        // Limpar arquivo de teste
        console.log('\n🗑️ Limpando arquivo de teste...');
        await contaboStorage.deleteFile(testKey);
        console.log('✅ Arquivo de teste removido!');

        console.log('\n🎉 Todos os testes passaram! A conexão está funcionando corretamente.');

    } catch (error) {
        console.error('\n❌ Erro na conexão:', error);
        console.error('\n🔧 Possíveis soluções:');
        console.error('1. Verifique se as variáveis de ambiente estão configuradas');
        console.error('2. Verifique se as credenciais do Contabo estão corretas');
        console.error('3. Verifique se o bucket existe e está acessível');
        console.error('4. Verifique se a região está correta');
    }
}

testContaboConnection();
