import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log('🎭 Loading styles...');
        }

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

        // Buscar tracks com seus estilos para calcular downloads por estilo e datas
        const tracksWithDetails = await prisma.track.findMany({
            where: {
                AND: [
                    { style: { not: null } },
                    { style: { not: 'N/A' } }
                ]
            },
            select: {
                id: true,
                style: true,
                updatedAt: true,
                createdAt: true,
                imageUrl: true
            }
        });

        // Calcular downloads por estilo e datas
        const styleData: {
            [key: string]: {
                trackCount: number;
                downloadCount: number;
                lastUpdated: Date;
                hasUpdatesToday: boolean;
                imageUrl: string | null;
            }
        } = {};

        tracksWithDetails.forEach(track => {
            const style = track.style!;
            const downloadCount = downloadMap.get(track.id) || 0;

            if (!styleData[style]) {
                styleData[style] = {
                    trackCount: 0,
                    downloadCount: 0,
                    lastUpdated: track.updatedAt || track.createdAt || new Date(),
                    hasUpdatesToday: false,
                    imageUrl: null
                };
            }

            styleData[style].trackCount++;
            styleData[style].downloadCount += downloadCount;

            // Atualizar data mais recente se necessário
            const trackDate = track.updatedAt || track.createdAt;
            if (trackDate && trackDate > styleData[style].lastUpdated) {
                styleData[style].lastUpdated = trackDate;
            }

            // Definir imagem do estilo (primeira imagem encontrada)
            if (!styleData[style].imageUrl && track.imageUrl) {
                styleData[style].imageUrl = track.imageUrl;
            }
        });

        // Verificar quais estilos foram atualizados hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        Object.keys(styleData).forEach(styleName => {
            const styleDate = new Date(styleData[styleName].lastUpdated);
            styleDate.setHours(0, 0, 0, 0);
            styleData[styleName].hasUpdatesToday = styleDate.getTime() === today.getTime();
        });

        // Formatar resultado com todos os estilos
        const formattedStyles = allStyles
            .filter(style => style.style && style.style !== 'N/A')
            .map(style => {
                const data = styleData[style.style!];
                return {
                    name: style.style!,
                    trackCount: data.trackCount,
                    downloadCount: data.downloadCount,
                    lastUpdated: data.lastUpdated.toISOString(),
                    hasUpdatesToday: data.hasUpdatesToday,
                    imageUrl: data.imageUrl
                };
            })
            .sort((a, b) => {
                // Primeiro: estilos atualizados hoje
                if (a.hasUpdatesToday && !b.hasUpdatesToday) return -1;
                if (!a.hasUpdatesToday && b.hasUpdatesToday) return 1;

                // Segundo: ordenar por data de atualização (mais recentes primeiro)
                const dateA = new Date(a.lastUpdated);
                const dateB = new Date(b.lastUpdated);
                if (dateA > dateB) return -1;
                if (dateA < dateB) return 1;

                // Terceiro: ordenar por downloads (mais downloads primeiro)
                return b.downloadCount - a.downloadCount;
            });

        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${formattedStyles.length} estilos carregados`);
        }

        return NextResponse.json({
            success: true,
            styles: formattedStyles,
            total: formattedStyles.length
        });

    } catch (error) {
        console.error('❌ Erro ao carregar estilos:', error);
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
