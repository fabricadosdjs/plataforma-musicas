// src/app/api/user-data/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// Simulação do seu catálogo de músicas. Em um cenário real, isso viria da tabela 'Track'.
const mockTracks = [
    { id: 13, songName: 'VERSACE ON THE FLOOR (Bruno Mars vs. David Guetta)', artist: 'BRUNO MARS', imageUrl: 'https://placehold.co/64x64/A52A2A/ffffff?text=BM', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 7, songName: 'Coração em Silêncio', artist: 'Rebeka Sanches', imageUrl: 'https://i.ibb.co/5qVv4TK/20250603-1839-Capa-Sertanejo-Rom-ntico-simple-compose-01jwvvpxkaet6b797dee9nr3py.png', downloadUrl: 'https://files.catbox.moe/59s0sn.mp3' },
    { id: 8, songName: 'Coração que Não Esquece', artist: 'Rebeka Sanches', imageUrl: 'https://i.ibb.co/5qVv4TK/20250603-1839-Capa-Sertanejo-Rom-ntico-simple-compose-01jwvvpxkaet6b797dee9nr3py.png', downloadUrl: 'https://files.catbox.moe/bmm8uo.mp3' },
    { id: 9, songName: 'Foi Deus Quem Fez', artist: 'Rebeka Sanches', imageUrl: 'https://i.ibb.co/5qVv4TK/20250603-1839-Capa-Sertanejo-Rom-ntico-simple-compose-01jwvvpxkaet6b797dee9nr3py.png', downloadUrl: 'https://files.catbox.moe/nojq78.mp3' },
    { id: 1, songName: 'TÚ ME DAS TUM TUM', artist: 'Dj Jéssika Luana', imageUrl: 'https://i.ibb.co/Y7K8ksd2/1b96dfec-11da-4705-8b51-6a55ea03dd62.png', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 2, songName: 'Out Of Sight Of You', artist: 'Interview', imageUrl: 'https://i.ibb.co/L6vjWd3/img-1.jpg', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 3, songName: 'Jigga Boo', artist: 'Tyrell The God', imageUrl: 'https://i.ibb.co/hH4vjJg/img-2.jpg', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = getAuth(req);

    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        likes: { orderBy: { createdAt: 'desc' } },
        downloads: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { id: userId, email: sessionClaims?.email, name: sessionClaims?.fullName },
        include: { likes: true, downloads: true },
      });
    }
    
    const likedTracks = user.likes
      .map(like => {
        const trackDetails = mockTracks.find(t => t.id === like.trackId);
        return trackDetails ? { ...trackDetails, actionDate: like.createdAt } : null;
      })
      .filter(Boolean);

    const downloadedTracks = user.downloads
      .map(download => {
        const trackDetails = mockTracks.find(t => t.id === download.trackId);
        return trackDetails ? { ...trackDetails, actionDate: download.createdAt } : null;
      })
      .filter(Boolean);
      
    const uniqueDownloadedIds = [...new Set(user.downloads.map(d => d.trackId))];

    return NextResponse.json({
      // Para a página /profile
      likes: likedTracks,
      downloads: downloadedTracks,
      // Para a página /new
      likedTrackIds: user.likes.map(like => like.trackId),
      downloadedTrackIds: uniqueDownloadedIds,
      downloadCount: uniqueDownloadedIds.length,
    });
  } catch (error) {
    console.error("[USER_DATA_GET_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new NextResponse(`Erro Interno do Servidor: ${errorMessage}`, { status: 500 });
  }
}
