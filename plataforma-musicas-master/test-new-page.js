// Teste da página /new
import fetch from 'node-fetch';

async function testNewPage() {
    try {
        console.log('🔍 Testando página /new...');

        // Testar API de tracks
        const apiResponse = await fetch('http://localhost:3000/api/tracks');
        const apiData = await apiResponse.json();

        console.log('📊 Resposta da API:');
        console.log('Status:', apiResponse.status);
        console.log('Tracks encontradas:', apiData.tracks?.length || 0);

        if (apiData.tracks && apiData.tracks.length > 0) {
            console.log('\n🎵 Primeiras tracks:');
            apiData.tracks.slice(0, 3).forEach((track, i) => {
                console.log(`${i + 1}. ${track.songName} - ${track.artist}`);
            });
        } else {
            console.log('❌ Nenhuma track retornada pela API');
        }

        // Testar página /new
        const pageResponse = await fetch('http://localhost:3000/new');
        console.log('\n📄 Status da página /new:', pageResponse.status);

        if (pageResponse.ok) {
            console.log('✅ Página /new carregou com sucesso');
        } else {
            console.log('❌ Erro ao carregar página /new');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

testNewPage(); 