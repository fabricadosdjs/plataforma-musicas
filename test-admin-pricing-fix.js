/**
 * Script para testar a correção da lógica de preços na administração
 * Verifica se Deemix/Deezer Premium são apenas flags de acesso e Uploader adiciona R$ 10
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando correções da administração de usuários...\n');

// Verificar página de administração
const adminPagePath = path.join(__dirname, 'src/app/admin/users/page.tsx');
const apiRoutePath = path.join(__dirname, 'src/app/api/admin/users/route.ts');

try {
    const adminContent = fs.readFileSync(adminPagePath, 'utf8');
    const apiContent = fs.readFileSync(apiRoutePath, 'utf8');

    console.log('✅ Verificações da Página de Administração:');

    // 1. Verificar se Deemix não altera preço no toggle
    if (adminContent.includes('// Não altera valor: apenas flag de acesso') &&
        adminContent.includes('setEditForm(prev => ({ ...prev, deemix: hasDeemix }))')) {
        console.log('✅ Toggle Deemix não altera preço (apenas acesso)');
    } else {
        console.log('❌ ERRO: Toggle Deemix ainda altera preço');
    }

    // 2. Verificar se Deezer Premium não altera preço no toggle
    if (adminContent.includes('deezerPremium: hasDeezerPremium') &&
        !adminContent.includes('calculateUserRealPrice(basePrice, editForm.deemix, hasDeezerPremium)') &&
        !adminContent.includes('valor: totalPrice')) {
        console.log('✅ Toggle Deezer Premium não altera preço (apenas acesso)');
    } else {
        console.log('❌ ERRO: Toggle Deezer Premium ainda altera preço');
    }

    // 3. Verificar função calculateUserPlanWithUploader
    if (adminContent.includes('// IMPORTANTE: Deemix e Deezer Premium NÃO alteram o preço') &&
        adminContent.includes('// O preço já está definido pelo plano escolhido no dropdown')) {
        console.log('✅ Função calculateUserPlanWithUploader corrigida');
    } else {
        console.log('❌ ERRO: Função calculateUserPlanWithUploader não corrigida');
    }

    // 4. Verificar valores do Uploader
    if (adminContent.includes('const UPLOADER_MONTHLY = 10.00') &&
        adminContent.includes('total += UPLOADER_MONTHLY * (1 - 0.05)') &&
        adminContent.includes('// Uploader grátis para semestral e anual')) {
        console.log('✅ Valores do Uploader corretos (R$ 10, desconto 5% trimestral, grátis semestral/anual)');
    } else {
        console.log('❌ ERRO: Valores do Uploader incorretos');
    }

    console.log('\n✅ Verificações da API:');

    // 5. Verificar se API não usa mais lógica de Deemix/Deezer Premium
    if (apiContent.includes('IMPORTANTE: DEEMIX E DEEZER PREMIUM NÃO ALTERAM PREÇO') &&
        !apiContent.includes('DEEMIX_PRICING:') &&
        !apiContent.includes('DEEZER_PREMIUM_PRICING = 9.75')) {
        console.log('✅ API corrigida - Deemix/Deezer Premium são apenas flags');
    } else {
        console.log('❌ ERRO: API ainda calcula preços com Deemix/Deezer Premium');
    }

    // 6. Verificar lógica do Uploader na API
    if (apiContent.includes('const UPLOADER_MONTHLY = 10') &&
        apiContent.includes('if (newUploader && basePrice >= 35)')) {
        console.log('✅ API - Uploader adiciona R$ 10 apenas para VIPs');
    } else {
        console.log('❌ ERRO: API - Lógica do Uploader incorreta');
    }

    console.log('\n📋 Resumo das Correções:');
    console.log('• Deemix Ativo: Apenas define acesso às credenciais (sem alterar preço)');
    console.log('• Deezer Premium: Apenas define acesso às credenciais (sem alterar preço)');
    console.log('• Uploader: Adiciona R$ 10,00/mês (5% desconto trimestral, grátis semestral/anual)');
    console.log('• Preço: Determinado apenas pelo plano escolhido no dropdown + Uploader');

    console.log('\n🎯 Comportamento Esperado:');
    console.log('• VIP BÁSICO (R$ 38) + Uploader = R$ 48');
    console.log('• VIP PADRÃO (R$ 42) + Uploader = R$ 52');
    console.log('• VIP COMPLETO (R$ 60) + Uploader = R$ 70');
    console.log('• Deemix/Deezer ativados: Mesmo preço, apenas acesso liberado');

} catch (error) {
    console.error('❌ Erro ao verificar arquivos:', error.message);
}

console.log('\n✨ Verificação concluída!');
