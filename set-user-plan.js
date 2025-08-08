import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setUserPlan() {
    try {
        const email = process.argv[2];
        const planType = process.argv[3];

        if (!email || !planType) {
            console.log('❌ Uso correto:');
            console.log('   node set-user-plan.js email@exemplo.com COMPLETO');
            console.log('   node set-user-plan.js email@exemplo.com PADRAO');
            console.log('   node set-user-plan.js email@exemplo.com BASICO');
            return;
        }

        // Definir valores por plano
        const planValues = {
            'COMPLETO': 50,
            'PADRAO': 42,
            'BASICO': 35
        };

        const valor = planValues[planType.toUpperCase()];
        if (!valor) {
            console.log('❌ Plano inválido. Use: COMPLETO, PADRAO ou BASICO');
            return;
        }

        // Verificar se usuário existe
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log(`❌ Usuário com email "${email}" não encontrado.`);
            return;
        }

        // Atualizar o plano
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                valor: valor,
                is_vip: true
            }
        });

        console.log('✅ Plano atualizado com sucesso!');
        console.log(`👤 Usuário: ${updatedUser.name}`);
        console.log(`📧 Email: ${updatedUser.email}`);
        console.log(`💰 Valor: R$ ${updatedUser.valor}`);
        console.log(`🎯 VIP: ${updatedUser.is_vip ? 'Sim' : 'Não'}`);
        console.log(`🏆 Plano: ${planType.toUpperCase()}`);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setUserPlan();
