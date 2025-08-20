const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicates() {
    try {
        console.log('🧹 Iniciando limpeza de dados duplicados...');

        // Limpar downloads duplicados
        console.log('📥 Limpando downloads duplicados...');

        // Encontrar downloads duplicados
        const duplicateDownloads = await prisma.$queryRaw`
      SELECT "userId", "trackId", COUNT(*) as count
      FROM "Download"
      WHERE "userId" IS NOT NULL
      GROUP BY "userId", "trackId"
      HAVING COUNT(*) > 1
      ORDER BY "userId", "trackId"
    `;

        console.log(`Encontrados ${duplicateDownloads.length} grupos de downloads duplicados`);

        for (const duplicate of duplicateDownloads) {
            const { userId, trackId } = duplicate;

            // Manter apenas o download mais recente
            const downloads = await prisma.download.findMany({
                where: { userId, trackId },
                orderBy: { createdAt: 'desc' }
            });

            if (downloads.length > 1) {
                // Deletar todos exceto o mais recente
                const toDelete = downloads.slice(1);
                const deleteIds = toDelete.map(d => d.id);

                await prisma.download.deleteMany({
                    where: { id: { in: deleteIds } }
                });

                console.log(`✅ Limpos ${toDelete.length} downloads duplicados para usuário ${userId}, track ${trackId}`);
            }
        }

        // Limpar likes duplicados
        console.log('❤️ Limpando likes duplicados...');

        const duplicateLikes = await prisma.$queryRaw`
      SELECT "userId", "trackId", COUNT(*) as count
      FROM "Like"
      GROUP BY "userId", "trackId"
      HAVING COUNT(*) > 1
      ORDER BY "userId", "trackId"
    `;

        console.log(`Encontrados ${duplicateLikes.length} grupos de likes duplicados`);

        for (const duplicate of duplicateLikes) {
            const { userId, trackId } = duplicate;

            // Manter apenas o like mais recente
            const likes = await prisma.like.findMany({
                where: { userId, trackId },
                orderBy: { createdAt: 'desc' }
            });

            if (likes.length > 1) {
                // Deletar todos exceto o mais recente
                const toDelete = likes.slice(1);
                const deleteIds = toDelete.map(l => l.id);

                await prisma.like.deleteMany({
                    where: { id: { in: deleteIds } }
                });

                console.log(`✅ Limpos ${toDelete.length} likes duplicados para usuário ${userId}, track ${trackId}`);
            }
        }

        console.log('🎉 Limpeza concluída com sucesso!');

        // Estatísticas finais
        const finalStats = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM "Download") as total_downloads,
        (SELECT COUNT(*) FROM "Like") as total_likes,
        (SELECT COUNT(*) FROM "Play") as total_plays
    `;

        console.log('📊 Estatísticas finais:', finalStats[0]);

    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupDuplicates();



