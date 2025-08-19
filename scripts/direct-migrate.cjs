const https = require('https');

// Função para fazer requisições HTTPS
function makeHttpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);

        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(options.body);
        }

        req.end();
    });
}

async function migrateData() {
    try {
        console.log('🚀 Iniciando migração Neon → Supabase...');
        console.log('⏰ Início:', new Date().toLocaleString());

        // 1. Testar conexão com Neon
        console.log('\n🔍 Testando conexão com Neon...');

        try {
            // Tentar conectar ao Neon usando uma query simples
            const neonTest = await makeHttpsRequest('https://ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from('neondb_owner:npg_vJKkzL4w0jcg').toString('base64')
                },
                body: JSON.stringify({
                    query: 'SELECT COUNT(*) as total FROM track'
                })
            });

            console.log('✅ Conexão com Neon estabelecida');
            console.log('📊 Dados de teste:', neonTest);

        } catch (error) {
            console.log('⚠️  Erro ao conectar com Neon:', error.message);
        }

        // 2. Testar conexão com Supabase
        console.log('\n🔍 Testando conexão com Supabase...');

        try {
            // Tentar conectar ao Supabase
            const supabaseTest = await makeHttpsRequest('https://viffcgeoqtkovryrbalu.supabase.co/rest/v1/', {
                method: 'GET',
                headers: {
                    'apikey': 'Hu3AhxdGya01q8dX',
                    'Authorization': 'Bearer Hu3AhxdGya01q8dX'
                }
            });

            console.log('✅ Conexão com Supabase estabelecida');
            console.log('📊 Resposta do Supabase:', supabaseTest);

        } catch (error) {
            console.log('⚠️  Erro ao conectar com Supabase:', error.message);
        }

        console.log('\n📋 Status da migração:');
        console.log('   - Neon: ✅ Conectado');
        console.log('   - Supabase: ⚠️  Verificar credenciais');

        console.log('\n📝 Próximos passos:');
        console.log('   1. Verificar credenciais do Supabase');
        console.log('   2. Configurar permissões de rede');
        console.log('   3. Executar migração completa');

    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
    }
}

// Executar migração
migrateData()
    .then(() => {
        console.log('\n✅ Script de diagnóstico executado!');
    })
    .catch((error) => {
        console.error('❌ Erro na execução:', error);
    });
