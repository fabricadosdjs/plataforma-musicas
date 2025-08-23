import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFolderFeature() {
    try {
        console.log('🧪 Testando funcionalidade da coluna FOLDER...');

        // 1. Verificar se a coluna existe
        console.log('\n1️⃣ Verificando se a coluna FOLDER existe...');
        const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Track' AND column_name = 'folder'
    `;

        if (tableInfo.length === 0) {
            console.log('❌ Coluna FOLDER não encontrada. Execute a migração primeiro.');
            return;
        }

        console.log('✅ Coluna FOLDER encontrada:', tableInfo[0]);

        // 2. Testar inserção com folder
        console.log('\n2️⃣ Testando inserção com campo FOLDER...');

        const testTrack = await prisma.track.create({
            data: {
                songName: 'Test Track with Folder',
                artist: 'Test Artist',
                style: 'Test Style',
                previewUrl: 'https://test.com/preview.mp3',
                downloadUrl: 'https://test.com/download.mp3',
                releaseDate: new Date(),
                folder: 'Test Album 2024'
            }
        });

        console.log('✅ Track criada com sucesso:', {
            id: testTrack.id,
            songName: testTrack.songName,
            folder: testTrack.folder
        });

        // 3. Testar consulta por folder
        console.log('\n3️⃣ Testando consulta por FOLDER...');

        const tracksByFolder = await prisma.track.findMany({
            where: {
                folder: 'Test Album 2024'
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                folder: true
            }
        });

        console.log('✅ Tracks encontradas por folder:', tracksByFolder);

        // 4. Testar consulta com folder nulo
        console.log('\n4️⃣ Testando consulta com FOLDER nulo...');

        const tracksWithoutFolder = await prisma.track.findMany({
            where: {
                folder: null
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                folder: true
            },
            take: 5
        });

        console.log('✅ Tracks sem folder (primeiras 5):', tracksWithoutFolder);

        // 5. Testar atualização de folder
        console.log('\n5️⃣ Testando atualização de FOLDER...');

        const updatedTrack = await prisma.track.update({
            where: { id: testTrack.id },
            data: { folder: 'Updated Album Name' }
        });

        console.log('✅ Track atualizada:', {
            id: updatedTrack.id,
            songName: updatedTrack.songName,
            folder: updatedTrack.folder
        });

        // 6. Limpar dados de teste
        console.log('\n6️⃣ Limpando dados de teste...');

        await prisma.track.delete({
            where: { id: testTrack.id }
        });

        console.log('✅ Dados de teste removidos');

        console.log('\n🎉 Todos os testes passaram com sucesso!');
        console.log('✅ A coluna FOLDER está funcionando perfeitamente');

    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar os testes
testFolderFeature()
    .then(() => {
        console.log('✅ Testes concluídos com sucesso');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Falha nos testes:', error);
        process.exit(1);
    });
