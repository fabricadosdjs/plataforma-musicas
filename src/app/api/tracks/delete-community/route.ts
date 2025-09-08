import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
    try {
        console.log('🗑️ API Delete Community: Iniciando...');

        // Verificar se o usuário está autenticado
        const session = await getServerSession(authOptions);
        console.log('👤 Sessão do usuário:', session?.user?.email ? 'Autenticado' : 'Não autenticado');

        if (!session?.user?.email) {
            console.log('❌ Usuário não autenticado');
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        console.log('📝 Fazendo parse do body...');
        const body = await request.json();
        console.log('📦 Body recebido:', body);

        const { trackId } = body;

        if (!trackId) {
            console.log('❌ TrackId não fornecido');
            return NextResponse.json(
                { success: false, error: 'ID da música é obrigatório' },
                { status: 400 }
            );
        }

        // Converter para número se necessário
        const trackIdNum = Number(trackId);
        console.log(`🆔 TrackId original: ${trackId} (tipo: ${typeof trackId})`);
        console.log(`🆔 TrackId convertido: ${trackIdNum}`);

        if (isNaN(trackIdNum)) {
            console.log('❌ TrackId inválido');
            return NextResponse.json(
                { success: false, error: 'ID da música inválido' },
                { status: 400 }
            );
        }

        console.log(`🔍 Buscando música com ID: ${trackIdNum}`);

        // Verificar se a música pertence ao usuário
        const track = await prisma.track.findFirst({
            where: {
                id: trackIdNum,
                uploadedBy: session.user.email,
                isCommunity: true
            }
        });

        console.log('📊 Resultado da busca:', track ? `Música encontrada: ${track.songName}` : 'Música não encontrada');

        if (!track) {
            console.log('❌ Música não encontrada ou não pertence ao usuário');
            return NextResponse.json(
                { success: false, error: 'Música não encontrada ou não pertence ao usuário' },
                { status: 404 }
            );
        }

        console.log(`🗑️ Deletando música "${track.songName}" (ID: ${trackIdNum}) do usuário ${session.user.email}`);

        // Deletar downloads, likes e plays relacionados
        console.log('🗑️ Deletando downloads relacionados...');
        const deletedDownloads = await prisma.download.deleteMany({
            where: { trackId: trackIdNum }
        });
        console.log(`📊 Downloads deletados: ${deletedDownloads.count}`);

        console.log('🗑️ Deletando likes relacionados...');
        const deletedLikes = await prisma.like.deleteMany({
            where: { trackId: trackIdNum }
        });
        console.log(`📊 Likes deletados: ${deletedLikes.count}`);

        console.log('🗑️ Deletando plays relacionados...');
        const deletedPlays = await prisma.play.deleteMany({
            where: { trackId: trackIdNum }
        });
        console.log(`📊 Plays deletados: ${deletedPlays.count}`);

        // Deletar a música
        console.log('🗑️ Deletando música principal...');
        await prisma.track.delete({
            where: { id: trackIdNum }
        });

        console.log(`✅ Música "${track.songName}" deletada com sucesso`);

        return NextResponse.json({
            success: true,
            message: 'Música deletada com sucesso',
            deletedTrack: {
                id: track.id,
                songName: track.songName,
                artist: track.artist
            }
        });

    } catch (error) {
        console.error('❌ Erro ao deletar música:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
