// Teste da API do NextAuth
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testNextAuthAPI() {
    console.log('🔍 TESTANDO API DO NEXTAUTH\n');

    try {
        // Teste 1: Verificar se a API está respondendo
        console.log('📡 Teste 1: Verificando endpoint session...');
        const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log(`Status: ${sessionResponse.status}`);
        console.log(`Content-Type: ${sessionResponse.headers.get('content-type')}`);

        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('✅ Session endpoint funcionando');
            console.log('📄 Resposta:', JSON.stringify(sessionData, null, 2));
        } else {
            const errorText = await sessionResponse.text();
            console.log('❌ Erro na session:', errorText);
        }

        // Teste 2: Verificar providers
        console.log('\n📡 Teste 2: Verificando providers...');
        const providersResponse = await fetch(`${BASE_URL}/api/auth/providers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log(`Status: ${providersResponse.status}`);
        console.log(`Content-Type: ${providersResponse.headers.get('content-type')}`);

        if (providersResponse.ok) {
            const providersData = await providersResponse.json();
            console.log('✅ Providers endpoint funcionando');
            console.log('📄 Providers:', JSON.stringify(providersData, null, 2));
        } else {
            const errorText = await providersResponse.text();
            console.log('❌ Erro nos providers:', errorText);
        }

        // Teste 3: Verificar CSRF token
        console.log('\n📡 Teste 3: Verificando CSRF token...');
        const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log(`Status: ${csrfResponse.status}`);
        console.log(`Content-Type: ${csrfResponse.headers.get('content-type')}`);

        if (csrfResponse.ok) {
            const csrfData = await csrfResponse.json();
            console.log('✅ CSRF endpoint funcionando');
            console.log('📄 CSRF Token:', csrfData.csrfToken?.substring(0, 20) + '...');
        } else {
            const errorText = await csrfResponse.text();
            console.log('❌ Erro no CSRF:', errorText);
        }

        console.log('\n🎉 TESTE CONCLUÍDO!');

    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        console.log('\n🔧 POSSÍVEIS CAUSAS:');
        console.log('1. Servidor não está rodando na porta 3001');
        console.log('2. Problema na configuração do NextAuth');
        console.log('3. Problema na conexão com o banco de dados');
        console.log('4. Variáveis de ambiente faltando');
    }
}

testNextAuthAPI();
