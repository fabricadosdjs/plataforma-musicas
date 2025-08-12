const https = require('https');
const http = require('http');

async function testVipCheck() {
    try {
        console.log('🔍 Testando verificação de VIP...');
        
        // Testar API de vídeo individual sem autenticação
        console.log('\n1. Testando API sem autenticação:');
        const response1 = await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:3000/api/youtube-downloads?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ', (res) => {
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
        
        console.log('Resposta:', response1);
        
        // Testar API de análise de playlist sem autenticação
        console.log('\n2. Testando API de playlist sem autenticação:');
        const response2 = await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:3000/api/youtube-downloads/analyze-playlist?url=https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMHwPzRNB-EKG5UZoK', (res) => {
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
        
        console.log('Resposta:', response2);
        
    } catch (error) {
        console.error('❌ Erro ao testar:', error.message);
    }
}

testVipCheck();
