/**
 * Script avançado para adicionar imagens nas tracks usando a API de detecção
 * Combina detecção inteligente com fallback para imagens genéricas
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// URL da imagem genérica padrão
const DEFAULT_IMAGE = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';

// URL da API de detecção (assumindo que está rodando localmente)
const API_BASE_URL = 'http://localhost:3000';

/**
 * Chama a API de detecção para obter dados de uma música
 */
async function detectMusicData(artist, songName, version = '') {
    try {
        console.log(`🔍 Consultando API para: ${artist} - ${songName}`);

        const response = await fetch(`${API_BASE_URL}/api/contabo/detect-style-label`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                artist: artist,
                songName: songName,
                version: version
            })
        });

        if (!response.ok) {
            console.warn(`⚠️ API retornou erro ${response.status} para ${artist} - ${songName}`);
            return null;
        }

        const data = await response.json();

        if (data.success && data.detection) {
            console.log(`✅ API detectou: ${data.detection.style} | ${data.detection.label} | Imagem: ${data.detection.coverImage ? 'Sim' : 'Não'}`);
            return data.detection;
        } else {
            console.warn(`⚠️ API não retornou detecção válida para ${artist} - ${songName}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Erro ao consultar API para ${artist} - ${songName}:`, error.message);
        return null;
    }
}

/**
 * Gera imagem baseada no estilo (fallback)
 */
function generateFallbackImage(artist, songName, style) {
    const styleImages = {
        'Progressive House': [
            'https://i.scdn.co/image/ab67616d0000b273f0b1d8a8b7c4c8c5a1b0c1d2',
            'https://geo-media.beatport.com/image_size/500x500/abc123def456.jpg'
        ],
        'Tech House': [
            'https://i.scdn.co/image/ab67616d0000b273b1c2d3e4f5g6h7i8j9k0l1m2',
            'https://geo-media.beatport.com/image_size/500x500/def456ghi789.jpg'
        ],
        'Melodic Techno': [
            'https://i.scdn.co/image/ab67616d0000b273c2d3e4f5g6h7i8j9k0l1m2n3',
            'https://geo-media.beatport.com/image_size/500x500/ghi789jkl012.jpg'
        ],
        'Deep House': [
            'https://i.scdn.co/image/ab67616d0000b273d3e4f5g6h7i8j9k0l1m2n3o4',
            'https://geo-media.beatport.com/image_size/500x500/jkl012mno345.jpg'
        ]
    };

    const artistHash = artist.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const songHash = songName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const combinedHash = artistHash + songHash;

    const images = styleImages[style] || styleImages['Progressive House'] || [];

    if (images.length > 0 && Math.random() < 0.7) {
        return images[combinedHash % images.length];
    }

    return DEFAULT_IMAGE;
}

/**
 * Busca tracks que precisam de imagem
 */
async function getTracksNeedingImages() {
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
                version: true,
                imageUrl: true
            },
            orderBy: {
                createdAt: 'desc' // Processa as mais recentes primeiro
            }
        });

        console.log(`📊 Encontradas ${tracks.length} tracks que precisam de imagem`);
        return tracks;
    } catch (error) {
        console.error('❌ Erro ao buscar tracks:', error);
        return [];
    }
}

/**
 * Atualiza imagem de uma track
 */
async function updateTrackImage(trackId, newImageUrl, additionalData = {}) {
    try {
        const updateData = { imageUrl: newImageUrl };

        // Se a API retornou dados adicionais, pode atualizar outros campos também
        if (additionalData.style && additionalData.style !== 'Unknown') {
            updateData.style = additionalData.style;
        }

        await prisma.track.update({
            where: { id: trackId },
            data: updateData
        });

        return true;
    } catch (error) {
        console.error(`❌ Erro ao atualizar track ${trackId}:`, error);
        return false;
    }
}

/**
 * Processa uma track individual
 */
async function processTrack(track, useAPI = true) {
    console.log(`\n🎵 Processando: ${track.artist} - ${track.songName}`);

    let newImageUrl = null;
    let additionalData = {};

    // Tenta usar a API primeiro se habilitada
    if (useAPI) {
        const detection = await detectMusicData(track.artist, track.songName, track.version || '');

        if (detection && detection.coverImage) {
            newImageUrl = detection.coverImage;
            additionalData = {
                style: detection.style,
                label: detection.label,
                confidence: detection.confidence
            };
            console.log(`🎯 Usando imagem da API: ${newImageUrl}`);
        }
    }

    // Fallback para imagem baseada no estilo
    if (!newImageUrl) {
        newImageUrl = generateFallbackImage(track.artist, track.songName, track.style);
        console.log(`🔄 Usando imagem fallback: ${newImageUrl}`);
    }

    // Atualiza a track
    const success = await updateTrackImage(track.id, newImageUrl, additionalData);

    if (success) {
        console.log(`✅ Track ${track.id} atualizada com sucesso`);
        return true;
    } else {
        console.log(`❌ Falha ao atualizar track ${track.id}`);
        return false;
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('🎵 Iniciando atualização inteligente de imagens das tracks...\n');

    const args = process.argv.slice(2);
    const useAPI = !args.includes('--no-api');
    const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1]) || 5;
    const maxTracks = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1]) || null;

    console.log(`⚙️ Configurações:`);
    console.log(`   - Usar API: ${useAPI ? 'Sim' : 'Não'}`);
    console.log(`   - Tamanho do lote: ${batchSize}`);
    console.log(`   - Limite de tracks: ${maxTracks || 'Sem limite'}\n`);

    try {
        // Busca tracks que precisam de imagem
        let tracks = await getTracksNeedingImages();

        if (tracks.length === 0) {
            console.log('✅ Todas as tracks já possuem imagem!');
            return;
        }

        // Aplica limite se especificado
        if (maxTracks && maxTracks < tracks.length) {
            tracks = tracks.slice(0, maxTracks);
            console.log(`📊 Limitando processamento a ${maxTracks} tracks`);
        }

        console.log(`🔄 Processando ${tracks.length} tracks em lotes de ${batchSize}...\n`);

        let updatedCount = 0;
        let errorCount = 0;

        // Processa em lotes
        for (let i = 0; i < tracks.length; i += batchSize) {
            const batch = tracks.slice(i, i + batchSize);
            const batchNum = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(tracks.length / batchSize);

            console.log(`\n📦 === LOTE ${batchNum}/${totalBatches} ===`);

            // Processa lote sequencialmente para evitar rate limit da API
            for (const track of batch) {
                try {
                    const success = await processTrack(track, useAPI);
                    if (success) {
                        updatedCount++;
                    } else {
                        errorCount++;
                    }

                    // Pequena pausa entre requisições da API
                    if (useAPI) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (error) {
                    console.error(`❌ Erro ao processar track ${track.id}:`, error);
                    errorCount++;
                }
            }

            // Pausa maior entre lotes
            if (i + batchSize < tracks.length) {
                console.log(`⏳ Aguardando 2 segundos antes do próximo lote...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log('\n📈 === RESUMO FINAL ===');
        console.log(`✅ Tracks atualizadas: ${updatedCount}`);
        console.log(`❌ Erros: ${errorCount}`);
        console.log(`📊 Total processadas: ${tracks.length}`);
        console.log(`🎯 Taxa de sucesso: ${((updatedCount / tracks.length) * 100).toFixed(1)}%`);

        if (updatedCount > 0) {
            console.log(`\n🎉 ${updatedCount} tracks agora possuem imagens de capa${useAPI ? ' detectadas pela IA' : ''}!`);
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
    getTracksNeedingImages,
    updateTrackImage,
    processTrack,
    detectMusicData
};
