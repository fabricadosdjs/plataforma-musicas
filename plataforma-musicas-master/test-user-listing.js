// Script para testar o sistema de listagem de usuários com o novo campo
const testUserListing = async () => {
    const baseUrl = 'http://localhost:3000';

    try {
        console.log('📋 Testando listagem de usuários...');

        const response = await fetch(`${baseUrl}/api/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Usuários listados com sucesso!');
            console.log(`📊 Total de usuários: ${result.users.length}`);

            // Verificar se o campo dataPrimeiroPagamento está presente
            const usersWithFirstPayment = result.users.filter(user => user.dataPrimeiroPagamento);
            console.log(`💰 Usuários com data do primeiro pagamento: ${usersWithFirstPayment.length}`);

            if (usersWithFirstPayment.length > 0) {
                console.log('📅 Exemplo de usuário com primeiro pagamento:');
                const example = usersWithFirstPayment[0];
                console.log(`   - Nome: ${example.name}`);
                console.log(`   - Email: ${example.email}`);
                console.log(`   - Primeiro Pagamento: ${example.dataPrimeiroPagamento}`);
                console.log(`   - Vencimento: ${example.vencimento}`);
                console.log(`   - Valor: R$ ${example.valor}`);
            }
        } else {
            console.log('❌ Erro ao listar usuários:', response.status, result);
        }

    } catch (error) {
        console.error('💥 Erro na requisição:', error);
    }
};

// Executar o teste
testUserListing();
