// Script para gerar links de pagamento dos novos planos Uploader
// Este script gera os links que devem ser configurados no Mercado Pago

const UPLOADER_PLANS_PRICING = {
    BASIC: {
        name: 'UPLOADER BÁSICO',
        monthlyPrice: 15.00,
        quarterlyPrice: 42.75, // 15 * 3 - 5% desconto
        semiannualPrice: 76.50, // 15 * 6 - 15% desconto
        annualPrice: 153.00, // 15 * 12 - 15% desconto
        features: [
            '15 downloads por dia',
            'Até 10 uploads por mês',
            'Acesso básico à comunidade',
            'Badge Básico'
        ]
    },
    PRO: {
        name: 'UPLOADER PRO',
        monthlyPrice: 25.00,
        quarterlyPrice: 71.25, // 25 * 3 - 5% desconto
        semiannualPrice: 127.50, // 25 * 6 - 15% desconto
        annualPrice: 255.00, // 25 * 12 - 15% desconto
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
        monthlyPrice: 35.00,
        quarterlyPrice: 99.75, // 35 * 3 - 5% desconto
        semiannualPrice: 178.50, // 35 * 6 - 15% desconto
        annualPrice: 357.00, // 35 * 12 - 15% desconto
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

console.log('🔗 Links de Pagamento - Planos UPLOADER');
console.log('========================================');

Object.entries(UPLOADER_PLANS_PRICING).forEach(([planKey, plan]) => {
    console.log(`\n📦 ${plan.name}`);
    console.log('─'.repeat(50));

    Object.entries(SUBSCRIPTION_PERIODS).forEach(([periodKey, period]) => {
        const basePrice = plan.monthlyPrice * period.months;
        const discountedPrice = basePrice * (1 - period.discount);
        const discountText = period.discount > 0 ? ` (${(period.discount * 100).toFixed(0)}% desconto)` : '';

        console.log(`\n📅 ${period.name}:`);
        console.log(`💰 Preço: R$ ${discountedPrice.toFixed(2).replace('.', ',')}${discountText}`);
        console.log(`🔗 Link: https://mpago.la/uploader-${planKey.toLowerCase()}-${periodKey.toLowerCase()}`);
    });

    console.log('\n✨ Benefícios:');
    plan.features.forEach(feature => {
        console.log(`   • ${feature}`);
    });
});

console.log('\n📝 Instruções:');
console.log('1. Configure estes links no Mercado Pago');
console.log('2. Atualize os links na página /plans/page.tsx');
console.log('3. Teste os pagamentos antes de ativar');
console.log('4. Configure webhooks para processar pagamentos');

console.log('\n🎯 Estratégia de Preços:');
console.log('• BASIC: R$ 15/mês - Entrada acessível');
console.log('• PRO: R$ 25/mês - Valor intermediário com mais benefícios');
console.log('• ELITE: R$ 35/mês - Plano premium com uploads ilimitados');

console.log('\n💡 Diferenciação dos Planos VIP:');
console.log('• Uploaders focam em contribuir com a comunidade');
console.log('• VIPs focam em consumir conteúdo premium');
console.log('• Uploaders não têm acesso ao Drive (exclusivo VIPs)');
console.log('• Uploaders não podem solicitar packs (exclusivo VIPs)'); 