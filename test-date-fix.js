// Teste para verificar e corrigir o problema da data
const testDate = "2025-08-18"; // Data que deveria ser hoje

console.log('🔍 Testando data:', testDate);

// Simular a função convertToBrazilTimezone corrigida
function convertToBrazilTimezone(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Se a data é uma string sem hora (ex: "2025-08-18"), assumir que é no timezone local do Brasil
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Criar a data no timezone local do Brasil (meio-dia para evitar problemas de timezone)
        const [year, month, day] = date.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }

    const brazilDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return brazilDate;
}

// Simular a função getDateOnlyBrazil
function getDateOnlyBrazil(date) {
    const brazilDate = convertToBrazilTimezone(date);
    return new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate());
}

// Simular a função getCurrentDateBrazil
function getCurrentDateBrazil() {
    const now = new Date();
    const brazilNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return brazilNow;
}

// Simular a função compareDatesOnly
function compareDatesOnly(date1, date2) {
    const date1Only = getDateOnlyBrazil(date1);
    const date2Only = getDateOnlyBrazil(date2);
    return date1Only.getTime() === date2Only.getTime();
}

// Simular a função getDateKeyBrazil corrigida
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

// Simular a função formatDateExtendedBrazil
function formatDateExtendedBrazil(date) {
    const brazilDate = convertToBrazilTimezone(date);

    const diaSemana = brazilDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dia = brazilDate.getDate();
    const mes = brazilDate.toLocaleDateString('pt-BR', { month: 'long' });
    const ano = brazilDate.getFullYear();

    // Capitalizar primeira letra do dia da semana
    const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

    return `${diaSemanaCapitalizado}, ${dia} de ${mes} de ${ano}`;
}

// Testar
console.log('\n🧪 TESTANDO FUNÇÕES:');
const trackDate = testDate;
const today = getCurrentDateBrazil();

console.log('\n📊 RESULTADO:');
const dateKey = getDateKeyBrazil(trackDate);
console.log('🔑 Chave da data:', dateKey);

// Testar formatação
const formattedDate = formatDateExtendedBrazil(trackDate);
console.log('📝 Data formatada:', formattedDate);

// Verificar se está funcionando
if (dateKey === 'today') {
    console.log('✅ CORRETO: A data está sendo identificada como "hoje"');
} else {
    console.log('❌ PROBLEMA: A data está sendo identificada incorretamente como:', dateKey);
}
