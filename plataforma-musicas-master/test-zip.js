// Teste da API de ZIP
import fetch from 'node-fetch';

async function testZip() {
    try {
        console.log('🔍 Testando API de ZIP...');

        const response = await fetch('http://localhost:3000/api/downloads/zip-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trackIds: [1818, 1819], // IDs de teste
                filename: 'test.zip'
            })
        });

        console.log('📊 Status da resposta:', response.status);
        console.log('📋 Headers:', response.headers);

        if (response.ok) {
            console.log('✅ API respondeu com sucesso');

            // Ler o stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('🏁 Stream finalizado');
                    break;
                }

                const chunk = decoder.decode(value);
                console.log('📦 Chunk recebido:', chunk.length, 'bytes');

                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            console.log('📡 Evento:', data.type, data);
                        } catch (error) {
                            console.error('❌ Erro ao fazer parse:', error);
                        }
                    }
                }
            }
        } else {
            console.log('❌ Erro na API:', response.statusText);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

testZip(); 