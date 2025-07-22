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

        // Com Supabase Auth, o usuário deve ser criado primeiro no Supabase
        // Este endpoint agora só cria o registro no nosso banco após autenticação

        const user = await prisma.user.create({
            data: {
                email,
                name,
                is_vip: false,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('REGISTRATION_ERROR', error);
        return new NextResponse('Erro interno', { status: 500 });
    }
}
