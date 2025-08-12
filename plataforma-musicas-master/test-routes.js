// Teste final das rotas principais
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testMainRoutes() {
    console.log('🔍 TESTANDO ROTAS PRINCIPAIS\n');

    const routes = [
        { path: '/', description: 'Página inicial', expectedStatus: 200 },
        { path: '/auth/sign-in', description: 'Login', expectedStatus: 200 },
        { path: '/auth/sign-up', description: 'Registro', expectedStatus: 200 },
        { path: '/new', description: 'Músicas novas (VIP)', expectedStatus: [200, 302, 307] }, // Pode redirecionar se não logado
        { path: '/pro', description: 'Página PRO (VIP)', expectedStatus: [200, 302, 307] },
        { path: '/api/auth/session', description: 'API Session', expectedStatus: 200 },
        { path: '/api/auth/providers', description: 'API Providers', expectedStatus: 200 },
    ];

    let passed = 0;
    let total = routes.length;

    for (const route of routes) {
        try {
            console.log(`📡 Testando: ${route.description} (${route.path})`);

            const response = await fetch(`${BASE_URL}${route.path}`, {
                method: 'GET',
                redirect: 'manual' // Não seguir redirects automaticamente
            });

            const expectedStatuses = Array.isArray(route.expectedStatus)
                ? route.expectedStatus
                : [route.expectedStatus];

            if (expectedStatuses.includes(response.status)) {
                console.log(`   ✅ Status ${response.status} - OK`);
                passed++;
            } else {
                console.log(`   ❌ Status ${response.status} - Esperado: ${expectedStatuses.join(' ou ')}`);
            }

            // Mostrar redirect se houver
            if (response.status >= 300 && response.status < 400) {
                const location = response.headers.get('location');
                console.log(`   🔄 Redirect para: ${location}`);
            }

        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
        }

        console.log('');
    }

    // Relatório final
    console.log('─'.repeat(50));
    console.log(`📊 RELATÓRIO: ${passed}/${total} rotas funcionando`);
    console.log(`📈 Taxa de sucesso: ${Math.round((passed / total) * 100)}%`);

    if (passed === total) {
        console.log('🎉 TODAS AS ROTAS PRINCIPAIS ESTÃO FUNCIONANDO!');
        console.log('✅ Sistema pronto para uso');
    } else {
        console.log('⚠️ Algumas rotas precisam de atenção');
    }

    // Teste específico do middleware
    console.log('\n🛡️ TESTANDO MIDDLEWARE:');

    try {
        // Tentar acessar rota protegida sem login
        const protectedResponse = await fetch(`${BASE_URL}/new`, {
            method: 'GET',
            redirect: 'manual'
        });

        if (protectedResponse.status === 302 || protectedResponse.status === 307) {
            const location = protectedResponse.headers.get('location');
            if (location && location.includes('/auth/sign-in')) {
                console.log('✅ Middleware funcionando - Redirecionando para login');
            } else {
                console.log(`⚠️ Redirect inesperado: ${location}`);
            }
        } else if (protectedResponse.status === 200) {
            console.log('ℹ️ Rota acessível (usuário pode estar logado)');
        } else {
            console.log(`❌ Status inesperado: ${protectedResponse.status}`);
        }

    } catch (error) {
        console.log(`❌ Erro no teste de middleware: ${error.message}`);
    }

    console.log('\n🏁 TESTE COMPLETO!');
}

testMainRoutes();
