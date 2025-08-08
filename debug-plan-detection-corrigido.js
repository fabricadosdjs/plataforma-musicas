// Script para testar a detecção correta de planos - VERSÃO CORRIGIDA

console.log('🧪 TESTE DE DETECÇÃO DE PLANOS\n');

// Simulando a lógica corrigida
function getUserPlan(valor, hasDeemix = false, hasDeezerPremium = false) {
    if (!valor || valor < 35) {
        return null;
    }

    // Simular cálculo do preço base
    let basePrice = valor;

    // Se tem Deemix, tentar calcular o preço base
    if (hasDeemix) {
        // Para planos com Deemix, deduzir o valor do Deemix
        if (valor === 70.50) basePrice = 38; // BÁSICO + Deemix
        else if (valor === 71.00) basePrice = 42; // PADRÃO + Deemix
        else if (valor === 80.00) basePrice = 60; // COMPLETO + Deemix
    }

    console.log(`📊 Valor total: R$ ${valor}, Preço base calculado: R$ ${basePrice}, Tem Deemix: ${hasDeemix}`);

    // VIP Plans baseados nos thresholds corretos (>=60, >=42, >=38)
    if (basePrice >= 60) {
        return { name: 'VIP COMPLETO', icon: '🥇', basePrice: 60 };
    }

    if (basePrice >= 42) {
        return { name: 'VIP PADRÃO', icon: '🥈', basePrice: 42 };
    }

    if (basePrice >= 38) {
        return { name: 'VIP BÁSICO', icon: '🥉', basePrice: 38 };
    }

    return null;
}

// Casos de teste
const testCases = [
    { valor: 38, hasDeemix: false, expected: 'VIP BÁSICO', desc: 'VIP Básico sem Deemix' },
    { valor: 42, hasDeemix: false, expected: 'VIP PADRÃO', desc: 'VIP Padrão sem Deemix' },
    { valor: 50, hasDeemix: false, expected: '?', desc: 'Caso reportado - R$ 50 sem Deemix' },
    { valor: 60, hasDeemix: false, expected: 'VIP COMPLETO', desc: 'VIP Completo sem Deemix' },
    { valor: 70.50, hasDeemix: true, expected: 'VIP BÁSICO', desc: 'VIP Básico com Deemix' },
    { valor: 71, hasDeemix: true, expected: 'VIP PADRÃO', desc: 'VIP Padrão com Deemix' },
    { valor: 80, hasDeemix: true, expected: 'VIP COMPLETO', desc: 'VIP Completo com Deemix' },
];

testCases.forEach((testCase, index) => {
    const result = getUserPlan(testCase.valor, testCase.hasDeemix);
    const success = result?.name === testCase.expected || testCase.expected === '?';

    console.log(`\nTeste ${index + 1}: ${success ? '✅' : '❌'} ${testCase.desc}`);
    console.log(`  💰 Valor: R$ ${testCase.valor} ${testCase.hasDeemix ? '(com Deemix)' : ''}`);
    console.log(`  🎯 Esperado: ${testCase.expected}`);
    console.log(`  📋 Resultado: ${result?.name || 'null'}`);

    if (testCase.valor === 50 && !testCase.hasDeemix) {
        console.log(`  🔍 Análise: R$ 50 < R$ 60 (threshold VIP COMPLETO)`);
        console.log(`  🤔 R$ 50 >= R$ 42 (threshold VIP PADRÃO) = ${50 >= 42}`);
        console.log(`  💡 Pela lógica atual: deveria ser VIP PADRÃO`);
        console.log(`  ⚠️  Se é VIP COMPLETO, o valor deveria ser >= R$ 60`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('📋 ANÁLISE DO PROBLEMA REPORTADO');
console.log('='.repeat(60));

console.log('\n🔍 Situação atual:');
console.log('- Usuário mostra: VIP PADRÃO (🥈)');
console.log('- Valor: R$ 50/mês');
console.log('- Usuário afirma: deveria ser VIP COMPLETO');

console.log('\n📊 Thresholds atuais:');
console.log('- VIP BÁSICO: >= R$ 38');
console.log('- VIP PADRÃO: >= R$ 42');
console.log('- VIP COMPLETO: >= R$ 60');

console.log('\n🧮 Análise do valor R$ 50:');
console.log(`- R$ 50 >= R$ 60? ${50 >= 60} (VIP COMPLETO)`);
console.log(`- R$ 50 >= R$ 42? ${50 >= 42} (VIP PADRÃO)`);
console.log(`- R$ 50 >= R$ 38? ${50 >= 38} (VIP BÁSICO)`);

console.log('\n💡 POSSÍVEIS CAUSAS:');
console.log('1. 🗃️  Erro no banco: usuário tem valor errado salvo');
console.log('2. ⚙️  Configuração: VIP COMPLETO deveria começar em R$ 50');
console.log('3. 🧮 Cálculo: R$ 50 é preço com desconto de período mais longo');
console.log('4. 📝 Dado: falta informação sobre período (trimestral/anual)');

console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
console.log('1. Verificar valor real no banco de dados');
console.log('2. Confirmar se é valor mensal ou de período mais longo');
console.log('3. Ajustar thresholds se necessário');
console.log('4. Corrigir valor no banco se estiver errado');

console.log('\n✅ TESTE CONCLUÍDO');
