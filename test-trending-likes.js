// Teste da funcionalidade de likes na página trending
const testTrendingLikes = async () => {
    console.log('🧪 Testando funcionalidade de likes na página trending...');

    // Teste 1: Verificar se a API de likes está funcionando
    try {
        const response = await fetch('/api/likes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API de likes GET funcionando:', data);
        } else {
            console.log('❌ API de likes GET falhou:', response.status);
        }
    } catch (error) {
        console.log('❌ Erro ao testar API de likes GET:', error);
    }

    // Teste 2: Verificar se a API de trending está funcionando
    try {
        const response = await fetch('/api/tracks/trending');

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API de trending funcionando:', {
                totalTracks: data.tracks?.length || 0,
                sampleTrack: data.tracks?.[0] || null
            });
        } else {
            console.log('❌ API de trending falhou:', response.status);
        }
    } catch (error) {
        console.log('❌ Erro ao testar API de trending:', error);
    }

    // Teste 3: Verificar se a página trending está acessível
    try {
        const response = await fetch('/trending');
        console.log('✅ Página trending acessível:', response.status);
    } catch (error) {
        console.log('❌ Erro ao acessar página trending:', error);
    }
};

// Executar teste se estiver no browser
if (typeof window !== 'undefined') {
    testTrendingLikes();
} else {
    console.log('Script deve ser executado no browser');
} 