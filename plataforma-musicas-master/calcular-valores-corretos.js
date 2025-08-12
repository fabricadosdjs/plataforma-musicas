// Script para calcular os valores corretos dos planos com e sem Deemix

// Configurações dos planos
const VIP_PLANS = {
    BASICO: { basePrice: 38 },
    PADRAO: { basePrice: 42 },
    COMPLETO: { basePrice: 60 }
};

// Configurações do Deemix atualizado
const DEEMIX_PRICING = {
    STANDALONE: 50, // Para não-VIP
    BASICO: {
        basePrice: 50,
        discount: 0.35, // 35% desconto
        finalPrice: 50 * (1 - 0.35) // R$ 32,50
    },
    PADRAO: {
        basePrice: 50,
        discount: 0.42, // 42% desconto  
        finalPrice: 50 * (1 - 0.42) // R$ 29,00
    },
    COMPLETO: {
        basePrice: 50,
        discount: 0.60, // 60% desconto
        finalPrice: 50 * (1 - 0.60) // R$ 20,00
    }
};

// Períodos de assinatura
const SUBSCRIPTION_PERIODS = {
    MONTHLY: {
        name: 'Mensal',
        months: 1,
        discount: 0,
        deemixDiscount: 0,
        deemixFree: false
    },
    QUARTERLY: {
        name: 'Trimestral',
        months: 3,
        discount: 0.05, // 5% desconto no plano
        deemixDiscount: 0.08, // 8% desconto no Deemix
        deemixFree: false
    },
    SEMIANNUAL: {
        name: 'Semestral',
        months: 6,
        discount: 0.15, // 15% desconto no plano
        deemixDiscount: 0.50, // 50% desconto no Deemix
        deemixFree: false
    },
    ANNUAL: {
        name: 'Anual',
        months: 12,
        discount: 0.15, // 15% desconto no plano
        deemixDiscount: 0,
        deemixFree: true // Deemix grátis
    }
};

// Função para calcular preço do plano
function calculatePlanPrice(planKey, period, includeDeemix = false) {
    const plan = VIP_PLANS[planKey];
    const periodConfig = SUBSCRIPTION_PERIODS[period];

    if (!plan || !periodConfig) return 0;

    // Preço base do plano com desconto do período
    let basePrice = plan.basePrice * (1 - periodConfig.discount);

    // Se não incluir Deemix ou for grátis no período
    if (!includeDeemix || periodConfig.deemixFree) {
        return basePrice * periodConfig.months;
    }

    // Preço do Deemix com desconto do período
    const deemixPricing = DEEMIX_PRICING[planKey];
    let deemixPrice = deemixPricing.finalPrice * (1 - periodConfig.deemixDiscount);

    return (basePrice + deemixPrice) * periodConfig.months;
}

console.log('🔢 VALORES CORRETOS DOS PLANOS - TODAS AS COMBINAÇÕES\n');

// Para cada plano
Object.keys(VIP_PLANS).forEach(planKey => {
    const planName = planKey === 'BASICO' ? 'VIP BÁSICO' :
        planKey === 'PADRAO' ? 'VIP PADRÃO' : 'VIP COMPLETO';

    console.log(`\n📋 ${planName}:`);
    console.log('═'.repeat(50));

    Object.keys(SUBSCRIPTION_PERIODS).forEach(periodKey => {
        const periodName = SUBSCRIPTION_PERIODS[periodKey].name;

        const semDeemix = calculatePlanPrice(planKey, periodKey, false);
        const comDeemix = calculatePlanPrice(planKey, periodKey, true);

        console.log(`\n${periodName}:`);
        console.log(`  Sem Deemix: R$ ${semDeemix.toFixed(2).replace('.', ',')}`);
        console.log(`  Com Deemix: R$ ${comDeemix.toFixed(2).replace('.', ',')}`);

        // Calcular preços mensais para comparação
        const months = SUBSCRIPTION_PERIODS[periodKey].months;
        console.log(`  (Mensal sem Deemix: R$ ${(semDeemix / months).toFixed(2).replace('.', ',')})`);
        console.log(`  (Mensal com Deemix: R$ ${(comDeemix / months).toFixed(2).replace('.', ',')})`);
    });
});

console.log('\n\n📊 RESUMO MENSAL PARA COMPARAÇÃO:');
console.log('═'.repeat(50));

Object.keys(VIP_PLANS).forEach(planKey => {
    const planName = planKey === 'BASICO' ? 'VIP BÁSICO' :
        planKey === 'PADRAO' ? 'VIP PADRÃO' : 'VIP COMPLETO';

    const semDeemix = calculatePlanPrice(planKey, 'MONTHLY', false);
    const comDeemix = calculatePlanPrice(planKey, 'MONTHLY', true);

    console.log(`${planName}:`);
    console.log(`  Sem Deemix: R$ ${semDeemix.toFixed(2).replace('.', ',')}/mês`);
    console.log(`  Com Deemix: R$ ${comDeemix.toFixed(2).replace('.', ',')}/mês`);
    console.log('');
});

console.log('🎵 DEEMIX AVULSO: R$ 50,00/mês (para não-VIP)\n');
