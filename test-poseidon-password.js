const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPoseidonPassword() {
    try {
        console.log('🔍 Testando usuário poseidomatlas7@gmail.com...');

        const email = 'poseidomatlas7@gmail.com';
        const testPassword = '123456'; // Senha de teste

        // Buscar o usuário
        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            console.log('❌ Usuário não encontrado');
            return;
        }

        console.log('✅ Usuário encontrado:', user.email);
        console.log('📋 Hash da senha:', user.password ? 'Presente' : 'Ausente');
        console.log('📋 Status:', user.status);
        console.log('📋 VIP:', user.is_vip);
        console.log('📋 Admin:', user.isAdmin);

        if (!user.password) {
            console.log('❌ Usuário não tem senha definida');
            console.log('🔄 Definindo nova senha...');

            const newHashedPassword = await bcrypt.hash(testPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: { password: newHashedPassword }
            });

            console.log('✅ Nova senha definida:', testPassword);
            console.log('📋 Hash gerado com sucesso');
        } else {
            console.log('🔐 Testando senha atual...');
            const isPasswordValid = await bcrypt.compare(testPassword, user.password);

            if (isPasswordValid) {
                console.log('✅ Senha atual está funcionando!');
                console.log('📋 Senha válida:', testPassword);
            } else {
                console.log('❌ Senha atual não funciona');
                console.log('🔄 Redefinindo senha...');

                const newHashedPassword = await bcrypt.hash(testPassword, 10);

                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: newHashedPassword }
                });

                console.log('✅ Senha redefinida:', testPassword);
            }
        }

        // Testar login final
        const finalUser = await prisma.user.findFirst({
            where: { email }
        });

        if (finalUser && finalUser.password) {
            const finalTest = await bcrypt.compare(testPassword, finalUser.password);
            console.log('🔐 Teste final:', finalTest ? '✅ SUCESSO' : '❌ FALHA');

            if (finalTest) {
                console.log('\n🎉 USUÁRIO PRONTO PARA LOGIN!');
                console.log('📧 Email:', email);
                console.log('🔑 Senha:', testPassword);
                console.log('\n💡 Use essas credenciais para fazer login');
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPoseidonPassword();
