// test-admin-login.js
// Script para testar o login do usuário admin

async function testAdminLogin() {
    console.log('🔐 Testando login do usuário admin...');

    try {
        const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: 'admin@nextor.com',
                password: 'admin123',
                callbackUrl: 'http://localhost:3000/new'
            })
        });

        console.log('📊 Status da resposta:', response.status);
        console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('📄 Conteúdo da resposta:', responseText);

        if (response.ok) {
            console.log('✅ Login do admin funcionando!');
        } else {
            console.log('❌ Erro no login do admin');
        }

    } catch (error) {
        console.error('❌ Erro ao testar login:', error);
    }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    testAdminLogin();
}

module.exports = { testAdminLogin };
