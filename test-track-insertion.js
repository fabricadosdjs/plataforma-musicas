const { PrismaClient } = require('@prisma/client');

// Carregar variáveis de ambiente
require('dotenv').config();

const prisma = new PrismaClient();

async function testTrackInsertion() {
    try {
        console.log('🔍 Testando inserção de tracks...');

        // Verificar conexão
        console.log('📡 Testando conexão com o banco...');
        await prisma.$connect();
        console.log('✅ Conexão estabelecida com sucesso!');

        // Verificar se a tabela Track existe
        console.log('📋 Verificando estrutura da tabela Track...');
        const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Track' 
      ORDER BY ordinal_position;
    `;
        console.log('📊 Estrutura da tabela Track:', tableInfo);

        // Testar inserção de uma track simples
        console.log('🧪 Testando inserção de uma track...');
        const testTrack = {
            songName: 'Test Track',
            artist: 'Test Artist',
            style: 'Test Style',
            version: 'Test Version',
            pool: 'Test Pool',
            imageUrl: 'https://placehold.co/64x64/333/fff?text=TT',
            previewUrl: 'https://example.com/preview.mp3',
            downloadUrl: 'https://example.com/download.mp3',
            releaseDate: new Date(),
            isCommunity: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        console.log('📝 Dados da track de teste:', testTrack);

        const result = await prisma.track.create({
            data: testTrack
        });

        console.log('✅ Track inserida com sucesso!', result);

        // Limpar track de teste
        console.log('🧹 Removendo track de teste...');
        await prisma.track.delete({
            where: { id: result.id }
        });
        console.log('✅ Track de teste removida!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);

        if (error.code === 'P2002') {
            console.error('🔑 Erro de constraint único');
        } else if (error.code === 'P2003') {
            console.error('🔗 Erro de foreign key');
        } else if (error.code === 'P2014') {
            console.error('🔄 Erro de relacionamento');
        }

    } finally {
        await prisma.$disconnect();
        console.log('🔌 Conexão fechada');
    }
}

testTrackInsertion();
