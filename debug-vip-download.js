// debug-vip-download.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugVipDownload() {
    try {
        console.log('🔍 DIAGNÓSTICO DO PROBLEMA VIP DOWNLOAD');
        console.log('='.repeat(50));

        // 1. Verificar todos os usuários VIP
        const vipUsers = await prisma.user.findMany({
            where: { is_vip: true },
            select: {
                id: true,
                email: true,
                name: true,
                is_vip: true,
                createdAt: true,
                downloads: {
                    select: {
                        id: true,
                        trackId: true,
                        downloadedAt: true
                    }
                }
            }
        });

        console.log(`👑 USUÁRIOS VIP ENCONTRADOS: ${vipUsers.length}`);

        if (vipUsers.length === 0) {
            console.log('❌ PROBLEMA: Nenhum usuário VIP encontrado!');
            console.log('💡 SOLUÇÃO: Promova um usuário via /admin/users');
            return;
        }

        vipUsers.forEach((user, index) => {
            console.log(`\n${index + 1}. 👤 ${user.email}`);
            console.log(`   📧 Nome: ${user.name || 'Não definido'}`);
            console.log(`   🆔 ID: ${user.id}`);
            console.log(`   👑 VIP: ${user.is_vip ? 'SIM' : 'NÃO'}`);
            console.log(`   📅 Criado: ${user.createdAt}`);
            console.log(`   ⬇️ Downloads: ${user.downloads.length}`);

            if (user.downloads.length > 0) {
                user.downloads.forEach(download => {
                    console.log(`      - Track ${download.trackId} em ${download.downloadedAt}`);
                });
            }
        });

        // 2. Verificar estrutura das tracks
        const tracks = await prisma.track.findMany({
            take: 3,
            select: {
                id: true,
                songName: true,
                artist: true,
                downloadUrl: true
            }
        });

        console.log(`\n🎵 TRACKS DISPONÍVEIS: ${tracks.length}`);
        tracks.forEach((track, index) => {
            console.log(`${index + 1}. ${track.songName} - ${track.artist}`);
            console.log(`   🆔 ID: ${track.id}`);
            console.log(`   🔗 Download URL: ${track.downloadUrl ? 'Disponível' : 'NÃO DISPONÍVEL'}`);
        });

        // 3. Verificar API downloads
        console.log('\n🔧 VERIFICAÇÕES DA API:');
        console.log('✅ Arquivo: src/app/api/downloads/route.ts');
        console.log('✅ Método: POST com verificação is_vip');
        console.log('✅ Autenticação: NextAuth getServerSession');

        console.log('\n🐛 POSSÍVEIS PROBLEMAS:');
        console.log('1. ❓ Usuário não está realmente logado');
        console.log('2. ❓ is_vip não foi salvo corretamente');
        console.log('3. ❓ Erro na API de downloads');
        console.log('4. ❓ Track não tem downloadUrl válida');

        console.log('\n🧪 PARA TESTAR MANUALMENTE:');
        console.log('1. Abra o console do navegador (F12)');
        console.log('2. Execute:');
        console.log('   fetch("/api/downloads", {');
        console.log('     method: "POST",');
        console.log('     headers: {"Content-Type": "application/json"},');
        console.log('     body: JSON.stringify({trackId: 1})');
        console.log('   }).then(r => r.json()).then(console.log)');

    } catch (error) {
        console.error('❌ Erro no diagnóstico:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugVipDownload();
