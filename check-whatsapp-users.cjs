const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWhatsAppUsers() {
    try {
        console.log('📱 Verificando usuários com WhatsApp...\n');

        // 1. Total de usuários
        const totalUsers = await prisma.user.count();
        console.log(`👥 Total de usuários: ${totalUsers}`);

        // 2. Usuários com WhatsApp
        const usersWithWhatsApp = await prisma.user.count({
            where: {
                whatsapp: {
                    not: null
                }
            }
        });
        console.log(`📱 Usuários com WhatsApp: ${usersWithWhatsApp}`);

        // 3. Usuários sem WhatsApp
        const usersWithoutWhatsApp = await prisma.user.count({
            where: {
                OR: [
                    { whatsapp: null },
                    { whatsapp: '' }
                ]
            }
        });
        console.log(`❌ Usuários sem WhatsApp: ${usersWithoutWhatsApp}`);

        // 4. Listar alguns usuários com WhatsApp
        const sampleUsersWithWhatsApp = await prisma.user.findMany({
            where: {
                whatsapp: {
                    not: null
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                whatsapp: true
            },
            take: 10
        });

        console.log('\n📱 Exemplos de usuários com WhatsApp:');
        sampleUsersWithWhatsApp.forEach(user => {
            console.log(`- ${user.email} (${user.name || 'Sem nome'}) - WhatsApp: ${user.whatsapp}`);
        });

        // 5. Listar alguns usuários sem WhatsApp
        const sampleUsersWithoutWhatsApp = await prisma.user.findMany({
            where: {
                OR: [
                    { whatsapp: null },
                    { whatsapp: '' }
                ]
            },
            select: {
                id: true,
                email: true,
                name: true,
                whatsapp: true
            },
            take: 5
        });

        console.log('\n❌ Exemplos de usuários sem WhatsApp:');
        sampleUsersWithoutWhatsApp.forEach(user => {
            console.log(`- ${user.email} (${user.name || 'Sem nome'}) - WhatsApp: ${user.whatsapp || 'null'}`);
        });

        // 6. Verificar se há usuários com WhatsApp vazio
        const usersWithEmptyWhatsApp = await prisma.user.findMany({
            where: {
                whatsapp: ''
            },
            select: {
                id: true,
                email: true,
                name: true,
                whatsapp: true
            },
            take: 5
        });

        if (usersWithEmptyWhatsApp.length > 0) {
            console.log('\n⚠️ Usuários com WhatsApp vazio:');
            usersWithEmptyWhatsApp.forEach(user => {
                console.log(`- ${user.email} (${user.name || 'Sem nome'}) - WhatsApp: "${user.whatsapp}"`);
            });
        }

        // 7. Verificar se há usuários com WhatsApp null
        const usersWithNullWhatsApp = await prisma.user.findMany({
            where: {
                whatsapp: null
            },
            select: {
                id: true,
                email: true,
                name: true,
                whatsapp: true
            },
            take: 5
        });

        if (usersWithNullWhatsApp.length > 0) {
            console.log('\n⚠️ Usuários com WhatsApp null:');
            usersWithNullWhatsApp.forEach(user => {
                console.log(`- ${user.email} (${user.name || 'Sem nome'}) - WhatsApp: ${user.whatsapp}`);
            });
        }

        console.log(`\n📊 Resumo:`);
        console.log(`- Total: ${totalUsers}`);
        console.log(`- Com WhatsApp: ${usersWithWhatsApp} (${((usersWithWhatsApp / totalUsers) * 100).toFixed(1)}%)`);
        console.log(`- Sem WhatsApp: ${usersWithoutWhatsApp} (${((usersWithoutWhatsApp / totalUsers) * 100).toFixed(1)}%)`);

    } catch (error) {
        console.error('❌ Erro ao verificar usuários:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkWhatsAppUsers(); 