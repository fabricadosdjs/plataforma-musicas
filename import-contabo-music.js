// Script para importar automaticamente músicas do Contabo para o banco de dados
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { ContaboStorage } from './src/lib/contabo-storage.js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function autoImportMusic() {
    console.log('🎵 Iniciando importação automática de músicas do Contabo...\n');

    try {
        // Inicializar storage
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT,
            region: process.env.CONTABO_REGION,
            accessKeyId: process.env.CONTABO_ACCESS_KEY,
            secretAccessKey: process.env.CONTABO_SECRET_KEY,
            bucketName: process.env.CONTABO_BUCKET_NAME,
        });

        // Buscar arquivos de áudio
        console.log('📁 Buscando arquivos de áudio no Contabo...');
        const audioFiles = await storage.listAudioFiles();
        console.log(`✅ Encontrados ${audioFiles.length} arquivos de áudio`);

        if (audioFiles.length === 0) {
            console.log('ℹ️ Nenhum arquivo de áudio encontrado para importar.');
            return;
        }

        // Verificar quais já existem no banco
        console.log('\n🔍 Verificando duplicatas no banco de dados...');
        const existingTracks = await prisma.track.findMany({
            select: { previewUrl: true, downloadUrl: true, songName: true }
        });

        const existingUrls = new Set([
            ...existingTracks.map(track => track.previewUrl),
            ...existingTracks.map(track => track.downloadUrl)
        ]);
        const newFiles = audioFiles.filter(file => !existingUrls.has(file.url)); console.log(`📊 Status:
   🗃️  Total no Contabo: ${audioFiles.length}
   📚 Já no banco: ${audioFiles.length - newFiles.length}
   ⭐ Novos para importar: ${newFiles.length}`);

        if (newFiles.length === 0) {
            console.log('✅ Todas as músicas já estão importadas!');
            return;
        }

        // Função para analisar nome do arquivo
        function parseAudioFileName(filename) {
            // Remover extensão
            const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|m4a|aac|ogg)$/i, '');

            // Padrões comuns de nomenclatura
            let artist = 'Artista Desconhecido';
            let title = nameWithoutExt;
            let genre = 'Eletrônica';

            // Padrão: Artista - Título
            if (nameWithoutExt.includes(' - ')) {
                const parts = nameWithoutExt.split(' - ');
                artist = parts[0].trim();
                title = parts.slice(1).join(' - ').trim();
            }
            // Padrão: Artista_Título
            else if (nameWithoutExt.includes('_') && !nameWithoutExt.includes(' ')) {
                const parts = nameWithoutExt.split('_');
                artist = parts[0].trim();
                title = parts.slice(1).join(' ').trim();
            }

            // Limpar caracteres especiais
            title = title.replace(/[\[\]()]/g, '').trim();
            artist = artist.replace(/[\[\]()]/g, '').trim();

            // Detectar gênero pelo nome
            const lowerName = nameWithoutExt.toLowerCase();
            if (lowerName.includes('house')) genre = 'House';
            else if (lowerName.includes('tech')) genre = 'Techno';
            else if (lowerName.includes('trance')) genre = 'Trance';
            else if (lowerName.includes('dubstep')) genre = 'Dubstep';
            else if (lowerName.includes('drum') || lowerName.includes('bass')) genre = 'Drum & Bass';

            return { artist, title, genre };
        }

        // Importar em lotes
        console.log('\n📥 Iniciando importação...');
        const batchSize = 10;
        let imported = 0;
        let errors = 0;

        for (let i = 0; i < newFiles.length; i += batchSize) {
            const batch = newFiles.slice(i, i + batchSize);

            console.log(`\n📦 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(newFiles.length / batchSize)}...`);

            for (const file of batch) {
                try {
                    const { artist, title, genre } = parseAudioFileName(file.filename);

                    await prisma.track.create({
                        data: {
                            songName: title,
                            artist,
                            previewUrl: file.url,
                            downloadUrl: file.url,
                            style: genre,
                            version: 'Original',
                            imageUrl: 'https://via.placeholder.com/300x300?text=Music',
                            releaseDate: new Date(),
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    }); imported++;
                    console.log(`   ✅ ${artist} - ${title}`);

                } catch (error) {
                    errors++;
                    console.log(`   ❌ Erro: ${file.filename} - ${error.message}`);
                }
            }

            // Pequena pausa entre lotes
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Relatório final
        console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA!');
        console.log(`📊 Resumo:
   ✅ Importadas com sucesso: ${imported}
   ❌ Erros: ${errors}
   📈 Total no banco agora: ${existingTracks.length + imported}`);

        // Estatísticas adicionais
        const totalTracks = await prisma.track.count();
        const styles = await prisma.track.groupBy({
            by: ['style'],
            _count: true
        });

        console.log('\n📈 ESTATÍSTICAS DO BANCO:');
        console.log(`   🎵 Total de músicas: ${totalTracks}`);
        console.log('   🎭 Por estilo:');
        styles.forEach(s => {
            console.log(`      ${s.style}: ${s._count} músicas`);
        }); console.log('\n💡 PRÓXIMOS PASSOS:');
        console.log('   1. Acesse /admin/contabo para gerenciar arquivos');
        console.log('   2. Acesse /admin para ver as músicas importadas');
        console.log('   3. Configure metadados adicionais se necessário');
        console.log('   4. Execute este script regularmente para importar novos arquivos');

    } catch (error) {
        console.error('\n❌ ERRO DURANTE A IMPORTAÇÃO:', error);
        console.log('\n🔧 Verifique:');
        console.log('   1. Se as credenciais do Contabo estão corretas');
        console.log('   2. Se o banco de dados está acessível');
        console.log('   3. Se as tabelas foram criadas corretamente');
    } finally {
        await prisma.$disconnect();
    }
}

// Executar importação
autoImportMusic();
