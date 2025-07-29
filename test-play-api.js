// Teste simples da API de play
console.log('=== TESTE DA API PLAY ===');

// Simular uma requisição POST para a API de play
const testPlayAPI = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/play', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trackId: 1,
                duration: 120,
                completed: false,
                deviceInfo: 'Test Device'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Resposta:', data);

        if (response.ok) {
            console.log('✅ API de play funcionando corretamente!');
        } else {
            console.log('❌ Erro na API de play:', data.error);
        }

    } catch (error) {
        console.error('❌ Erro ao testar API:', error.message);
    }
};

// Aguardar um pouco para o servidor estar pronto
setTimeout(testPlayAPI, 2000); 