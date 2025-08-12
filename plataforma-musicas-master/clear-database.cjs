// Script para esvaziar todas as tabelas principais do banco
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        await prisma.download.deleteMany();
        await prisma.like.deleteMany();
        await prisma.track.deleteMany();
        await prisma.profile.deleteMany();
        await prisma.user.deleteMany();
        console.log('Todas as tabelas principais foram esvaziadas.');
    } catch (error) {
        console.error('Erro ao esvaziar tabelas:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();
