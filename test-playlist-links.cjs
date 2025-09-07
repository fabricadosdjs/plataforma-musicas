// Script para testar se os links estão funcionando na página de playlist
const https = require('https');
const http = require('http');

async function testPlaylistLinks() {
    console.log('🔍 Testando links na página de playlist...\n');
    
    try {
        const response = await fetch('http://localhost:3000/playlists/tech-house-anthems-2');
        const html = await response.text();
        
        console.log(`📊 Status: ${response.status}`);
        
        // Verificar se as classes dos links estão presentes
        const hasRedLinks = html.includes('bg-red-500/20');
        const hasBlueLinks = html.includes('bg-blue-500/20');
        const hasGenreLinks = html.includes('/genres/');
        const hasPoolLinks = html.includes('/pools/');
        
        console.log(`🔗 Links de estilo (vermelho): ${hasRedLinks ? '✅' : '❌'}`);
        console.log(`🔗 Links de pool (azul): ${hasBlueLinks ? '✅' : '❌'}`);
        console.log(`🔗 Links para /genres/: ${hasGenreLinks ? '✅' : '❌'}`);
        console.log(`🔗 Links para /pools/: ${hasPoolLinks ? '✅' : '❌'}`);
        
        if (hasRedLinks && hasBlueLinks && hasGenreLinks && hasPoolLinks) {
            console.log('\n🎉 Todos os links estão funcionando!');
        } else {
            console.log('\n⚠️ Alguns links podem não estar funcionando corretamente');
        }
        
    } catch (error) {
        console.log(`❌ Erro na requisição: ${error.message}`);
    }
}

// Executar o teste
testPlaylistLinks().catch(console.error);
