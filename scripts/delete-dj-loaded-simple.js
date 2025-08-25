import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🚀 Script de Limpeza - DJ LOADED');
        console.log('================================');

        // 1. Buscar músicas
        console.log('🔍 Buscando músicas do DJ LOADED...');
        const tracks = await prisma.track.findMany({
            where: {
                OR: [
                    {
                        artist: {
                            contains: 'DJ LOADED',
                            mode: 'insensitive'
                        }
                    },
                    {
                        songName: {
                            contains: 'DJ LOADED',
                            mode: 'insensitive'
                        }
                    },
                    {
                        downloadUrl: {
                            contains: 'DJ%20LOADED',
                            mode: 'insensitive'
                        }
                    },
                    {
                        downloadUrl: {
                            contains: '250%20PRIME%20CHANGE%20AHEAD',
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true
            }
        });

        if (tracks.length === 0) {
            console.log('✅ Nenhuma música encontrada.');
            return;
        }

        console.log(`📊 Total de músicas encontradas: ${tracks.length}`);
        console.log('');

        // 2. Mostrar algumas músicas
        console.log('📋 Primeiras 10 músicas:');
        tracks.slice(0, 10).forEach((track, index) => {
            console.log(`   ${index + 1}. ${track.songName} - ${track.artist}`);
        });
        console.log('');

        // 3. Deletar músicas
        console.log('🗑️ Iniciando exclusão...');
        const trackIds = tracks.map(track => track.id);

        const result = await prisma.track.deleteMany({
            where: {
                id: {
                    in: trackIds
                }
            }
        });

        // 4. Resultado
        console.log('✅ Exclusão concluída!');
        console.log(`📊 Músicas deletadas: ${result.count}`);
        console.log(`📊 Total esperado: ${tracks.length}`);

        // 5. Verificação
        const remaining = await prisma.track.findMany({
            where: {
                OR: [
                    {
                        artist: {
                            contains: 'DJ LOADED',
                            mode: 'insensitive'
                        }
                    },
                    {
                        downloadUrl: {
                            contains: 'DJ%20LOADED',
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        });

        console.log(`📊 Músicas restantes: ${remaining.length}`);

    } catch (error) {
        console.error('💥 Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();


