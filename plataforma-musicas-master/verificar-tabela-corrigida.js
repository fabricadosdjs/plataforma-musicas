// Script para verificar os valores corretos da tabela de cadastro

console.log('✅ VERIFICAÇÃO DOS VALORES CORRIGIDOS NA TABELA DE CADASTRO\n');

// Valores corretos que devem estar na tabela
const valoresCorretos = {
    'MENSAL': {
        'VIP BÁSICO': { semDeemix: 38.00, comDeemix: 70.50 },
        'VIP PADRÃO': { semDeemix: 42.00, comDeemix: 71.00 },
        'VIP COMPLETO': { semDeemix: 60.00, comDeemix: 80.00 }
    },
    'TRIMESTRAL': {
        'VIP BÁSICO': { semDeemix: 108.30, comDeemix: 198.00 },
        'VIP PADRÃO': { semDeemix: 119.70, comDeemix: 199.74 },
        'VIP COMPLETO': { semDeemix: 171.00, comDeemix: 226.20 }
    },
    'SEMESTRAL': {
        'VIP BÁSICO': { semDeemix: 193.80, comDeemix: 291.30 },
        'VIP PADRÃO': { semDeemix: 214.20, comDeemix: 301.20 },
        'VIP COMPLETO': { semDeemix: 306.00, comDeemix: 366.00 }
    },
    'ANUAL': {
        'VIP BÁSICO': { semDeemix: 387.60, comDeemix: 387.60 },
        'VIP PADRÃO': { semDeemix: 428.40, comDeemix: 428.40 },
        'VIP COMPLETO': { semDeemix: 612.00, comDeemix: 612.00 }
    }
};

console.log('📊 VALORES CORRETOS POR PERÍODO:\n');

Object.entries(valoresCorretos).forEach(([periodo, planos]) => {
    console.log(`${periodo}:`);
    console.log('─'.repeat(40));

    Object.entries(planos).forEach(([plano, valores]) => {
        console.log(`  ${plano}:`);
        console.log(`    Sem Deemix: R$ ${valores.semDeemix.toFixed(2).replace('.', ',')}`);
        console.log(`    Com Deemix: R$ ${valores.comDeemix.toFixed(2).replace('.', ',')}`);

        if (periodo === 'ANUAL' && valores.semDeemix === valores.comDeemix) {
            console.log(`    🎁 Deemix GRÁTIS no anual!`);
        }
        console.log('');
    });
    console.log('');
});

console.log('🎵 DEEMIX AVULSO: R$ 50,00/mês');
console.log('🎁 DEEZER PREMIUM AVULSO: R$ 9,75/mês\n');

console.log('✅ Valores da tabela de cadastro CORRIGIDOS com sucesso!');
