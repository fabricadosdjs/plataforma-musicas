import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('📁 API Folders Most Downloaded: Carregando todas as pastas...');

        // Buscar todas as pastas disponíveis com contagem de tracks
        const allFolders = await prisma.track.groupBy({
            by: ['folder'],
            where: {
                AND: [
                    { folder: { not: null } },
                    { folder: { not: 'N/A' } }
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

        // Buscar tracks com suas pastas para calcular downloads por pasta e datas
        const tracksWithDetails = await prisma.track.findMany({
            where: {
                AND: [
                    { folder: { not: null } },
                    { folder: { not: 'N/A' } }
                ]
            },
            select: {
                id: true,
                folder: true,
                updatedAt: true,
                createdAt: true,
                imageUrl: true
            }
        });

        // Calcular downloads por pasta e datas
        const folderData: {
            [key: string]: {
                trackCount: number;
                downloadCount: number;
                lastUpdated: Date;
                hasUpdatesToday: boolean;
                imageUrl: string | null;
            }
        } = {};

        tracksWithDetails.forEach(track => {
            const folder = track.folder!;
            const downloadCount = downloadMap.get(track.id) || 0;

            if (!folderData[folder]) {
                folderData[folder] = {
                    trackCount: 0,
                    downloadCount: 0,
                    lastUpdated: track.updatedAt || track.createdAt || new Date(),
                    hasUpdatesToday: false,
                    imageUrl: null
                };
            }

            folderData[folder].trackCount++;
            folderData[folder].downloadCount += downloadCount;

            // Atualizar data mais recente se necessário
            const trackDate = track.updatedAt || track.createdAt;
            if (trackDate && trackDate > folderData[folder].lastUpdated) {
                folderData[folder].lastUpdated = trackDate;
            }

            // Definir imagem da pasta (primeira imagem encontrada)
            if (!folderData[folder].imageUrl && track.imageUrl) {
                folderData[folder].imageUrl = track.imageUrl;
            }
        });

        // Verificar quais pastas foram atualizadas hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        Object.keys(folderData).forEach(folderName => {
            const folderDate = new Date(folderData[folderName].lastUpdated);
            folderDate.setHours(0, 0, 0, 0);
            folderData[folderName].hasUpdatesToday = folderDate.getTime() === today.getTime();
        });

        // Formatar resultado com todas as pastas
        const formattedFolders = allFolders
            .filter(folder => folder.folder && folder.folder !== 'N/A')
            .map(folder => {
                const data = folderData[folder.folder!];
                return {
                    name: folder.folder!,
                    trackCount: data.trackCount,
                    downloadCount: data.downloadCount,
                    lastUpdated: data.lastUpdated.toISOString(),
                    hasUpdatesToday: data.hasUpdatesToday,
                    imageUrl: data.imageUrl
                };
            })
            .sort((a, b) => {
                // Primeiro: pastas atualizadas hoje
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

        console.log(`✅ ${formattedFolders.length} pastas carregadas com dados completos`);
        console.log('📊 Pastas encontradas:', formattedFolders.map(f => `${f.name}: ${f.downloadCount} downloads, atualizado: ${f.lastUpdated}`));

        return NextResponse.json({
            success: true,
            folders: formattedFolders,
            total: formattedFolders.length
        });

    } catch (error) {
        console.error('❌ Erro ao carregar pastas:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                folders: [],
                total: 0
            },
            { status: 500 }
        );
    }
}
