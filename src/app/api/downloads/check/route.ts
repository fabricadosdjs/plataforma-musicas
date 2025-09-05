import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const { trackIds } = await request.json();

        if (!trackIds || !Array.isArray(trackIds)) {
            return NextResponse.json(
                { error: 'Lista de IDs de tracks é obrigatória' },
                { status: 400 }
            );
        }

        // Buscar downloads do usuário para as tracks especificadas
        const downloads = await prisma.download.findMany({
            where: {
                userId: (session.user as any).id,
                trackId: {
                    in: trackIds.map(id => parseInt(id))
                }
            },
            select: {
                trackId: true,
                downloadedAt: true
            }
        });

        // Criar mapa de downloads
        const downloadMap: { [key: number]: boolean } = {};
        downloads.forEach(download => {
            downloadMap[download.trackId] = true;
        });

        return NextResponse.json({
            success: true,
            downloads: downloadMap
        });

    } catch (error) {
        console.error('Erro ao verificar downloads:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
