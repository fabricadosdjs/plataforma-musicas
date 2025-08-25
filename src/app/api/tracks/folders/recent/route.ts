import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        console.log('📁 API: Buscando folders recentes...');

        // Primeiro, vamos ver quantas tracks com folders existem
        const totalTracksWithFolders = await prisma.track.count({
            where: {
                folder: {
                    not: null
                }
            }
        });

        console.log(`📁 API: Total de tracks com folders: ${totalTracksWithFolders}`);

        if (totalTracksWithFolders === 0) {
            console.log('📁 API: Nenhuma track com folder encontrada');
            return NextResponse.json({
                success: true,
                folders: [],
                total: 0
            });
        }

        // Buscar todas as tracks com folders, ordenadas por data de atualização
        const tracksWithFolders = await prisma.track.findMany({
            where: {
                folder: {
                    not: null
                }
            },
            select: {
                folder: true,
                imageUrl: true,
                updatedAt: true,
                createdAt: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
            // Remover take para pegar todas
        });

        console.log(`📁 API: Encontradas ${tracksWithFolders.length} tracks com folders`);

        // Agrupar por folder e pegar as informações mais recentes
        const folderMap = new Map<string, {
            name: string;
            trackCount: number;
            imageUrl: string;
            lastUpdated: string;
            downloadCount: number;
        }>();

        tracksWithFolders.forEach(track => {
            if (!track.folder) return;

            if (!folderMap.has(track.folder)) {
                folderMap.set(track.folder, {
                    name: track.folder,
                    trackCount: 0,
                    imageUrl: track.imageUrl || '/images/default-folder.jpg',
                    lastUpdated: track.updatedAt?.toISOString() || track.createdAt?.toISOString() || new Date().toISOString(),
                    downloadCount: 0
                });
            }

            const folderInfo = folderMap.get(track.folder)!;
            folderInfo.trackCount++;

            // Atualizar a data mais recente
            const trackDate = track.updatedAt || track.createdAt;
            if (trackDate && new Date(trackDate) > new Date(folderInfo.lastUpdated)) {
                folderInfo.lastUpdated = trackDate.toISOString();
            }

            // Atualizar a imagem se não tiver uma
            if (!folderInfo.imageUrl || folderInfo.imageUrl === '/images/default-folder.jpg') {
                folderInfo.imageUrl = track.imageUrl || '/images/default-folder.jpg';
            }
        });

        // Converter para array e ordenar por data mais recente
        const folders = Array.from(folderMap.values())
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
            .slice(0, 7); // Pegar os 7 mais recentes

        console.log(`📁 API: Retornando ${folders.length} folders válidos`);

        // Log dos folders encontrados para debug
        folders.forEach((folder, index) => {
            console.log(`📁 Folder ${index + 1}: ${folder.name} - ${folder.trackCount} tracks - ${folder.lastUpdated}`);
        });

        return NextResponse.json({
            success: true,
            folders: folders,
            total: folders.length
        });

    } catch (error) {
        console.error('❌ API: Erro ao buscar folders recentes:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                message: 'Não foi possível buscar os folders recentes'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
