// Teste da correção do DownloadExtensionDetector
const testDownloadDetectorFix = async () => {
    console.log('🧪 Testando correção do DownloadExtensionDetector...');

    try {
        // Teste 1: Verificar se o método detectExtensions funciona
        const { DownloadExtensionDetector } = await import('/src/utils/downloadDetector.ts');

        if (typeof DownloadExtensionDetector.detectExtensions === 'function') {
            console.log('✅ Método detectExtensions existe');

            // Teste 2: Verificar se não há erros ao executar
            try {
                const extensions = DownloadExtensionDetector.detectExtensions();
                console.log('✅ detectExtensions executou sem erros:', extensions);
            } catch (error) {
                console.log('❌ Erro ao executar detectExtensions:', error);
            }
        } else {
            console.log('❌ Método detectExtensions não existe');
        }

        // Teste 3: Verificar outros métodos
        if (typeof DownloadExtensionDetector.isDownloadExtensionActive === 'function') {
            console.log('✅ Método isDownloadExtensionActive existe');
        } else {
            console.log('❌ Método isDownloadExtensionActive não existe');
        }

        if (typeof DownloadExtensionDetector.getDetectedExtensions === 'function') {
            console.log('✅ Método getDetectedExtensions existe');
        } else {
            console.log('❌ Método getDetectedExtensions não existe');
        }

    } catch (error) {
        console.log('❌ Erro ao importar DownloadExtensionDetector:', error);
    }
};

// Executar teste se estiver no browser
if (typeof window !== 'undefined') {
    testDownloadDetectorFix();
} else {
    console.log('Script deve ser executado no browser');
} 