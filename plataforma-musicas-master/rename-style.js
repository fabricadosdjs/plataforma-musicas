// rename-style.js
// Uso: node rename-style.js "Estilo Antigo" "Estilo Novo"

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const [oldName, newName] = process.argv.slice(2);
    if (!oldName || !newName) {
        console.error('Uso: node rename-style.js "Estilo Antigo" "Estilo Novo"');
        process.exit(1);
    }

    const result = await prisma.track.updateMany({
        where: { style: oldName },
        data: { style: newName },
    });

    console.log(`Registros atualizados: ${result.count}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
