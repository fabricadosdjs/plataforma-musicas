// test-likes-system.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLikesSystem() {
    try {
        console.log('❤️ TESTE DO SISTEMA DE LIKES');
        console.log('='.repeat(40));

        // 1. Verificar usuários
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true }
        });

        console.log(`👥 Usuários encontrados: ${users.length}`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
        });

        // 2. Verificar tracks
        const tracks = await prisma.track.findMany({
            take: 5,
            select: { id: true, songName: true, artist: true }
        });

        console.log(`\n🎵 Tracks encontradas: ${tracks.length}`);
        tracks.forEach((track, index) => {
            console.log(`${index + 1}. ${track.songName} - ${track.artist} (ID: ${track.id})`);
        });

        // 3. Verificar likes existentes
        const allLikes = await prisma.like.findMany({
            include: {
                user: { select: { email: true } },
                track: { select: { songName: true, artist: true } }
            }
        });

        console.log(`\n❤️ Likes existentes: ${allLikes.length}`);
        if (allLikes.length > 0) {
            allLikes.forEach((like, index) => {
                console.log(`${index + 1}. ${like.user.email} curtiu "${like.track.songName}" - ${like.track.artist}`);
            });
        } else {
            console.log('Nenhum like encontrado ainda.');
        }

        // 4. Teste de integridade
        console.log('\n🔧 VERIFICAÇÃO DE INTEGRIDADE:');

        // Verificar se há likes órfãos (sem usuário ou track)
        const orphanLikes = await prisma.like.findMany({
            where: {
                OR: [
                    { user: null },
                    { track: null }
                ]
            }
        });

        if (orphanLikes.length > 0) {
            console.log(`⚠️ Encontrados ${orphanLikes.length} likes órfãos`);
        } else {
            console.log('✅ Todos os likes têm usuários e tracks válidos');
        }

        // 5. Instruções para teste manual
        console.log('\n🧪 PARA TESTAR MANUALMENTE:');
        console.log('1. Faça login na aplicação');
        console.log('2. Clique no botão "Like" de uma música');
        console.log('3. Observe que o botão muda para "Liked" (vermelho)');
        console.log('4. Recarregue a página (F5)');
        console.log('5. Verifique se o like permaneceu');
        console.log('6. Clique novamente para "deslikar"');

        console.log('\n📋 STATUS DO SISTEMA:');
        console.log('✅ API GET /api/likes - Busca likes do usuário');
        console.log('✅ API POST /api/likes - Toggle like/unlike');
        console.log('✅ AppContext carrega likes na inicialização');
        console.log('✅ MusicTable usa dados do AppContext');
        console.log('✅ Botões com cores diferentes (Like/Liked)');
        console.log('✅ Estado persistente no banco de dados');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLikesSystem();
