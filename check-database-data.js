const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseData() {
    try {
        console.log('🔍 Verificando dados no banco de dados...\n');

        // Verificar usuários
        const userCount = await prisma.user.count();
        console.log(`👥 Total de usuários: ${userCount}`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                take: 3,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    is_vip: true,
                    valor: true,
                    createdAt: true
                }
            });
            console.log('\nExemplos de usuários:');
            users.forEach(user => {
                console.log(`  - ${user.name} (${user.email})`);
                console.log(`    VIP: ${user.is_vip ? 'Sim' : 'Não'}`);
                console.log(`    Valor: ${user.valor || 'N/A'}`);
                console.log(`    Criado em: ${user.createdAt}`);
                console.log('');
            });
        }

        // Verificar tracks
        const trackCount = await prisma.track.count();
        console.log(`\n🎵 Total de tracks: ${trackCount}`);

        if (trackCount > 0) {
            const tracks = await prisma.track.findMany({
                take: 5,
                select: {
                    id: true,
                    songName: true,
                    artist: true,
                    style: true,
                    version: true,
                    releaseDate: true,
                    imageUrl: true,
                    previewUrl: true,
                    downloadUrl: true,
                    createdAt: true
                },
                orderBy: {
                    releaseDate: 'desc'
                }
            });
            console.log('\nTracks mais recentes:');
            tracks.forEach(track => {
                console.log(`  - ${track.songName}`);
                console.log(`    Artista: ${track.artist}`);
                console.log(`    Estilo: ${track.style}`);
                console.log(`    Lançamento: ${track.releaseDate}`);
                console.log(`    Versão: ${track.version || 'N/A'}`);
                console.log(`    URL: ${track.downloadUrl ? 'Sim' : 'Não'}`);
                console.log('');
            });
        }

        // Verificar downloads
        const downloadCount = await prisma.download.count();
        console.log(`\n📥 Total de downloads: ${downloadCount}`);

        if (downloadCount > 0) {
            const recentDownloads = await prisma.download.findMany({
                take: 3,
                include: {
                    user: { select: { name: true, email: true } },
                    track: { select: { title: true, artist: true } }
                },
                orderBy: {
                    downloadedAt: 'desc'
                }
            });
            console.log('\nDownloads recentes:');
            recentDownloads.forEach(download => {
                console.log(`  - ${download.user.name} baixou "${download.track.title}" de ${download.track.artist}`);
                console.log(`    Data: ${download.downloadedAt}`);
                console.log('');
            });
        }

        // Verificar plays (se existir)
        try {
            const playCount = await prisma.play.count();
            console.log(`\n▶️ Total de plays: ${playCount}`);

            if (playCount > 0) {
                const recentPlays = await prisma.play.findMany({
                    take: 3,
                    include: {
                        user: { select: { name: true } },
                        track: { select: { title: true, artist: true } }
                    },
                    orderBy: {
                        playedAt: 'desc'
                    }
                });
                console.log('\nPlays recentes:');
                recentPlays.forEach(play => {
                    console.log(`  - ${play.user.name} tocou "${play.track.title}" de ${play.track.artist}`);
                    console.log(`    Duração: ${play.duration || 0} segundos`);
                    console.log(`    Data: ${play.playedAt}`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log('\n❌ Tabela Play não encontrada ou erro ao acessar');
        }

        console.log('\n📊 RESUMO GERAL:');
        console.log(`  👥 Usuários: ${userCount}`);
        console.log(`  🎵 Músicas: ${trackCount}`);
        console.log(`  📥 Downloads: ${downloadCount}`);

        if (userCount === 0 && trackCount === 0) {
            console.log('\n⚠️ ATENÇÃO: O banco de dados parece estar vazio!');
            console.log('   Considere executar o seed para popular com dados de teste.');
        } else if (trackCount === 0) {
            console.log('\n⚠️ ATENÇÃO: Não há músicas cadastradas no sistema!');
        } else if (userCount === 0) {
            console.log('\n⚠️ ATENÇÃO: Não há usuários cadastrados no sistema!');
        } else {
            console.log('\n✅ Banco de dados contém dados!');
        }

    } catch (error) {
        console.error('\n❌ Erro ao verificar banco de dados:', error.message);
        console.error('Detalhes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabaseData();
