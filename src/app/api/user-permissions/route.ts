// src/app/api/user-permissions/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: Obter permissões atuais do usuário logado
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.profile.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                is_vip: true,
                deemix: true,
                status: true
            }
        });

        if (!user) {
            return new NextResponse("Usuário não encontrado", { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("[USER_PERMISSIONS_GET_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}
