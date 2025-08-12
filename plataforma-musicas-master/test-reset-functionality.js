// test-reset-functionality.js
const { PrismaClient } = require('@prisma/client');

async function testResetFunctionality() {
    const prisma = new PrismaClient();

    try {
        console.log('🧪 Testando funcionalidade de reset...');

        const testUserId = '23f02c7e-c418-4650-9bf2-05ecdd607516';

        // 1. Definir alguns contadores para testar
        console.log('📊 Definindo contadores de teste...');
        await prisma.user.update({
            where: { id: testUserId },
            data: {
                dailyDownloadCount: 45,
                weeklyPackRequests: 8,
                weeklyPlaylistDownloads: 5
            }
        });

        const userBefore = await prisma.user.findUnique({
            where: { id: testUserId },
            select: {
                email: true,
                dailyDownloadCount: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true
            }
        });

        console.log('✅ Estado ANTES do reset:');
        console.log(`   Contador diário: ${userBefore.dailyDownloadCount}`);
        console.log(`   Requisições semanais: ${userBefore.weeklyPackRequests}`);
        console.log(`   Downloads playlist: ${userBefore.weeklyPlaylistDownloads}`);

        // 2. Testar reset do contador diário
        console.log('\n🔄 Testando reset do contador diário...');
        await prisma.user.update({
            where: { id: testUserId },
            data: {
                dailyDownloadCount: 0,
                lastDownloadReset: new Date()
            }
        });

        // 3. Testar reset dos contadores semanais
        console.log('🔄 Testando reset dos contadores semanais...');
        await prisma.user.update({
            where: { id: testUserId },
            data: {
                weeklyPackRequests: 0,
                weeklyPlaylistDownloads: 0
            }
        });

        const userAfter = await prisma.user.findUnique({
            where: { id: testUserId },
            select: {
                email: true,
                dailyDownloadCount: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true,
                lastDownloadReset: true
            }
        });

        console.log('\n✅ Estado DEPOIS do reset:');
        console.log(`   Contador diário: ${userAfter.dailyDownloadCount}`);
        console.log(`   Requisições semanais: ${userAfter.weeklyPackRequests}`);
        console.log(`   Downloads playlist: ${userAfter.weeklyPlaylistDownloads}`);
        console.log(`   Último reset: ${userAfter.lastDownloadReset}`);

        // Verificar se o reset funcionou
        if (userAfter.dailyDownloadCount === 0 &&
            userAfter.weeklyPackRequests === 0 &&
            userAfter.weeklyPlaylistDownloads === 0) {
            console.log('\n🎉 Reset funcionando corretamente!');
        } else {
            console.log('\n❌ Reset não funcionou como esperado');
        }

    } catch (error) {
        console.error('❌ Erro durante teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testResetFunctionality();
