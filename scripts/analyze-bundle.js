#!/usr/bin/env node

/**
 * Script para analisar e otimizar o bundle do Next.js
 * Identifica dependências desnecessárias e sugere otimizações
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Analisando bundle do Next.js...\n');

// Dependências que podem ser removidas ou otimizadas
const heavyDependencies = [
    'puppeteer',           // ~300MB - não usado no frontend
    '@foobar404/wave',     // ~50MB - não usado
    'drizzle-orm',         // ~20MB - não usado no frontend
    'cheerio',             // ~15MB - apenas em API
    'ffmpeg-static',       // ~100MB - apenas em scripts
    'archiver',            // ~10MB - apenas em scripts
    'jszip',               // ~8MB - apenas em scripts
    'fs-extra',            // ~5MB - apenas em scripts
    'nodemailer',          // ~15MB - apenas em API
    'resend',              // ~10MB - apenas em API
    'oci-sdk',             // ~50MB - apenas em API
    'pg',                  // ~20MB - apenas em API
    'postgres',            // ~15MB - apenas em API
    'bcrypt',              // ~5MB - apenas em API
    'bcryptjs',            // ~3MB - apenas em API
    'uuid',                // ~2MB - apenas em API
    'cookies-next',        // ~1MB - apenas em API
    'dotenv',              // ~1MB - apenas em API
    'node-fetch',          // ~2MB - apenas em API
    'turnstile',           // ~3MB - apenas em API
    'wavesurfer.js',       // ~20MB - apenas em uma página
    'react-slick',         // ~15MB - não usado
    'slick-carousel',      // ~10MB - não usado
    'embla-carousel-react' // ~5MB - não usado
];

// Verificar package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log('📦 Dependências pesadas encontradas:');
    let totalSize = 0;
    
    heavyDependencies.forEach(dep => {
        if (dependencies[dep]) {
            console.log(`   ❌ ${dep} - ${dependencies[dep]}`);
            totalSize += getEstimatedSize(dep);
        }
    });
    
    console.log(`\n💾 Tamanho estimado das dependências pesadas: ~${totalSize}MB`);
    
    // Sugestões de otimização
    console.log('\n🚀 Sugestões de otimização:');
    console.log('   1. Mover dependências pesadas para devDependencies');
    console.log('   2. Usar imports dinâmicos para bibliotecas grandes');
    console.log('   3. Implementar code splitting');
    console.log('   4. Remover dependências não utilizadas');
    console.log('   5. Usar tree shaking para reduzir bundle size');
    
    // Verificar imports desnecessários
    console.log('\n🔍 Verificando imports desnecessários...');
    checkUnusedImports();
}

function getEstimatedSize(dependency) {
    const sizes = {
        'puppeteer': 300,
        '@foobar404/wave': 50,
        'drizzle-orm': 20,
        'cheerio': 15,
        'ffmpeg-static': 100,
        'archiver': 10,
        'jszip': 8,
        'fs-extra': 5,
        'nodemailer': 15,
        'resend': 10,
        'oci-sdk': 50,
        'pg': 20,
        'postgres': 15,
        'bcrypt': 5,
        'bcryptjs': 3,
        'uuid': 2,
        'cookies-next': 1,
        'dotenv': 1,
        'node-fetch': 2,
        'turnstile': 3,
        'wavesurfer.js': 20,
        'react-slick': 15,
        'slick-carousel': 10,
        'embla-carousel-react': 5
    };
    return sizes[dependency] || 0;
}

function checkUnusedImports() {
    const srcDir = path.join(__dirname, '..', 'src');
    if (!fs.existsSync(srcDir)) {
        console.log('   ❌ Diretório src não encontrado');
        return;
    }
    
    // Verificar imports de framer-motion
    const framerMotionFiles = findFilesWithImport(srcDir, 'framer-motion');
    console.log(`   📊 Framer Motion usado em ${framerMotionFiles.length} arquivos`);
    
    // Verificar imports de @aws-sdk
    const awsSdkFiles = findFilesWithImport(srcDir, '@aws-sdk');
    console.log(`   📊 AWS SDK usado em ${awsSdkFiles.length} arquivos`);
    
    // Verificar imports de wavesurfer
    const wavesurferFiles = findFilesWithImport(srcDir, 'wavesurfer');
    console.log(`   📊 Wavesurfer usado em ${wavesurferFiles.length} arquivos`);
}

function findFilesWithImport(dir, importName) {
    const files = [];
    
    function searchDir(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                searchDir(fullPath);
            } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes(`import.*${importName}`) || content.includes(`from.*${importName}`)) {
                    files.push(fullPath);
                }
            }
        });
    }
    
    searchDir(dir);
    return files;
}

console.log('\n✅ Análise concluída!');
console.log('\n💡 Próximos passos:');
console.log('   1. Execute: npm run build -- --analyze');
console.log('   2. Verifique o bundle analyzer');
console.log('   3. Implemente as otimizações sugeridas');
console.log('   4. Teste a performance após as mudanças');
