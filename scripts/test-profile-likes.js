/**
 * Script para testar a API de likes do perfil
 * Execute com: node scripts/test-profile-likes.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProfileLikes() {
    try {
        console.log('🔍 Testando API de likes do perfil...\n');

        // 1. Verificar se a tabela Like existe
        console.log('1. Verificando estrutura da tabela Like...');
        try {
            const likeCount = await prisma.like.count();
            console.log(`✅ Tabela Like encontrada com ${likeCount} registros`);
        } catch (error) {
            console.log('❌ Tabela Like não encontrada:', error.message);
            return;
        }

        // 2. Verificar estrutura da tabela Like
        console.log('\n2. Verificando estrutura da tabela Like...');
        try {
            const sampleLike = await prisma.like.findFirst({
                include: {
                    track: true,
                    user: true
                }
            });

            if (sampleLike) {
                console.log('✅ Estrutura da tabela Like:');
                console.log('   - Like ID:', sampleLike.id);
                console.log('   - User ID:', sampleLike.userId);
                console.log('   - Track ID:', sampleLike.trackId);
                console.log('   - Created At:', sampleLike.createdAt);
                console.log('   - Track:', {
                    id: sampleLike.track.id,
                    songName: sampleLike.track.songName,
                    artist: sampleLike.track.artist,
                    style: sampleLike.track.style,
                    imageUrl: sampleLike.track.imageUrl,
                    pool: sampleLike.track.pool,
                    folder: sampleLike.track.folder
                });
            } else {
                console.log('⚠️  Nenhum like encontrado na base de dados');
            }
        } catch (error) {
            console.log('❌ Erro ao verificar estrutura:', error.message);
        }

        // 3. Verificar relacionamentos
        console.log('\n3. Verificando relacionamentos...');
        try {
            const likesWithTracks = await prisma.like.findMany({
                take: 5,
                include: {
                    track: {
                        select: {
                            id: true,
                            songName: true,
                            artist: true,
                            style: true,
                            imageUrl: true,
                            pool: true,
                            folder: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            console.log(`✅ Encontrados ${likesWithTracks.length} likes com detalhes das músicas:`);
            likesWithTracks.forEach((like, index) => {
                console.log(`   ${index + 1}. ${like.track.songName} - ${like.track.artist}`);
                console.log(`      Style: ${like.track.style || 'N/A'}`);
                console.log(`      Pool: ${like.track.pool || 'N/A'}`);
                console.log(`      Folder: ${like.track.folder || 'N/A'}`);
                console.log(`      Curtido em: ${like.createdAt.toLocaleDateString('pt-BR')}`);
            });
        } catch (error) {
            console.log('❌ Erro ao verificar relacionamentos:', error.message);
        }

        // 4. Verificar estatísticas
        console.log('\n4. Verificando estatísticas...');
        try {
            const totalLikes = await prisma.like.count();
            const uniqueUsers = await prisma.like.groupBy({
                by: ['userId'],
                _count: true
            });
            const uniqueTracks = await prisma.like.groupBy({
                by: ['trackId'],
                _count: true
            });

            console.log('✅ Estatísticas:');
            console.log(`   - Total de likes: ${totalLikes}`);
            console.log(`   - Usuários únicos: ${uniqueUsers.length}`);
            console.log(`   - Músicas únicas: ${uniqueTracks.length}`);

            // Verificar estilos únicos
            const likesWithStyles = await prisma.like.findMany({
                include: {
                    track: {
                        select: {
                            style: true
                        }
                    }
                }
            });

            const uniqueStyles = [...new Set(likesWithStyles.map(like => like.track.style).filter(Boolean))];
            console.log(`   - Estilos únicos: ${uniqueStyles.length}`);
            console.log(`   - Estilos: ${uniqueStyles.join(', ')}`);

        } catch (error) {
            console.log('❌ Erro ao verificar estatísticas:', error.message);
        }

        console.log('\n✅ Teste concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o teste
testProfileLikes();
