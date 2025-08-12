const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
    try {
        console.log('🔍 Testando login para poseidomatlas7@gmail.com...');

        const email = 'poseidomatlas7@gmail.com';
        const password = 'sua_senha_aqui'; // Substitua pela senha que você definiu

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

        if (!user.password) {
            console.log('❌ Usuário não tem senha definida');
            return;
        }

        // Testar a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log('🔐 Resultado do teste de senha:', isPasswordValid ? '✅ Válida' : '❌ Inválida');

        if (isPasswordValid) {
            console.log('✅ Login seria bem-sucedido!');
            console.log('📋 Dados do usuário:');
            console.log('- ID:', user.id);
            console.log('- Nome:', user.name);
            console.log('- VIP:', user.is_vip);
            console.log('- Admin:', user.isAdmin);
            console.log('- Status:', user.status);
        } else {
            console.log('❌ Senha incorreta');
            console.log('💡 Sugestões:');
            console.log('1. Verifique se a senha está correta');
            console.log('2. Execute o script fix-user-password.js para corrigir');
            console.log('3. Verifique se não há espaços extras na senha');
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
