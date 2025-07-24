// Script para testar a importação inteligente
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testSmartImport() {
    console.log('🧠 Testando Importação Inteligente...\n');

    try {
        // Teste 1: Detectar novos arquivos
        console.log('🔍 Teste 1: Detectando novos arquivos...');
        const detectResponse = await fetch('http://localhost:3000/api/contabo/detect-new');
        const detectResult = await detectResponse.json();

        console.log(`✅ Detecção concluída!`);
        console.log(`   📁 Total no storage: ${detectResult.totalFiles}`);
        console.log(`   ✅ Já no banco: ${detectResult.existingFiles}`);
        console.log(`   ⭐ Novos arquivos: ${detectResult.newFiles}`);

        if (detectResult.newTracks.length > 0) {
            console.log('\n📋 Preview dos novos arquivos:');
            detectResult.newTracks.slice(0, 3).forEach((track, index) => {
                console.log(`   ${index + 1}. ${track.preview.artist} - ${track.preview.title}`);
                console.log(`      Versão: ${track.preview.version}`);
                console.log(`      Arquivo: ${track.filename}`);
            });
        }

        // Teste 2: Importação inteligente (apenas se há novos arquivos)
        if (detectResult.newFiles > 0) {
            console.log('\n🧠 Teste 2: Executando importação inteligente...');

            const importResponse = await fetch('http://localhost:3000/api/contabo/smart-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const importResult = await importResponse.json();

            if (importResult.success) {
                console.log(`✅ Importação bem-sucedida!`);
                console.log(`   🎵 Músicas importadas: ${importResult.imported}`);
                console.log(`   📊 Total no banco: ${importResult.statistics.totalInDatabase}`);

                if (importResult.statistics.byStyle.length > 0) {
                    console.log('\n🎭 Estilos detectados:');
                    importResult.statistics.byStyle.forEach(style => {
                        console.log(`   ${style.style}: ${style._count} músicas`);
                    });
                }

                if (importResult.newTracks.length > 0) {
                    console.log('\n🎶 Músicas importadas:');
                    importResult.newTracks.slice(0, 5).forEach((track, index) => {
                        console.log(`   ${index + 1}. ${track.artist} - ${track.songName} (${track.style})`);
                    });
                }
            } else {
                console.log(`❌ Erro na importação: ${importResult.message}`);
            }
        } else {
            console.log('\n ℹ️ Nenhum arquivo novo para importar');
        }

        console.log('\n🎉 TESTE DA IMPORTAÇÃO INTELIGENTE CONCLUÍDO!');
        console.log('💡 Acesse http://localhost:3000/admin/contabo-smart para ver a interface visual');

    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        console.log('\n🔧 Verifique:');
        console.log('   1. Se o servidor está rodando na porta 3000');
        console.log('   2. Se as APIs foram criadas corretamente');
        console.log('   3. Se o Contabo está conectado');
    }
}

testSmartImport();
