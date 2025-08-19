// Teste específico para debugar o problema da data
const testDate = "2025-08-18"; // Data que deveria ser hoje

console.log('🔍 Testando data específica:', testDate);

// Simular exatamente as funções do dateUtils.ts
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

    console.log('📅 Data da track (original):', date);
    console.log('📅 Data da track (convertida):', brazilDate);
    console.log('📅 Data da track (só data):', dateOnly);
    console.log('📅 Hoje (original):', today);
    console.log('📅 Hoje (só data):', todayOnly);
    console.log('📅 Ontem (original):', yesterday);
    console.log('📅 Ontem (só data):', yesterdayOnly);

    console.log('\n🔍 COMPARAÇÕES:');
    console.log('Track vs Hoje:', dateOnly.getTime(), '===', todayOnly.getTime(), '=', dateOnly.getTime() === todayOnly.getTime());
    console.log('Track vs Ontem:', dateOnly.getTime(), '===', yesterdayOnly.getTime(), '=', dateOnly.getTime() === yesterdayOnly.getTime());

    console.log('\n🔍 TIMESTAMPS:');
    console.log('Track timestamp:', dateOnly.getTime());
    console.log('Hoje timestamp:', todayOnly.getTime());
    console.log('Ontem timestamp:', yesterdayOnly.getTime());

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

// Testar com a data atual real
const now = new Date();
console.log('\n📅 DATA ATUAL REAL:', now);
console.log('📅 DATA ATUAL BRASIL:', getCurrentDateBrazil());

// Testar com a data específica
console.log('\n🧪 TESTANDO DATA ESPECÍFICA:');
const result = getDateKeyBrazil(testDate);
console.log('\n🔑 RESULTADO:', result);

// Testar com outras datas para comparação
console.log('\n🧪 TESTANDO OUTRAS DATAS:');
console.log('2025-08-17 (ontem):', getDateKeyBrazil('2025-08-17'));
console.log('2025-08-19 (amanhã):', getDateKeyBrazil('2025-08-19'));
