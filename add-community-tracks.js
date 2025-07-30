// Script para adicionar músicas de exemplo da comunidade
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCommunityTracks() {
    try {
        console.log('🎵 Adicionando músicas de exemplo da comunidade...');

        // Buscar alguns usuários VIP para associar às músicas
        const vipUsers = await prisma.user.findMany({
            where: { is_vip: true },
            take: 5
        });

        if (vipUsers.length === 0) {
            console.log('❌ Nenhum usuário VIP encontrado. Criando usuário de exemplo...');

            const exampleUser = await prisma.user.create({
                data: {
                    email: 'dj-community@example.com',
                    name: 'DJ Comunidade',
                    is_vip: true,
                    status: 'ativo'
                }
            });

            vipUsers.push(exampleUser);
        }

        // Músicas de exemplo da comunidade
        const communityTracks = [
            {
                songName: 'Deep House Vibes',
                artist: 'DJ Community',
                style: 'Deep House',
                version: 'Original Mix',
                imageUrl: 'https://i.ibb.co/VqKJ8Lp/deep-house.jpg',
                previewUrl: 'https://example.com/preview1.mp3',
                downloadUrl: 'https://example.com/download1.mp3',
                releaseDate: new Date('2024-01-15'),
                isCommunity: true,
                uploadedBy: vipUsers[0].id
            },
            {
                songName: 'Tech House Groove',
                artist: 'Community Producer',
                style: 'Tech House',
                version: 'Extended Mix',
                imageUrl: 'https://i.ibb.co/VqKJ8Lp/tech-house.jpg',
                previewUrl: 'https://example.com/preview2.mp3',
                downloadUrl: 'https://example.com/download2.mp3',
                releaseDate: new Date('2024-01-20'),
                isCommunity: true,
                uploadedBy: vipUsers[0].id
            },
            {
                songName: 'Progressive Trance',
                artist: 'Trance Master',
                style: 'Progressive Trance',
                version: 'Club Mix',
                imageUrl: 'https://i.ibb.co/VqKJ8Lp/progressive.jpg',
                previewUrl: 'https://example.com/preview3.mp3',
                downloadUrl: 'https://example.com/download3.mp3',
                releaseDate: new Date('2024-01-25'),
                isCommunity: true,
                uploadedBy: vipUsers[0].id
            },
            {
                songName: 'Minimal Techno',
                artist: 'Minimal DJ',
                style: 'Minimal Techno',
                version: 'Original Mix',
                imageUrl: 'https://i.ibb.co/VqKJ8Lp/minimal.jpg',
                previewUrl: 'https://example.com/preview4.mp3',
                downloadUrl: 'https://example.com/download4.mp3',
                releaseDate: new Date('2024-02-01'),
                isCommunity: true,
                uploadedBy: vipUsers[0].id
            },
            {
                songName: 'Melodic House',
                artist: 'Melodic Producer',
                style: 'Melodic House',
                version: 'Extended Mix',
                imageUrl: 'https://i.ibb.co/VqKJ8Lp/melodic.jpg',
                previewUrl: 'https://example.com/preview5.mp3',
                downloadUrl: 'https://example.com/download5.mp3',
                releaseDate: new Date('2024-02-05'),
                isCommunity: true,
                uploadedBy: vipUsers[0].id
            }
        ];

        // Adicionar músicas da comunidade
        for (const track of communityTracks) {
            const existingTrack = await prisma.track.findFirst({
                where: {
                    songName: track.songName,
                    artist: track.artist
                }
            });

            if (!existingTrack) {
                await prisma.track.create({
                    data: track
                });
                console.log(`✅ Adicionada: ${track.songName} - ${track.artist}`);
            } else {
                console.log(`⏭️ Já existe: ${track.songName} - ${track.artist}`);
            }
        }

        console.log('🎉 Músicas da comunidade adicionadas com sucesso!');

        // Contar músicas da comunidade
        const communityCount = await prisma.track.count({
            where: {
                OR: [
                    { isCommunity: true },
                    { uploadedBy: { not: null } }
                ]
            }
        });

        console.log(`📊 Total de músicas da comunidade: ${communityCount}`);

    } catch (error) {
        console.error('❌ Erro ao adicionar músicas da comunidade:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addCommunityTracks(); 