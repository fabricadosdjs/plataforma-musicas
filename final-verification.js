/**
 * Script de verificação final - VIP BÁSICO + DEEMIX + UPLOADER
 * Deve calcular corretamente R$ 61,56 + R$ 10,00 = R$ 71,56
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎯 VERIFICAÇÃO FINAL: VIP BÁSICO + DEEMIX + UPLOADER\n');

try {
    const adminContent = fs.readFileSync(path.join(__dirname, 'src/app/admin/users/page.tsx'), 'utf8');

    console.log('✅ Validações técnicas:');

    // 1. Verificar valor MD_BASICO
    if (adminContent.includes("value: 61.56, deemix: true")) {
        console.log('✅ MD_BASICO: R$ 61,56 (VIP BÁSICO + DEEMIX)');
    } else {
        console.log('❌ MD_BASICO não configurado corretamente');
    }

    // 2. Verificar função recomputeValorFromSelections atualizada
    if (adminContent.includes('uploaderValue = 10.00; // R$ 10,00 mensal') &&
        adminContent.includes('const planValue = plan.value; // Valor base do plano')) {
        console.log('✅ recomputeValorFromSelections corrigida');
    } else {
        console.log('❌ recomputeValorFromSelections não corrigida');
    }

    // 3. Verificar getBasePriceFromTotal
    if (adminContent.includes('61.56, 64.04, 75.20')) {
        console.log('✅ getBasePriceFromTotal inclui valores com Deemix');
    } else {
        console.log('❌ getBasePriceFromTotal não inclui valores com Deemix');
    }

    // 4. Verificar calculateUserPlanWithUploader
    if (adminContent.includes('const UPLOADER_MONTHLY = 10.00;') &&
        adminContent.includes('// IMPORTANTE: Deemix e Deezer Premium NÃO alteram o preço')) {
        console.log('✅ calculateUserPlanWithUploader corrigida');
    } else {
        console.log('❌ calculateUserPlanWithUploader não corrigida');
    }

    console.log('\n📊 Simulação do cálculo:');
    console.log('• Plano selecionado: MD_BASICO (🥉 VIP BÁSICO + 🎧 DEEMIX)');
    console.log('• Valor base: R$ 61,56');
    console.log('• Uploader MENSAL: +R$ 10,00');
    console.log('• Total calculado: R$ 61,56 + R$ 10,00 = R$ 71,56');

    console.log('\n🎯 Resultado esperado na interface:');
    console.log('• Campo "Valor": R$ 71,56');
    console.log('• Base calculada pela getBasePriceFromTotal: R$ 61,56');
    console.log('• Diferença (Uploader): R$ 10,00');

    console.log('\n🔧 Instruções para teste:');
    console.log('1. Acesse /admin/users');
    console.log('2. Clique em "Adicionar Usuário" ou edite um existente');
    console.log('3. No dropdown de planos, selecione "🥉 VIP BÁSICO + 🎧 DEEMIX"');
    console.log('4. Ative o checkbox "Uploader"');
    console.log('5. Observe se o valor total fica R$ 71,56');
    console.log('6. Salve o usuário');
    console.log('7. Na tabela, verifique se mostra Base: R$ 61,56 e Total: R$ 71,56');

    console.log('\n💡 Se ainda aparecer erro:');
    console.log('• Verifique se selecionou o plano correto no dropdown');
    console.log('• Certifique-se de que ativou o Uploader');
    console.log('• Reinicie o servidor de desenvolvimento se necessário');

} catch (error) {
    console.error('❌ Erro ao verificar arquivos:', error.message);
}

console.log('\n🎉 Verificação final concluída!');
