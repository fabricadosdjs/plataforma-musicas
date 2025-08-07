// Script para gerar links de pagamento do plano Uploader
// Este script gera os links que devem ser configurados no Mercado Pago

const UPLOADER_PRICING = {
    MONTHLY: {
        name: 'Mensal',
        price: 20.00,
        discount: 0
    },
    QUARTERLY: {
        name: 'Trimestral',
        price: 57.00, // 20 * 3 - 5% desconto
        discount: 0.05
    },
    SEMIANNUAL: {
        name: 'Semestral',
        price: 102.00, // 20 * 6 - 15% desconto
        discount: 0.15
    },
    ANNUAL: {
        name: 'Anual',
        price: 204.00, // 20 * 12 - 15% desconto
        discount: 0.15
    }
};

console.log('🔗 Links de Pagamento - Plano UPLOADER');
console.log('=====================================');

Object.entries(UPLOADER_PRICING).forEach(([period, config]) => {
    console.log(`\n📅 ${config.name}:`);
    console.log(`💰 Preço: R$ ${config.price.toFixed(2)}`);
    if (config.discount > 0) {
        console.log(`🎯 Desconto: ${(config.discount * 100).toFixed(0)}%`);
    }
    console.log(`🔗 Link: https://mpago.la/uploader-${period.toLowerCase()}`);
});

console.log('\n📝 Instruções:');
console.log('1. Configure estes links no Mercado Pago');
console.log('2. Atualize os links na página /plans/page.tsx');
console.log('3. Teste os pagamentos antes de ativar');

console.log('\n🎯 Benefícios do Plano Uploader:');
console.log('• 25 downloads por dia');
console.log('• Upload ilimitado de músicas');
console.log('• Acesso à comunidade');
console.log('• Badge de Uploader');
console.log('• Sem acesso ao Drive (exclusivo para VIPs)');
console.log('• Sem solicitação de packs (exclusivo para VIPs)'); 