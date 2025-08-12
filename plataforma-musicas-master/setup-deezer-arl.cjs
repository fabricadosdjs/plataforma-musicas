const fs = require('fs');
const path = require('path');

// ARL fornecido pelo usuário
const DEEZER_ARL = '048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e';

console.log('🎵 Configurando ARL do Deezer');
console.log('=============================');

// Verificar se o arquivo .env existe
const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

let envContent = '';

// Tentar ler .env.local primeiro, depois .env
if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
    console.log('📁 Arquivo .env.local encontrado');
} else if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📁 Arquivo .env encontrado');
} else {
    console.log('📁 Criando novo arquivo .env');
}

// Verificar se DEEZER_ARL já existe
if (envContent.includes('DEEZER_ARL=')) {
    // Atualizar ARL existente
    envContent = envContent.replace(
        /DEEZER_ARL=.*/,
        `DEEZER_ARL=${DEEZER_ARL}`
    );
    console.log('✅ ARL atualizado no arquivo existente');
} else {
    // Adicionar nova linha
    envContent += `\n# Deezer ARL para downloads\nDEEZER_ARL=${DEEZER_ARL}\n`;
    console.log('✅ ARL adicionado ao arquivo');
}

// Salvar no arquivo apropriado
const targetPath = fs.existsSync(envLocalPath) ? envLocalPath : envPath;
fs.writeFileSync(targetPath, envContent);

console.log(`💾 ARL salvo em: ${targetPath}`);
console.log(`🔑 ARL configurado: ${DEEZER_ARL.substring(0, 20)}...`);
console.log('📋 Qualidade: 128 kbps');
console.log('\n✅ Configuração concluída!');
console.log('🔄 Reinicie o servidor para aplicar as mudanças.');
