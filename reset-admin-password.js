const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
    try {
        // New admin credentials
        const adminEmail = 'its_admin@nexorrecords.com.br';
        const adminPassword = 'Admin2025!';
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        // Check if admin user exists
        const existingAdmin = await prisma.user.findFirst({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            // Update existing admin
            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: {
                    password: hashedPassword,
                    is_vip: true,
                    isAdmin: true,
                    valor: 999,
                    status: 'ativo',
                    deemix: true,
                    dailyDownloadCount: 0,
                    weeklyPackRequests: 0,
                    weeklyPlaylistDownloads: 0,
                    vencimento: null,
                    dataPagamento: null,
                    whatsapp: '11999999999'
                }
            });
            console.log('✅ Admin user updated successfully');
        } else {
            // Create new admin user
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Administrador',
                    is_vip: true,
                    isAdmin: true,
                    valor: 999,
                    status: 'ativo',
                    deemix: true,
                    dailyDownloadCount: 0,
                    weeklyPackRequests: 0,
                    weeklyPlaylistDownloads: 0,
                    vencimento: null,
                    dataPagamento: null,
                    whatsapp: '11999999999'
                }
            });
            console.log('✅ Admin user created successfully');
        }

        console.log('\n📋 Admin Credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('\n⚠️  IMPORTANTE: Update your .env file with:');
        console.log('ADMIN_EMAIL=' + adminEmail);
        console.log('ADMIN_PASSWORD=' + adminPassword);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword(); 