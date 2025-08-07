const { ContaboStorage } = require('./src/lib/contabo-storage.ts');

async function testContaboConnection() {
    console.log('🧪 Testando conexão com Contabo Storage...');

    // Verificar variáveis de ambiente
    const requiredEnvVars = [
        'CONTABO_ENDPOINT',
        'CONTABO_REGION',
        'CONTABO_ACCESS_KEY_ID',
        'CONTABO_SECRET_ACCESS_KEY',
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
        console.log('\n💡 Configure essas variáveis no painel do Netlify ou no arquivo .env.local');
        return;
    }

    try {
        // Criar instância do ContaboStorage
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT,
            region: process.env.CONTABO_REGION,
            accessKeyId: process.env.CONTABO_ACCESS_KEY_ID,
            secretAccessKey: process.env.CONTABO_SECRET_ACCESS_KEY,
            bucketName: process.env.CONTABO_BUCKET_NAME,
        });

        console.log('\n🔗 Testando conexão...');

        // Tentar listar arquivos
        const files = await storage.listFiles();
        console.log(`✅ Conexão bem-sucedida! ${files.length} arquivos encontrados`);

        // Mostrar alguns arquivos de exemplo
        if (files.length > 0) {
            console.log('\n📁 Primeiros 5 arquivos:');
            files.slice(0, 5).forEach(file => {
                console.log(`   - ${file.filename} (${file.size} bytes)`);
            });
        }

    } catch (error) {
        console.error('\n❌ ERRO na conexão:', error.message);
        console.error('\n🔍 Detalhes do erro:', error);

        if (error.code === 'CredentialsError') {
            console.log('\n💡 Verifique suas credenciais do Contabo');
        } else if (error.code === 'NoSuchBucket') {
            console.log('\n💡 Verifique o nome do bucket');
        } else if (error.code === 'NetworkingError') {
            console.log('\n💡 Verifique o endpoint e região');
        }
    }
}

testContaboConnection().catch(console.error); 