const fs = require('fs');
const path = require('path');

// Carregar variáveis do .env.local
function loadEnvFile() {
    const envPath = path.join(process.cwd(), '.env.local');

    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach(line => {
            if (line && !line.startsWith('#') && line.includes('=')) {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            }
        });

        console.log('✅ Variáveis do .env.local carregadas');
    } else {
        console.log('❌ Arquivo .env.local não encontrado');
    }
}

// Carregar variáveis primeiro
loadEnvFile();

console.log('\n🧪 Testando conexão com Contabo Storage...\n');

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
    console.log('\n💡 Verifique se o arquivo .env.local está correto');
    return;
}

console.log('\n✅ Todas as variáveis estão configuradas!');
console.log('💡 Agora teste a página /admin/contabo no navegador');
console.log('   http://localhost:3000/admin/contabo'); 