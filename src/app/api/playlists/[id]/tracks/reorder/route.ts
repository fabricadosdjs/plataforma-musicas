import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const playlistId = parseInt(id);

        if (isNaN(playlistId)) {
            return NextResponse.json(
                { success: false, error: 'ID da playlist inválido' },
                { status: 400 }
            );
        }

        const { trackOrders } = await request.json();

        if (!Array.isArray(trackOrders)) {
            return NextResponse.json(
                { success: false, error: 'trackOrders deve ser um array' },
                { status: 400 }
            );
        }

        // Verificar se a playlist existe
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!playlist) {
            return NextResponse.json(
                { success: false, error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Atualizar a ordem das músicas
        const updatePromises = trackOrders.map(({ trackId, order }: { trackId: number, order: number }) =>
            prisma.playlistTrack.updateMany({
                where: {
                    playlistId: playlistId,
                    trackId: trackId
                },
                data: {
                    order: order
                }
            })
        );

        await Promise.all(updatePromises);

        return NextResponse.json({
            success: true,
            message: 'Ordem das músicas atualizada com sucesso'
        });

    } catch (error) {
        console.error('Error reordering tracks:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}



