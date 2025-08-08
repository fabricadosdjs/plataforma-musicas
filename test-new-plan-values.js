import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função de detecção de plano (copiada da config)
function getVipPlan(valor) {
    if (!valor) return null;

    if (valor >= 60) return 'COMPLETO';  // 🥇 VIP COMPLETO
    if (valor >= 42) return 'PADRAO';    // 🥈 VIP PADRÃO  
    if (valor >= 38) return 'BASICO';    // 🥉 VIP BÁSICO

    return null; // 📦 Usuário Free/Sem Plano
}

// Função para obter informações do plano
function getPlanInfo(valor) {
    const planType = getVipPlan(valor);

    if (!planType) {
        return {
            id: null,
            icon: '📦',
            name: 'Sem Plano',
            value: 0
        };
    }

    const plans = {
        BASICO: { id: 'BASICO', icon: '🥉', name: 'VIP BÁSICO', value: 38 },
        PADRAO: { id: 'PADRAO', icon: '🥈', name: 'VIP PADRÃO', value: 42 },
        COMPLETO: { id: 'COMPLETO', icon: '🥇', name: 'VIP COMPLETO', value: 60 }
    };

    return plans[planType];
}

async function testNewPlanValues() {
    try {
        console.log('🧪 Testando novos valores dos planos...\n');

        // Valores de teste
        const testValues = [38, 42, 60, 35, 50, 70, 30];

        console.log('📊 Teste de detecção de planos:');
        console.log('════════════════════════════════\n');

        testValues.forEach(valor => {
            const planDetected = getVipPlan(valor);
            const planInfo = getPlanInfo(valor);

            console.log(`💰 Valor: R$ ${valor}`);
            console.log(`🔍 Plano detectado: ${planDetected || 'Sem Plano'}`);
            console.log(`📝 Nome: ${planInfo.name}`);
            console.log(`🎯 Ícone: ${planInfo.icon}`);
            console.log('─────────────────────────\n');
        });

        // Testar usuários existentes
        console.log('👥 Testando usuários existentes no banco:');
        console.log('═══════════════════════════════════════\n');

        const users = await prisma.user.findMany({
            where: {
                valor: { not: null }
            },
            select: {
                id: true,
                name: true,
                email: true,
                valor: true,
                is_vip: true
            },
            take: 5
        });

        users.forEach(user => {
            const planDetected = getVipPlan(user.valor);
            const planInfo = getPlanInfo(user.valor);

            console.log(`👤 ${user.name}`);
            console.log(`📧 ${user.email}`);
            console.log(`💰 Valor atual: R$ ${user.valor}`);
            console.log(`🏆 Plano detectado: ${planDetected || 'Sem Plano'}`);
            console.log(`📝 Nome do plano: ${planInfo.name}`);
            console.log(`🎯 Ícone: ${planInfo.icon}`);
            console.log('───────────────────────────────\n');
        });

        console.log('✅ Teste concluído! Novos valores:');
        console.log('🥉 VIP BÁSICO: R$ 38+ (antes: R$ 35+)');
        console.log('🥈 VIP PADRÃO: R$ 42+ (mantido)');
        console.log('🥇 VIP COMPLETO: R$ 60+ (antes: R$ 50+)');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNewPlanValues();
