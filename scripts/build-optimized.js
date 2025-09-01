#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando build otimizado...');

// 1. Limpar cache do Next.js
console.log('🧹 Limpando cache...');
try {
    if (process.platform === 'win32') {
        execSync('rmdir /s /q .next', { stdio: 'inherit' });
    } else {
        execSync('rm -rf .next', { stdio: 'inherit' });
    }
    console.log('✅ Cache limpo');
} catch (error) {
    console.log('⚠️ Erro ao limpar cache:', error.message);
}

// 2. Limpar node_modules/.cache
try {
    if (process.platform === 'win32') {
        execSync('rmdir /s /q node_modules\\.cache', { stdio: 'inherit' });
    } else {
        execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
    }
    console.log('✅ Cache do node_modules limpo');
} catch (error) {
    console.log('⚠️ Erro ao limpar cache do node_modules:', error.message);
}

// 3. Verificar se o arquivo de configuração otimizado existe
const optimizedConfigPath = path.join(process.cwd(), 'next.config.optimized.mjs');
const defaultConfigPath = path.join(process.cwd(), 'next.config.mjs');

if (fs.existsSync(optimizedConfigPath)) {
    console.log('📝 Usando configuração otimizada...');
    // Backup da configuração atual
    if (fs.existsSync(defaultConfigPath)) {
        fs.copyFileSync(defaultConfigPath, path.join(process.cwd(), 'next.config.backup.mjs'));
    }
    // Usar configuração otimizada
    fs.copyFileSync(optimizedConfigPath, defaultConfigPath);
    console.log('✅ Configuração otimizada aplicada');
}

// 4. Executar build com otimizações
console.log('🔨 Executando build...');
try {
    execSync('npm run build', {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            ANALYZE: 'false', // Desabilitar bundle analyzer por padrão
            NEXT_TELEMETRY_DISABLED: '1'
        }
    });
    console.log('✅ Build concluído com sucesso');
} catch (error) {
    console.error('❌ Erro no build:', error.message);
    process.exit(1);
}

// 5. Restaurar configuração original se necessário
if (fs.existsSync(optimizedConfigPath)) {
    const backupPath = path.join(process.cwd(), 'next.config.backup.mjs');
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, defaultConfigPath);
        fs.unlinkSync(backupPath);
        console.log('✅ Configuração original restaurada');
    }
}

// 6. Gerar relatório de tamanho do bundle
console.log('📊 Analisando tamanho do bundle...');
try {
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
        const analyzeBundle = () => {
            const staticDir = path.join(buildDir, 'static');
            if (fs.existsSync(staticDir)) {
                let totalSize = 0;
                let fileCount = 0;

                const analyzeDir = (dir) => {
                    const files = fs.readdirSync(dir);
                    files.forEach(file => {
                        const filePath = path.join(dir, file);
                        const stat = fs.statSync(filePath);

                        if (stat.isDirectory()) {
                            analyzeDir(filePath);
                        } else if (file.endsWith('.js') || file.endsWith('.css')) {
                            totalSize += stat.size;
                            fileCount++;
                        }
                    });
                };

                analyzeDir(staticDir);

                console.log(`📈 Estatísticas do bundle:`);
                console.log(`   - Total de arquivos: ${fileCount}`);
                console.log(`   - Tamanho total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
                console.log(`   - Tamanho médio por arquivo: ${(totalSize / fileCount / 1024).toFixed(2)} KB`);
            }
        };

        analyzeBundle();
    }
} catch (error) {
    console.log('⚠️ Erro ao analisar bundle:', error.message);
}

console.log('🎉 Build otimizado concluído!');
console.log('');
console.log('💡 Dicas para melhorar ainda mais a performance:');
console.log('   - Use React.memo() em componentes que re-renderizam frequentemente');
console.log('   - Implemente lazy loading para componentes pesados');
console.log('   - Use useMemo() e useCallback() para evitar recálculos desnecessários');
console.log('   - Considere usar React.lazy() para code splitting');
console.log('   - Otimize imagens usando next/image');
console.log('   - Implemente service workers para cache offline');
