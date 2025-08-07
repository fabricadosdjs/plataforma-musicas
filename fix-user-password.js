const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixUserPassword() {
    try {
        console.log('🔍 Verificando usuário poseidomatlas7@gmail.com...');

        // Buscar o usuário
        const user = await prisma.user.findFirst({
            where: { email: 'poseidomatlas7@gmail.com' }
        });

        if (!user) {
            console.log('❌ Usuário não encontrado');
            return;
        }

        console.log('✅ Usuário encontrado:', user.email);
        console.log('📋 Senha atual no banco:', user.password ? 'Hash presente' : 'Sem senha');

        // Testar a senha atual
        const testPassword = 'sua_senha_aqui'; // Substitua pela senha que você definiu
        const isCurrentPasswordValid = user.password && await bcrypt.compare(testPassword, user.password);

        console.log('🔐 Teste da senha atual:', isCurrentPasswordValid ? '✅ Válida' : '❌ Inválida');

        if (!isCurrentPasswordValid) {
            console.log('🔄 Gerando nova senha...');

            // Gerar novo hash
            const newHashedPassword = await bcrypt.hash(testPassword, 10);

            // Atualizar a senha no banco
            await prisma.user.update({
                where: { id: user.id },
                data: { password: newHashedPassword }
            });

            console.log('✅ Senha atualizada com sucesso!');
            console.log('📋 Nova senha hash gerada');

            // Testar novamente
            const isNewPasswordValid = await bcrypt.compare(testPassword, newHashedPassword);
            console.log('🔐 Teste da nova senha:', isNewPasswordValid ? '✅ Válida' : '❌ Inválida');
        } else {
            console.log('✅ Senha atual está funcionando corretamente');
        }

        console.log('\n📋 Informações do usuário:');
        console.log('ID:', user.id);
        console.log('Email:', user.email);
        console.log('Nome:', user.name);
        console.log('VIP:', user.is_vip);
        console.log('Admin:', user.isAdmin);
        console.log('Status:', user.status);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUserPassword();
