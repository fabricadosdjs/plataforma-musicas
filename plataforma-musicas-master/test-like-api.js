// Teste da API de likes
const testLikeAPI = async () => {
    try {
        console.log('🧪 Testando API de likes...');
        
        // Teste 1: Verificar se a rota existe
        const response = await fetch('http://localhost:3000/api/tracks/like?trackId=1516', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status da resposta:', response.status);
        console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API funcionando:', data);
        } else {
            const errorText = await response.text();
            console.log('❌ Erro na API:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar API:', error);
    }
};

testLikeAPI(); 