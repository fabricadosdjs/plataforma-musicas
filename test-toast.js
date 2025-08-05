// Teste dos toasts
const testToasts = () => {
    try {
        console.log('🧪 Testando sistema de toasts...');

        // Simular um toast de teste
        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('🧪 Teste de toast funcionando!', 'info', 5000);
            console.log('✅ Toast de teste enviado');
        } else {
            console.log('❌ Função showToast não encontrada');
        }

    } catch (error) {
        console.error('❌ Erro no teste de toasts:', error);
    }
};

// Função para testar toasts via console
window.testToasts = testToasts;

// Executar teste se estiver no browser
if (typeof window !== 'undefined') {
    // Aguardar um pouco para o React carregar
    setTimeout(() => {
        testToasts();
    }, 2000);
}

module.exports = { testToasts }; 