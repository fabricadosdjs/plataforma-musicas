console.log('🎵 Teste Completo do Sistema Deezer');
console.log('====================================');

async function testComplete() {
    try {
        // Teste 1: Verificar se o servidor está rodando
        console.log('\n🔍 Verificando servidor...');
        const serverResponse = await fetch('http://localhost:3000/api/deezer-downloads?query=test');

        if (serverResponse.status === 401) {
            console.log('✅ Servidor rodando (401 = autenticação necessária)');
        } else {
            console.log('❌ Servidor não está rodando ou API não responde');
            return;
        }

        // Teste 2: Verificar estrutura de arquivos
        console.log('\n📁 Verificando estrutura de arquivos...');
        const fs = require('fs');
        const path = require('path');

        const downloadsDir = path.join(process.cwd(), 'downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
            console.log('✅ Diretório downloads criado');
        } else {
            console.log('✅ Diretório downloads existe');
        }

        // Teste 3: Verificar ARL configurado
        console.log('\n🔑 Verificando ARL...');
        const dotenv = require('dotenv');
        dotenv.config({ path: '.env.local' });

        if (process.env.DEEZER_ARL) {
            console.log('✅ ARL configurado:', process.env.DEEZER_ARL.substring(0, 20) + '...');
        } else {
            console.log('❌ ARL não configurado');
        }

        // Teste 4: Verificar arquivos de teste
        console.log('\n📋 Verificando arquivos de teste...');
        const testFile = path.join(downloadsDir, 'test_file.txt');
        fs.writeFileSync(testFile, 'Arquivo de teste para verificar permissões');

        if (fs.existsSync(testFile)) {
            console.log('✅ Permissões de escrita OK');
            fs.unlinkSync(testFile);
        } else {
            console.log('❌ Problema com permissões de escrita');
        }

        console.log('\n🎉 Teste completo finalizado!');
        console.log('💡 Para testar no navegador:');
        console.log('   1. Acesse http://localhost:3000/profile');
        console.log('   2. Faça login como usuário VIP');
        console.log('   3. Clique em "DEEZER PREMIUM"');
        console.log('   4. Teste a funcionalidade');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testComplete();
