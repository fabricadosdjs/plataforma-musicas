// Endpoint temporário para testar autenticação manualmente
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }
        if (!user.password) {
            return NextResponse.json({ error: 'Usuário sem senha cadastrada' }, { status: 500 });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
        }
        if (user.status !== 'ativo') {
            return NextResponse.json({ error: 'Usuário inativo' }, { status: 403 });
        }
        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            is_vip: user.is_vip,
            valor: user.valor,
            status: user.status
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
