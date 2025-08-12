// Script para testar os pagamentos PIX dos planos Uploader
// Este script simula os cálculos de preços e gera os links PIX

const UPLOADER_PLANS = {
    BASIC: {
        name: 'UPLOADER BÁSICO',
        basePrice: 15.00,
        features: [
            '15 downloads por dia',
            'Até 10 uploads por mês',
            'Acesso básico à comunidade',
            'Badge Básico'
        ]
    },
    PRO: {
        name: 'UPLOADER PRO',
        basePrice: 25.00,
        features: [
            '30 downloads por dia',
            'Até 50 uploads por mês',
            'Acesso completo à comunidade',
            'Suporte prioritário',
            'Conteúdo exclusivo',
            'Badge Pro'
        ]
    },
    ELITE: {
        name: 'UPLOADER ELITE',
        basePrice: 35.00,
        features: [
            '50 downloads por dia',
            'Uploads ilimitados',
            'Acesso VIP à comunidade',
            'Suporte VIP',
            'Conteúdo premium',
            'Analytics completos',
            'Badge Elite'
        ]
    }
};

const SUBSCRIPTION_PERIODS = {
    MONTHLY: { name: 'Mensal', months: 1, discount: 0 },
    QUARTERLY: { name: 'Trimestral', months: 3, discount: 0.05 },
    SEMIANNUAL: { name: 'Semestral', months: 6, discount: 0.15 },
    ANNUAL: { name: 'Anual', months: 12, discount: 0.15 }
};

function calculatePrice(planKey, periodKey) {
    const plan = UPLOADER_PLANS[planKey];
    const period = SUBSCRIPTION_PERIODS[periodKey];

    const basePrice = plan.basePrice * period.months;
    const discountedPrice = basePrice * (1 - period.discount);

    return {
        basePrice,
        discountedPrice,
        discount: period.discount * 100,
        months: period.months
    };
}

console.log('🧪 Teste de Pagamentos PIX - Planos Uploader');
console.log('============================================');

Object.entries(UPLOADER_PLANS).forEach(([planKey, plan]) => {
    console.log(`\n📦 ${plan.name}`);
    console.log('─'.repeat(50));

    Object.entries(SUBSCRIPTION_PERIODS).forEach(([periodKey, period]) => {
        const price = calculatePrice(planKey, periodKey);

        console.log(`\n📅 ${period.name}:`);
        console.log(`💰 Preço base: R$ ${price.basePrice.toFixed(2).replace('.', ',')}`);
        console.log(`🎯 Preço com desconto: R$ ${price.discountedPrice.toFixed(2).replace('.', ',')}`);
        if (price.discount > 0) {
            console.log(`💸 Desconto: ${price.discount.toFixed(0)}%`);
        }
        console.log(`🔗 Link PIX: /planstoogle?plan=uploader-${planKey.toLowerCase()}&period=${periodKey.toLowerCase()}`);
    });

    console.log('\n✨ Benefícios:');
    plan.features.forEach(feature => {
        console.log(`   • ${feature}`);
    });
});

console.log('\n📝 Instruções para Teste:');
console.log('1. Acesse os links gerados acima');
console.log('2. Verifique se os preços estão corretos');
console.log('3. Teste o cálculo de upgrade/downgrade');
console.log('4. Verifique se o PIX está sendo gerado corretamente');

console.log('\n🎯 Exemplos de Links para Teste:');
console.log('• /planstoogle?plan=uploader-basic&period=monthly');
console.log('• /planstoogle?plan=uploader-pro&period=quarterly');
console.log('• /planstoogle?plan=uploader-elite&period=annual');

console.log('\n💡 Diferenciação dos Planos VIP:');
console.log('• Uploaders focam em contribuir com a comunidade');
console.log('• VIPs focam em consumir conteúdo premium');
console.log('• Uploaders não têm acesso ao Drive (exclusivo VIPs)');
console.log('• Uploaders não podem solicitar packs (exclusivo VIPs)'); 