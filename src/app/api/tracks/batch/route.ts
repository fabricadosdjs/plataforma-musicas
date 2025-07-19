// src/app/api/tracks/batch/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Autenticação: Garante que apenas um admin possa usar esta API
    const { userId } = getAuth(req);
    // TODO: Adicionar verificação de role de admin quando implementado no Clerk
    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // 2. Extrai os dados do corpo da requisição
    const body = await req.json();
    const {
      trackDetails,
      previewLinks,
      downloadLinks,
      style,
      version,
      duration,
      fileSize,
      releaseDate,
    } = body;

    // 3. Validação dos dados recebidos
    if (!trackDetails || !previewLinks || !downloadLinks || !style || !version || !duration || !fileSize || !releaseDate) {
        return new NextResponse("Dados em falta", { status: 400 });
    }

    // 4. Processa os textos em listas (arrays)
    const detailsArray = trackDetails.split('\n').filter((line: string) => line.trim() !== '');
    const previewsArray = previewLinks.split('\n').filter((line: string) => line.trim() !== '');
    const downloadsArray = downloadLinks.split('\n').filter((line: string) => line.trim() !== '');

    // Verifica se as listas têm o mesmo tamanho
    if (detailsArray.length !== previewsArray.length || detailsArray.length !== downloadsArray.length) {
        return new NextResponse("A quantidade de linhas nos campos de texto não corresponde.", { status: 400 });
    }

    // 5. Prepara os dados para o banco de dados
    const tracksToCreate = detailsArray.map((detailLine: string, index: number) => {
        const [artist, songName] = detailLine.split(' - ').map(s => s.trim());
        
        return {
            songName: songName || 'Sem Título',
            artist: artist || 'Artista Desconhecido',
            previewUrl: previewsArray[index].trim(),
            downloadUrl: downloadsArray[index].trim(),
            style,
            version,
            duration,
            fileSize,
            releaseDate: new Date(releaseDate),
            // URL de imagem genérica por enquanto
            imageUrl: `https://placehold.co/64x64/333/fff?text=${artist ? artist.substring(0, 2) : '??'}`,
        };
    });

    // 6. Insere as novas músicas no banco de dados
    const result = await prisma.track.createMany({
      data: tracksToCreate,
      skipDuplicates: true, // Não insere se já existir (baseado em chaves únicas, se houver)
    });

    return NextResponse.json({ message: `${result.count} músicas adicionadas com sucesso!` });

  } catch (error) {
    console.error("[TRACK_BATCH_POST_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}