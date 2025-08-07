const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo região do Contabo...\n');

const envLocalPath = path.join(process.cwd(), '.env.local');

try {
    // Ler o arquivo atual
    const content = fs.readFileSync(envLocalPath, 'utf8');

    // Substituir a região incorreta
    const correctedContent = content.replace(
        /CONTABO_REGION=us-east-1/g,
        'CONTABO_REGION=usc1'
    );

    // Verificar se houve mudança
    if (content !== correctedContent) {
        // Salvar o arquivo corrigido
        fs.writeFileSync(envLocalPath, correctedContent);
        console.log('✅ Região corrigida de "us-east-1" para "usc1"');
    } else {
        console.log('ℹ️ Região já está correta ou não foi encontrada');
    }

    // Mostrar as variáveis do Contabo após correção
    console.log('\n📋 Variáveis do Contabo após correção:');
    const lines = correctedContent.split('\n');
    const contaboVars = lines.filter(line =>
        line.includes('CONTABO_') && !line.startsWith('#')
    );

    contaboVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            const displayValue = key.includes('KEY') ? '***' : value.trim();
            console.log(`   ${key.trim()}: ${displayValue}`);
        }
    });

    console.log('\n💡 Agora reinicie o servidor de desenvolvimento:');
    console.log('   npm run dev');

} catch (error) {
    console.error('❌ Erro ao corrigir arquivo:', error.message);
} 