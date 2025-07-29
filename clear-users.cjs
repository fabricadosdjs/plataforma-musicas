// Script para esvaziar apenas as tabelas de usuários e perfis
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearUsers() {
    try {
        await prisma.user.deleteMany();
        console.log('Tabela de usuários foi esvaziada.');
    } catch (error) {
        console.error('Erro ao esvaziar tabelas de usuários:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearUsers();
