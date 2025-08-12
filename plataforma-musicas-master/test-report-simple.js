import fetch from 'node-fetch';

async function testReportSimple() {
    console.log('🧪 Testando APIs de report...\n');

    const testData = {
        trackId: 123,
        trackName: 'Test Track - Report',
        artist: 'Test Artist',
        issue: 'Problema reportado pelo usuário',
        userEmail: 'test@example.com'
    };

    // Teste sem autenticação (deve falhar)
    console.log('1️⃣ Testando sem autenticação...');
    try {
        const response = await fetch('http://localhost:3000/api/report-bug', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        const result = await response.json();
        console.log('Resultado:', result);
    } catch (error) {
        console.error('Erro:', error.message);
    }

    console.log('\n2️⃣ Testando copyright sem autenticação...');
    try {
        const response = await fetch('http://localhost:3000/api/report-copyright', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        const result = await response.json();
        console.log('Resultado:', result);
    } catch (error) {
        console.error('Erro:', error.message);
    }

    console.log('\n📝 As APIs estão retornando "Não autorizado" porque requerem autenticação.');
    console.log('📝 Para testar completamente, use a interface web em: http://localhost:3000/top-100');
    console.log('📝 Faça login e clique nos botões de report nas músicas.');
}

testReportSimple().catch(console.error); 