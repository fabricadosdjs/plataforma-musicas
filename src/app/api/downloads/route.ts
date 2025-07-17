// src/app/api/downloads/route.ts
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return new NextResponse("Não autorizado", { status: 401 });
        }

        const { trackId } = await req.json();
        if (!trackId) {
            return new NextResponse("ID da música é obrigatório", { status: 400 });
        }

        // Simplesmente registra o download sem verificar duplicatas,
        // pois um usuário pode baixar a mesma música várias vezes.
        // A lógica de limite será controlada no frontend com base na contagem.
        await prisma.download.create({
            data: {
                userId,
                trackId,
            },
        });

        return NextResponse.json({ message: 'Download registrado' });
    } catch (error) {
        console.error("[DOWNLOADS_POST_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}
