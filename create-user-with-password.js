// script para criar usuário com senha
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUserWithPassword() {
    try {
        console.log('🔧 Criando usuário com senha...');

        // Hash da senha
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Verificar se já existe
        const existingUser = await prisma.user.findUnique({
            where: { email: 'teste@nexorrecords.com.br' }
        });

        if (existingUser) {
            console.log('👤 Usuário já existe, atualizando com senha...');

            // Tentar atualizar com senha
            try {
                const updatedUser = await prisma.user.update({
                    where: { email: 'teste@nexorrecords.com.br' },
                    data: {
                        password: hashedPassword
                    }
                });

                console.log('✅ Usuário atualizado com senha!');
            } catch (updateError) {
                console.log('❌ Não foi possível adicionar senha ao usuário existente');
                console.log('Isso indica que o campo password não existe no schema do Supabase');

                // Vamos criar um novo usuário em uma tabela diferente ou usar auth do Supabase
                console.log('\n💡 Soluções possíveis:');
                console.log('1. Usar Supabase Auth diretamente');
                console.log('2. Modificar o schema para incluir campo password');
                console.log('3. Criar usuário diretamente no Supabase Auth');

                return;
            }
        } else {
            // Criar novo usuário com senha
            const user = await prisma.user.create({
                data: {
                    name: 'Usuário Teste',
                    email: 'teste@nexorrecords.com.br',
                    password: hashedPassword,
                    is_vip: true,
                },
            });

            console.log('✅ Usuário criado com senha!');
        }

        console.log('📋 Dados para login:');
        console.log(`📧 Email: teste@nexorrecords.com.br`);
        console.log(`🔑 Senha: 123456`);

    } catch (error) {
        console.error('❌ Erro:', error.message);

        if (error.message.includes('password')) {
            console.log('\n💡 O campo "password" não existe no schema do Supabase');
            console.log('Você está usando Supabase Auth, que gerencia autenticação separadamente');
        }
    } finally {
        await prisma.$disconnect();
    }
}

createUserWithPassword();
