// src/app/api/tracks/batch/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('🎵 API /tracks/batch chamada');

    // 1. Autenticação: Para desenvolvimento, vamos aceitar qualquer requisição
    // TODO: Adicionar verificação de role de admin em produção
    console.log('✅ Autenticação aceita para desenvolvimento');

    // 2. Validação do Corpo da Requisição
    const body = await req.json();
    console.log('📥 Dados recebidos:', Array.isArray(body) ? `Array com ${body.length} itens` : 'Objeto único');

    // Verifica se é o formato novo (array de objetos JSON) ou o formato antigo
    if (Array.isArray(body)) {
      // Formato novo: array de objetos JSON
      const tracks = body;

      // 3. Validação dos dados recebidos (formato JSON)
      console.log('🔍 Validando músicas...');
      for (const track of tracks) {
        const missingFields = [];
        if (!track.songName) missingFields.push('songName');
        if (!track.artist) missingFields.push('artist');
        if (!track.style) missingFields.push('style');
        if (!track.version) missingFields.push('version');
        if (!track.pool) missingFields.push('pool');
        if (!track.imageUrl) missingFields.push('imageUrl');
        if (!track.previewUrl) missingFields.push('previewUrl');
        if (!track.downloadUrl) missingFields.push('downloadUrl');
        if (!track.releaseDate) missingFields.push('releaseDate');

        if (missingFields.length > 0) {
          console.log(`❌ Música "${track.songName || 'Desconhecida'}" tem campos faltando: ${missingFields.join(', ')}`);
          return new NextResponse(`Dados em falta na música "${track.songName || 'Desconhecida'}": ${missingFields.join(', ')}`, { status: 400 });
        }
      }
      console.log('✅ Todas as músicas passaram na validação');

      // 4. Prepara os dados para o banco de dados (formato JSON)
      const now = new Date();
      const tracksToCreate = tracks.map((track: any) => ({
        songName: track.songName,
        artist: track.artist,
        previewUrl: track.previewUrl,
        downloadUrl: track.downloadUrl,
        style: track.style,
        version: track.version,
        pool: track.pool || 'Nexor Records',
        imageUrl: track.imageUrl,
        releaseDate: new Date(track.releaseDate),
        isCommunity: false, // Explicitamente define como false para músicas oficiais
        createdAt: now,
        updatedAt: now,
      }));

      // 5. Verificar duplicados apenas no banco de dados
      console.log('🔍 Verificando duplicados no banco de dados...');
      const existingTracks = await prisma.track.findMany({
        select: {
          songName: true,
          artist: true,
          previewUrl: true,
          downloadUrl: true,
        }
      });

      // Criar sets para verificação rápida
      const existingUrls = new Set([
        ...existingTracks.map(track => track.previewUrl),
        ...existingTracks.map(track => track.downloadUrl)
      ]);

      const existingSongs = new Set(
        existingTracks.map(track => `${track.artist} - ${track.songName}`.toLowerCase())
      );

      // Separar músicas únicas e duplicadas
      const uniqueTracks = [];
      const duplicateTracks = [];
      const duplicateReasons = [];

      for (const track of tracksToCreate) {
        const songKey = `${track.artist} - ${track.songName}`.toLowerCase();
        const isDuplicateUrl = existingUrls.has(track.previewUrl) || existingUrls.has(track.downloadUrl);
        const isDuplicateSong = existingSongs.has(songKey);

        console.log(`🔍 Verificando: ${track.artist} - ${track.songName}`);

        if (isDuplicateUrl || isDuplicateSong) {
          duplicateTracks.push(track);

          if (isDuplicateUrl) {
            duplicateReasons.push(`URL duplicada: ${track.artist} - ${track.songName}`);
          } else {
            duplicateReasons.push(`Música já existe: ${track.artist} - ${track.songName}`);
          }
        } else {
          uniqueTracks.push(track);
        }
      }

      console.log(`📊 Resumo da verificação:`);
      console.log(`   - Total recebido: ${tracksToCreate.length}`);
      console.log(`   - Únicas: ${uniqueTracks.length}`);
      console.log(`   - Duplicadas: ${duplicateTracks.length}`);

      // 6. Inserir apenas músicas únicas
      let insertResult = null;
      if (uniqueTracks.length > 0) {
        console.log('💾 Inserindo músicas únicas no banco de dados...');
        insertResult = await prisma.track.createMany({
          data: uniqueTracks,
          skipDuplicates: true,
        });
        console.log(`✅ ${insertResult.count} músicas inseridas com sucesso!`);
      }

      // 7. Preparar resposta detalhada
      const response = {
        success: true,
        totalReceived: tracksToCreate.length,
        totalInserted: insertResult?.count || 0,
        totalDuplicates: duplicateTracks.length,
        message: `${insertResult?.count || 0} músicas adicionadas com sucesso!`,
        duplicates: duplicateReasons,
        summary: {
          received: tracksToCreate.length,
          inserted: insertResult?.count || 0,
          duplicates: duplicateTracks.length,
          unique: uniqueTracks.length
        }
      };

      console.log('📋 Resumo final:', response.summary);
      return NextResponse.json(response);

    } else {
      // Formato antigo: campos separados
      const {
        trackDetails,
        previewLinks,
        downloadLinks,
        style,
        version,
        releaseDate,
      } = body;

      // 3. Validação dos dados recebidos (formato antigo)
      if (!trackDetails || !previewLinks || !downloadLinks || !style || !version || !releaseDate) {
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

      // 5. Prepara os dados para o banco de dados (formato antigo)
      const tracksToCreate = detailsArray.map((detailLine: string, index: number) => {
        const [artist, songName] = detailLine.split(' - ').map(s => s.trim());

        return {
          songName: songName || 'Sem Título',
          artist: artist || 'Artista Desconhecido',
          previewUrl: previewsArray[index].trim(),
          downloadUrl: downloadsArray[index].trim(),
          style,
          version,
          releaseDate: new Date(new Date(releaseDate).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })),
          // URL de imagem genérica por enquanto
          imageUrl: `https://placehold.co/64x64/333/fff?text=${artist ? artist.substring(0, 2) : '??'}`,
        };
      });

      // 6. Insere as novas músicas no banco de dados
      const result = await prisma.track.createMany({
        data: tracksToCreate,
        skipDuplicates: true,
      });

      return NextResponse.json({ message: `${result.count} músicas adicionadas com sucesso!` });
    }

  } catch (error) {
    console.error("[TRACK_BATCH_POST_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}