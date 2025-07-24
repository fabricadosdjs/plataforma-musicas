// Script para atualizar todas as músicas com style 'Electronic' para 'Italo Disco'
// Execute com: node update-style-italodisco.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tracks = await prisma.track.findMany({
        where: {
            OR: [
                { style: 'Electronic' },
                { style: '' }
            ]
        }
    });
    let updated = 0;
    for (const track of tracks) {
        await prisma.track.update({
            where: { id: track.id },
            data: { style: 'Italo Disco' }
        });
        updated++;
        console.log(`Atualizado: ${track.songName} - ${track.artist}`);
    }
    console.log(`Total de músicas alteradas: ${updated}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
