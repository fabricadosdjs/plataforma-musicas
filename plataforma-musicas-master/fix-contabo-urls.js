// Script para corrigir URLs do Contabo Storage no banco de dados
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para corrigir URL do Contabo Storage
function fixContaboUrl(url) {
    if (!url || !url.includes('contabostorage.com')) {
        return url;
    }

    const urlParts = url.split('/');
    const bucketAndKey = urlParts.slice(3).join('/');
    const bucketSeparator = bucketAndKey.indexOf(':');

    if (bucketSeparator === -1) {
        console.log('❌ URL malformado:', url);
        return url;
    }

    const bucket = bucketAndKey.substring(0, bucketSeparator);
    const key = bucketAndKey.substring(bucketSeparator + 1);

    // Separa o caminho do nome do arquivo
    const pathParts = key.split('/');
    const fileName = pathParts.pop(); // Remove o nome do arquivo
    const path = pathParts.join('/'); // Reconstrói o caminho

    // Codifica apenas o nome do arquivo
    const encodedFileName = encodeURIComponent(fileName || '');

    // Reconstrói o key com apenas o nome do arquivo codificado
    const encodedKey = path ? `${path}/${encodedFileName}` : encodedFileName;

    const fixedUrl = `https://usc1.contabostorage.com/${bucket}:${encodedKey}`;

    console.log('🔧 Corrigindo URL:');
    console.log('  Original:', url);
    console.log('  Key:', key);
    console.log('  Path:', path);
    console.log('  FileName:', fileName);
    console.log('  EncodedFileName:', encodedFileName);
    console.log('  EncodedKey:', encodedKey);
    console.log('  Corrigido:', fixedUrl);
    console.log('');

    return fixedUrl;
}

// Função para corrigir todas as músicas
async function fixAllContaboUrls() {
    try {
        console.log('🔍 Iniciando correção de URLs do Contabo Storage...\n');

        // Buscar todas as músicas que têm URLs do Contabo
        const tracks = await prisma.track.findMany({
            where: {
                OR: [
                    { previewUrl: { contains: 'contabostorage.com' } },
                    { downloadUrl: { contains: 'contabostorage.com' } }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                previewUrl: true,
                downloadUrl: true
            }
        });

        console.log(`📊 Encontradas ${tracks.length} músicas com URLs do Contabo Storage\n`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const track of tracks) {
            try {
                let needsUpdate = false;
                const updateData = {};

                // Corrigir previewUrl se necessário
                if (track.previewUrl && track.previewUrl.includes('contabostorage.com')) {
                    const fixedPreviewUrl = fixContaboUrl(track.previewUrl);
                    if (fixedPreviewUrl !== track.previewUrl) {
                        updateData.previewUrl = fixedPreviewUrl;
                        needsUpdate = true;
                    }
                }

                // Corrigir downloadUrl se necessário
                if (track.downloadUrl && track.downloadUrl.includes('contabostorage.com')) {
                    const fixedDownloadUrl = fixContaboUrl(track.downloadUrl);
                    if (fixedDownloadUrl !== track.downloadUrl) {
                        updateData.downloadUrl = fixedDownloadUrl;
                        needsUpdate = true;
                    }
                }

                // Atualizar no banco se houve mudanças
                if (needsUpdate) {
                    await prisma.track.update({
                        where: { id: track.id },
                        data: updateData
                    });

                    console.log(`✅ Música "${track.songName}" - "${track.artist}" corrigida`);
                    updatedCount++;
                } else {
                    console.log(`⏭️  Música "${track.songName}" - "${track.artist}" já está correta`);
                }

            } catch (error) {
                console.error(`❌ Erro ao corrigir música ${track.id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📈 Resumo da correção:');
        console.log(`  Total de músicas processadas: ${tracks.length}`);
        console.log(`  Músicas corrigidas: ${updatedCount}`);
        console.log(`  Músicas já corretas: ${tracks.length - updatedCount - errorCount}`);
        console.log(`  Erros: ${errorCount}`);

        if (updatedCount > 0) {
            console.log('\n🎉 Correção concluída com sucesso!');
        } else {
            console.log('\nℹ️  Nenhuma correção necessária.');
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Função para testar a correção em uma música específica
async function testUrlFix() {
    const testUrl = "https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/04.08.2025/EL SIMBOLO - NO TE PREOCUPES (ERNANI REMIX).mp3";
    const expectedUrl = "https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/04.08.2025/EL%20SIMBOLO%20-%20NO%20TE%20PREOCUPES%20(ERNANI%20REMIX).mp3";

    console.log('🧪 Testando correção de URL:');
    console.log('URL de teste:', testUrl);
    console.log('URL esperado:', expectedUrl);

    const fixedUrl = fixContaboUrl(testUrl);

    if (fixedUrl === expectedUrl) {
        console.log('✅ Teste passou!');
    } else {
        console.log('❌ Teste falhou!');
        console.log('URL corrigido:', fixedUrl);
    }

    console.log('');
}

// Executar o script
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--test')) {
        await testUrlFix();
    }

    if (args.includes('--fix')) {
        await fixAllContaboUrls();
    }

    if (args.length === 0) {
        console.log('🔧 Script de correção de URLs do Contabo Storage');
        console.log('');
        console.log('Uso:');
        console.log('  node fix-contabo-urls.js --test    # Testa a correção');
        console.log('  node fix-contabo-urls.js --fix     # Corrige todas as músicas');
        console.log('');
    }
}

main().catch(console.error); 