import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { ContaboStorage } from '@/lib/contabo-storage';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se o usuário está logado e é admin
    const isAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';

    if (!session?.user || !isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Acesso negado. Apenas administradores podem excluir músicas.'
      }, { status: 403 });
    }

    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json({
        success: false,
        error: 'ID da música é obrigatório'
      }, { status: 400 });
    }

    // Buscar a música no banco de dados
    const track = await prisma.track.findUnique({
      where: { id: trackId }
    });

    if (!track) {
      return NextResponse.json({
        success: false,
        error: 'Música não encontrada'
      }, { status: 404 });
    }

    console.log(`🗑️ Iniciando exclusão da música: ${track.artist} - ${track.songName}`);

    // Inicializar ContaboStorage
    const storage = new ContaboStorage({
      endpoint: process.env.CONTABO_ENDPOINT!,
      region: process.env.CONTABO_REGION!,
      accessKeyId: process.env.CONTABO_ACCESS_KEY!,
      secretAccessKey: process.env.CONTABO_SECRET_KEY!,
      bucketName: process.env.CONTABO_BUCKET_NAME!,
    });

    let storageDeleted = false;
    let storageError = null;

    try {
      // Tentar excluir do storage se a URL for do Contabo
      if (track.downloadUrl && track.downloadUrl.includes(process.env.CONTABO_ENDPOINT!)) {
        // Extrair a chave do arquivo da URL
        const urlParts = track.downloadUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Buscar arquivos no storage para encontrar a chave exata
        const storageFiles = await storage.listFiles();
        const fileKey = storageFiles.find(file => file.key.includes(fileName))?.key;

        if (fileKey) {
          console.log(`🗑️ Excluindo arquivo do storage: ${fileKey}`);
          await storage.deleteFile(fileKey);
          storageDeleted = true;
          console.log(`✅ Arquivo excluído do storage: ${fileKey}`);
        } else {
          console.log(`⚠️ Arquivo não encontrado no storage: ${fileName}`);
        }
      } else {
        console.log(`ℹ️ URL não é do Contabo, pulando exclusão do storage: ${track.downloadUrl}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao excluir do storage:`, error);
      storageError = error instanceof Error ? error.message : 'Erro desconhecido';
    }

    // Excluir do banco de dados
    console.log(`🗑️ Excluindo do banco de dados: ${track.id}`);
    await prisma.track.delete({
      where: { id: trackId }
    });

    console.log(`✅ Música excluída com sucesso: ${track.artist} - ${track.songName}`);

    return NextResponse.json({
      success: true,
      message: 'Música excluída com sucesso',
      trackDeleted: {
        id: track.id,
        artist: track.artist,
        songName: track.songName
      },
      storageDeleted,
      storageError
    });

  } catch (error) {
    console.error('Erro ao excluir música:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 