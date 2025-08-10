// test-credit-system.js
// Script simples para testar o sistema de créditos

console.log('🔍 Testando sistema de créditos...');

// Verificar se o CreditContext está disponível
if (window.React) {
    console.log('✅ React disponível');
} else {
    console.log('❌ React não encontrado');
}

// Testar API de créditos
async function testCreditAPI() {
    try {
        const response = await fetch('/api/credits');
        console.log('🌐 Resposta da API de créditos:', response.status);

        if (response.status === 401) {
            console.log('✅ API funcionando - Usuário não autenticado (esperado)');
        } else {
            const data = await response.json();
            console.log('📊 Dados de créditos:', data);
        }
    } catch (error) {
        console.error('❌ Erro na API de créditos:', error);
    }
}

// Testar API de autenticação simples
async function testAuthAPI() {
    try {
        const response = await fetch('/api/auth/simple');
        console.log('🔐 Resposta da API de auth:', response.status);

        if (response.status === 401) {
            console.log('✅ API de auth funcionando - Token não fornecido (esperado)');
        } else {
            const data = await response.json();
            console.log('👤 Dados de auth:', data);
        }
    } catch (error) {
        console.error('❌ Erro na API de auth:', error);
    }
}

// Executar testes
testCreditAPI();
testAuthAPI();

console.log('🏁 Testes concluídos - verifique os logs acima');
