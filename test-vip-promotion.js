// test-vip-promotion.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testVipPromotion() {
    try {
        console.log('🧪 TESTE DE PROMOÇÃO VIP');
        console.log('='.repeat(40));

        // 1. Listar todos os usuários
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                is_vip: true,
                createdAt: true
            }
        });

        console.log(`👥 Total de usuários: ${allUsers.length}`);

        if (allUsers.length === 0) {
            console.log('❌ Nenhum usuário encontrado!');
            console.log('💡 Crie um usuário primeiro fazendo login na aplicação.');
            return;
        }

        console.log('\n📋 LISTA DE USUÁRIOS:');
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   👤 Nome: ${user.name || 'Não definido'}`);
            console.log(`   👑 VIP: ${user.is_vip ? 'SIM ✅' : 'NÃO ❌'}`);
            console.log(`   🆔 ID: ${user.id}`);
            console.log(`   📅 Criado: ${user.createdAt}\n`);
        });

        // 2. Promover primeiro usuário não-VIP para VIP
        const nonVipUser = allUsers.find(user => !user.is_vip);

        if (nonVipUser) {
            console.log(`🚀 PROMOVENDO USUÁRIO: ${nonVipUser.email}`);

            const updatedUser = await prisma.user.update({
                where: { id: nonVipUser.id },
                data: { is_vip: true }
            });

            console.log(`✅ ${updatedUser.email} agora é VIP!`);

            // Verificar se a alteração foi salva
            const verification = await prisma.user.findUnique({
                where: { id: nonVipUser.id },
                select: { email: true, is_vip: true }
            });

            console.log(`🔍 Verificação: ${verification.email} - VIP: ${verification.is_vip ? 'SIM ✅' : 'NÃO ❌'}`);

        } else {
            console.log('ℹ️  Todos os usuários já são VIP');

            // Mostrar como despromover se necessário
            const vipUser = allUsers.find(user => user.is_vip);
            if (vipUser) {
                console.log(`\n🔄 Para testar, posso despromover: ${vipUser.email}`);
                console.log('Digite "y" para despromover e testar novamente:');
            }
        }

        console.log('\n📝 PRÓXIMOS PASSOS:');
        console.log('1. Faça login na aplicação com um dos usuários acima');
        console.log('2. Vá para /admin/users para ver a interface de promoção');
        console.log('3. Teste o download de uma música');
        console.log('4. Verifique os logs no console do navegador (F12)');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testVipPromotion();
