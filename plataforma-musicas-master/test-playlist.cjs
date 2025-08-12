const ytdl = require('@distube/ytdl-core');

async function testPlaylist() {
    try {
        // URL de exemplo de playlist
        const playlistUrl = 'https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMHwPzRNB-EKG5UZoK';

        console.log('🔍 Testando playlist:', playlistUrl);

        const playlistInfo = await ytdl.getInfo(playlistUrl, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        console.log('✅ Informações obtidas com sucesso!');
        console.log('📊 Estrutura da resposta:');
        console.log(Object.keys(playlistInfo));

        // Verificar diferentes possíveis locais dos vídeos
        if (playlistInfo.related_videos) {
            console.log(`📹 related_videos: ${playlistInfo.related_videos.length} vídeos`);
        }

        if (playlistInfo.videos) {
            console.log(`📹 videos: ${playlistInfo.videos.length} vídeos`);
        }

        if (playlistInfo.playlist) {
            console.log(`📹 playlist.videos: ${playlistInfo.playlist.videos?.length || 0} vídeos`);
        }

        if (playlistInfo.entries) {
            console.log(`📹 entries: ${playlistInfo.entries.length} vídeos`);
        }

        // Mostrar alguns vídeos de exemplo
        let videos = [];
        if (playlistInfo.related_videos && Array.isArray(playlistInfo.related_videos)) {
            videos = playlistInfo.related_videos;
        } else if (playlistInfo.videos && Array.isArray(playlistInfo.videos)) {
            videos = playlistInfo.videos;
        } else if (playlistInfo.playlist && playlistInfo.playlist.videos) {
            videos = playlistInfo.playlist.videos;
        } else if (playlistInfo.entries && Array.isArray(playlistInfo.entries)) {
            videos = playlistInfo.entries;
        }

        console.log(`\n📋 Primeiros 3 vídeos encontrados:`);
        videos.slice(0, 3).forEach((video, index) => {
            console.log(`${index + 1}. ${video.title} (ID: ${video.id})`);
        });

    } catch (error) {
        console.error('❌ Erro ao testar playlist:', error.message);
    }
}

testPlaylist();
