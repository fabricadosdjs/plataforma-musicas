const https = require('https');
const http = require('http');

async function testPlaylistAPI() {
    try {
        const url = 'http://localhost:3000/api/youtube-downloads/analyze-playlist?url=https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMHwPzRNB-EKG5UZoK&test=dev123';

        console.log('🔍 Testando API de playlist...');

        const response = await new Promise((resolve, reject) => {
            const req = http.get(url, (res) => {
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

        if (response.videos) {
            console.log(`\n✅ Encontrados ${response.videos.length} vídeos`);
            response.videos.forEach((video, index) => {
                console.log(`${index + 1}. ${video.title}`);
            });
        }

    } catch (error) {
        console.error('❌ Erro ao testar API:', error.message);
    }
}

testPlaylistAPI();
