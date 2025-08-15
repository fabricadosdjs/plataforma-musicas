// Teste da API audio-url
const testAudioUrlApi = async () => {
    try {
        console.log('🧪 Testando API audio-url...');

        // Simular uma chave de arquivo
        const testKey = 'community/test-track.mp3';

        const response = await fetch(`http://localhost:3000/api/audio-url?key=${encodeURIComponent(testKey)}`);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API funcionando:', data);
        } else {
            const errorText = await response.text();
            console.error('❌ Erro na API:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Erro ao testar API:', error.message);
    }
};

// Executar teste
testAudioUrlApi();





