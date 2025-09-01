import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { getVipPlan, getPlanInfo } from '@/lib/plans-config';

export async function getProfileData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    // Busca usuário e dados relacionados diretamente do modelo User
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            downloads: true,
            likes: true,
            plays: true,
        },
    });
    if (!user) return null;

    // ========== 🏆 DETECÇÃO DO PLANO DO USUÁRIO ==========
    const planInfo = getPlanInfo(user.valor);

    // Contagem de downloads, likes, plays
    const downloadsCount = user.downloads?.length || 0;
    const likesCount = user.likes?.length || 0;
    const playsCount = user.plays?.length || 0;

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        whatsapp: user.whatsapp,
        valor: user.valor?.toString() || '0',
        vencimento: user.vencimento?.toISOString() || null,
        status: user.status,
        is_vip: user.is_vip,
        deemix: user.deemix,
        deezerPremium: user.deezerPremium,
        isUploader: user.isUploader,
        dailyDownloadCount: user.dailyDownloadCount || 0,
        weeklyPackRequests: user.weeklyPackRequests || 0,
        weeklyPlaylistDownloads: user.weeklyPlaylistDownloads || 0,
        downloadsCount,
        likesCount,
        playsCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        // ========== 🎯 DADOS DO PLANO ==========
        plan: planInfo.id as 'BASICO' | 'PADRAO' | 'COMPLETO' | null,
        planIcon: planInfo.icon,
        planName: planInfo.name,

        benefits: (typeof session.user === 'object' && session.user && 'benefits' in session.user ? (session.user as { benefits?: Record<string, unknown> }).benefits : undefined) || {},
    };
}
