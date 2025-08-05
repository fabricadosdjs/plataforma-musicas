// Teste da API de downloads
const testDownloadsAPI = async () => {
    try {
        console.log('🧪 Testando API de downloads...');

        // Teste GET
        console.log('📊 Testando GET /api/downloads...');
        const getResponse = await fetch('/api/downloads');
        console.log('📊 Status GET:', getResponse.status);

        if (getResponse.ok) {
            const getData = await getResponse.json();
            console.log('📊 Dados GET:', getData);
        } else {
            const errorData = await getResponse.json();
            console.log('❌ Erro GET:', errorData);
        }

        // Teste POST
        console.log('📊 Testando POST /api/downloads...');
        const postResponse = await fetch('/api/downloads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trackId: 1
            })
        });

        console.log('📊 Status POST:', postResponse.status);

        if (postResponse.ok) {
            const postData = await postResponse.json();
            console.log('📊 Dados POST:', postData);
        } else {
            const errorData = await postResponse.json();
            console.log('❌ Erro POST:', errorData);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
};

// Executar teste se estiver no browser
if (typeof window !== 'undefined') {
    testDownloadsAPI();
}

module.exports = { testDownloadsAPI }; 