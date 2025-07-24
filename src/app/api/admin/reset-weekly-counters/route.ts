import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        // Resetar contadores semanais
        const updatedProfile = await prisma.profile.update({
            where: { id: userId },
            data: {
                weeklyPackRequests: 0,
                weeklyPlaylistDownloads: 0,
                lastWeekReset: new Date()
            }
        });

        console.log(`✅ Contadores semanais resetados para perfil ${userId}`);

        return NextResponse.json({
            success: true,
            message: 'Contadores semanais resetados com sucesso',
            profile: {
                id: updatedProfile.id,
                weeklyPackRequests: updatedProfile.weeklyPackRequests,
                weeklyPlaylistDownloads: updatedProfile.weeklyPlaylistDownloads,
                lastWeekReset: updatedProfile.lastWeekReset
            }
        });

    } catch (error) {
        console.error('❌ Erro ao resetar contadores semanais:', error);
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
