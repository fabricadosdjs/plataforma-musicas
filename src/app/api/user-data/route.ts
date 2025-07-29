// src/app/api/user-data/route.ts
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

        // Verificar se é um usuário admin especial
        const isAdmin = session.user.id === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess;

        if (isAdmin) {
            return NextResponse.json({
                user: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
                    isAdmin: true,
                    benefits: (session.user as any).benefits || { adminAccess: true }
                }
            });
        }

        // Verificar se o userId é válido (UUID ou CUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const cuidRegex = /^[a-z0-9]{25}$/i;

        if (!uuidRegex.test(session.user.id) && !cuidRegex.test(session.user.id)) {
            console.error('ID de usuário inválido detectado:', session.user.id);
            return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 });
        }


        // Buscar dados completos do usuário (incluindo whatsapp)
        const userDb = await prisma.user.findUnique({
            where: { email: session.user.email || undefined },
            select: {
                id: true,
                name: true,
                email: true,
                whatsapp: true,
                createdAt: true,
            }
        });

        // Buscar downloads do usuário
        const userDownloads = await prisma.download.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                trackId: true
            }
        });

        const downloadedTrackIds = userDownloads.map(download => download.trackId);

        return NextResponse.json({
            user: {
                id: userDb?.id || session.user.id,
                name: userDb?.name || session.user.name,
                email: userDb?.email || session.user.email,
                whatsapp: userDb?.whatsapp || null,
                createdAt: userDb?.createdAt || null,
                isAdmin: false,
                benefits: (session.user as any).benefits || {}
            },
            downloadedTrackIds: downloadedTrackIds
        });

    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();

        // Verificar se é um usuário admin especial
        const isAdmin = session.user.id === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess;

        if (!isAdmin) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        // Aqui você pode implementar atualizações de dados do usuário se necessário
        // Por exemplo, atualizar preferências, configurações, etc.

        return NextResponse.json({
            message: 'Dados atualizados com sucesso',
            user: session.user
        });

    } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}