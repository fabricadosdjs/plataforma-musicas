import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();

// Configuração do álbum a ser deletado
const ALBUM_CONFIG = {
    artist: 'DJ LOADED',
    albumName: '250 PRIME CHANGE AHEAD',
    // Padrões de busca para identificar músicas do álbum
    patterns: [
        '%DJ LOADED%',
        '%250 PRIME CHANGE AHEAD%'
    ]
};

// Interface para leitura do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para perguntar ao usuário
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim().toLowerCase());
        });
    });
}

// Função para buscar músicas do álbum
async function findAlbumTracks() {
    console.log('🔍 Buscando músicas do álbum...');

    try {
        // Busca mais flexível para encontrar músicas do DJ LOADED
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
                artist: true,
                style: true,
                downloadUrl: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return tracks;
    } catch (error) {
        console.error('❌ Erro ao buscar músicas:', error);
        throw error;
    }
}

// Função para deletar músicas
async function deleteTracks(trackIds) {
    console.log('🗑️ Iniciando exclusão das músicas...');

    try {
        const result = await prisma.track.deleteMany({
            where: {
                id: {
                    in: trackIds
                }
            }
        });

        return result;
    } catch (error) {
        console.error('❌ Erro ao deletar músicas:', error);
        throw error;
    }
}

// Função principal
async function main() {
    try {
        console.log('🚀 Script de Limpeza do Banco de Dados');
        console.log('=====================================');
        console.log(`🎵 Álbum: ${ALBUM_CONFIG.albumName}`);
        console.log(`👤 Artista: ${ALBUM_CONFIG.artist}`);
        console.log('');

        // 1. Buscar músicas
        const tracks = await findAlbumTracks();

        if (tracks.length === 0) {
            console.log('✅ Nenhuma música encontrada para este álbum.');
            return;
        }

        console.log(`📊 Total de músicas encontradas: ${tracks.length}`);
        console.log('');

        // 2. Mostrar algumas músicas como exemplo
        console.log('📋 Exemplos de músicas encontradas:');
        tracks.slice(0, 5).forEach((track, index) => {
            console.log(`   ${index + 1}. ${track.songName} - ${track.artist}`);
        });

        if (tracks.length > 5) {
            console.log(`   ... e mais ${tracks.length - 5} músicas`);
        }
        console.log('');

        // 3. Confirmação do usuário
        console.log('⚠️  ATENÇÃO: Esta ação não pode ser desfeita!');
        const confirm = await askQuestion('🤔 Tem certeza que deseja deletar TODAS essas músicas? (sim/não): ');

        if (confirm !== 'sim' && confirm !== 's' && confirm !== 'yes' && confirm !== 'y') {
            console.log('❌ Operação cancelada pelo usuário.');
            return;
        }

        // 4. Confirmação final
        const finalConfirm = await askQuestion('🔴 Digite "DELETAR" para confirmar a exclusão: ');

        if (finalConfirm !== 'DELETAR') {
            console.log('❌ Confirmação incorreta. Operação cancelada.');
            return;
        }

        // 5. Deletar músicas
        const trackIds = tracks.map(track => track.id);
        const deleteResult = await deleteTracks(trackIds);

        // 6. Resultado
        console.log('');
        console.log('✅ Exclusão concluída com sucesso!');
        console.log(`📊 Músicas deletadas: ${deleteResult.count}`);
        console.log(`📊 Total esperado: ${tracks.length}`);

        if (deleteResult.count === tracks.length) {
            console.log('🎯 Todas as músicas foram deletadas corretamente!');
        } else {
            console.log('⚠️  Algumas músicas podem não ter sido deletadas.');
        }

        // 7. Verificação final
        const remainingTracks = await findAlbumTracks();
        console.log(`📊 Músicas restantes: ${remainingTracks.length}`);

    } catch (error) {
        console.error('💥 Erro fatal:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

// Executar script
main().catch(console.error);
