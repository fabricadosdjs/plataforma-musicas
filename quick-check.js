// quick-check.js
const { PrismaClient } = require('@prisma/client');

async function quickCheck() {
    const prisma = new PrismaClient();

    try {
        // Verificar se há tracks
        const tracks = await prisma.track.findMany({ take: 3 });
        console.log(`📊 Encontradas ${tracks.length} tracks`);

        if (tracks.length > 0) {
            console.log('✅ Tracks encontradas:');
            tracks.forEach((track, i) => {
                console.log(`${i + 1}. ${track.songName} - ${track.artist}`);
            });
        }

        // Verificar usuários
        const users = await prisma.user.findMany({ take: 3 });
        console.log(`👥 Encontrados ${users.length} usuários`);

        if (users.length > 0) {
            console.log('✅ Usuários encontrados:');
            users.forEach((user, i) => {
                console.log(`${i + 1}. ${user.email} (VIP: ${user.is_vip ? 'Sim' : 'Não'})`);
            });
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

quickCheck();
