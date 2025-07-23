// test-reset-apis.js
// Script para testar as APIs de reset de contadores

const { PrismaClient } = require('@prisma/client');

async function testResetAPIs() {
    const prisma = new PrismaClient();

    try {
        console.log('🧪 Testando APIs de reset de contadores...');

        // Buscar um usuário de teste
        const testUser = await prisma.user.findFirst({
            where: {
                email: 'vip@nextor.com'
            }
        });

        if (!testUser) {
            console.log('❌ Usuário de teste não encontrado');
            return;
        }

        console.log(`✅ Usuário encontrado: ${testUser.email} (ID: ${testUser.id})`);
        console.log(`📊 Estado atual:`);
        console.log(`   - Contador diário: ${testUser.dailyDownloadCount || 0}`);
        console.log(`   - Requisições semanais: ${testUser.weeklyPackRequests || 0}`);
        console.log(`   - Downloads de playlist: ${testUser.weeklyPlaylistDownloads || 0}`);

        // Atualizar contadores para testar
        await prisma.user.update({
            where: { id: testUser.id },
            data: {
                dailyDownloadCount: 25,
                weeklyPackRequests: 5,
                weeklyPlaylistDownloads: 3
            }
        });

        console.log('✅ Contadores atualizados para teste');

        // Verificar estrutura da tabela User para confirmar campos
        const userFields = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('dailyDownloadCount', 'weeklyPackRequests', 'weeklyPlaylistDownloads', 'lastDownloadReset', 'lastWeekReset')
      ORDER BY column_name;
    `;

        console.log('📋 Campos relacionados a contadores na tabela User:');
        userFields.forEach(field => {
            console.log(`   - ${field.column_name}: ${field.data_type}`);
        });

    } catch (error) {
        console.error('❌ Erro durante teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    testResetAPIs();
}

module.exports = { testResetAPIs };
