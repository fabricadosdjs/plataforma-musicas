// quick-users-check.js
const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
    const prisma = new PrismaClient();

    try {
        console.log('👥 Verificando usuários no banco...');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                dailyDownloadCount: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true
            }
        });

        if (users.length === 0) {
            console.log('❌ Nenhum usuário encontrado no banco');
            return;
        }

        console.log(`✅ ${users.length} usuário(s) encontrado(s):`);
        users.forEach(user => {
            console.log(`  📧 ${user.email}`);
            console.log(`     ID: ${user.id}`);
            console.log(`     Contador diário: ${user.dailyDownloadCount || 0}`);
            console.log(`     Requisições semanais: ${user.weeklyPackRequests || 0}`);
            console.log(`     Downloads playlist: ${user.weeklyPlaylistDownloads || 0}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
