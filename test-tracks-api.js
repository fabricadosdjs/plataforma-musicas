// Teste da API de tracks
async function testTracksAPI() {
    try {
        console.log('🔍 Testando API /api/tracks...');

        const response = await fetch('/api/tracks');
        console.log('📡 Status da resposta:', response.status);
        console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Dados recebidos:', data);
            console.log('📊 Total de tracks:', data.tracks?.length || 0);

            if (data.tracks && data.tracks.length > 0) {
                console.log('🎵 Primeira track:', data.tracks[0]);
            }
        } else {
            console.error('❌ Erro na resposta:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Detalhes do erro:', errorText);
        }
    } catch (error) {
        console.error('❌ Erro ao testar API:', error);
    }
}

// Executar teste
testTracksAPI();

