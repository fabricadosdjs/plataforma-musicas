// Teste da API de likes
const testLikesAPI = async () => {
    try {
        console.log('🧪 Testando API de likes...');

        // Simular uma requisição de like
        const response = await fetch('/api/tracks/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trackId: 1,
                action: 'like'
            })
        });

        console.log('📊 Status da resposta:', response.status);
        console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('📊 Dados da resposta:', data);

        if (response.ok) {
            console.log('✅ API de likes funcionando corretamente');
        } else {
            console.log('❌ Erro na API de likes:', data);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
};

// Executar teste se estiver no browser
if (typeof window !== 'undefined') {
    testLikesAPI();
}

module.exports = { testLikesAPI }; 