// Script para adicionar música de teste do Google Drive
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestMusic() {
    try {
        console.log('🎵 Adicionando música de teste...');

        // releaseDate: garantir data válida no timezone do Brasil
        let releaseDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        if (isNaN(releaseDate.getTime())) {
            releaseDate = new Date('2025-07-28T00:00:00.000Z'); // fallback seguro
        }
        const music = await prisma.track.create({
            data: {
                songName: 'LA DOLCE VITA (DJ IL CUBANO)',
                artist: 'DV',
                style: 'Eletronic',
                version: 'Original Mix',
                imageUrl: 'https://i.ibb.co/w6K2V4Q/music-placeholder.jpg',
                previewUrl: 'https://drive.google.com/uc?export=download&id=1pwthiEgKH9vBYrtIIZWFv8T1nc4fh65A',
                downloadUrl: 'https://drive.google.com/uc?export=download&id=1pwthiEgKH9vBYrtIIZWFv8T1nc4fh65A',
                releaseDate,
            }
        });

        console.log('✅ Música criada com sucesso:', music);
        console.log('📊 ID da música:', music.id);
        console.log('🎧 Preview URL:', music.previewUrl);

    } catch (error) {
        console.error('❌ Erro ao criar música:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addTestMusic();
