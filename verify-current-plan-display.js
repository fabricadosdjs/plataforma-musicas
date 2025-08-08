/**
 * Script para verificar se a exibição do plano atual está correta
 * Verifica se mostra o valor base do plano VIP, não o valor total com add-ons
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando correção da exibição do plano atual...\n');

// Ler o arquivo da página de planos
const plansPagePath = path.join(__dirname, 'src/app/plans/page.tsx');

try {
    const plansContent = fs.readFileSync(plansPagePath, 'utf8');

    console.log('✅ Verificações realizadas:');

    // 1. Verificar se não usa mais session?.user?.valor para mostrar o preço principal
    if (plansContent.includes('R$ {session?.user?.valor}/mês') &&
        !plansContent.includes('Total com add-ons: R$ {session.user.valor}/mês')) {
        console.log('❌ ERRO: Ainda usa session.user.valor para preço principal');
    } else {
        console.log('✅ Não usa mais session.user.valor para preço principal');
    }

    // 2. Verificar se usa userPlan.basePrice
    if (plansContent.includes('R$ {userPlan.basePrice}/mês')) {
        console.log('✅ Usa userPlan.basePrice para mostrar preço do plano');
    } else {
        console.log('❌ ERRO: Não encontrado userPlan.basePrice');
    }

    // 3. Verificar se mostra total separadamente quando há add-ons
    if (plansContent.includes('Total com add-ons: R$ {session.user.valor}/mês')) {
        console.log('✅ Mostra valor total separadamente quando há add-ons');
    } else {
        console.log('❌ ERRO: Não mostra valor total com add-ons');
    }

    // 4. Verificar condição para mostrar total
    if (plansContent.includes('Number(session.user.valor) !== userPlan.basePrice')) {
        console.log('✅ Só mostra total quando diferente do valor base');
    } else {
        console.log('❌ ERRO: Não verifica se total é diferente do base');
    }

    console.log('\n📋 Resumo da correção:');
    console.log('• Preço principal: Agora mostra valor base do plano VIP (R$ 38, R$ 42 ou R$ 60)');
    console.log('• Valor total: Mostrado apenas quando há add-ons ativos');
    console.log('• Transparência: Usuário vê claramente o valor base vs valor total');

    console.log('\n🎯 Comportamento esperado:');
    console.log('• VIP BÁSICO: "R$ 38/mês" (mesmo se pagar R$ 50 por add-ons)');
    console.log('• VIP PADRÃO: "R$ 42/mês" (valor base do plano)');
    console.log('• VIP COMPLETO: "R$ 60/mês" (valor base do plano)');
    console.log('• Se há add-ons: Mostra "Total com add-ons: R$ XX/mês" em texto menor');

} catch (error) {
    console.error('❌ Erro ao verificar arquivo:', error.message);
}

console.log('\n✨ Verificação concluída!');
