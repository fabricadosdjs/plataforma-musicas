const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Executando seed do banco de dados...');

    try {
        // Criar usuário admin básico com UUID
        console.log('👤 Criando usuário admin...');
        await prisma.user.upsert({
            where: { email: 'admin@nextor.com' },
            update: {},
            create: {
                id: uuidv4(),
                name: 'Administrador Nextor',
                email: 'admin@nextor.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hash para 'password'
                valor: 150,
                status: 'ativo',
                is_vip: true,
                deemix: true,
                dailyDownloadCount: 0,
                weeklyPackRequests: 0,
                weeklyPlaylistDownloads: 0,
            }
        });

        // Criar usuário VIP de teste
        console.log('� Criando usuário VIP...');
        await prisma.user.upsert({
            where: { email: 'vip@nextor.com' },
            update: {},
            create: {
                id: uuidv4(),
                name: 'Usuário VIP',
                email: 'vip@nextor.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hash para 'password'
                valor: 100,
                status: 'ativo',
                is_vip: true,
                deemix: true,
                dailyDownloadCount: 0,
                weeklyPackRequests: 0,
                weeklyPlaylistDownloads: 0,
            }
        });

        // Criar algumas tracks de exemplo
        console.log('🎵 Criando tracks de exemplo...');

        const tracks = [
            {
                songName: 'Summer Vibes',
                artist: 'DJ Nextor',
                style: 'House',
                version: 'Original Mix',
                imageUrl: 'https://via.placeholder.com/300x300?text=Summer+Vibes',
                previewUrl: 'https://files.catbox.moe/preview1.mp3',
                downloadUrl: 'https://files.catbox.moe/example1.mp3',
                releaseDate: new Date('2025-07-22')
            },
            {
                songName: 'Night Drive',
                artist: 'Nextor Records',
                style: 'Deep House',
                version: 'Extended Mix',
                imageUrl: 'https://via.placeholder.com/300x300?text=Night+Drive',
                previewUrl: 'https://files.catbox.moe/preview2.mp3',
                downloadUrl: 'https://files.catbox.moe/example2.mp3',
                releaseDate: new Date('2025-07-21')
            },
            {
                songName: 'Tropical Storm',
                artist: 'Various Artists',
                style: 'Progressive House',
                version: 'Radio Edit',
                imageUrl: 'https://via.placeholder.com/300x300?text=Tropical+Storm',
                previewUrl: 'https://files.catbox.moe/preview3.mp3',
                downloadUrl: 'https://files.catbox.moe/example3.mp3',
                releaseDate: new Date('2025-07-20')
            },
            {
                songName: 'Electronic Dreams',
                artist: 'Nextor Productions',
                style: 'Trance',
                version: 'Club Mix',
                imageUrl: 'https://via.placeholder.com/300x300?text=Electronic+Dreams',
                previewUrl: 'https://files.catbox.moe/preview4.mp3',
                downloadUrl: 'https://files.catbox.moe/example4.mp3',
                releaseDate: new Date('2025-07-19')
            },
            {
                songName: 'Midnight Hour',
                artist: 'DJ Nextor',
                style: 'Tech House',
                version: 'Original Mix',
                imageUrl: 'https://via.placeholder.com/300x300?text=Midnight+Hour',
                previewUrl: 'https://files.catbox.moe/preview5.mp3',
                downloadUrl: 'https://files.catbox.moe/example5.mp3',
                releaseDate: new Date('2025-07-18')
            }
        ];

        for (const track of tracks) {
            await prisma.track.create({
                data: track
            });
        }

        console.log('✅ Seed executado com sucesso!');
        console.log(`👥 2 usuários criados`);
        console.log(`🎵 ${tracks.length} tracks criadas`);
        console.log('\n📧 Credenciais de teste:');
        console.log('Admin: admin@nextor.com / password');
        console.log('VIP: vip@nextor.com / password');

    } catch (error) {
        console.error('❌ Erro durante o seed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
