import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        if (!session.user.is_vip) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { trackId, imageUrl } = await request.json();

        if (!trackId || !imageUrl) {
            return NextResponse.json({ error: 'trackId e imageUrl são obrigatórios' }, { status: 400 });
        }

        // Atualizar thumbnail no banco de dados
        const updatedTrack = await prisma.track.update({
            where: { id: trackId },
            data: { imageUrl }
        });

        console.log(`🎵 Thumbnail da música ${trackId} atualizada para: ${imageUrl}`);

        return NextResponse.json({
            success: true,
            message: 'Thumbnail atualizada com sucesso',
            trackId,
            imageUrl,
            track: updatedTrack
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar thumbnail:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        if (!session.user.is_vip) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { trackIds, imageUrl } = await request.json();

        if (!trackIds || !Array.isArray(trackIds) || !imageUrl) {
            return NextResponse.json({ error: 'trackIds (array) e imageUrl são obrigatórios' }, { status: 400 });
        }

        // Atualizar múltiplas músicas em lote
        console.log(`🎵 Atualizando thumbnails de ${trackIds.length} músicas para: ${imageUrl}`);

        const updatePromises = trackIds.map(trackId =>
            prisma.track.update({
                where: { id: trackId },
                data: { imageUrl }
            })
        );

        const updatedTracks = await Promise.all(updatePromises);

        console.log(`✅ ${updatedTracks.length} thumbnails atualizadas com sucesso`);

        return NextResponse.json({
            success: true,
            message: `${trackIds.length} thumbnails atualizadas com sucesso`,
            results: updatedTracks.map(track => ({
                trackId: track.id,
                imageUrl: track.imageUrl,
                status: 'updated'
            }))
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar thumbnails em lote:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
