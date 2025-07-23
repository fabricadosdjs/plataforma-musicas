import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Verificar se é admin (pode ajustar essa lógica conforme necessário)
        if (session.user.email !== 'admin@admin.com') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '7d';

        // Calcular período
        let dateFrom = new Date();
        switch (period) {
            case '24h':
                dateFrom.setHours(dateFrom.getHours() - 24);
                break;
            case '7d':
                dateFrom.setDate(dateFrom.getDate() - 7);
                break;
            case '30d':
                dateFrom.setDate(dateFrom.getDate() - 30);
                break;
            case '90d':
                dateFrom.setDate(dateFrom.getDate() - 90);
                break;
            default:
                dateFrom.setDate(dateFrom.getDate() - 7);
        }

        // Estatísticas gerais
        const totalPlays = await prisma.$queryRaw`
            SELECT COUNT(*) as count 
            FROM "public"."play" 
            WHERE "createdAt" >= ${dateFrom}
        `;

        const completedPlays = await prisma.$queryRaw`
            SELECT COUNT(*) as count 
            FROM "public"."play" 
            WHERE "createdAt" >= ${dateFrom} AND "completed" = true
        `;

        const uniqueUsers = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT "userId") as count 
            FROM "public"."play" 
            WHERE "createdAt" >= ${dateFrom}
        `;

        // Top músicas mais tocadas
        const topTracks = await prisma.$queryRaw`
            SELECT 
                t."songName", 
                t."artist", 
                COUNT(p.id) as play_count
            FROM "public"."play" p
            JOIN "public"."track" t ON p."trackId" = t.id
            WHERE p."createdAt" >= ${dateFrom}
            GROUP BY t.id, t."songName", t."artist"
            ORDER BY play_count DESC
            LIMIT 10
        `;

        // Reproduções por dia
        const dailyPlays = await prisma.$queryRaw`
            SELECT 
                DATE("createdAt") as date,
                COUNT(*) as plays
            FROM "public"."play"
            WHERE "createdAt" >= ${dateFrom}
            GROUP BY DATE("createdAt")
            ORDER BY date
        `;

        return NextResponse.json({
            success: true,
            period,
            stats: {
                totalPlays: Number((totalPlays as any)[0]?.count || 0),
                completedPlays: Number((completedPlays as any)[0]?.count || 0),
                uniqueUsers: Number((uniqueUsers as any)[0]?.count || 0),
                completionRate: Number((completedPlays as any)[0]?.count || 0) / Number((totalPlays as any)[0]?.count || 1) * 100
            },
            topTracks,
            dailyPlays
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas de reprodução:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}
