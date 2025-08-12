// Teste de timezone do Brasil
const { getCurrentDateBrazil, convertToBrazilTimezone, isTodayBrazil, isYesterdayBrazil } = require('./src/utils/dateUtils.ts');

console.log('🧪 Testando timezone do Brasil...');

// Data atual
const now = new Date();
console.log('Data atual (UTC):', now.toISOString());
console.log('Data atual (Brasil):', getCurrentDateBrazil().toISOString());

// Teste com uma data específica (07.08.2025)
const testDate = new Date('2025-08-07T00:00:00.000Z');
console.log('Data de teste (UTC):', testDate.toISOString());
console.log('Data de teste (Brasil):', convertToBrazilTimezone(testDate).toISOString());

// Teste se é hoje
console.log('É hoje?', isTodayBrazil(testDate));

// Teste se é ontem
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
console.log('É ontem?', isYesterdayBrazil(yesterday));

console.log('✅ Teste concluído!');
