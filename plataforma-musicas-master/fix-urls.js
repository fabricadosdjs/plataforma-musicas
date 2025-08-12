// Script para corrigir URLs mal formadas no banco de dados
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { ContaboStorage } from './src/lib/contabo-storage.js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function fixUrls() {
    console.log('🔧 Corrigindo URLs no banco de dados...\n');

    try {
        // Configurar Contabo Storage
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT || 'https://usc1.contabostorage.com',
            region: process.env.CONTABO_REGION || 'us-central-1',
            accessKeyId: process.env.CONTABO_ACCESS_KEY || '',
            secretAccessKey: process.env.CONTABO_SECRET_KEY || '',
            bucketName: process.env.CONTABO_BUCKET_NAME || '',
        });

        // Buscar todas as tracks com URLs mal formadas
        const tracks = await prisma.track.findMany({
            where: {
                OR: [
                    { previewUrl: { contains: 'async' } },
                    { downloadUrl: { contains: 'async' } }
                ]
            }
        });

        console.log(`📁 Encontradas ${tracks.length} músicas com URLs mal formadas`);

        if (tracks.length === 0) {
            console.log('✅ Todas as URLs já estão corretas!');
            return;
        }

        // Listar arquivos do Contabo para fazer o match
        const audioFiles = await storage.listAudioFiles();
        console.log(`🎵 Encontrados ${audioFiles.length} arquivos no Contabo`);

        // Criar mapa de arquivos por nome
        const fileMap = new Map();
        audioFiles.forEach(file => {
            const filename = file.filename;
            fileMap.set(filename, file.url);
        });

        // Corrigir cada track
        let correctedCount = 0;
        for (const track of tracks) {
            console.log(`\\n🔍 Corrigindo: ${track.artist} - ${track.songName}`);

            // Extrair o nome do arquivo da URL mal formada
            let filename = '';
            if (track.previewUrl.includes('plataforma-de-musicas/')) {
                filename = track.previewUrl.split('plataforma-de-musicas/')[1];
            } else if (track.downloadUrl.includes('plataforma-de-musicas/')) {
                filename = track.downloadUrl.split('plataforma-de-musicas/')[1];
            }

            if (filename && fileMap.has(filename)) {
                const correctUrl = fileMap.get(filename);

                await prisma.track.update({
                    where: { id: track.id },
                    data: {
                        previewUrl: correctUrl,
                        downloadUrl: correctUrl
                    }
                });

                console.log(`   ✅ URL corrigida: ${filename}`);
                console.log(`   📎 Nova URL: ${correctUrl}`);
                correctedCount++;
            } else {
                console.log(`   ❌ Arquivo não encontrado no Contabo: ${filename}`);
            }
        }

        console.log(`\\n🎉 Correção concluída!`);
        console.log(`✅ ${correctedCount} URLs corrigidas`);
        console.log(`❌ ${tracks.length - correctedCount} URLs não puderam ser corrigidas`);

        // Verificar resultado
        const remainingBadUrls = await prisma.track.count({
            where: {
                OR: [
                    { previewUrl: { contains: 'async' } },
                    { downloadUrl: { contains: 'async' } }
                ]
            }
        });

        if (remainingBadUrls === 0) {
            console.log(`\\n🎊 Todas as URLs foram corrigidas com sucesso!`);
        } else {
            console.log(`\\n⚠️  Ainda restam ${remainingBadUrls} URLs com problemas`);
        }

    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUrls();
