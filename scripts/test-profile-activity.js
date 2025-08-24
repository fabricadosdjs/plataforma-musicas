/**
 * Script para testar a API de atividade do perfil
 * Execute com: node scripts/test-profile-activity.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProfileActivity() {
    try {
        console.log('🔍 Testando API de atividade do perfil...\n');

        // 1. Verificar se as tabelas existem
        console.log('1. Verificando estrutura das tabelas...');
        try {
            const downloadCount = await prisma.download.count();
            const likeCount = await prisma.like.count();
            const playCount = await prisma.play.count();

            console.log(`✅ Tabela Download encontrada com ${downloadCount} registros`);
            console.log(`✅ Tabela Like encontrada com ${likeCount} registros`);
            console.log(`✅ Tabela Play encontrada com ${playCount} registros`);
        } catch (error) {
            console.log('❌ Erro ao verificar tabelas:', error.message);
            return;
        }

        // 2. Verificar dados de exemplo
        console.log('\n2. Verificando dados de exemplo...');
        try {
            const sampleDownload = await prisma.download.findFirst({
                include: {
                    user: true,
                    track: true
                }
            });

            if (sampleDownload) {
                console.log('✅ Exemplo de Download:');
                console.log('   - User ID:', sampleDownload.userId);
                console.log('   - Track:', sampleDownload.track.songName);
                console.log('   - Downloaded At:', sampleDownload.downloadedAt);
            }

            const sampleLike = await prisma.like.findFirst({
                include: {
                    user: true,
                    track: true
                }
            });

            if (sampleLike) {
                console.log('✅ Exemplo de Like:');
                console.log('   - User ID:', sampleLike.userId);
                console.log('   - Track:', sampleLike.track.songName);
                console.log('   - Created At:', sampleLike.createdAt);
            }

            const samplePlay = await prisma.play.findFirst({
                include: {
                    user: true,
                    track: true
                }
            });

            if (samplePlay) {
                console.log('✅ Exemplo de Play:');
                console.log('   - User ID:', samplePlay.userId);
                console.log('   - Track:', samplePlay.track.songName);
                console.log('   - Created At:', samplePlay.createdAt);
            }
        } catch (error) {
            console.log('❌ Erro ao verificar dados de exemplo:', error.message);
        }

        // 3. Simular consultas da API
        console.log('\n3. Simulando consultas da API...');
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

            // Simular busca por um usuário específico (primeiro usuário encontrado)
            const firstUser = await prisma.user.findFirst({
                select: { id: true, email: true }
            });

            if (firstUser) {
                console.log(`✅ Usuário de teste: ${firstUser.email}`);

                // Downloads
                const downloadsToday = await prisma.download.count({
                    where: {
                        userId: firstUser.id,
                        downloadedAt: { gte: today }
                    }
                });

                const downloadsThisWeek = await prisma.download.count({
                    where: {
                        userId: firstUser.id,
                        downloadedAt: { gte: weekAgo }
                    }
                });

                const downloadsThisMonth = await prisma.download.count({
                    where: {
                        userId: firstUser.id,
                        downloadedAt: { gte: monthAgo }
                    }
                });

                const downloadsThisYear = await prisma.download.count({
                    where: {
                        userId: firstUser.id,
                        downloadedAt: { gte: yearAgo }
                    }
                });

                const totalDownloads = await prisma.download.count({
                    where: { userId: firstUser.id }
                });

                // Likes
                const likesToday = await prisma.like.count({
                    where: {
                        userId: firstUser.id,
                        createdAt: { gte: today }
                    }
                });

                const likesThisWeek = await prisma.like.count({
                    where: {
                        userId: firstUser.id,
                        createdAt: { gte: weekAgo }
                    }
                });

                const totalLikes = await prisma.like.count({
                    where: { userId: firstUser.id }
                });

                // Plays
                const playsToday = await prisma.play.count({
                    where: {
                        userId: firstUser.id,
                        createdAt: { gte: today }
                    }
                });

                const totalPlays = await prisma.play.count({
                    where: { userId: firstUser.id }
                });

                // Estatísticas
                const estimatedGB = Math.round((totalDownloads * 10) / 1024 * 100) / 100;

                console.log('✅ Estatísticas simuladas:');
                console.log('   Downloads:');
                console.log(`     - Hoje: ${downloadsToday}`);
                console.log(`     - Esta semana: ${downloadsThisWeek}`);
                console.log(`     - Este mês: ${downloadsThisMonth}`);
                console.log(`     - Este ano: ${downloadsThisYear}`);
                console.log(`     - Total: ${totalDownloads}`);
                console.log('   Likes:');
                console.log(`     - Hoje: ${likesToday}`);
                console.log(`     - Esta semana: ${likesThisWeek}`);
                console.log(`     - Total: ${totalLikes}`);
                console.log('   Plays:');
                console.log(`     - Hoje: ${playsToday}`);
                console.log(`     - Total: ${totalPlays}`);
                console.log(`   Armazenamento estimado: ${estimatedGB} GB`);

                // Dados para gráficos (últimos 7 dias)
                console.log('\n4. Dados para gráficos (últimos 7 dias):');
                const dailyStats = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

                    const dayDownloads = await prisma.download.count({
                        where: {
                            userId: firstUser.id,
                            downloadedAt: {
                                gte: dayStart,
                                lt: dayEnd
                            }
                        }
                    });

                    const dayLikes = await prisma.like.count({
                        where: {
                            userId: firstUser.id,
                            createdAt: {
                                gte: dayStart,
                                lt: dayEnd
                            }
                        }
                    });

                    dailyStats.push({
                        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        downloads: dayDownloads,
                        likes: dayLikes
                    });

                    console.log(`   ${date.toLocaleDateString('pt-BR')}: ${dayDownloads} downloads, ${dayLikes} likes`);
                }
            } else {
                console.log('⚠️  Nenhum usuário encontrado na base de dados');
            }

        } catch (error) {
            console.log('❌ Erro ao simular consultas:', error.message);
        }

        console.log('\n✅ Teste concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o teste
testProfileActivity();
