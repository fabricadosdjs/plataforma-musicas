import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buscar estatísticas totais do banco
    const totalTracks = await prisma.track.count();

    // Buscar total de downloads (assumindo que existe uma tabela de downloads)
    const totalDownloads = await prisma.download.count();

    // Calcular tracks novas (criadas nos últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newTracks = await prisma.track.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    const stats = {
      totalTracks,
      totalDownloads,
      newTracks,
      success: true
    };

    console.log('📊 Estatísticas carregadas:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[GET_STATS_ERROR]', error);
    return NextResponse.json({
      error: 'Erro ao buscar estatísticas',
      success: false
    }, { status: 500 });
  }
}