// Script para testar a sessão de admin
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdminSession() {
    try {
        // Buscar usuário admin
        const adminUser = await prisma.user.findFirst({
            where: {
                email: 'admin@nexorrecords.com.br'
            }
        });

        if (adminUser) {
            console.log('✅ Usuário admin encontrado:');
            console.log({
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                isAdmin: adminUser.isAdmin,
                is_vip: adminUser.is_vip,
                isPro: adminUser.isPro,
                status: adminUser.status
            });

            // Simular dados que seriam retornados pelo NextAuth
            const mockUser = {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                isAdmin: adminUser.isAdmin,
                is_vip: adminUser.is_vip,
                valor: adminUser.valor,
                status: adminUser.status
            };

            console.log('\n📋 Dados que seriam passados para a sessão:');
            console.log(mockUser);

            console.log('\n🔍 Verificações:');
            console.log('isAdmin:', mockUser.isAdmin);
            console.log('is_vip:', mockUser.is_vip);
            console.log('isPro:', mockUser.isPro);

            if (mockUser.isAdmin) {
                console.log('✅ Usuário tem permissão de admin');
            } else {
                console.log('❌ Usuário NÃO tem permissão de admin');
            }
        } else {
            console.log('❌ Usuário admin não encontrado!');
        }
    } catch (error) {
        console.error('❌ Erro ao testar sessão de admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminSession(); 