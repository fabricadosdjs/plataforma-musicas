import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPlanDetection() {
    try {
        console.log('🔍 Verificando usuários no banco de dados...\n');

        // Buscar todos os usuários com valor definido
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { valor: { not: null } },
                    { is_vip: true }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                valor: true,
                is_vip: true,
                isUploader: true
            }
        });

        console.log(`📊 Encontrados ${users.length} usuários com planos:\n`);

        users.forEach(user => {
            console.log(`👤 ${user.name} (${user.email})`);
            console.log(`   💰 Valor: R$ ${user.valor || 0}`);
            console.log(`   🎯 VIP: ${user.is_vip ? 'Sim' : 'Não'}`);
            console.log(`   📤 Uploader: ${user.isUploader ? 'Sim' : 'Não'}`);

            // Testar detecção de plano
            const planDetected = detectPlan(user.valor);
            console.log(`   🔍 Plano detectado: ${planDetected || 'Sem Plano'}`);
            console.log('   ──────────────────────────────\n');
        });

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

debugPlanDetection();
