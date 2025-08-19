import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                error: 'Não autenticado'
            }, { status: 401 });
        }

        const { trackIds } = await request.json();

        if (!Array.isArray(trackIds) || trackIds.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'IDs de faixas inválidos'
            }, { status: 400 });
        }

        // Limpar downloads do banco de dados
        const deleteResult = await prisma.download.deleteMany({
            where: {
                userId: session.user.id,
                trackId: {
                    in: trackIds.map(id => parseInt(id))
                }
            }
        });

        console.log(`🗑️ Histórico limpo para usuário ${session.user.id}: ${deleteResult.count} downloads removidos`);

        return NextResponse.json({
            success: true,
            message: `Histórico de ${deleteResult.count} downloads limpo com sucesso`,
            deletedCount: deleteResult.count
        });

    } catch (error) {
        console.error('❌ Erro ao limpar histórico de downloads:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}
