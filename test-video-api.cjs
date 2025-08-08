const https = require('https');
const http = require('http');

async function testVideoAPI() {
    try {
        // URL de exemplo de vídeo individual
        const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        console.log('🔍 Testando API de vídeo individual...');

        const response = await new Promise((resolve, reject) => {
            const req = http.get(`http://localhost:3000/api/youtube-downloads?url=${encodeURIComponent(videoUrl)}`, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });
        });

        console.log('📊 Resposta da API:');
        console.log(JSON.stringify(response, null, 2));

        if (response.title) {
            console.log(`\n✅ Vídeo encontrado: ${response.title}`);
            console.log(`📺 Canal: ${response.author}`);
            console.log(`⏱️ Duração: ${response.duration}`);
        }

    } catch (error) {
        console.error('❌ Erro ao testar API:', error.message);
    }
}

testVideoAPI();
