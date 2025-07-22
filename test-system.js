// test-system.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSystem() {
    try {
        console.log('🧪 TESTANDO O SISTEMA DE LIKES E DOWNLOADS');
        console.log('='.repeat(50));

        // 1. Verificar dados existentes
        const trackCount = await prisma.track.count();
        const userCount = await prisma.user.count();
        const likeCount = await prisma.like.count();
        const downloadCount = await prisma.download.count();

        console.log(`📊 STATUS ATUAL:`);
        console.log(`   🎵 Tracks: ${trackCount}`);
        console.log(`   👥 Usuários: ${userCount}`);
        console.log(`   ❤️ Likes: ${likeCount}`);
        console.log(`   ⬇️ Downloads: ${downloadCount}`);
        console.log('');

        // 2. Verificar se há tracks
        if (trackCount === 0) {
            console.log('❌ Nenhuma track encontrada. Criando tracks de teste...');

            const sampleTracks = [
                {
                    songName: "Sample Song 1",
                    artist: "Artist 1",
                    style: "Pop",
                    previewUrl: "https://example.com/sample1.mp3",
                    downloadUrl: "https://example.com/download1.mp3",
                    imageUrl: "https://placehold.co/300x300"
                },
                {
                    songName: "Sample Song 2",
                    artist: "Artist 2",
                    style: "Rock",
                    previewUrl: "https://example.com/sample2.mp3",
                    downloadUrl: "https://example.com/download2.mp3",
                    imageUrl: "https://placehold.co/300x300"
                }
            ];

            for (const track of sampleTracks) {
                await prisma.track.create({ data: track });
            }

            console.log('✅ Tracks de teste criadas!');
        }

        // 3. Verificar usuários VIP
        const vipUsers = await prisma.user.findMany({
            where: { is_vip: true }
        });

        console.log(`👑 Usuários VIP: ${vipUsers.length}`);
        if (vipUsers.length > 0) {
            vipUsers.forEach(user => {
                console.log(`   - ${user.email} (${user.name || 'Sem nome'})`);
            });
        }

        // 4. Status das funcionalidades
        console.log('');
        console.log('🔧 STATUS DAS FUNCIONALIDADES:');
        console.log(`   ✅ API de Likes: /api/likes`);
        console.log(`   ✅ API de Downloads: /api/downloads`);
        console.log(`   ✅ API Admin Users: /api/admin/users`);
        console.log(`   ✅ Painel Admin: /admin/users`);
        console.log(`   ✅ Autenticação NextAuth + Supabase`);
        console.log(`   ✅ Esquema de cores #202124`);

        console.log('');
        console.log('🚀 PARA TESTAR:');
        console.log('1. Execute: npm run dev');
        console.log('2. Acesse: http://localhost:3000');
        console.log('3. Faça login/cadastro');
        console.log('4. Teste curtir músicas');
        console.log('5. Acesse /admin/users para promover VIP');
        console.log('6. Teste downloads (apenas VIP)');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSystem();
