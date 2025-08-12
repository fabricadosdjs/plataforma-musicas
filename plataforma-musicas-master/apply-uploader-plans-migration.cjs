const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyUploaderPlansMigration() {
    try {
        console.log('🔄 Aplicando migração dos novos planos Uploader...');

        // Executar a migração SQL - comandos separados
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isUploader" BOOLEAN DEFAULT false`;
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderLevel" INTEGER DEFAULT 0`;
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderExpiration" TIMESTAMP`;
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderBenefits" JSONB`;
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderPlan" VARCHAR(50) DEFAULT 'FREE'`;
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderPlanType" VARCHAR(50) DEFAULT 'FREE'`;
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderExpirationDate" TIMESTAMP`;
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderMonthlyFee" DECIMAL(10,2) DEFAULT 0.00`;
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderStatus" VARCHAR(20) DEFAULT 'INACTIVE'`;

        // Atualizar índice existente
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

        await prisma.$executeRaw`CREATE INDEX "idx_user_uploader_plans" ON "User"("isUploader", "uploaderPlanType", "uploaderStatus")`;

        // Atualizar usuários existentes com valor 20 para serem Uploader BASIC
        const basicUploaders = await prisma.user.updateMany({
            where: {
                valor: 20
            },
            data: {
                isUploader: true,
                uploaderPlanType: 'BASIC',
                uploaderPlan: 'BASIC',
                uploaderLevel: 1,
                uploaderStatus: 'ACTIVE',
                uploaderMonthlyFee: 15.00,
                uploaderBenefits: {
                    dailyDownloads: { enabled: true, limit: 15 },
                    uploadPrivileges: { enabled: true, limit: 10 },
                    communityAccess: { enabled: true },
                    uploaderBadge: { enabled: true },
                    prioritySupport: { enabled: false },
                    exclusiveContent: { enabled: false },
                    analytics: { enabled: false }
                }
            }
        });

        // Criar novos usuários de teste para os planos PRO e ELITE
        const testUsers = [
            {
                email: 'uploader-pro@test.com',
                name: 'Uploader Pro Test',
                valor: 25,
                uploaderPlanType: 'PRO',
                uploaderLevel: 2,
                uploaderMonthlyFee: 25.00,
                uploaderBenefits: {
                    dailyDownloads: { enabled: true, limit: 30 },
                    uploadPrivileges: { enabled: true, limit: 50 },
                    communityAccess: { enabled: true },
                    uploaderBadge: { enabled: true },
                    prioritySupport: { enabled: true },
                    exclusiveContent: { enabled: true },
                    analytics: { enabled: false }
                }
            },
            {
                email: 'uploader-elite@test.com',
                name: 'Uploader Elite Test',
                valor: 35,
                uploaderPlanType: 'ELITE',
                uploaderLevel: 3,
                uploaderMonthlyFee: 35.00,
                uploaderBenefits: {
                    dailyDownloads: { enabled: true, limit: 50 },
                    uploadPrivileges: { enabled: true, limit: -1 },
                    communityAccess: { enabled: true },
                    uploaderBadge: { enabled: true },
                    prioritySupport: { enabled: true },
                    exclusiveContent: { enabled: true },
                    analytics: { enabled: true }
                }
            }
        ];

        for (const userData of testUsers) {
            await prisma.user.upsert({
                where: { email: userData.email },
                update: {
                    isUploader: true,
                    uploaderPlanType: userData.uploaderPlanType,
                    uploaderPlan: userData.uploaderPlanType,
                    uploaderLevel: userData.uploaderLevel,
                    uploaderStatus: 'ACTIVE',
                    uploaderMonthlyFee: userData.uploaderMonthlyFee,
                    uploaderBenefits: userData.uploaderBenefits,
                    valor: userData.valor
                },
                create: {
                    email: userData.email,
                    name: userData.name,
                    isUploader: true,
                    uploaderPlanType: userData.uploaderPlanType,
                    uploaderPlan: userData.uploaderPlanType,
                    uploaderLevel: userData.uploaderLevel,
                    uploaderStatus: 'ACTIVE',
                    uploaderMonthlyFee: userData.uploaderMonthlyFee,
                    uploaderBenefits: userData.uploaderBenefits,
                    valor: userData.valor,
                    status: 'ativo'
                }
            });
        }

        console.log(`✅ Migração aplicada com sucesso!`);
        console.log(`📊 ${basicUploaders.count} usuários atualizados para Uploader BASIC`);
        console.log(`🧪 2 usuários de teste criados (PRO e ELITE)`);

        // Verificar usuários existentes
        const totalUsers = await prisma.user.count();
        const uploaderCount = await prisma.user.count({
            where: { isUploader: true }
        });

        const basicCount = await prisma.user.count({
            where: { uploaderPlanType: 'BASIC' }
        });

        const proCount = await prisma.user.count({
            where: { uploaderPlanType: 'PRO' }
        });

        const eliteCount = await prisma.user.count({
            where: { uploaderPlanType: 'ELITE' }
        });

        console.log(`📈 Total de usuários: ${totalUsers}`);
        console.log(`📤 Uploaders: ${uploaderCount}`);
        console.log(`📊 Distribuição:`);
        console.log(`   • BASIC: ${basicCount}`);
        console.log(`   • PRO: ${proCount}`);
        console.log(`   • ELITE: ${eliteCount}`);

    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

applyUploaderPlansMigration(); 