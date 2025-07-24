// Script para atualizar URLs para o formato público correto
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { ContaboStorage } from './src/lib/contabo-storage.js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function updateToPublicUrls() {
    console.log('🔧 Atualizando URLs para formato público...\n');

    try {
        // Configurar Contabo Storage
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT || 'https://usc1.contabostorage.com',
            region: process.env.CONTABO_REGION || 'us-central-1',
            accessKeyId: process.env.CONTABO_ACCESS_KEY || '',
            secretAccessKey: process.env.CONTABO_SECRET_KEY || '',
            bucketName: process.env.CONTABO_BUCKET_NAME || '',
        });

        // Buscar todas as tracks que não têm o formato público correto
        const tracks = await prisma.track.findMany({
            where: {
                AND: [
                    { previewUrl: { not: { contains: '211285f2fbcc4760a62df1aff280735f' } } },
                    { previewUrl: { contains: 'contabostorage.com' } }
                ]
            }
        });

        console.log(`📁 Encontradas ${tracks.length} músicas para atualizar`);

        if (tracks.length === 0) {
            console.log('✅ Todas as URLs já estão no formato público correto!');
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

        // Atualizar cada track
        let updatedCount = 0;
        for (const track of tracks) {
            console.log(`\\n🔍 Atualizando: ${track.artist} - ${track.songName}`);

            // Extrair o nome do arquivo da URL atual
            let filename = '';
            if (track.previewUrl.includes('/plataforma-de-musicas/')) {
                filename = track.previewUrl.split('/plataforma-de-musicas/').pop();
            }

            if (filename && fileMap.has(filename)) {
                const newPublicUrl = fileMap.get(filename);

                await prisma.track.update({
                    where: { id: track.id },
                    data: {
                        previewUrl: newPublicUrl,
                        downloadUrl: newPublicUrl
                    }
                });

                console.log(`   ✅ URL atualizada: ${filename}`);
                console.log(`   📎 Nova URL pública: ${newPublicUrl}`);
                updatedCount++;
            } else {
                console.log(`   ❌ Arquivo não encontrado: ${filename}`);
            }
        }

        console.log(`\\n🎉 Atualização concluída!`);
        console.log(`✅ ${updatedCount} URLs atualizadas para formato público`);

        // Testar uma URL para verificar se está acessível
        if (updatedCount > 0) {
            console.log(`\\n🌐 Testando acessibilidade da primeira URL...`);
            const firstTrack = await prisma.track.findFirst({
                where: { previewUrl: { contains: '211285f2fbcc4760a62df1aff280735f' } }
            });

            if (firstTrack) {
                try {
                    const response = await fetch(firstTrack.previewUrl, { method: 'HEAD' });
                    if (response.ok) {
                        console.log(`✅ URL pública acessível! Status: ${response.status}`);
                    } else {
                        console.log(`❌ Problema de acesso. Status: ${response.status}`);
                    }
                } catch (error) {
                    console.log(`❌ Erro ao testar URL: ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Erro durante a atualização:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateToPublicUrls();
