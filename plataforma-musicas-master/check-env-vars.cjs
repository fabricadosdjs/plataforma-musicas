console.log('🧪 Verificando variáveis de ambiente do Contabo...\n');

// Verificar variáveis de ambiente
const requiredEnvVars = [
    'CONTABO_ENDPOINT',
    'CONTABO_REGION',
    'CONTABO_ACCESS_KEY_ID',
    'CONTABO_SECRET_ACCESS_KEY',
    'CONTABO_BUCKET_NAME'
];

console.log('📋 Variáveis de ambiente necessárias:');
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
    console.log('\n💡 Configure essas variáveis no painel do Netlify:');
    console.log('   1. Acesse o painel do Netlify');
    console.log('   2. Vá em Site settings > Environment variables');
    console.log('   3. Adicione cada variável com seu respectivo valor');
    console.log('\n🔧 Valores necessários:');
    console.log('   - CONTABO_ENDPOINT: https://usc1.contabostorage.com');
    console.log('   - CONTABO_REGION: usc1');
    console.log('   - CONTABO_ACCESS_KEY_ID: Sua Access Key ID');
    console.log('   - CONTABO_SECRET_ACCESS_KEY: Sua Secret Access Key');
    console.log('   - CONTABO_BUCKET_NAME: Nome do seu bucket');
} else {
    console.log('\n✅ Todas as variáveis estão configuradas!');
    console.log('💡 Se ainda houver erro 500, verifique:');
    console.log('   1. Se as credenciais estão corretas');
    console.log('   2. Se o bucket existe e está acessível');
    console.log('   3. Se a região está correta');
} 