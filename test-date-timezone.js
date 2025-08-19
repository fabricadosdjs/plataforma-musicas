// Teste para verificar o problema de timezone
const testDate = "2025-08-18"; // Data que deveria ser hoje

console.log('🔍 Testando data:', testDate);

// Simular a função convertToBrazilTimezone
function convertToBrazilTimezone(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    console.log('📅 Data original:', dateObj);
    console.log('🌍 Data UTC:', dateObj.toISOString());

    const brazilDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    console.log('🇧🇷 Data Brasil:', brazilDate);

    return brazilDate;
}

// Simular a função getDateOnlyBrazil
function getDateOnlyBrazil(date) {
    const brazilDate = convertToBrazilTimezone(date);
    const dateOnly = new Date(brazilDate.getFullYear(), brazilDate.getMonth(), brazilDate.getDate());
    console.log('📅 Data apenas (sem hora):', dateOnly);
    return dateOnly;
}

// Simular a função getCurrentDateBrazil
function getCurrentDateBrazil() {
    const now = new Date();
    console.log('🕐 Agora (UTC):', now);
    const brazilNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    console.log('🕐 Agora (Brasil):', brazilNow);
    return brazilNow;
}

// Simular a função compareDatesOnly
function compareDatesOnly(date1, date2) {
    const date1Only = getDateOnlyBrazil(date1);
    const date2Only = getDateOnlyBrazil(date2);
    const isEqual = date1Only.getTime() === date2Only.getTime();
    console.log('🔍 Comparação:', date1Only, '===', date2Only, '=', isEqual);
    return isEqual;
}

// Testar
console.log('\n🧪 TESTANDO FUNÇÕES:');
const trackDate = testDate;
const today = getCurrentDateBrazil();

console.log('\n📊 RESULTADO:');
const isToday = compareDatesOnly(trackDate, today);
console.log('✅ É hoje?', isToday);

// Verificar o problema
console.log('\n🔍 DIAGNÓSTICO:');
const trackDateObj = new Date(testDate);
console.log('📅 Track date (string):', testDate);
console.log('📅 Track date (Date):', trackDateObj);
console.log('🌍 Track date (ISO):', trackDateObj.toISOString());

// Problema: quando criamos new Date("2025-08-18"), ele assume UTC 00:00:00
// Mas o Brasil está em UTC-3, então quando convertemos para o timezone do Brasil
// a data pode mudar para o dia anterior

console.log('\n💡 SOLUÇÃO:');
console.log('Para datas sem hora, devemos usar: new Date("2025-08-18T00:00:00")');
const fixedDate = new Date("2025-08-18T00:00:00");
console.log('📅 Data corrigida:', fixedDate);
console.log('🌍 Data corrigida (ISO):', fixedDate.toISOString());
