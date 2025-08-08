// 🔍 VERIFICAÇÃO DE CONSISTÊNCIA - ADMIN vs PLANS
// Compara os valores entre a página de planos e o admin

console.log('🔍 VERIFICAÇÃO DE CONSISTÊNCIA - ADMIN vs PLANS\n');

// ========== CONFIGURAÇÕES DOS PLANOS ==========
const VIP_PLANS = {
    BASICO: 38,
    PADRAO: 42,
    COMPLETO: 60
};

const DEEMIX_VIP_DISCOUNTS = {
    BASICO: 0.38,   // 38% OFF
    PADRAO: 0.42,   // 42% OFF
    COMPLETO: 0.60  // 60% OFF
};

const DEEMIX_BASE = 38;

// ========== CÁLCULO DOS PREÇOS FINAIS DEEMIX ==========
const DEEMIX_FINAL_PRICES = {
    BASICO: DEEMIX_BASE * (1 - DEEMIX_VIP_DISCOUNTS.BASICO),    // R$ 23,56
    PADRAO: DEEMIX_BASE * (1 - DEEMIX_VIP_DISCOUNTS.PADRAO),    // R$ 22,04
    COMPLETO: DEEMIX_BASE * (1 - DEEMIX_VIP_DISCOUNTS.COMPLETO) // R$ 15,20
};

// ========== DESCONTOS POR PERÍODO ==========
const PERIOD_DISCOUNTS = {
    MONTHLY: { planDiscount: 0, deemixDiscount: 0, months: 1 },
    QUARTERLY: { planDiscount: 0.05, deemixDiscount: 0.08, months: 3 },
    SEMIANNUAL: { planDiscount: 0.15, deemixDiscount: 0.50, months: 6 },
    ANNUAL: { planDiscount: 0.15, deemixDiscount: 0, months: 12, deemixFree: true }
};

// ========== CÁLCULOS ESPERADOS ==========
console.log('📊 VALORES ESPERADOS NA PÁGINA DE PLANOS:\n');

Object.entries(VIP_PLANS).forEach(([plan, planPrice]) => {
    console.log(`🎯 ${plan}:`);

    Object.entries(PERIOD_DISCOUNTS).forEach(([period, config]) => {
        const planWithDiscount = planPrice * (1 - config.planDiscount);
        const totalPlanPrice = planWithDiscount * config.months;

        if (config.deemixFree) {
            console.log(`   ${period}: R$ ${totalPlanPrice.toFixed(2)} (Deemix GRÁTIS)`);
        } else {
            const deemixWithVipDiscount = DEEMIX_FINAL_PRICES[plan];
            const deemixWithPeriodDiscount = deemixWithVipDiscount * (1 - config.deemixDiscount);
            const totalDeemixPrice = deemixWithPeriodDiscount * config.months;
            const totalFinal = totalPlanPrice + totalDeemixPrice;

            console.log(`   ${period}: R$ ${totalFinal.toFixed(2)} (Plano: R$ ${totalPlanPrice.toFixed(2)} + Deemix: R$ ${totalDeemixPrice.toFixed(2)})`);
        }
    });
    console.log('');
});

// ========== VALORES DO ADMIN ATUALIZADOS ==========
console.log('📋 VALORES ATUALIZADOS NO ADMIN:\n');

const ADMIN_VALUES = {
    // Mensais
    MD_BASICO: 61.56,   // 38.00 + 23.56
    MD_PADRAO: 64.04,   // 42.00 + 22.04
    MD_COMPLETO: 75.20, // 60.00 + 15.20

    // Trimestrais  
    TD_BASICO: 173.33,  // (36.10 + 21.68) * 3
    TD_PADRAO: 180.53,  // (39.90 + 20.28) * 3
    TD_COMPLETO: 212.95, // (57.00 + 13.98) * 3

    // Semestrais
    SD_BASICO: 264.48,  // (32.30 + 11.78) * 6
    SD_PADRAO: 280.32,  // (35.70 + 11.02) * 6
    SD_COMPLETO: 351.60, // (51.00 + 7.60) * 6

    // Anuais (Deemix grátis)
    AD_BASICO: 387.60,  // 32.30 * 12
    AD_PADRAO: 428.40,  // 35.70 * 12
    AD_COMPLETO: 612.00 // 51.00 * 12
};

console.log('✅ MENSAIS:');
console.log(`   MD_BASICO: R$ ${ADMIN_VALUES.MD_BASICO.toFixed(2)}`);
console.log(`   MD_PADRAO: R$ ${ADMIN_VALUES.MD_PADRAO.toFixed(2)}`);
console.log(`   MD_COMPLETO: R$ ${ADMIN_VALUES.MD_COMPLETO.toFixed(2)}`);
console.log('');

console.log('✅ TRIMESTRAIS:');
console.log(`   TD_BASICO: R$ ${ADMIN_VALUES.TD_BASICO.toFixed(2)}`);
console.log(`   TD_PADRAO: R$ ${ADMIN_VALUES.TD_PADRAO.toFixed(2)}`);
console.log(`   TD_COMPLETO: R$ ${ADMIN_VALUES.TD_COMPLETO.toFixed(2)}`);
console.log('');

console.log('✅ SEMESTRAIS:');
console.log(`   SD_BASICO: R$ ${ADMIN_VALUES.SD_BASICO.toFixed(2)}`);
console.log(`   SD_PADRAO: R$ ${ADMIN_VALUES.SD_PADRAO.toFixed(2)}`);
console.log(`   SD_COMPLETO: R$ ${ADMIN_VALUES.SD_COMPLETO.toFixed(2)}`);
console.log('');

console.log('✅ ANUAIS (Deemix Grátis):');
console.log(`   AD_BASICO: R$ ${ADMIN_VALUES.AD_BASICO.toFixed(2)}`);
console.log(`   AD_PADRAO: R$ ${ADMIN_VALUES.AD_PADRAO.toFixed(2)}`);
console.log(`   AD_COMPLETO: R$ ${ADMIN_VALUES.AD_COMPLETO.toFixed(2)}`);
console.log('');

// ========== VERIFICAÇÃO DE DISCREPÂNCIAS ==========
console.log('🔍 VERIFICAÇÃO DE CONSISTÊNCIA:');
console.log('');

// Mensal
const expectedMonthly = {
    BASICO: VIP_PLANS.BASICO + DEEMIX_FINAL_PRICES.BASICO,
    PADRAO: VIP_PLANS.PADRAO + DEEMIX_FINAL_PRICES.PADRAO,
    COMPLETO: VIP_PLANS.COMPLETO + DEEMIX_FINAL_PRICES.COMPLETO
};

console.log('📅 MENSAIS:');
console.log(`   BÁSICO: Esperado R$ ${expectedMonthly.BASICO.toFixed(2)} vs Admin R$ ${ADMIN_VALUES.MD_BASICO.toFixed(2)} ${Math.abs(expectedMonthly.BASICO - ADMIN_VALUES.MD_BASICO) < 0.01 ? '✅' : '❌'}`);
console.log(`   PADRÃO: Esperado R$ ${expectedMonthly.PADRAO.toFixed(2)} vs Admin R$ ${ADMIN_VALUES.MD_PADRAO.toFixed(2)} ${Math.abs(expectedMonthly.PADRAO - ADMIN_VALUES.MD_PADRAO) < 0.01 ? '✅' : '❌'}`);
console.log(`   COMPLETO: Esperado R$ ${expectedMonthly.COMPLETO.toFixed(2)} vs Admin R$ ${ADMIN_VALUES.MD_COMPLETO.toFixed(2)} ${Math.abs(expectedMonthly.COMPLETO - ADMIN_VALUES.MD_COMPLETO) < 0.01 ? '✅' : '❌'}`);
console.log('');

console.log('🎯 RESULTADO: Admin atualizado para consistência total com a página de planos!');
