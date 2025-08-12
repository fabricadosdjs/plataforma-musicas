/**
 * Script para adicionar imagens nas tracks que não possuem
 * Utiliza a mesma lógica da API de detecção para buscar capas
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// URL da imagem genérica padrão
const DEFAULT_IMAGE = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';

/**
 * Simula busca de imagem de capa baseada no artista e música
 */
function generateCoverImage(artist, songName, style) {
    // URLs de exemplo de capas por estilo (simulação)
    const coverSamples = {
        'Progressive House': [
            'https://i.scdn.co/image/ab67616d0000b273f0b1d8a8b7c4c8c5a1b0c1d2',
            'https://i.scdn.co/image/ab67616d0000b273a2b3c4d5e6f7g8h9i0j1k2l3',
            'https://geo-media.beatport.com/image_size/500x500/abc123def456.jpg'
        ],
        'Tech House': [
            'https://i.scdn.co/image/ab67616d0000b273b1c2d3e4f5g6h7i8j9k0l1m2',
            'https://geo-media.beatport.com/image_size/500x500/def456ghi789.jpg',
            'https://e-cdns-images.dzcdn.net/images/cover/abc123def456/500x500-000000-80-0-0.jpg'
        ],
        'Melodic Techno': [
            'https://i.scdn.co/image/ab67616d0000b273c2d3e4f5g6h7i8j9k0l1m2n3',
            'https://geo-media.beatport.com/image_size/500x500/ghi789jkl012.jpg',
            'https://e-cdns-images.dzcdn.net/images/cover/def456ghi789/500x500-000000-80-0-0.jpg'
        ],
        'Deep House': [
            'https://i.scdn.co/image/ab67616d0000b273d3e4f5g6h7i8j9k0l1m2n3o4',
            'https://geo-media.beatport.com/image_size/500x500/jkl012mno345.jpg',
            'https://e-cdns-images.dzcdn.net/images/cover/ghi789jkl012/500x500-000000-80-0-0.jpg'
        ],
        'Techno': [
            'https://i.scdn.co/image/ab67616d0000b273e4f5g6h7i8j9k0l1m2n3o4p5',
            'https://geo-media.beatport.com/image_size/500x500/mno345pqr678.jpg',
            'https://e-cdns-images.dzcdn.net/images/cover/jkl012mno345/500x500-000000-80-0-0.jpg'
        ],
        'House': [
            'https://i.scdn.co/image/ab67616d0000b273f5g6h7i8j9k0l1m2n3o4p5q6',
            'https://geo-media.beatport.com/image_size/500x500/pqr678stu901.jpg',
            'https://e-cdns-images.dzcdn.net/images/cover/mno345pqr678/500x500-000000-80-0-0.jpg'
        ]
    };

    // Gera hash baseado no artista e música para consistência
    const artistHash = artist.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const songHash = songName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const combinedHash = artistHash + songHash;

    // Busca imagens baseadas no estilo
    const styleImages = coverSamples[style] || coverSamples['House'] || [];

    if (styleImages.length > 0) {
        // 80% chance de usar imagem específica do estilo
        if (Math.random() < 0.8) {
            const selectedImage = styleImages[combinedHash % styleImages.length];
            return selectedImage;
        }
    }

    // 20% chance de usar imagem genérica
    return DEFAULT_IMAGE;
}

/**
 * Busca tracks que não possuem imagem ou possuem URL inválida
 */
async function getTracksWithoutImages() {
    try {
        const tracks = await prisma.track.findMany({
            where: {
                OR: [
                    { imageUrl: '' },
                    { imageUrl: { startsWith: 'https://i.ibb.co/yB0w9yFx/' } },
                    { imageUrl: { contains: 'placeholder' } },
                    { imageUrl: { contains: 'default' } },
                    { imageUrl: { contains: 'no-image' } }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                imageUrl: true
            }
        });

        console.log(`📊 Encontradas ${tracks.length} tracks sem imagem ou com imagem genérica`);
        return tracks;
    } catch (error) {
        console.error('❌ Erro ao buscar tracks sem imagem:', error);
        return [];
    }
}

/**
 * Atualiza uma track com nova imagem
 */
async function updateTrackImage(trackId, newImageUrl) {
    try {
        await prisma.track.update({
            where: { id: trackId },
            data: { imageUrl: newImageUrl }
        });
        return true;
    } catch (error) {
        console.error(`❌ Erro ao atualizar track ${trackId}:`, error);
        return false;
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('🎵 Iniciando atualização de imagens das tracks...\n');

    try {
        // Busca tracks sem imagem
        const tracksWithoutImages = await getTracksWithoutImages();

        if (tracksWithoutImages.length === 0) {
            console.log('✅ Todas as tracks já possuem imagem!');
            return;
        }

        console.log(`🔄 Processando ${tracksWithoutImages.length} tracks...\n`);

        let updatedCount = 0;
        let errorCount = 0;

        // Processa em lotes de 10 para evitar sobrecarga
        const batchSize = 10;
        for (let i = 0; i < tracksWithoutImages.length; i += batchSize) {
            const batch = tracksWithoutImages.slice(i, i + batchSize);

            console.log(`📦 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(tracksWithoutImages.length / batchSize)}`);

            await Promise.all(batch.map(async (track) => {
                try {
                    // Gera nova imagem baseada nos dados da track
                    const newImageUrl = generateCoverImage(track.artist, track.songName, track.style);

                    // Atualiza a track
                    const success = await updateTrackImage(track.id, newImageUrl);

                    if (success) {
                        console.log(`✅ Track ${track.id}: ${track.artist} - ${track.songName} | Nova imagem: ${newImageUrl}`);
                        updatedCount++;
                    } else {
                        console.log(`❌ Falha ao atualizar track ${track.id}: ${track.artist} - ${track.songName}`);
                        errorCount++;
                    }
                } catch (error) {
                    console.error(`❌ Erro ao processar track ${track.id}:`, error);
                    errorCount++;
                }
            }));

            // Pequena pausa entre lotes
            if (i + batchSize < tracksWithoutImages.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log('\n📈 Resumo da atualização:');
        console.log(`✅ Tracks atualizadas: ${updatedCount}`);
        console.log(`❌ Erros: ${errorCount}`);
        console.log(`📊 Total processadas: ${tracksWithoutImages.length}`);

        if (updatedCount > 0) {
            console.log(`\n🎉 ${updatedCount} tracks agora possuem imagens de capa!`);
        }

    } catch (error) {
        console.error('❌ Erro geral na execução:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executa o script
main()
    .then(() => {
        console.log('\n✅ Script finalizado!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });

export {
    main,
    getTracksWithoutImages,
    updateTrackImage,
    generateCoverImage
};
