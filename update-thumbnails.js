// Atualiza todas as thumbnails das músicas no banco de dados para uma imagem padrão
// Execute com: node update-thumbnails.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const THUMBNAIL_URL = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';

async function main() {
    const result = await prisma.track.updateMany({
        data: { imageUrl: THUMBNAIL_URL }
    });
    console.log(`Thumbnails atualizadas para ${THUMBNAIL_URL}. Total de músicas alteradas:`, result.count);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
