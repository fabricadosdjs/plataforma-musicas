import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserPlan() {
    try {
        console.log('🔍 Verificando usuário específico...\n');

        // Pedir o email do usuário
        const email = process.argv[2];
        if (!email) {
            console.log('❌ Por favor, forneça o email do usuário:');
            console.log('   node check-user-plan.js exemplo@email.com');
            return;
        }

        // Buscar o usuário
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                valor: true,
                is_vip: true,
                isUploader: true
            }
        });

        if (!user) {
            console.log(`❌ Usuário com email "${email}" não encontrado.`);
            return;
        }

        console.log(`👤 Usuário: ${user.name}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`💰 Valor: R$ ${user.valor || 0}`);
        console.log(`🎯 VIP: ${user.is_vip ? 'Sim' : 'Não'}`);
        console.log(`📤 Uploader: ${user.isUploader ? 'Sim' : 'Não'}\n`);

        // Testar função de detecção
        const planDetected = detectPlan(user.valor);
        console.log(`🔍 Plano detectado: ${planDetected || 'Sem Plano'}`);

        if (!planDetected) {
            console.log('\n💡 Para definir um plano, use:');
            console.log(`   UPDATE users SET valor = 50 WHERE email = '${email}'; -- Para COMPLETO`);
            console.log(`   UPDATE users SET valor = 42 WHERE email = '${email}'; -- Para PADRÃO`);
            console.log(`   UPDATE users SET valor = 35 WHERE email = '${email}'; -- Para BÁSICO`);
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

function detectPlan(valor) {
    if (!valor) return null;

    if (valor >= 50) return 'COMPLETO';
    if (valor >= 42) return 'PADRAO';
    if (valor >= 35) return 'BASICO';

    return null;
}

checkUserPlan();
