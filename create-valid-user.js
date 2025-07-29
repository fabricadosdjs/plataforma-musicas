// Script para criar um usuário e perfil de teste com UUID válido
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const userId = uuidv4();
    const email = 'validuser@djpool.com';
    const password = await bcrypt.hash('123456', 10);

    // Cria usuário na tabela users
    const user = await prisma.user.create({
        data: {
            id: userId,
            email,
            password,
        },
    });

    // Cria perfil na tabela profiles
    const profile = await prisma.profile.create({
        data: {
            id: userId,
            name: 'Usuário Válido',
            whatsapp: '+5511999999999',
            valor: 0,
            vencimento: new Date('2099-12-31'),
            dataPagamento: new Date(),
            status: 'ativo',
            deemix: true,
            is_vip: false,
            dailyDownloadCount: 0,
            weeklyPackRequests: 0,
            weeklyPlaylistDownloads: 0,
            lastDownloadReset: null,
            lastWeekReset: null,
            customBenefits: {},
        },
    });

    console.log('Usuário e perfil criados:', { user, profile });
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
