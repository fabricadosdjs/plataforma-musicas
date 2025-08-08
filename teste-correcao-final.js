// Teste final da correção de detecção de planos

console.log('🔧 TESTE DA CORREÇÃO - VIP COMPLETO R$ 50\n');

// Função corrigida
function getUserPlan(valor, hasDeemix = false, hasDeezerPremium = false) {
    if (!valor || valor < 35) {
        return null;
    }

    let basePrice = valor;

    // Se tem Deemix, calcular preço base
    if (hasDeemix) {
        if (valor === 70.50) basePrice = 38; // BÁSICO + Deemix
        else if (valor === 71.00) basePrice = 42; // PADRÃO + Deemix
        else if (valor === 70.00) basePrice = 50; // COMPLETO + Deemix (corrigido)
    }

    // Thresholds corrigidos (>=50, >=42, >=38)
    if (basePrice >= 50) {
        return { name: 'VIP COMPLETO', icon: '🥇', basePrice: 50 };
    }

    if (basePrice >= 42) {
        return { name: 'VIP PADRÃO', icon: '🥈', basePrice: 42 };
    }

    if (basePrice >= 38) {
        return { name: 'VIP BÁSICO', icon: '🥉', basePrice: 38 };
    }

    return null;
}

// Teste do caso específico reportado
console.log('📋 CASO REPORTADO:');
console.log('Valor: R$ 50/mês, sem Deemix');

const resultado = getUserPlan(50, false);
console.log(`Resultado: ${resultado?.name} ${resultado?.icon}`);
console.log(`✅ CORREÇÃO: ${resultado?.name === 'VIP COMPLETO' ? 'SUCESSO' : 'FALHOU'}\n`);

// Teste completo dos novos thresholds
console.log('📊 NOVOS THRESHOLDS TESTADOS:');
console.log('- VIP BÁSICO: >= R$ 38');
console.log('- VIP PADRÃO: >= R$ 42');
console.log('- VIP COMPLETO: >= R$ 50 (CORRIGIDO)\n');

const testCases = [
    { valor: 37, expected: null, desc: 'Abaixo do threshold' },
    { valor: 38, expected: 'VIP BÁSICO', desc: 'Mínimo VIP Básico' },
    { valor: 41, expected: 'VIP BÁSICO', desc: 'Ainda VIP Básico' },
    { valor: 42, expected: 'VIP PADRÃO', desc: 'Mínimo VIP Padrão' },
    { valor: 49, expected: 'VIP PADRÃO', desc: 'Ainda VIP Padrão' },
    { valor: 50, expected: 'VIP COMPLETO', desc: 'Mínimo VIP Completo - CASO CORRIGIDO' },
    { valor: 60, expected: 'VIP COMPLETO', desc: 'VIP Completo alto' },
];

testCases.forEach((test, index) => {
    const result = getUserPlan(test.valor, false);
    const success = (result?.name === test.expected) || (result === null && test.expected === null);

    console.log(`${index + 1}. ${success ? '✅' : '❌'} ${test.desc}`);
    console.log(`   R$ ${test.valor} → ${result?.name || 'null'}`);
});

console.log('\n💰 RECÁLCULO DOS VALORES COM DEEMIX:');
console.log('Com os novos preços base:');
console.log('- VIP BÁSICO (R$ 38) + Deemix (R$ 32,50) = R$ 70,50');
console.log('- VIP PADRÃO (R$ 42) + Deemix (R$ 29,00) = R$ 71,00');
console.log('- VIP COMPLETO (R$ 50) + Deemix (R$ 20,00) = R$ 70,00 ⚠️');

console.log('\n🚨 ATENÇÃO:');
console.log('Com VIP COMPLETO = R$ 50, o valor com Deemix seria R$ 70,00');
console.log('Isso é menor que VIP BÁSICO + Deemix (R$ 70,50)');
console.log('Recomenda-se manter VIP COMPLETO = R$ 60 para consistência\n');

console.log('✅ TESTE CONCLUÍDO');
