// src/app/api/register/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return new NextResponse('Email e senha são obrigatórios', { status: 400 });
        }

        // Criação de usuário no banco de dados usando NextAuth
        // Este endpoint cria o registro no banco após autenticação

        const user = await prisma.user.create({
            data: {
                id: crypto.randomUUID(),
                email,
                password,
                name,
                is_vip: false,
                status: 'ativo',
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('REGISTRATION_ERROR', error);
        return new NextResponse('Erro interno', { status: 500 });
    }
}
