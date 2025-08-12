const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testLikes() {
    try {
        console.log('🔍 Testando funcionalidade de likes...');

        // Testar API de likes
        const testTrackId = 1844; // Track da comunidade

        console.log(`📊 Testando like para track ID: ${testTrackId}`);

        // Simular like
        const likeResponse = await fetch('http://localhost:3000/api/tracks/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trackId: testTrackId,
                action: 'like'
            })
        });

        console.log(`📊 Status da resposta de like: ${likeResponse.status}`);

        if (likeResponse.ok) {
            const likeResult = await likeResponse.json();
            console.log('✅ Resultado do like:', likeResult);
        } else {
            const errorData = await likeResponse.json();
            console.log('❌ Erro no like:', errorData);
        }

        // Testar verificação de like
        const checkResponse = await fetch(`http://localhost:3000/api/tracks/like?trackId=${testTrackId}`);

        console.log(`📊 Status da verificação: ${checkResponse.status}`);

        if (checkResponse.ok) {
            const checkResult = await checkResponse.json();
            console.log('✅ Resultado da verificação:', checkResult);
        } else {
            const errorData = await checkResponse.json();
            console.log('❌ Erro na verificação:', errorData);
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar o script
testLikes();
