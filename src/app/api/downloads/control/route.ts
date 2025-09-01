// src/app/api/downloads/control/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to parse dates, considering potential custom object format and problematic year prefixes
function parseDateInput(dateInput: any): Date | null {
    if (!dateInput) return null;

    let dateString: string | null = null;

    // Handle the specific BSON/EJSON-like date object format
    if (typeof dateInput === 'object' && dateInput.$type === 'DateTime' && typeof dateInput.value === 'string') {
        dateString = dateInput.value;
    }
    // Handle standard string
    else if (typeof dateInput === 'string') {
        dateString = dateInput;
    }
    // Handle Date object directly
    else if (dateInput instanceof Date) {
        // Ensure it's a valid date object before returning
        return isNaN(dateInput.getTime()) ? null : dateInput;
    }

    if (dateString) {
        // Attempt to clean the string if it contains problematic prefixes like '+'
        // This is a speculative fix for "+272025-08-21T03:00:00.000Z"
        // It tries to remove the leading '+' if it seems to be part of an invalid large year format.
        if (dateString.startsWith('+') && dateString.length > 5 && !isNaN(parseInt(dateString.substring(1, 5)))) {
            dateString = dateString.substring(1);
        }

        const parsedDate = new Date(dateString);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    return null;
}


export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const trackId = searchParams.get('trackId');

        if (!trackId || isNaN(parseInt(trackId))) {
            return NextResponse.json({ error: 'trackId inválido' }, { status: 400 });
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

        // Verificar se o userId é válido (UUID ou CUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const cuidRegex = /^[a-z0-9]{25}$/i; // CUID format: 25 caracteres alfanuméricos

        if (!uuidRegex.test(session.user.id) && !cuidRegex.test(session.user.id)) {
            console.error('ID de usuário inválido detectado:', session.user.id);
            return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 });
        }

        // Buscar download diretamente sem verificar se track existe (otimização)
        // Incluindo nextAllowedDownload no select para a lógica de canDownload
        const download = await prisma.download.findFirst({
            where: {
                userId: session.user.id,
                trackId: parseInt(trackId)
            },
            orderBy: {
                downloadedAt: 'desc'
            },
            select: {
                id: true,
                trackId: true,
                userId: true,
                downloadedAt: true,
                createdAt: true,
            }
        });

        const canDownload = !download || true; // Sempre permitir download se não houver restrições

        return NextResponse.json({
            canDownload,
            hasDownloaded: !!download,
            nextAllowedDownload: null
        });

    } catch (error) {
        console.error('Erro ao verificar controle de download:', error);

        // Retornar resposta padrão em caso de erro para não quebrar a interface
        return NextResponse.json({
            canDownload: true,
            hasDownloaded: false,
            nextAllowedDownload: null,
            error: 'Erro interno - usando valores padrão'
        }, { status: 200 }); // Status 200 para não quebrar o carregamento
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

        // Buscar dados do usuário
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verificar se é VIP ou admin
        const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
        if (!user.is_vip && !isAdmin) {
            return NextResponse.json({ error: 'Apenas usuários VIP podem baixar músicas.' }, { status: 403 });
        }

        // Para usuários VIP, não há limite de downloads
        const isVipUser = user.is_vip || isAdmin;

        // Resetar contador diário se passou 24h (mantido para estatísticas)
        const now = new Date();
        let dailyCount = user.dailyDownloadCount || 0;
        let lastReset = user.lastDownloadReset ? new Date(user.lastDownloadReset) : null;
        if (!lastReset || now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
            await prisma.user.update({
                where: { id: user.id },
                data: { dailyDownloadCount: 0, lastDownloadReset: now }
            });
            dailyCount = 0;
            lastReset = now;
        }

        // Verificar limite diário APENAS para usuários não-VIP
        if (!isVipUser) {
            const maxDailyDownloads = (user as any).benefits?.downloadsPerDay || 50;
            if (dailyCount >= maxDailyDownloads) {
                const resetTime = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
                return NextResponse.json({
                    error: `Limite diário de ${maxDailyDownloads} downloads atingido. Tente novamente após ${resetTime.toLocaleString('pt-BR')}.`,
                    dailyDownloadCount: dailyCount,
                    lastDownloadReset: lastReset.toISOString(),
                    needsConfirmation: false
                }, { status: 429 });
            }
        }

        // Verificar se já existe um download recente
        const existingDownload = await prisma.download.findFirst({
            where: {
                userId: user.id,
                trackId: parseInt(trackId)
            },
            orderBy: { downloadedAt: 'desc' },
            select: {
                id: true,
                trackId: true,
                userId: true,
                downloadedAt: true,
                createdAt: true,
            }
        });
        const canDownload = true; // Sempre permitir download
        const downloadedAt = now;

        const download = await prisma.download.upsert({
            where: {
                userId_trackId: {
                    userId: user.id,
                    trackId: parseInt(trackId)
                }
            },
            update: {
                downloadedAt: downloadedAt
            },
            create: {
                userId: user.id,
                trackId: parseInt(trackId),
                downloadedAt: downloadedAt
            }
        });

        // Incrementar contador apenas para usuários não-VIP
        if (!isVipUser) {
            await prisma.user.update({
                where: { id: user.id },
                data: { dailyDownloadCount: dailyCount + 1 }
            });
        }

        return NextResponse.json({
            success: true,
            download,
            dailyDownloadCount: isVipUser ? dailyCount : dailyCount + 1,
            isVipUser: isVipUser
        });
    } catch (error) {
        console.error('Erro ao registrar download:', error);
        return NextResponse.json({ error: 'Erro interno ao registrar download' }, { status: 500 });
    }
}