// Script para testar o novo sistema de cadastro de usuários
const testNewUserSystem = async () => {
    const baseUrl = 'http://localhost:3000';

    // Dados de teste para criar um usuário
    const newUserData = {
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        password: 'senha123',
        whatsapp: '11999999999',
        valor: 35.00, // VIP Básico
        planName: 'VIP Básico Manual',
        is_vip: true,
        dataPrimeiroPagamento: new Date().toISOString(),
        vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias no futuro
        deemix: false,
        deezerPremium: false,
        isUploader: false
    };

    try {
        console.log('🧪 Testando criação de usuário...');
        console.log('📊 Dados enviados:', JSON.stringify(newUserData, null, 2));

        const response = await fetch(`${baseUrl}/api/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUserData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Usuário criado com sucesso!');
            console.log('📋 Resposta:', JSON.stringify(result, null, 2));
        } else {
            console.log('❌ Erro ao criar usuário:', response.status, result);
        }

    } catch (error) {
        console.error('💥 Erro na requisição:', error);
    }
};

// Executar o teste
testNewUserSystem();
