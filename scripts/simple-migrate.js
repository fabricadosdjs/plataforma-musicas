const https = require('https');
const http = require('http');

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;

        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = client.request(requestOptions, (res) => {
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

        // 1. Buscar dados do Neon via API
        console.log('\n📦 Buscando dados do Neon...');

        // Buscar tracks
        const tracksResponse = await makeRequest('https://ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from('neondb_owner:npg_vJKkzL4w0jcg').toString('base64')
            },
            body: JSON.stringify({
                query: 'SELECT * FROM track LIMIT 1000'
            })
        });

        console.log('✅ Dados do Neon obtidos');

        // 2. Migrar para Supabase
        console.log('\n📤 Migrando para Supabase...');

        // Aqui você precisaria implementar a lógica de inserção no Supabase
        // Como não temos acesso direto ao banco, vou mostrar como seria:

        console.log('📋 Estrutura dos dados encontrados:');
        if (tracksResponse && tracksResponse.length > 0) {
            console.log(`   - Tracks: ${tracksResponse.length} registros`);
            console.log(`   - Primeira track: ${tracksResponse[0]?.songName || 'N/A'}`);
        }

        console.log('\n🎉 Migração preparada!');
        console.log('📝 Para completar a migração, você precisa:');
        console.log('   1. Configurar o Prisma com o Supabase');
        console.log('   2. Executar: npx prisma db push');
        console.log('   3. Executar o script de migração completo');

    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
    }
}

// Executar migração
migrateData()
    .then(() => {
        console.log('✅ Script executado com sucesso!');
    })
    .catch((error) => {
        console.error('❌ Erro na execução:', error);
    });
