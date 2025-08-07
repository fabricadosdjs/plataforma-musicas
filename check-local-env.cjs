const fs = require('fs');
const path = require('path');

console.log('🧪 Verificando variáveis de ambiente locais...\n');

// Verificar se os arquivos .env existem
const envFiles = ['.env', '.env.local', '.env.development'];

console.log('📁 Arquivos .env encontrados:');
envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - EXISTE`);

        // Ler o conteúdo do arquivo
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            // Verificar variáveis do Contabo
            const contaboVars = lines.filter(line =>
                line.includes('CONTABO_') && !line.startsWith('#')
            );

            if (contaboVars.length > 0) {
                console.log(`   📋 Variáveis do Contabo em ${file}:`);
                contaboVars.forEach(line => {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        const displayValue = key.includes('KEY') ? '***' : value.trim();
                        console.log(`      ${key.trim()}: ${displayValue}`);
                    }
                });
            } else {
                console.log(`   ❌ Nenhuma variável do Contabo encontrada em ${file}`);
            }
        } catch (error) {
            console.log(`   ❌ Erro ao ler ${file}: ${error.message}`);
        }
    } else {
        console.log(`❌ ${file} - NÃO EXISTE`);
    }
});

console.log('\n🔍 Verificando variáveis de ambiente do processo:');
const requiredEnvVars = [
    'CONTABO_ENDPOINT',
    'CONTABO_REGION',
    'CONTABO_ACCESS_KEY_ID',
    'CONTABO_SECRET_ACCESS_KEY',
    'CONTABO_BUCKET_NAME'
];

requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${varName.includes('KEY') ? '***' : value}`);
    } else {
        console.log(`❌ ${varName}: NÃO DEFINIDA`);
    }
});

console.log('\n💡 Para configurar localmente:');
console.log('   1. Edite o arquivo .env.local');
console.log('   2. Adicione as variáveis do Contabo:');
console.log('      CONTABO_ENDPOINT=https://usc1.contabostorage.com');
console.log('      CONTABO_REGION=usc1');
console.log('      CONTABO_ACCESS_KEY_ID=sua_access_key_id');
console.log('      CONTABO_SECRET_ACCESS_KEY=sua_secret_access_key');
console.log('      CONTABO_BUCKET_NAME=nome_do_seu_bucket');
console.log('   3. Reinicie o servidor de desenvolvimento'); 