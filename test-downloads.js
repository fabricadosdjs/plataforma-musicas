// Script para testar downloads do usuário
// Salve como test-downloads.js e execute com: node test-downloads.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUserDownloads(userId) {
    try {
        // Buscar todos os downloads do usuário
        const downloads = await prisma.download.findMany({
            where: { userId },
            select: {
                id: true,
                trackId: true,
                downloadedAt: true,
                createdAt: true
            }
        });
        console.log(`Downloads do usuário ${userId}:`, downloads);
        if (downloads.length === 0) {
            console.log('Nenhum download encontrado para este usuário.');
        }
    } catch (error) {
        console.error('Erro ao buscar downloads:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Troque pelo ID de um usuário válido do seu banco
const USER_ID = 'COLOQUE_O_ID_AQUI';
testUserDownloads(USER_ID);
