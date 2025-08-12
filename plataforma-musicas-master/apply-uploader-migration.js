const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyUploaderMigration() {
    try {
        console.log('🔄 Aplicando migração do plano Uploader...');

        // Executar a migração SQL
        await prisma.$executeRaw`
            -- Adicionar campos para o plano Uploader
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isUploader" BOOLEAN DEFAULT false;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderLevel" INTEGER DEFAULT 0;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderExpiration" TIMESTAMP;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderBenefits" JSONB;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderPlan" VARCHAR(50) DEFAULT 'FREE';
        `;

        // Criar índice para melhor performance
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "idx_user_uploader" ON "User"("isUploader", "uploaderPlan");
        `;

        // Atualizar usuários com valor 20 para serem Uploaders
        const uploaderUsers = await prisma.user.updateMany({
            where: {
                valor: 20
            },
            data: {
                isUploader: true,
                uploaderPlan: 'UPLOADER',
                uploaderLevel: 1,
                uploaderBenefits: {
                    dailyDownloads: { enabled: true, limit: 25 },
                    uploadPrivileges: { enabled: true },
                    communityAccess: { enabled: true },
                    uploaderBadge: { enabled: true }
                }
            }
        });

        console.log(`✅ Migração aplicada com sucesso!`);
        console.log(`📊 ${uploaderUsers.count} usuários atualizados para plano Uploader`);

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

applyUploaderMigration(); 