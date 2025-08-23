import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFolderAPI() {
    try {
        console.log('🔍 Testando APIs para campo folder...');

        // 1. Inserir uma música de teste com folder
        console.log('➕ Inserindo música de teste...');

        const testTrack = await prisma.track.create({
            data: {
                songName: 'API Test Folder Song',
                artist: 'API Test Artist',
                style: 'API Test Style',
                previewUrl: 'https://example.com/preview.mp3',
                downloadUrl: 'https://example.com/download.mp3',
                releaseDate: new Date(),
                pool: 'Test Pool',
                folder: 'Plus Soda Music',
                isCommunity: false
            }
        });

        console.log('✅ Música criada:', testTrack.id);

        // 2. Testar se a API /api/tracks/new retorna o folder
        console.log('\n🔍 Testando API /api/tracks/new...');
        try {
            const response = await fetch('http://localhost:3000/api/tracks/new');
            if (response.ok) {
                const data = await response.json();
                const trackWithFolder = data.tracks.find(t => t.id === testTrack.id);
                if (trackWithFolder) {
                    console.log('✅ API /api/tracks/new retornou folder:', trackWithFolder.folder);
                } else {
                    console.log('⚠️ Música não encontrada na API /api/tracks/new');
                }
            } else {
                console.log('❌ Erro na API /api/tracks/new:', response.status);
            }
        } catch (error) {
            console.log('⚠️ Não foi possível testar API (servidor pode não estar rodando):', error.message);
        }

        // 3. Testar se a API /api/tracks/genre retorna o folder
        console.log('\n🔍 Testando API /api/tracks/genre...');
        try {
            const response = await fetch(`http://localhost:3000/api/tracks/genre/${encodeURIComponent('API Test Style')}`);
            if (response.ok) {
                const data = await response.json();
                const trackWithFolder = data.tracks.find(t => t.id === testTrack.id);
                if (trackWithFolder) {
                    console.log('✅ API /api/tracks/genre retornou folder:', trackWithFolder.folder);
                } else {
                    console.log('⚠️ Música não encontrada na API /api/tracks/genre');
                }
            } else {
                console.log('❌ Erro na API /api/tracks/genre:', response.status);
            }
        } catch (error) {
            console.log('⚠️ Não foi possível testar API (servidor pode não estar rodando):', error.message);
        }

        // 4. Testar se a API /api/tracks/pool retorna o folder
        console.log('\n🔍 Testando API /api/tracks/pool...');
        try {
            const response = await fetch(`http://localhost:3000/api/tracks/pool/${encodeURIComponent('Test Pool')}`);
            if (response.ok) {
                const data = await response.json();
                const trackWithFolder = data.tracks.find(t => t.id === testTrack.id);
                if (trackWithFolder) {
                    console.log('✅ API /api/tracks/pool retornou folder:', trackWithFolder.folder);
                } else {
                    console.log('⚠️ Música não encontrada na API /api/tracks/pool');
                }
            } else {
                console.log('❌ Erro na API /api/tracks/pool:', response.status);
            }
        } catch (error) {
            console.log('⚠️ Não foi possível testar API (servidor pode não estar rodando):', error.message);
        }

        // 5. Limpar dados de teste
        await prisma.track.delete({
            where: { id: testTrack.id }
        });

        console.log('\n🧹 Dados de teste removidos');

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFolderAPI()
    .then(() => {
        console.log('\n✅ Teste concluído');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Teste falhou:', error);
        process.exit(1);
    });
