const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
    const prisma = new PrismaClient();

    try {
        console.log('🔌 Conectando ao banco...');
        await prisma.$connect();
        console.log('✅ Conexão estabelecida');

        // Testar count
        const count = await prisma.track.count();
        console.log(`📊 Total de tracks: ${count}`);

        // Tentar inserir uma track de teste
        const testTrack = {
            songName: 'Test Song Direct',
            artist: 'Test Artist Direct',
            style: 'Pop',
            version: 'Original Mix',
            pool: 'Test Records',
            bitrate: 320,
            imageUrl: 'https://placehold.co/300x300/1f2937/ffffff?text=TD',
            previewUrl: 'https://files.catbox.moe/testdirect.mp3',
            downloadUrl: 'https://files.catbox.moe/testdirectdownload.mp3',
            releaseDate: new Date('2025-01-22'),
            isCommunity: false,
            uploadedBy: null,
        };

        console.log('🔄 Tentando inserir track diretamente...');
        console.log('📋 Dados:', JSON.stringify(testTrack, null, 2));

        const result = await prisma.track.create({
            data: testTrack
        });

        console.log('✅ Track inserida com sucesso!');
        console.log('📋 Resultado:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Erro:', error);
        console.error('❌ Detalhes:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testPrisma();
