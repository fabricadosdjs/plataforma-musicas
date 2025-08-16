// src/app/api/tracks/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '0') : undefined;

    console.log('🔍 API Tracks chamada - carregando todas as músicas');
    console.log('🔍 Parâmetros:', { limit, searchParams: Object.fromEntries(searchParams.entries()) });

    // Verificar conexão com o banco
    try {
      await prisma.$connect();
      console.log('✅ Conexão com banco estabelecida');
    } catch (dbError) {
      console.error('❌ Erro na conexão com banco:', dbError);
      throw dbError;
    }

    // Query para retornar todas as músicas (sem limite)
    console.log('🔍 Executando query Prisma...');
    const tracks = await prisma.track.findMany({
      select: {
        id: true,
        songName: true,
        artist: true,
        style: true,
        pool: true,
        imageUrl: true,
        downloadUrl: true,
        releaseDate: true,
        createdAt: true,
        previewUrl: true,
        isCommunity: true,
        uploadedBy: true,
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      ...(limit && { take: limit }),
    });

    console.log(`📊 Resultado: ${tracks.length} músicas encontradas.`);

    // Log das primeiras tracks para debug
    if (tracks.length > 0) {
      console.log('🎵 Primeiras 3 tracks:', tracks.slice(0, 3).map(t => ({
        id: t.id,
        songName: t.songName,
        artist: t.artist,
        style: t.style
      })));
    } else {
      console.log('⚠️ Nenhuma track encontrada - verificando se a tabela existe...');

      // Verificar se a tabela Track existe e tem dados
      try {
        const tableInfo = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Track"`;
        console.log('📊 Info da tabela Track:', tableInfo);

        const allTables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('📊 Tabelas disponíveis:', allTables);
      } catch (tableError) {
        console.error('❌ Erro ao verificar tabela:', tableError);
      }
    }

    // Processar tracks de forma ultra-simplificada
    const tracksWithPreview = tracks.map((track: any) => ({
      ...track,
      previewUrl: track.downloadUrl || '',
      isCommunity: false,
      uploadedBy: null,
      downloadCount: 0,
      likeCount: 0,
      playCount: 0,
    }));

    console.log('✅ Processamento concluído, retornando resposta');

    return NextResponse.json({
      tracks: tracksWithPreview,
      totalCount: tracksWithPreview.length,
      currentPage: 1,
      totalPages: 1,
      hasMore: false
    });

  } catch (error) {
    console.error("[GET_TRACKS_ERROR]", error);

    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('🔍 Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    return NextResponse.json({
      error: "Erro interno do servidor ao buscar músicas",
      tracks: [],
      totalCount: 0
    }, { status: 500 });
  } finally {
    // Fechar conexão
    try {
      await prisma.$disconnect();
      console.log('🔌 Conexão com banco fechada');
    } catch (disconnectError) {
      console.error('❌ Erro ao fechar conexão:', disconnectError);
    }
  }
}