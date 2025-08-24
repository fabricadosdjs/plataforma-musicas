import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Buscar dados atualizados do usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                is_vip: true,
                status: true,
                valor: true,
                vencimento: true,
                dataPagamento: true,
                whatsapp: true,
                deemix: true,
                deezerPremium: true,
                deezerEmail: true,
                deezerPassword: true,
                isPro: true,
                isAdmin: true,
                isUploader: true,
                dailyDownloadCount: true,
                lastDownloadReset: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true,
                weeklyPackRequestsUsed: true,
                weeklyPlaylistDownloadsUsed: true,
                lastWeekReset: true,
                customBenefits: true,
                dataPrimeiroPagamento: true,
                planName: true,
                planType: true,
                period: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Debug: Log dos dados retornados
        console.log('🔍 PROFILE USER API - DADOS RETORNADOS:', {
            id: user.id,
            email: user.email,
            planName: user.planName,
            planType: user.planType,
            period: user.period,
            deemix: user.deemix,
            deezerPremium: user.deezerPremium,
            isUploader: user.isUploader,
            valor: user.valor
        });

        // Debug: Log da query executada
        console.log('🔍 PROFILE USER API - QUERY EXECUTADA:', {
            where: { email: session.user.email },
            select: {
                planName: true,
                planType: true,
                period: true,
                deemix: true,
                deezerPremium: true,
                isUploader: true,
                valor: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('[PROFILE_USER_ERROR]', error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}
