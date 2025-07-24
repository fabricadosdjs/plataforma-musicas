// Teste direto da API tracks
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testTracksAPI() {
    console.log('🔍 TESTANDO API TRACKS DIRETAMENTE\n');

    try {
        // Teste básico
        console.log('📡 Teste 1: Busca básica...');
        const response = await fetch(`${BASE_URL}/api/tracks?limit=5`);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Músicas retornadas: ${data.tracks?.length || 0}`);
            console.log(`📊 Total: ${data.totalCount || data.total || 0}`);

            if (data.tracks && data.tracks.length > 0) {
                console.log(`🎵 Primeira música: "${data.tracks[0].songName}" - ${data.tracks[0].artist}`);
            }
        } else {
            const text = await response.text();
            console.log(`❌ Erro: ${text.substring(0, 200)}...`);
        }

        // Teste filtro de mês
        console.log('\n📡 Teste 2: Filtro de mês 2025-01...');
        const monthResponse = await fetch(`${BASE_URL}/api/tracks?month=2025-01&limit=5`);
        console.log(`Status: ${monthResponse.status}`);

        if (monthResponse.ok) {
            const monthData = await monthResponse.json();
            console.log(`✅ Músicas de janeiro 2025: ${monthData.tracks?.length || 0}`);
            console.log(`📊 Total: ${monthData.totalCount || monthData.total || 0}`);
        } else {
            const text = await monthResponse.text();
            console.log(`❌ Erro: ${text.substring(0, 200)}...`);
        }

        // Teste filtro de mês 2
        console.log('\n📡 Teste 3: Filtro de mês 2025-07...');
        const month2Response = await fetch(`${BASE_URL}/api/tracks?month=2025-07&limit=5`);
        console.log(`Status: ${month2Response.status}`);

        if (month2Response.ok) {
            const month2Data = await month2Response.json();
            console.log(`✅ Músicas de julho 2025: ${month2Data.tracks?.length || 0}`);
            console.log(`📊 Total: ${month2Data.totalCount || month2Data.total || 0}`);
        } else {
            const text = await month2Response.text();
            console.log(`❌ Erro: ${text.substring(0, 200)}...`);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }

    console.log('\n🏁 TESTE DIRETO DA API CONCLUÍDO!');
}

testTracksAPI();
