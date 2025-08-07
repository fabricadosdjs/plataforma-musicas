const https = require('https');

async function testContaboAPI() {
    console.log('🧪 Testando APIs do Contabo...\n');

    const baseUrl = 'https://your-site.netlify.app'; // Substitua pelo seu domínio

    // Testar API de listagem de arquivos
    console.log('📁 Testando /api/contabo/files...');
    try {
        const filesResponse = await makeRequest(`${baseUrl}/api/contabo/files?audioOnly=false`);
        console.log('✅ API /api/contabo/files funcionando!');
        console.log(`   - Status: ${filesResponse.status}`);
        console.log(`   - Arquivos: ${filesResponse.data?.count || 0}`);
    } catch (error) {
        console.log('❌ Erro na API /api/contabo/files:');
        console.log(`   - Status: ${error.status || 'N/A'}`);
        console.log(`   - Erro: ${error.message}`);
    }

    console.log('\n📥 Testando /api/contabo/import...');
    try {
        const importResponse = await makeRequest(`${baseUrl}/api/contabo/import`);
        console.log('✅ API /api/contabo/import funcionando!');
        console.log(`   - Status: ${importResponse.status}`);
        console.log(`   - Importáveis: ${importResponse.data?.importableCount || 0}`);
    } catch (error) {
        console.log('❌ Erro na API /api/contabo/import:');
        console.log(`   - Status: ${error.status || 'N/A'}`);
        console.log(`   - Erro: ${error.message}`);
    }

    console.log('\n💡 Se houver erros 500, configure as variáveis de ambiente:');
    console.log('   - CONTABO_ENDPOINT');
    console.log('   - CONTABO_REGION');
    console.log('   - CONTABO_ACCESS_KEY_ID');
    console.log('   - CONTABO_SECRET_ACCESS_KEY');
    console.log('   - CONTABO_BUCKET_NAME');
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                status: 'N/A',
                message: error.message
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject({
                status: 'TIMEOUT',
                message: 'Timeout após 10 segundos'
            });
        });
    });
}

testContaboAPI().catch(console.error); 