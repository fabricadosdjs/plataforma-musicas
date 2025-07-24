// Script para verificar músicas no banco de dados
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkDatabase() {
    console.log('🔍 Verificando músicas no banco de dados...\n');

    try {
        // Contar total de músicas
        const totalTracks = await prisma.track.count();
        console.log(`📊 Total de músicas no banco: ${totalTracks}`);

        if (totalTracks === 0) {
            console.log('❌ Nenhuma música encontrada no banco de dados!');
            console.log('💡 Execute: npm run contabo:import para importar as músicas');
            return;
        }

        // Listar algumas músicas
        console.log('\n🎵 Músicas encontradas:');
        const tracks = await prisma.track.findMany({
            take: 10,
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                version: true,
                previewUrl: true,
                downloadUrl: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        tracks.forEach((track, index) => {
            console.log(`\n${index + 1}. ID: ${track.id}`);
            console.log(`   Título: ${track.songName}`);
            console.log(`   Artista: ${track.artist}`);
            console.log(`   Estilo: ${track.style}`);
            console.log(`   Versão: ${track.version}`);
            console.log(`   Preview URL: ${track.previewUrl}`);
            console.log(`   Download URL: ${track.downloadUrl}`);
            console.log(`   Criado em: ${track.createdAt?.toLocaleString()}`);
        });

        // Estatísticas por estilo
        console.log('\n📈 Estatísticas por estilo:');
        const styleStats = await prisma.track.groupBy({
            by: ['style'],
            _count: true,
            orderBy: {
                _count: {
                    style: 'desc'
                }
            }
        });

        styleStats.forEach(stat => {
            console.log(`   ${stat.style}: ${stat._count} músicas`);
        });

        // Verificar URLs
        console.log('\n🔗 Verificando URLs:');
        const tracksWithUrls = await prisma.track.findMany({
            where: {
                OR: [
                    { previewUrl: { contains: 'contabostorage' } },
                    { downloadUrl: { contains: 'contabostorage' } }
                ]
            },
            select: {
                id: true,
                songName: true,
                previewUrl: true
            },
            take: 3
        });

        if (tracksWithUrls.length > 0) {
            console.log('✅ Músicas com URLs do Contabo encontradas:');
            tracksWithUrls.forEach(track => {
                console.log(`   ${track.songName}: ${track.previewUrl}`);
            });
        } else {
            console.log('❌ Nenhuma música com URLs do Contabo encontrada');
        }

        console.log('\n🎉 Verificação do banco concluída!');

    } catch (error) {
        console.error('\n❌ ERRO ao verificar banco:', error);
        console.log('\n🔧 Verifique:');
        console.log('   1. Se o banco de dados está acessível');
        console.log('   2. Se as tabelas foram criadas corretamente');
        console.log('   3. Se a DATABASE_URL está correta no .env.local');
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
