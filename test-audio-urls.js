// Teste para verificar URLs de áudio
const testUrls = [
    'https://example.com/audio1.mp3',
    'https://example.com/audio2.mp3',
    // Adicione URLs reais das suas músicas aqui
];

async function testAudioUrl(url) {
    try {
        console.log(`🔍 Testando URL: ${url}`);

        const response = await fetch(url, { method: 'HEAD' });
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        if (response.ok) {
            console.log('✅ URL válida');
        } else {
            console.log('❌ URL inválida');
        }
    } catch (error) {
        console.log(`❌ Erro ao testar URL: ${error.message}`);
    }
}

// Testar todas as URLs
testUrls.forEach(testAudioUrl); 