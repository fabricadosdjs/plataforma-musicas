import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import prisma from '@/lib/prisma';

const s3Client = new S3Client({
    region: process.env.CONTABO_REGION!,
    endpoint: process.env.CONTABO_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.CONTABO_ACCESS_KEY!,
        secretAccessKey: process.env.CONTABO_SECRET_KEY!,
    },
});

export async function POST(request: NextRequest) {
    try {
        // Removida verificação de autenticação para teste

        const { fileKey, filename } = await request.json();

        if (!fileKey || !filename) {
            return NextResponse.json(
                { error: 'fileKey e filename são obrigatórios' },
                { status: 400 }
            );
        }

        console.log(`🎵 Importando álbum: ${filename} (${fileKey})`);

        // Extrair informações do caminho do arquivo
        const pathParts = fileKey.split('/');
        let artist = '';
        let album = '';
        let track = '';
        let genre = '';

        // Padrão esperado: albuns/ARTISTA/ALBUM/TRACK.mp3
        if (pathParts.length >= 4) {
            artist = pathParts[1] || '';
            album = pathParts[2] || '';
            track = pathParts[3]?.replace(/\.[^/.]+$/, '') || '';
        } else if (pathParts.length === 3) {
            artist = pathParts[1] || '';
            album = pathParts[2]?.replace(/\.[^/.]+$/, '') || '';
        } else if (pathParts.length === 2) {
            artist = pathParts[1]?.replace(/\.[^/.]+$/, '') || '';
        }

        // Tentar detectar gênero
        const genreKeywords = [
            'house', 'techno', 'trance', 'progressive', 'deep', 'tech', 'minimal',
            'dubstep', 'drum', 'bass', 'ambient', 'chillout', 'lounge', 'jazz',
            'rock', 'pop', 'hiphop', 'rap', 'reggae', 'salsa', 'samba', 'bossa'
        ];

        const fullText = `${artist} ${album} ${track}`.toLowerCase();
        for (const keyword of genreKeywords) {
            if (fullText.includes(keyword)) {
                genre = keyword.charAt(0).toUpperCase() + keyword.slice(1);
                break;
            }
        }

        // Verificar se já existe um release para este álbum
        let release = await prisma.release.findFirst({
            where: {
                title: album,
                artist: artist
            }
        });

        // Se não existir, criar um novo release
        if (!release) {
            console.log(`📀 Criando novo release: ${album} - ${artist}`);

            release = await prisma.release.create({
                data: {
                    title: album || filename,
                    artist: artist || 'Artista Desconhecido',
                    albumArt: '/images/default-album.jpg', // Imagem padrão
                    description: `Álbum importado automaticamente do Contabo Storage`,
                    genre: genre || 'Desconhecido',
                    releaseDate: new Date(),
                    trackCount: 1,
                    featured: false,
                    exclusive: false,
                    streaming: {},
                    social: {}
                }
            });

            console.log(`✅ Release criado: ${release.id}`);
        } else {
            console.log(`📀 Release já existe: ${release.id}`);
        }

        // Verificar se já existe uma track para este arquivo
        const existingTrack = await prisma.track.findFirst({
            where: {
                songName: track || filename,
                artist: artist
            }
        });

        if (existingTrack) {
            console.log(`⚠️ Track já existe: ${existingTrack.id}`);
            return NextResponse.json({
                message: 'Track já existe no banco',
                track: existingTrack,
                release: release
            });
        }

        // Criar nova track
        console.log(`🎵 Criando nova track: ${track || filename}`);

        const newTrack = await prisma.track.create({
            data: {
                songName: track || filename,
                artist: artist || 'Artista Desconhecido',
                style: genre || 'Desconhecido',
                version: 'Original',
                pool: 'Álbum',
                previewUrl: `${process.env.CONTABO_ENDPOINT}/${process.env.CONTABO_BUCKET_NAME}/${fileKey}`,
                downloadUrl: `${process.env.CONTABO_ENDPOINT}/${process.env.CONTABO_BUCKET_NAME}/${fileKey}`,
                imageUrl: '/images/default-track.jpg', // Imagem padrão
                releaseDate: new Date(),
                bitrate: 320, // Assumir qualidade alta para álbuns
                duration: '00:00:00', // Será preenchido depois se possível
                uploadedBy: 'admin',
                isActive: true,
                releaseId: release.id // Conectar com o release
            }
        });

        console.log(`✅ Track criada: ${newTrack.id}`);

        // Atualizar contador de tracks no release
        await prisma.release.update({
            where: { id: release.id },
            data: { trackCount: { increment: 1 } }
        });

        console.log(`✅ Contador de tracks atualizado no release`);

        return NextResponse.json({
            message: 'Álbum importado com sucesso',
            track: newTrack,
            release: release,
            metadata: {
                artist,
                album,
                track,
                genre,
                fileKey,
                filename
            }
        });

    } catch (error) {
        console.error('❌ Erro ao importar álbum:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: 'Erro ao importar álbum', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
