// Teste do sistema de download
const testDownload = async () => {
    try {
        console.log('🧪 Testando sistema de download...');

        // Simular uma chave de arquivo
        const testKey = 'Dj Ernani/ISRAEL _ RODOLFFO MARI FERNANDEZ - SEU BRILHO SUMIU (ERNANI REMIX).mp3';

        console.log('📊 Testando API audio-url...');
        const audioUrlResponse = await fetch(`/api/audio-url?key=${encodeURIComponent(testKey)}`);
        console.log('📊 Status audio-url:', audioUrlResponse.status);

        if (audioUrlResponse.ok) {
            const audioUrlData = await audioUrlResponse.json();
            console.log('📊 URL obtida:', audioUrlData.url);

            // Testar o proxy de download
            console.log('📊 Testando proxy de download...');
            const proxyResponse = await fetch(`/api/download-proxy?url=${encodeURIComponent(audioUrlData.url)}&filename=test.mp3`);
            console.log('📊 Status proxy:', proxyResponse.status);

            if (proxyResponse.ok) {
                console.log('✅ Download funcionando corretamente');
            } else {
                const errorText = await proxyResponse.text();
                console.log('❌ Erro no proxy:', errorText);
            }
        } else {
            const errorData = await audioUrlResponse.json();
            console.log('❌ Erro na audio-url:', errorData);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
};

// Executar teste se estiver no browser
if (typeof window !== 'undefined') {
    testDownload();
}

module.exports = { testDownload }; 