// Debug do problema das datas
const testDate = "2025-08-18";

console.log('🔍 Debug da data:', testDate);

// Simular as funções do dateUtils.ts
function getCurrentDateBrazil() {
    const now = new Date();
    const brazilOffset = -3 * 60; // UTC-3 para Brasil
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (brazilOffset * 60000));
}

function convertToBrazilTimezone(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }

    const brazilDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return brazilDate;
}

function getDateOnlyBrazil(date) {
    const brazilDate = convertToBrazilTimezone(date);
    return new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate());
}

function compareDatesOnly(date1, date2) {
    const date1Only = getDateOnlyBrazil(date1);
    const date2Only = getDateOnlyBrazil(date2);
    return date1Only.getTime() === date2Only.getTime();
}

function getDateKeyBrazil(date) {
    const brazilDate = convertToBrazilTimezone(date);
    const today = getCurrentDateBrazil();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = getDateOnlyBrazil(brazilDate);
    const todayOnly = getDateOnlyBrazil(today);
    const yesterdayOnly = getDateOnlyBrazil(yesterday);

    console.log('📅 Data da track:', dateOnly);
    console.log('📅 Hoje:', todayOnly);
    console.log('📅 Ontem:', yesterdayOnly);
    console.log('🔍 Comparação com hoje:', compareDatesOnly(dateOnly, todayOnly));
    console.log('🔍 Comparação com ontem:', compareDatesOnly(dateOnly, yesterdayOnly));

    if (compareDatesOnly(dateOnly, todayOnly)) {
        return 'today';
    } else if (compareDatesOnly(dateOnly, yesterdayOnly)) {
        return 'yesterday';
    } else if (dateOnly > todayOnly) {
        return 'future';
    } else {
        return dateOnly.toISOString().split('T')[0];
    }
}

function formatDateExtendedBrazil(date) {
    const brazilDate = convertToBrazilTimezone(date);

    const diaSemana = brazilDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dia = brazilDate.getDate();
    const mes = brazilDate.toLocaleDateString('pt-BR', { month: 'long' });
    const ano = brazilDate.getFullYear();

    console.log('📝 Dia da semana (raw):', diaSemana);
    console.log('📝 Dia:', dia);
    console.log('📝 Mês (raw):', mes);
    console.log('📝 Ano:', ano);

    // Capitalizar primeira letra do dia da semana
    const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

    console.log('📝 Dia da semana capitalizado:', diaSemanaCapitalizado);

    return `${diaSemanaCapitalizado}, ${dia} de ${mes} de ${ano}`;
}

// Testar
console.log('\n🧪 TESTANDO FUNÇÕES:');
const result = getDateKeyBrazil(testDate);
console.log('🔑 Resultado da chave:', result);

const formattedDate = formatDateExtendedBrazil(testDate);
console.log('📝 Data formatada:', formattedDate);

// Verificar se está funcionando
if (result === 'today') {
    console.log('✅ CORRETO: Data identificada como "hoje"');
} else {
    console.log('❌ PROBLEMA: Data identificada como:', result);
}
