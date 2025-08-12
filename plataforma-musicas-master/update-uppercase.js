// Script para deixar artista e nome da música com letra maiúscula no banco de dados
// Execute com: node update-uppercase.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

async function main() {
    const tracks = await prisma.track.findMany();
    let updated = 0;

    for (const track of tracks) {
        const newSongName = toTitleCase(track.songName);
        const newArtist = toTitleCase(track.artist);
        await prisma.track.update({
            where: { id: track.id },
            data: {
                songName: newSongName,
                artist: newArtist,
            }
        });
        updated++;
        console.log(`Atualizado: ${newSongName} - ${newArtist}`);
    }

    console.log(`Total de músicas atualizadas: ${updated}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
