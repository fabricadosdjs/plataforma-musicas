// Script para listar todos os usuários e perfis para debug de login
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function listUsers() {
    const users = await prisma.user.findMany({
        include: { profile: true }
    });
    console.log('Usuários cadastrados:');
    users.forEach(u => {
        console.log({
            id: u.id,
            email: u.email,
            password: u.password,
            name: u.name,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            profile: u.profile ? {
                name: u.profile.name,
                status: u.profile.status,
                is_vip: u.profile.is_vip,
                valor: u.profile.valor,
                vencimento: u.profile.vencimento,
                dailyDownloadCount: u.profile.dailyDownloadCount,
            } : null
        });
    });
    await prisma.$disconnect();
}

listUsers();
