
pg_dump--data - only--inserts--no - owner--no - privileges - h < host_neon > -U < usuario_neon > -d < database_neon > > dump_neon.sql// Script para criar usuário de teste no banco via Prisma (ES module)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'teste@djpool.com';
    const password = '123456'; // Altere para hash se necessário
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            id: 'user-teste-001',
            name: 'Usuário Teste',
            email,
            password,
            status: 'ativo',
            is_vip: true,
            deemix: true,
            dailyDownloadCount: 0,
            weeklyPackRequests: 0,
            weeklyPlaylistDownloads: 0,
            valor: 0,
            vencimento: new Date('2099-12-31'),
            dataPagamento: new Date(),
            customBenefits: {},
        },
    });
    console.log('Usuário criado/testado:', user);
}


main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
