import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFolderField() {
    try {
        console.log('🔍 Testando campo folder...');

        // 1. Verificar se a coluna folder existe
        const tableInfo = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'Track' AND column_name = 'folder'
        `;

        console.log('📋 Informações da coluna folder:', tableInfo);

        // 2. Inserir uma música de teste com folder
        console.log('➕ Inserindo música de teste com folder...');

        const testTrack = await prisma.track.create({
            data: {
                songName: 'Test Folder Song',
                artist: 'Test Artist',
                style: 'Test Style',
                previewUrl: 'https://example.com/preview.mp3',
                downloadUrl: 'https://example.com/download.mp3',
                releaseDate: new Date(),
                pool: 'Test Pool',
                folder: 'Plus Soda Music', // Folder específico
                isCommunity: false
            }
        });

        console.log('✅ Música criada:', testTrack);

        // 3. Verificar se foi salva corretamente
        const savedTrack = await prisma.track.findUnique({
            where: { id: testTrack.id }
        });

        console.log('💾 Música salva no banco:', savedTrack);
        console.log('📁 Campo folder:', savedTrack?.folder);

        // 4. Buscar músicas por folder
        const tracksByFolder = await prisma.track.findMany({
            where: { folder: 'Plus Soda Music' }
        });

        console.log('🔍 Músicas encontradas por folder "Plus Soda Music":', tracksByFolder.length);

        // 5. Limpar dados de teste
        await prisma.track.delete({
            where: { id: testTrack.id }
        });

        console.log('🧹 Dados de teste removidos');

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFolderField()
    .then(() => {
        console.log('✅ Teste concluído');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Teste falhou:', error);
        process.exit(1);
    });
