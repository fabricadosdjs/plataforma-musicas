// Script para corrigir todos os erros de TypeScript relacionados a error handling
const fs = require('fs');
const path = require('path');

function fixAllTypeScriptErrors() {
    console.log('🔧 Corrigindo todos os erros de TypeScript...\n');

    let totalFixed = 0;

    function processFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;
            let fileFixed = false;

            // Corrigir error.message
            const messageRegex = /error\.message/g;
            if (messageRegex.test(content)) {
                newContent = newContent.replace(messageRegex, '(error as Error).message');
                fileFixed = true;
            }

            // Corrigir error.stack
            const stackRegex = /error\.stack/g;
            if (stackRegex.test(content)) {
                newContent = newContent.replace(stackRegex, '(error as Error).stack');
                fileFixed = true;
            }

            // Corrigir error.code
            const codeRegex = /error\.code/g;
            if (codeRegex.test(content)) {
                newContent = newContent.replace(codeRegex, '(error as Error).code');
                fileFixed = true;
            }

            if (fileFixed) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`✅ Corrigido: ${filePath}`);
                totalFixed++;
            }

        } catch (err) {
            console.error(`❌ Erro ao processar ${filePath}:`, err.message);
        }
    }

    function processDirectory(dir) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                processDirectory(filePath);
            } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                processFile(filePath);
            }
        });
    }

    // Processar apenas a pasta src
    const srcDir = path.join(process.cwd(), 'src');
    if (fs.existsSync(srcDir)) {
        processDirectory(srcDir);
    }

    console.log(`\n🎯 Total de arquivos corrigidos: ${totalFixed}`);
    console.log('✅ Correção concluída!');
}

// Executar a correção
fixAllTypeScriptErrors();
