const { PrismaClient } = require('@prisma/client');
const { restoreLatestBackup } = require('../restore-database.js');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Executando seed do banco de dados...');

    try {
        // Restaurar do backup mais recente
        await restoreLatestBackup();
        console.log('✅ Seed executado com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante o seed:', error);

        // Se falhar, criar pelo menos um usuário admin básico
        console.log('🔧 Criando usuário admin básico...');
        await prisma.user.upsert({
            where: { email: 'admin@exemplo.com' },
            update: {},
            create: {
                name: 'Administrador',
                email: 'admin@exemplo.com',
                password: 'admin123', // Senha temporária
                valor: 60,
                status: 'ativo',
                is_vip: true,
                deemix: true,
                dailyDownloadCount: 0,
                weeklyPackRequests: 0,
                weeklyPlaylistDownloads: 0,
            }
        });
        console.log('✅ Usuário admin criado!');
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
