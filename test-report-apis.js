// Script para testar as APIs de report e copyright
import fetch from 'node-fetch';

async function testReportAPIs() {
    try {
        console.log('🧪 Testando APIs de report e copyright...');

        const testTrack = {
            id: 1,
            songName: "Test Track",
            artist: "Test Artist",
            imageUrl: "https://example.com/image.jpg"
        };

        // Teste da API de report-bug
        console.log('\n📤 Testando API report-bug...');
        const reportResponse = await fetch('http://localhost:3001/api/report-bug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                track: testTrack,
                user: 'test@example.com',
                timestamp: new Date().toISOString(),
                issue: 'Teste de report'
            })
        });

        console.log(`📡 Status report-bug: ${reportResponse.status}`);
        const reportData = await reportResponse.text();
        console.log('📡 Resposta report-bug:', reportData);

        // Teste da API de report-copyright
        console.log('\n📤 Testando API report-copyright...');
        const copyrightResponse = await fetch('http://localhost:3001/api/report-copyright', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                track: testTrack,
                user: 'test@example.com',
                timestamp: new Date().toISOString()
            })
        });

        console.log(`📡 Status report-copyright: ${copyrightResponse.status}`);
        const copyrightData = await copyrightResponse.text();
        console.log('📡 Resposta report-copyright:', copyrightData);

        if (reportResponse.ok && copyrightResponse.ok) {
            console.log('\n✅ APIs funcionando corretamente!');
        } else {
            console.log('\n❌ Erro nas APIs');
        }

    } catch (error) {
        console.error('❌ Erro ao testar APIs:', error);
    }
}

// Executar o teste
testReportAPIs(); 