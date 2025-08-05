const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function applyDeezerMigration() {
    const prisma = new PrismaClient();

    try {
        console.log('🚀 Aplicando migração do Deezer Premium...');

        // Ler o arquivo de migração
        const migrationPath = path.join(__dirname, 'prisma', 'migrations', 'add_deezer_premium_fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📋 SQL da migração:');
        console.log(migrationSQL);

        // Executar as queries SQL diretamente
        console.log('\n🔧 Executando migração...');

        // Verificar se as colunas já existem
        const checkColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('deezerPremium', 'deezerEmail', 'deezerPassword')
    `;

        console.log('📊 Colunas existentes:', checkColumns);

        if (checkColumns.length === 0) {
            // Adicionar as colunas
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "deezerPremium" BOOLEAN DEFAULT false`;
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "deezerEmail" TEXT`;
            await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "deezerPassword" TEXT`;

            console.log('✅ Colunas do Deezer Premium adicionadas com sucesso!');
        } else {
            console.log('ℹ️ Colunas do Deezer Premium já existem no banco de dados.');
        }

        // Verificar novamente
        const finalCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('deezerPremium', 'deezerEmail', 'deezerPassword')
    `;

        console.log('✅ Verificação final - Colunas presentes:', finalCheck);

    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

applyDeezerMigration(); 