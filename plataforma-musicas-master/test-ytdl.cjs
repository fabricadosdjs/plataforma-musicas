const ytdl = require('@distube/ytdl-core');

async function testYtdl() {
    try {
        console.log('🔍 Testando biblioteca ytdl-core...');

        const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        console.log('📋 URL de teste:', testUrl);
        console.log('✅ URL válida:', ytdl.validateURL(testUrl));

        console.log('🔍 Obtendo informações do vídeo...');
        const info = await ytdl.getInfo(testUrl);

        console.log('✅ Informações obtidas com sucesso!');
        console.log('📋 Título:', info.videoDetails.title);
        console.log('📋 Duração:', info.videoDetails.lengthSeconds, 'segundos');
        console.log('📋 Canal:', info.videoDetails.author.name);
        console.log('📋 Visualizações:', info.videoDetails.viewCount);

        console.log('\n🎉 Biblioteca funcionando corretamente!');

    } catch (error) {
        console.error('❌ Erro ao testar ytdl:', error);
        console.log('\n💡 Possíveis soluções:');
        console.log('1. Atualizar a biblioteca: npm install @distube/ytdl-core@latest');
        console.log('2. Verificar se o YouTube não bloqueou temporariamente');
        console.log('3. Tentar com outro vídeo');
    }
}

testYtdl();
