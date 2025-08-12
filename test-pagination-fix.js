// Teste para verificar se a correção da paginação está funcionando
const { ContaboStorage } = require('./src/lib/contabo-storage.ts');

async function testPaginationFix() {
    console.log('🧪 Testando correção da paginação no ContaboStorage...');

    // Verificar variáveis de ambiente
    const requiredEnvVars = [
        'CONTABO_ENDPOINT',
        'CONTABO_REGION',
        'CONTABO_ACCESS_KEY',
        'CONTABO_SECRET_KEY',
        'CONTABO_BUCKET_NAME'
    ];

    console.log('\n📋 Variáveis de ambiente necessárias:');
    requiredEnvVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            console.log(`✅ ${varName}: ${varName.includes('KEY') ? '***' : value}`);
        } else {
            console.log(`❌ ${varName}: NÃO DEFINIDA`);
        }
    });

    // Verificar se todas as variáveis estão definidas
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.log('\n❌ ERRO: Variáveis de ambiente faltando:');
        missingVars.forEach(varName => console.log(`   - ${varName}`));
        console.log('\n💡 Configure essas variáveis no arquivo .env.local');
        return;
    }

    try {
        // Criar instância do ContaboStorage
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT,
            region: process.env.CONTABO_REGION,
            accessKeyId: process.env.CONTABO_ACCESS_KEY,
            secretAccessKey: process.env.CONTABO_SECRET_KEY,
            bucketName: process.env.CONTABO_BUCKET_NAME,
        });

        console.log('\n🔗 Testando listagem com paginação...');

        // Testar listagem de todos os arquivos
        console.log('📁 Listando todos os arquivos...');
        const startTime = Date.now();
        const allFiles = await storage.listFiles();
        const endTime = Date.now();

        console.log(`✅ Listagem concluída em ${endTime - startTime}ms`);
        console.log(`📊 Total de arquivos encontrados: ${allFiles.length}`);

        // Testar listagem apenas de arquivos de áudio
        console.log('\n🎵 Listando apenas arquivos de áudio...');
        const startTimeAudio = Date.now();
        const audioFiles = await storage.listAudioFiles();
        const endTimeAudio = Date.now();

        console.log(`✅ Listagem de áudio concluída em ${endTimeAudio - startTimeAudio}ms`);
        console.log(`📊 Total de arquivos de áudio encontrados: ${audioFiles.length}`);

        // Mostrar alguns arquivos de exemplo
        if (allFiles.length > 0) {
            console.log('\n📋 Primeiros 10 arquivos encontrados:');
            allFiles.slice(0, 10).forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.filename} (${file.key}) - ${file.size} bytes - ${file.isAudio ? '🎵 Áudio' : '📄 Outro'}`);
            });
        }

        if (audioFiles.length > 0) {
            console.log('\n🎵 Primeiros 10 arquivos de áudio:');
            audioFiles.slice(0, 10).forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.filename} (${file.key}) - ${file.size} bytes`);
            });
        }

        // Verificar se há mais de 1000 arquivos (teste da paginação)
        if (allFiles.length > 1000) {
            console.log('\n🎉 PAGINAÇÃO FUNCIONANDO! Encontrados mais de 1000 arquivos.');
        } else if (allFiles.length === 1000) {
            console.log('\n⚠️ ATENÇÃO: Exatamente 1000 arquivos encontrados. Pode haver mais arquivos não listados.');
        } else {
            console.log('\nℹ️ Menos de 1000 arquivos encontrados. Paginação não necessária.');
        }

    } catch (error) {
        console.error('\n❌ ERRO no teste:', error.message);
        console.error('\n🔍 Detalhes do erro:', error);
    }
}

testPaginationFix().catch(console.error);
