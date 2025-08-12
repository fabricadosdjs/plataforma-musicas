const http = require('http');

async function checkCurrentSession() {
    console.log('🔍 Verificando sessão atual...\n');

    const baseUrl = 'http://localhost:3000';

    try {
        // Testar se há uma sessão ativa
        console.log('📋 Testando sessão atual...');
        const sessionResponse = await makeRequest(`${baseUrl}/api/auth/session`);

        if (sessionResponse.status === 200) {
            const session = sessionResponse.data;
            if (session && session.user) {
                console.log('✅ Usuário logado:');
                console.log(`   - Nome: ${session.user.name}`);
                console.log(`   - Email: ${session.user.email}`);
                console.log(`   - ID: ${session.user.id}`);

                // Verificar se é admin
                const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
                if (isAdmin) {
                    console.log('✅ É ADMIN - pode acessar /admin/users');
                } else {
                    console.log('❌ NÃO É ADMIN - precisa fazer login como admin');
                }
            } else {
                console.log('❌ Nenhum usuário logado');
            }
        } else {
            console.log(`⚠️ Erro ao verificar sessão: ${sessionResponse.status}`);
        }

    } catch (error) {
        console.log('❌ Erro ao verificar sessão:', error.message);
    }

    console.log('\n💡 Para fazer login como admin:');
    console.log('   1. Acesse http://localhost:3000/auth/sign-in');
    console.log('   2. Use as credenciais:');
    console.log('      Email: edersonleonardo@nexorrecords.com.br');
    console.log('      Senha: Eclipse2025*');
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

checkCurrentSession().catch(console.error); 