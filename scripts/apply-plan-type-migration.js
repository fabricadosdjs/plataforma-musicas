const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function applyMigration() {
    try {
        console.log('🔄 Aplicando migração para adicionar coluna planType...');

        // Verificar se a coluna já existe
        const tableInfo = await prisma.$queryRaw`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User' AND column_name = 'planType'
        `;

        if (tableInfo.length > 0) {
            console.log('✅ Coluna planType já existe!');
            return;
        }

        // Adicionar a coluna planType
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN "planType" TEXT`;
        console.log('✅ Coluna planType adicionada com sucesso!');

        // Atualizar registros existentes baseado no valor
        const result = await prisma.$executeRaw`
            UPDATE "User" 
            SET "planType" = CASE 
                WHEN "valor" >= 38 AND "valor" <= 41.99 THEN 'BASICO'
                WHEN "valor" >= 42 AND "valor" <= 59.99 THEN 'PADRAO'
                WHEN "valor" >= 60 THEN 'COMPLETO'
                ELSE NULL
            END
            WHERE "valor" IS NOT NULL
        `;

        console.log(`✅ ${result} registros atualizados com sucesso!`);

        // Verificar os resultados
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                valor: true,
                planType: true,
                planName: true
            },
            where: {
                valor: { not: null }
            },
            take: 10
        });

        console.log('\n📊 Exemplo de registros atualizados:');
        users.forEach(user => {
            console.log(`- ${user.name}: R$ ${user.valor} → ${user.planType || 'N/A'} (${user.planName || 'Sem nome'})`);
        });

    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

applyMigration();
