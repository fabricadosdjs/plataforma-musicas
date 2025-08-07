const http = require('http');

async function checkAdminSession() {
    console.log('🔍 Verificando sessão de admin...\n');

    const baseUrl = 'http://localhost:3000';

    try {
        // Testar se a página de admin está acessível
        console.log('📋 Testando acesso à página de admin...');
        const adminResponse = await makeRequest(`${baseUrl}/admin/users`);

        if (adminResponse.status === 200) {
            console.log('✅ Página de admin acessível');
        } else if (adminResponse.status === 401) {
            console.log('❌ Não autorizado - precisa fazer login como admin');
        } else if (adminResponse.status === 302) {
            console.log('🔄 Redirecionando para login');
        } else {
            console.log(`⚠️ Status inesperado: ${adminResponse.status}`);
        }

        // Testar a API diretamente
        console.log('\n📋 Testando API /api/admin/users...');
        const apiResponse = await makeRequest(`${baseUrl}/api/admin/users`);

        if (apiResponse.status === 200) {
            console.log('✅ API de admin funcionando');
            console.log(`   - Usuários encontrados: ${apiResponse.data?.users?.length || 0}`);
        } else if (apiResponse.status === 401) {
            console.log('❌ API retorna 401 - não autorizado');
            console.log('💡 Você precisa estar logado como admin');
        } else {
            console.log(`⚠️ API retorna status: ${apiResponse.status}`);
        }

    } catch (error) {
        console.log('❌ Erro ao testar:', error.message);
    }

    console.log('\n💡 Para resolver:');
    console.log('   1. Acesse http://localhost:3000/auth/sign-in');
    console.log('   2. Faça login com credenciais de admin:');
    console.log('      Email: edersonleonardo@nexorrecords.com.br');
    console.log('      Senha: Eclipse2025*');
    console.log('   3. Depois acesse http://localhost:3000/admin/users');
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
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

checkAdminSession().catch(console.error); 