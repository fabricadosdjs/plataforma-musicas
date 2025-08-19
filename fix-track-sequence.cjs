const { PrismaClient } = require('@prisma/client');

// Carregar variáveis de ambiente
require('dotenv').config();

const prisma = new PrismaClient();

async function fixTrackSequence() {
    try {
        console.log('🔧 Corrigindo sequência de auto-incremento da tabela Track...');

        // Conectar ao banco
        await prisma.$connect();
        console.log('✅ Conexão estabelecida!');

        // Verificar o valor atual da sequência
        console.log('📊 Verificando sequência atual...');
        const sequenceResult = await prisma.$queryRaw`
      SELECT last_value, is_called 
      FROM "Track_id_seq";
    `;
        console.log('🔢 Sequência atual:', sequenceResult);

        // Verificar o maior ID na tabela
        console.log('🔍 Verificando maior ID na tabela...');
        const maxIdResult = await prisma.$queryRaw`
      SELECT MAX(id) as max_id 
      FROM "Track";
    `;
        console.log('📈 Maior ID encontrado:', maxIdResult);

        const maxId = maxIdResult[0]?.max_id || 0;

        // Corrigir a sequência para o próximo valor correto
        console.log('🔄 Corrigindo sequência...');
        await prisma.$queryRaw`
      SELECT setval('"Track_id_seq"', ${maxId + 1}, true);
    `;
        console.log('✅ Sequência corrigida para:', maxId + 1);

        // Verificar se a correção funcionou
        console.log('🔍 Verificando sequência após correção...');
        const newSequenceResult = await prisma.$queryRaw`
      SELECT last_value, is_called 
      FROM "Track_id_seq";
    `;
        console.log('🔢 Nova sequência:', newSequenceResult);

        // Testar inserção de uma track
        console.log('🧪 Testando inserção após correção...');
        const testTrack = {
            songName: 'Test Track Fixed',
            artist: 'Test Artist Fixed',
            style: 'Test Style',
            version: 'Test Version',
            pool: 'Test Pool',
            imageUrl: 'https://placehold.co/64x64/333/fff?text=TF',
            previewUrl: 'https://example.com/preview-fixed.mp3',
            downloadUrl: 'https://example.com/download-fixed.mp3',
            releaseDate: new Date(),
            isCommunity: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await prisma.track.create({
            data: testTrack
        });

        console.log('✅ Track inserida com sucesso após correção!', result);

        // Limpar track de teste
        await prisma.track.delete({
            where: { id: result.id }
        });
        console.log('✅ Track de teste removida!');

    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
    } finally {
        await prisma.$disconnect();
        console.log('🔌 Conexão fechada');
    }
}

fixTrackSequence();
