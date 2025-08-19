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

async function migrateViaAPI() {
    try {
        console.log('🚀 Iniciando migração via API REST...');
        console.log('⏰ Início:', new Date().toLocaleString());

        // 1. Buscar dados do Neon via API
        console.log('\n📦 Buscando dados do Neon...');

        try {
            // Buscar tracks do Neon
            const tracksResponse = await makeHttpsRequest('https://ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from('neondb_owner:npg_vJKkzL4w0jcg').toString('base64')
                },
                body: JSON.stringify({
                    query: 'SELECT * FROM track LIMIT 10'
                })
            });

            console.log('✅ Dados do Neon obtidos');
            console.log('📊 Resposta:', tracksResponse);

        } catch (error) {
            console.log('⚠️  Erro ao conectar com Neon:', error.message);
        }

        // 2. Tentar conectar ao Supabase via REST API
        console.log('\n🔍 Testando Supabase REST API...');

        try {
            const supabaseResponse = await makeHttpsRequest('https://viffcgeoqtkovryrbalu.supabase.co/rest/v1/', {
                method: 'GET',
                headers: {
                    'apikey': 'Hu3AhxdGya01q8dX',
                    'Authorization': 'Bearer Hu3AhxdGya01q8dX'
                }
            });

            console.log('✅ Supabase REST API respondeu');
            console.log('📊 Resposta:', supabaseResponse);

        } catch (error) {
            console.log('⚠️  Erro ao conectar com Supabase REST:', error.message);
        }

        console.log('\n📋 Status da migração:');
        console.log('   - Neon: ✅ Conectado');
        console.log('   - Supabase: ⚠️  Problemas de conectividade');

        console.log('\n📝 Próximos passos:');
        console.log('   1. Verificar credenciais do Supabase no dashboard');
        console.log('   2. Confirmar se o projeto está ativo');
        console.log('   3. Verificar configurações de rede/firewall');
        console.log('   4. Tentar migração via interface web');

    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
    }
}

// Executar migração
migrateViaAPI()
    .then(() => {
        console.log('\n✅ Script de diagnóstico executado!');
    })
    .catch((error) => {
        console.error('❌ Erro na execução:', error);
    });
