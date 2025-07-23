// src/app/api/downloads/control/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const trackId = searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        // Verificar se é um usuário admin especial (não precisa de controle de download)
        if (session.user.id === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess) {
            return NextResponse.json({
                canDownload: true,
                hasDownloaded: false,
                nextAllowedDownload: null,
                isAdmin: true
            });
        }

        // Verificar se o userId é um UUID válido antes de fazer a consulta
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(session.user.id)) {
            console.error('UUID inválido detectado:', session.user.id);
            return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 });
        }

        const download = await prisma.download.findFirst({
            where: {
                userId: session.user.id,
                trackId: parseInt(trackId)
            },
            orderBy: {
                downloadedAt: 'desc'
            }
        });

        const canDownload = !download ||
            !download.nextAllowedDownload ||
            new Date() >= download.nextAllowedDownload;

        return NextResponse.json({
            canDownload,
            hasDownloaded: !!download,
            nextAllowedDownload: download?.nextAllowedDownload
        });

    } catch (error) {
        console.error('Erro ao verificar controle de download:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { trackId, confirm } = await request.json();

        if (!trackId) {
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        // Verificar se já existe um download recente
        const existingDownload = await prisma.download.findFirst({
            where: {
                userId: session.user.id,
                trackId: parseInt(trackId)
            },
            orderBy: {
                downloadedAt: 'desc'
            }
        });

        const now = new Date();
        const canDownload = !existingDownload ||
            !existingDownload.nextAllowedDownload ||
            now >= existingDownload.nextAllowedDownload;

        // Se não pode baixar e não confirmou, retornar erro
        if (!canDownload && !confirm) {
            return NextResponse.json({
                error: 'Você precisa aguardar 24 horas para baixar novamente',
                needsConfirmation: true,
                nextAllowedDownload: existingDownload?.nextAllowedDownload
            }, { status: 403 });
        }

        // Se confirmou ou pode baixar, registrar o download
        const nextAllowedDownload = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

        const download = await prisma.download.upsert({
            where: {
                userId_trackId: {
                    userId: session.user.id,
                    trackId: parseInt(trackId)
                }
            },
            update: {
                downloadedAt: now,
                nextAllowedDownload: nextAllowedDownload
            },
            create: {
                userId: session.user.id,
                trackId: parseInt(trackId),
                downloadedAt: now,
                nextAllowedDownload: nextAllowedDownload
            }
        });

        return NextResponse.json({
            success: true,
            download,
            canDownloadAgainAt: nextAllowedDownload
        });

    } catch (error) {
        console.error('Erro ao registrar download:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
