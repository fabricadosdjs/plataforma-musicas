const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyUploaderSimplifiedMigration() {
    try {
        console.log('🔄 Aplicando migração simplificada dos uploaders...');

        // Remover campos antigos dos uploaders
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "uploaderLevel"`;
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "uploaderExpiration"`;
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "uploaderBenefits"`;
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "uploaderPlan"`;
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "uploaderPlanType"`;
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "uploaderExpirationDate"`;
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "uploaderMonthlyFee"`;
        await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "uploaderStatus"`;

        // Manter apenas o campo isUploader
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isUploader" BOOLEAN DEFAULT false`;

        // Remover índices antigos
        try {
            await prisma.$executeRaw`DROP INDEX IF EXISTS "idx_user_uploader"`;
        } catch (error) {
            console.log('Índice anterior não encontrado, continuando...');
        }

        try {
            await prisma.$executeRaw`DROP INDEX IF EXISTS "idx_user_uploader_plans"`;
        } catch (error) {
            console.log('Índice uploader_plans não encontrado, continuando...');
        }

        // Criar novo índice simplificado (se não existir)
        try {
            await prisma.$executeRaw`CREATE INDEX "idx_user_uploader_simple" ON "User"("isUploader")`;
        } catch (error) {
            console.log('Índice idx_user_uploader_simple já existe, continuando...');
        }

        // Atualizar usuários existentes para remover dados antigos
        await prisma.user.updateMany({
            where: {
                isUploader: true
            },
            data: {
                isUploader: false // Reset para nova lógica
            }
        });

        console.log(`✅ Migração simplificada aplicada com sucesso!`);

        // Verificar usuários existentes
        const totalUsers = await prisma.user.count();
        const uploaderCount = await prisma.user.count({
            where: { isUploader: true }
        });

        console.log(`📈 Total de usuários: ${totalUsers}`);
        console.log(`📤 Uploaders: ${uploaderCount}`);

    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

applyUploaderSimplifiedMigration(); 