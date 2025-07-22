const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔌 Testando conexão com o banco...');

        // Testar consulta de usuários
        const users = await prisma.user.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                valor: true,
                status: true,
                is_vip: true,
                dailyDownloadCount: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true
            }
        });

        console.log(`👥 Encontrados ${users.length} usuários:`);
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - VIP: ${user.is_vip} - Valor: R$${user.valor}`);
        });

        // Testar consulta de tracks
        const tracks = await prisma.track.findMany({
            take: 3,
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true
            }
        });

        console.log(`🎵 Encontradas ${tracks.length} músicas:`);
        tracks.forEach(track => {
            console.log(`- ${track.songName} by ${track.artist} (${track.style})`);
        });

        console.log('✅ Conexão com banco funcionando perfeitamente!');

    } catch (error) {
        console.error('❌ Erro de conexão:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
