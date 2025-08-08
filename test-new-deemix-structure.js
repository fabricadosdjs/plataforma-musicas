// 🧪 TESTE COMPLETO - NOVA ESTRUTURA DE DESCONTOS DEEMIX
// Verificando todos os cálculos com as novas regras

console.log('🧪 TESTE COMPLETO - NOVA ESTRUTURA DEEMIX\n');

// ========== CONFIGURAÇÕES DA NOVA ESTRUTURA ==========
const DEEMIX_BASE_PRICE = 38;

const VIP_DISCOUNTS = {
    BASICO: 0.38,   // 38% OFF
    PADRAO: 0.42,   // 42% OFF  
    COMPLETO: 0.60  // 60% OFF
};

const PERIOD_DISCOUNTS = {
    MONTHLY: {
        planDiscount: 0,      // 0% OFF nos planos
        deemixDiscount: 0,    // 0% OFF no Deemix
        deemixFree: false
    },
    QUARTERLY: {
        planDiscount: 0.05,   // 5% OFF nos planos
        deemixDiscount: 0.08, // 8% OFF no Deemix
        deemixFree: false
    },
    SEMIANNUAL: {
        planDiscount: 0.15,   // 15% OFF nos planos
        deemixDiscount: 0.50, // 50% OFF no Deemix
        deemixFree: false
    },
    ANNUAL: {
        planDiscount: 0.15,   // 15% OFF nos planos
        deemixDiscount: 0,    // Não se aplica
        deemixFree: true      // Deemix GRÁTIS
    }
};

// ========== CÁLCULO DOS PREÇOS FINAIS DO DEEMIX ==========
console.log('🎵 PREÇOS FINAIS DO DEEMIX POR PLANO VIP:');
console.log('');

Object.entries(VIP_DISCOUNTS).forEach(([plan, discount]) => {
    const finalPrice = DEEMIX_BASE_PRICE * (1 - discount);
    console.log(`${plan}: R$ ${DEEMIX_BASE_PRICE} - ${(discount * 100)}% = R$ ${finalPrice.toFixed(2)}`);
});

console.log('');
console.log('📅 IMPACTO DOS DESCONTOS POR PERÍODO:');
console.log('');

// Exemplo: VIP BÁSICO + Deemix
const vipBasicoPrice = 38; // Preço do plano VIP BÁSICO
const deemixVipBasicoPrice = DEEMIX_BASE_PRICE * (1 - VIP_DISCOUNTS.BASICO); // R$ 23,56

Object.entries(PERIOD_DISCOUNTS).forEach(([period, config]) => {
    const months = period === 'MONTHLY' ? 1 : period === 'QUARTERLY' ? 3 : period === 'SEMIANNUAL' ? 6 : 12;

    console.log(`\n📆 ${period.toUpperCase()} (${months} ${months === 1 ? 'mês' : 'meses'}):`);

    // Preço do plano com desconto de período
    const planWithPeriodDiscount = vipBasicoPrice * (1 - config.planDiscount);
    const totalPlanPrice = planWithPeriodDiscount * months;

    console.log(`   Plano VIP BÁSICO: R$ ${vipBasicoPrice} → R$ ${planWithPeriodDiscount.toFixed(2)}/mês (${config.planDiscount * 100}% OFF)`);
    console.log(`   Total ${months} meses: R$ ${totalPlanPrice.toFixed(2)}`);

    if (config.deemixFree) {
        console.log(`   Deemix: GRÁTIS 🎁`);
        console.log(`   TOTAL FINAL: R$ ${totalPlanPrice.toFixed(2)}`);
    } else {
        // Preço do Deemix com desconto VIP + desconto de período
        const deemixWithPeriodDiscount = deemixVipBasicoPrice * (1 - config.deemixDiscount);
        const totalDeemixPrice = deemixWithPeriodDiscount * months;

        console.log(`   Deemix VIP BÁSICO: R$ ${deemixVipBasicoPrice.toFixed(2)} → R$ ${deemixWithPeriodDiscount.toFixed(2)}/mês (${config.deemixDiscount * 100}% OFF adicional)`);
        console.log(`   Total Deemix ${months} meses: R$ ${totalDeemixPrice.toFixed(2)}`);
        console.log(`   TOTAL FINAL: R$ ${(totalPlanPrice + totalDeemixPrice).toFixed(2)}`);
    }
});

console.log('\n');
console.log('💰 COMPARAÇÃO DE ECONOMIAS:');
console.log('');

// Economia anual para cada plano VIP
const plans = [
    { name: 'VIP BÁSICO', monthlyPrice: 38, deemixDiscount: VIP_DISCOUNTS.BASICO },
    { name: 'VIP PADRÃO', monthlyPrice: 42, deemixDiscount: VIP_DISCOUNTS.PADRAO },
    { name: 'VIP COMPLETO', monthlyPrice: 60, deemixDiscount: VIP_DISCOUNTS.COMPLETO }
];

plans.forEach(plan => {
    const monthlyTotal = plan.monthlyPrice + (DEEMIX_BASE_PRICE * (1 - plan.deemixDiscount));
    const annualNoDiscount = monthlyTotal * 12;

    // Anual com descontos
    const planWithDiscount = plan.monthlyPrice * (1 - PERIOD_DISCOUNTS.ANNUAL.planDiscount);
    const annualWithDiscount = planWithDiscount * 12; // Deemix é grátis no anual

    const savings = annualNoDiscount - annualWithDiscount;

    console.log(`${plan.name}:`);
    console.log(`   Sem desconto: R$ ${annualNoDiscount.toFixed(2)}/ano`);
    console.log(`   Com desconto anual: R$ ${annualWithDiscount.toFixed(2)}/ano`);
    console.log(`   ECONOMIA: R$ ${savings.toFixed(2)} (${((savings / annualNoDiscount) * 100).toFixed(1)}%)`);
    console.log('');
});

console.log('🎯 RESUMO DA NOVA ESTRUTURA:');
console.log('');
console.log('📊 DESCONTOS VIP NO DEEMIX:');
console.log('• VIP BÁSICO: 38% OFF → R$ 23,56/mês');
console.log('• VIP PADRÃO: 42% OFF → R$ 22,04/mês');
console.log('• VIP COMPLETO: 60% OFF → R$ 15,20/mês');
console.log('');
console.log('📅 DESCONTOS POR PERÍODO:');
console.log('• TRIMESTRAL: Planos 5% OFF, Deemix 8% OFF adicional');
console.log('• SEMESTRAL: Planos 15% OFF, Deemix 50% OFF adicional');
console.log('• ANUAL: Planos 15% OFF, Deemix GRÁTIS');
console.log('');
console.log('✅ ESTRUTURA ATUALIZADA COM SUCESSO!');
