// Script para testar sistema de likes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLikes() {
    try {
        console.log('🧪 Testando sistema de likes...');

        // Verificar usuários disponíveis
        const users = await prisma.user.findMany();
        console.log(`👥 Usuários disponíveis: ${users.length}`);

        if (users.length > 0) {
            const user = users[0];
            console.log(`🔍 Testando com usuário: ${user.email} (ID: ${user.id})`);

            // Verificar tracks disponíveis
            const tracks = await prisma.track.findMany({ take: 3 });
            console.log(`🎵 Tracks disponíveis: ${tracks.length}`);

            if (tracks.length > 0) {
                const track = tracks[0];
                console.log(`🎯 Testando com track: "${track.songName}" (ID: ${track.id})`);

                // Verificar se já existe like
                const existingLike = await prisma.like.findFirst({
                    where: {
                        userId: user.id,
                        trackId: track.id
                    }
                });

                if (existingLike) {
                    console.log('❤️ Like já existe, removendo...');
                    await prisma.like.delete({
                        where: { id: existingLike.id }
                    });
                    console.log('✅ Like removido!');
                } else {
                    console.log('➕ Criando like...');
                    await prisma.like.create({
                        data: {
                            userId: user.id,
                            trackId: track.id
                        }
                    });
                    console.log('✅ Like criado!');
                }

                // Verificar likes do usuário
                const userLikes = await prisma.like.findMany({
                    where: { userId: user.id },
                    include: { track: true }
                });

                console.log(`\n📊 Likes do usuário ${user.email}:`);
                userLikes.forEach(like => {
                    console.log(`- ${like.track.songName} by ${like.track.artist}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Erro no teste de likes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLikes();
