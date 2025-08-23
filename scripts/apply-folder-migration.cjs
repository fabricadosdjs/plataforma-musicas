const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyFolderMigration() {
    try {
        console.log('🚀 Iniciando migração da coluna FOLDER...');

        // Verificar se a coluna já existe
        const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tracks' AND column_name = 'folder'
    `;

        if (tableInfo.length > 0) {
            console.log('✅ Coluna FOLDER já existe na tabela tracks');
            return;
        }

        console.log('📝 Adicionando coluna FOLDER...');

        // Adicionar a coluna folder
        await prisma.$executeRaw`ALTER TABLE tracks ADD COLUMN folder VARCHAR(255)`;
        console.log('✅ Coluna FOLDER adicionada com sucesso');

        // Adicionar comentário
        await prisma.$executeRaw`COMMENT ON COLUMN tracks.folder IS 'Coluna para organizar músicas por pasta/álbum no servidor'`;
        console.log('✅ Comentário adicionado na coluna');

        // Criar índice para performance
        await prisma.$executeRaw`CREATE INDEX idx_tracks_folder ON tracks(folder)`;
        console.log('✅ Índice criado na coluna FOLDER');

        // Verificar se foi criada corretamente
        const newTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tracks' AND column_name = 'folder'
    `;

        console.log('📊 Informações da nova coluna:', newTableInfo[0]);

        console.log('🎉 Migração da coluna FOLDER concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar a migração
applyFolderMigration()
    .then(() => {
        console.log('✅ Script de migração executado com sucesso');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Falha na migração:', error);
        process.exit(1);
    });
