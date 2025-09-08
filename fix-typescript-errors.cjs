// Script para identificar e corrigir erros de TypeScript
const fs = require('fs');
const path = require('path');

function fixTypeScriptErrors() {
    console.log('🔍 Identificando e corrigindo erros de TypeScript...\n');

    const errors = [
        {
            file: 'src/app/api/library/route.ts',
            line: 99,
            error: "Type error: 'error' is of type 'unknown'",
            fix: (content) => {
                // Corrigir error.stack para (error as Error).stack
                return content.replace(
                    /console\.error\('Stack trace:', error\.stack\);/g,
                    'console.error(\'Stack trace:\', (error as Error).stack);'
                );
            }
        }
    ];

    let fixedCount = 0;

    errors.forEach(({ file, line, error, fix }) => {
        const filePath = path.join(process.cwd(), file);

        if (fs.existsSync(filePath)) {
            console.log(`📁 Corrigindo: ${file}:${line}`);
            console.log(`❌ Erro: ${error}`);

            try {
                let content = fs.readFileSync(filePath, 'utf8');
                const originalContent = content;

                content = fix(content);

                if (content !== originalContent) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`✅ Corrigido: ${file}`);
                    fixedCount++;
                } else {
                    console.log(`⚠️ Nenhuma mudança necessária: ${file}`);
                }
            } catch (err) {
                console.error(`❌ Erro ao corrigir ${file}:`, err.message);
            }
        } else {
            console.log(`⚠️ Arquivo não encontrado: ${file}`);
        }

        console.log('');
    });

    console.log(`🎯 Total de erros corrigidos: ${fixedCount}`);

    // Verificar se há outros erros similares no projeto
    console.log('\n🔍 Verificando outros possíveis erros similares...');

    const searchPatterns = [
        {
            pattern: /error\.stack/g,
            description: 'Uso de error.stack sem type assertion'
        },
        {
            pattern: /error\.message/g,
            description: 'Uso de error.message sem type assertion'
        },
        {
            pattern: /error\.code/g,
            description: 'Uso de error.code sem type assertion'
        }
    ];

    function searchInDirectory(dir, patterns) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                searchInDirectory(filePath, patterns);
            } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');

                    patterns.forEach(({ pattern, description }) => {
                        const matches = content.match(pattern);
                        if (matches) {
                            console.log(`⚠️ ${description} encontrado em: ${filePath}`);
                            matches.forEach(match => {
                                console.log(`   - ${match}`);
                            });
                        }
                    });
                } catch (err) {
                    // Ignorar erros de leitura
                }
            }
        });
    }

    searchInDirectory(path.join(process.cwd(), 'src'), searchPatterns);

    console.log('\n✅ Verificação concluída!');
}

// Executar a correção
fixTypeScriptErrors();
