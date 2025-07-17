// src/app/api/tracks/route.ts
import { NextResponse } from 'next/server';

// Dados de exemplo (temporariamente aqui, mas virão do banco de dados)
const mockTracks = [
    { id: 13, songName: 'VERSACE ON THE FLOOR (Bruno Mars vs. David Guetta)', artist: 'BRUNO MARS', style: 'Eletronica', version: 'Remix', imageUrl: 'https://placehold.co/64x64/A52A2A/ffffff?text=BM', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 7, songName: 'Coração em Silêncio', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: 'https://i.ibb.co/5qVv4TK/20250603-1839-Capa-Sertanejo-Rom-ntico-simple-compose-01jwvvpxkaet6b797dee9nr3py.png', previewUrl: 'https://files.catbox.moe/59s0sn.mp3', downloadUrl: 'https://files.catbox.moe/59s0sn.mp3' },
    { id: 8, songName: 'Coração que Não Esquece', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: 'https://i.ibb.co/5qVv4TK/20250603-1839-Capa-Sertanejo-Rom-ntico-simple-compose-01jwvvpxkaet6b797dee9nr3py.png', previewUrl: 'https://files.catbox.moe/bmm8uo.mp3', downloadUrl: 'https://files.catbox.moe/bmm8uo.mp3' },
    { id: 9, songName: 'Foi Deus Quem Fez', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: 'https://i.ibb.co/5qVv4TK/20250603-1839-Capa-Sertanejo-Rom-ntico-simple-compose-01jwvvpxkaet6b797dee9nr3py.png', previewUrl: 'https://files.catbox.moe/nojq78.mp3', downloadUrl: 'https://files.catbox.moe/nojq78.mp3' },
    { id: 1, songName: 'TÚ ME DAS TUM TUM', artist: 'Dj Jéssika Luana', style: 'House', version: 'Remix', imageUrl: 'https://i.ibb.co/Y7K8ksd2/1b96dfec-11da-4705-8b51-6a55ea03dd62.png', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 2, songName: 'Out Of Sight Of You', artist: 'Interview', style: 'Pop', version: 'Original', imageUrl: 'https://i.ibb.co/L6vjWd3/img-1.jpg', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 3, songName: 'Jigga Boo', artist: 'Tyrell The God', style: 'Trap Hip Hop', version: 'Dirty', imageUrl: 'https://i.ibb.co/hH4vjJg/img-2.jpg', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

export async function POST(req: Request) {
  try {
    const { trackIds } = await req.json();

    if (!trackIds || !Array.isArray(trackIds)) {
      return new NextResponse("IDs de faixas inválidos", { status: 400 });
    }

    // Em um cenário real, isso seria: await prisma.track.findMany(...)
    const foundTracks = mockTracks.filter(track => trackIds.includes(track.id));

    return NextResponse.json(foundTracks);
  } catch (error) {
    console.error("[TRACKS_POST_ERROR]", error);
    return new NextResponse("Erro Interno do Servidor", { status: 500 });
  }
}
