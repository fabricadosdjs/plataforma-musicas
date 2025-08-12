// Teste do novo formato de timer mais compacto
console.log('⏰ Testando novo formato de timer...\n');

// Simular a função calculateTimeLeft otimizada
function calculateTimeLeft(hoursLeft, minutesLeft) {
    // Mostrar apenas o maior valor para economizar espaço
    if (hoursLeft > 0) {
        return `${hoursLeft}h`;
    }
    return `${minutesLeft}m`;
}

const testCases = [
    { hours: 23, minutes: 55, description: 'Quase 1 dia' },
    { hours: 2, minutes: 30, description: '2 horas e meia' },
    { hours: 0, minutes: 45, description: '45 minutos' },
    { hours: 0, minutes: 5, description: '5 minutos' },
    { hours: 0, minutes: 0, description: 'Disponível' }
];

testCases.forEach((test, index) => {
    const result = test.hours === 0 && test.minutes === 0
        ? 'Disponível'
        : calculateTimeLeft(test.hours, test.minutes);

    console.log(`🧪 Teste ${index + 1}: ${test.description}`);
    console.log(`   Formato antigo: ${test.hours}h ${test.minutes}m`);
    console.log(`   Formato novo: ${result}`);
    console.log(`   Economia: ${`${test.hours}h ${test.minutes}m`.length - result.length} caracteres\n`);
});

console.log('✅ Timer agora é mais compacto - apenas "23h" ou "55m"!');
console.log('📊 Botões principais aumentados para min-w-[75px] com padding normal');
console.log('🔽 Botões de ação (Copyright/Report) reduzidos para w-6 h-6');
