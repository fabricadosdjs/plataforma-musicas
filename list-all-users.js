import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllUsers() {
    try {
        console.log('👥 Listando todos os usuários...\n');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                valor: true,
                is_vip: true,
                isUploader: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`📊 Total de usuários: ${users.length}\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. 👤 ${user.name}`);
            console.log(`   📧 ${user.email}`);
            console.log(`   💰 Valor: R$ ${user.valor || 0}`);
            console.log(`   🎯 VIP: ${user.is_vip ? 'Sim' : 'Não'}`);
            console.log(`   📤 Uploader: ${user.isUploader ? 'Sim' : 'Não'}`);

            const planDetected = detectPlan(user.valor);
            console.log(`   🔍 Plano: ${planDetected || 'Sem Plano'}`);
            console.log('   ────────────────────────────\n');
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

listAllUsers();
