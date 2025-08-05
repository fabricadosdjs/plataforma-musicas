import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { trackIds, filename } = body;

        if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
            return NextResponse.json({ error: 'IDs de músicas inválidos' }, { status: 400 });
        }

        // Buscar as músicas no banco de dados
        const tracks = await prisma.track.findMany({
            where: {
                id: { in: trackIds }
            }
        });

        if (tracks.length === 0) {
            return NextResponse.json({ error: 'Nenhuma música encontrada' }, { status: 404 });
        }

        // Criar ZIP
        const zip = new JSZip();
        const totalTracks = tracks.length;
        let processedTracks = 0;

        // Adicionar cada música ao ZIP
        for (const track of tracks) {
            try {
                // Buscar o arquivo de áudio
                const audioResponse = await fetch(track.downloadUrl);
                if (!audioResponse.ok) {
                    console.error(`Erro ao buscar áudio para ${track.songName}`);
                    processedTracks++;
                    continue;
                }

                const audioBuffer = await audioResponse.arrayBuffer();

                // Criar nome do arquivo
                const sanitizedSongName = track.songName.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
                const sanitizedArtist = track.artist.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
                const fileName = `${sanitizedArtist} - ${sanitizedSongName}.mp3`;

                // Adicionar ao ZIP
                zip.file(fileName, audioBuffer);
                processedTracks++;
            } catch (error) {
                console.error(`Erro ao processar ${track.songName}:`, error);
                processedTracks++;
            }
        }

        // Gerar ZIP
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        // Registrar downloads no banco
        const userId = session.user.id;
        const downloadPromises = tracks.map(track =>
            prisma.download.create({
                data: {
                    trackId: track.id,
                    userId: userId,
                    downloadedAt: new Date()
                }
            }).catch(error => {
                console.error(`Erro ao registrar download de ${track.songName}:`, error);
            })
        );

        await Promise.all(downloadPromises);

        // Retornar arquivo ZIP
        return new NextResponse(zipBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename || 'nexor-records.zip'}"`,
                'Content-Length': zipBuffer.length.toString()
            }
        });

    } catch (error) {
        console.error('Erro ao criar ZIP:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
