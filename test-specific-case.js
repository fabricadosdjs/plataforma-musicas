/**
 * Script para testar o caso específico: VIP BÁSICO + DEEMIX + UPLOADER
 * Deve resultar em: Base R$ 61,56 + Uploader R$ 10,00 = Total R$ 71,56
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testando caso específico: VIP BÁSICO + DEEMIX + UPLOADER\n');

try {
    const adminContent = fs.readFileSync(path.join(__dirname, 'src/app/admin/users/page.tsx'), 'utf8');

    console.log('✅ Verificações do caso específico:');

    // 1. Verificar se o valor MD_BASICO está correto
    if (adminContent.includes("{ key: 'MD_BASICO', title: '🥉 VIP BÁSICO + 🎧 DEEMIX', value: 61.56, deemix: true }")) {
        console.log('✅ VIP BÁSICO + DEEMIX configurado: R$ 61,56');
    } else {
        console.log('❌ VIP BÁSICO + DEEMIX não encontrado ou valor incorreto');
    }

    // 2. Verificar se getBasePriceFromTotal inclui 61.56
    if (adminContent.includes('61.56, 64.04, 75.20')) {
        console.log('✅ getBasePriceFromTotal inclui valores com Deemix');
    } else {
        console.log('❌ getBasePriceFromTotal não inclui valores com Deemix');
    }

    // 3. Verificar lógica do uploader
    if (adminContent.includes('total += UPLOADER_MONTHLY; // R$ 10,00')) {
        console.log('✅ Uploader adiciona R$ 10,00 corretamente');
    } else {
        console.log('❌ Lógica do uploader incorreta');
    }

    console.log('\n📋 Cenário de teste:');
    console.log('• Plano selecionado: MD_BASICO (VIP BÁSICO + DEEMIX)');
    console.log('• Valor base: R$ 61,56');
    console.log('• Uploader ativo: Sim (+R$ 10,00)');
    console.log('• Total esperado: R$ 71,56');

    console.log('\n🎯 Comportamento correto:');
    console.log('• Campo "Valor": R$ 71,56 (total)');
    console.log('• Base calculada: R$ 61,56 (MD_BASICO)');
    console.log('• Add-on: R$ 10,00 (Uploader)');

    console.log('\n🔧 Para testar na interface:');
    console.log('1. Vá em /admin/users');
    console.log('2. Adicionar/Editar usuário');
    console.log('3. Selecione "🥉 VIP BÁSICO + 🎧 DEEMIX" no dropdown');
    console.log('4. Ative "Uploader"');
    console.log('5. Verifique se o valor total fica R$ 71,56');

} catch (error) {
    console.error('❌ Erro ao verificar arquivos:', error.message);
}

console.log('\n✨ Teste específico concluído!');
