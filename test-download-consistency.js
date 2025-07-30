// Teste da consistência dos botões de download
const testDownloadConsistency = async () => {
    console.log('🧪 Testando consistência dos botões de download...');

    // Teste 1: Verificar se a API de downloads está funcionando
    try {
        const response = await fetch('/api/downloads');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API de downloads funcionando:', {
                dailyDownloadCount: data.dailyDownloadCount,
                downloads: data.downloads,
                isVip: data.isVip,
                dailyLimit: data.dailyLimit
            });
        } else {
            console.log('❌ API de downloads falhou:', response.status);
        }
    } catch (error) {
        console.log('❌ Erro ao testar API de downloads:', error);
    }

    // Teste 2: Verificar se o estado dos downloads é carregado corretamente
    try {
        // Simular um download para testar
        const testTrackId = 1;
        const response = await fetch('/api/downloads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: testTrackId })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Download simulado com sucesso:', {
                success: data.success,
                dailyDownloadCount: data.dailyDownloadCount,
                downloads: data.downloadedTrackIds
            });
        } else {
            console.log('❌ Download simulado falhou:', response.status);
        }
    } catch (error) {
        console.log('❌ Erro ao simular download:', error);
    }

    // Teste 3: Verificar se a página carrega sem erros
    try {
        const response = await fetch('/new');
        console.log('✅ Página de música acessível:', response.status);
    } catch (error) {
        console.log('❌ Erro ao acessar página de música:', error);
    }
};

// Executar teste se estiver no browser
if (typeof window !== 'undefined') {
    testDownloadConsistency();
} else {
    console.log('Script deve ser executado no browser');
} 