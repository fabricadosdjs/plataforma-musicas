import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('🎭 API Styles Most Downloaded: Carregando estilos mais baixados...');

        // Buscar todos os estilos disponíveis com contagem de tracks
        const allStyles = await prisma.track.groupBy({
            by: ['style'],
            where: {
                AND: [
                    { style: { not: null } },
                    { style: { not: 'N/A' } }
                ]
            },
            _count: {
                _all: true
            }
        });

        // Buscar downloads reais agrupados por trackId
        const downloadsByTrack = await prisma.download.groupBy({
            by: ['trackId'],
            _count: {
                _all: true
            }
        });

        // Criar mapa de downloads por track
        const downloadMap = new Map();
        downloadsByTrack.forEach(download => {
            downloadMap.set(download.trackId, download._count._all);
        });

        // Buscar tracks com seus estilos para calcular downloads por estilo
        const tracksWithDownloads = await prisma.track.findMany({
            where: {
                AND: [
                    {
                        id: {
                            in: Array.from(downloadMap.keys())
                        }
                    },
                    { style: { not: null } },
                    { style: { not: 'N/A' } }
                ]
            },
            select: {
                id: true,
                style: true
            }
        });

        // Calcular downloads por estilo
        const styleDownloadCounts: { [key: string]: number } = {};
        tracksWithDownloads.forEach(track => {
            const style = track.style!;
            const downloadCount = downloadMap.get(track.id) || 0;

            if (!styleDownloadCounts[style]) {
                styleDownloadCounts[style] = 0;
            }
            styleDownloadCounts[style] += downloadCount;
        });

        // Formatar resultado com todos os estilos disponíveis
        const formattedStyles = allStyles
            .filter(style => style.style && style.style !== 'N/A')
            .map(style => ({
                name: style.style!,
                trackCount: style._count._all,
                downloadCount: styleDownloadCounts[style.style!] || 0
            }))
            .sort((a, b) => b.downloadCount - a.downloadCount); // Ordenar por downloads

        console.log(`✅ ${formattedStyles.length} estilos carregados com dados de download`);
        console.log('📊 Estilos encontrados:', formattedStyles.map(s => `${s.name}: ${s.downloadCount} downloads`));

        return NextResponse.json({
            success: true,
            styles: formattedStyles,
            total: formattedStyles.length
        });

    } catch (error) {
        console.error('❌ Erro ao carregar estilos mais baixados:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                styles: [],
                total: 0
            },
            { status: 500 }
        );
    }
}
