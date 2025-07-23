const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
    const prisma = new PrismaClient();

    try {
        console.log('🔍 Verificando usuários...');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        console.log(`\n📊 Total de usuários: ${users.length}`);
        console.log('\n👥 Lista de usuários:');

        users.forEach((user, index) => {
            console.log(`${index + 1}. ID: "${user.id}" | Nome: ${user.name} | Email: ${user.email}`);

            // Verificar se o ID é um UUID válido
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(user.id)) {
                console.log(`   ❌ UUID INVÁLIDO: "${user.id}"`);
            } else {
                console.log(`   ✅ UUID válido`);
            }
        });

        // Verificar downloads problemáticos
        console.log('\n🔍 Verificando downloads...');
        try {
            const downloads = await prisma.download.findMany({
                select: {
                    id: true,
                    userId: true,
                    trackId: true
                },
                take: 5
            });
            console.log(`📊 Downloads encontrados: ${downloads.length}`);
        } catch (error) {
            console.log('❌ Erro ao buscar downloads:', error.message);
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
