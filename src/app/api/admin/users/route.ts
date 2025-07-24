// src/app/api/admin/users/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// GET: Listar todos os usuários (apenas para admins)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // TODO: Implementar verificação de admin quando tivermos o campo
        // Por enquanto, qualquer usuário logado pode ver

        const users = await prisma.profile.findMany({
            select: {
                id: true,
                name: true,
                whatsapp: true,
                valor: true,
                vencimento: true,
                dataPagamento: true,
                status: true,
                deemix: true,
                is_vip: true,
                createdAt: true,
                updatedAt: true,
                dailyDownloadCount: true,
                lastDownloadReset: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Buscar contadores separadamente
        const usersWithCounts = await Promise.all(
            users.map(async (user) => {
                const [downloadsCount, likesCount] = await Promise.all([
                    prisma.download.count({ where: { userId: user.id } }),
                    prisma.like.count({ where: { userId: user.id } })
                ]);

                return {
                    ...user,
                    downloadsCount,
                    likesCount
                };
            })
        );

        return NextResponse.json({ users: usersWithCounts });
    } catch (error) {
        console.error("[USERS_GET_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}

// POST: Adicionar novo usuário
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // TODO: Implementar verificação de admin

        const { name, whatsapp, email, password, valor, vencimento, dataPagamento, status, deemix, is_vip } = await req.json();

        if (!name || !email) {
            return new NextResponse("Nome e email são obrigatórios", { status: 400 });
        }

        // Verificar se o email já existe
        // Não é possível buscar por email diretamente em Profile, pois o campo não existe
        // Se necessário, buscar por id ou implementar lógica diferente

        // Hash da senha se fornecida
        let hashedPassword = null;
        if (password && password.trim()) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const newProfile = await prisma.profile.create({
            data: {
                id: uuidv4(),
                name,
                whatsapp: whatsapp || null,
                valor: valor || null,
                vencimento: vencimento ? new Date(vencimento) : null,
                dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
                status: status || 'ativo',
                deemix: deemix !== undefined ? deemix : true,
                is_vip: is_vip !== undefined ? is_vip : true,
                dailyDownloadCount: 0,
                lastDownloadReset: null,
            },
            select: {
                id: true,
                name: true,
                is_vip: true,
            }
        });

        return NextResponse.json({
            message: "Usuário criado com sucesso",
            profile: newProfile
        });
    } catch (error) {
        console.error("[USERS_POST_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}

// PATCH: Atualizar usuário (VIP, nome, email, etc.)
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // TODO: Implementar verificação de admin

        const { userId, name, whatsapp, email, password, valor, vencimento, dataPagamento, status, deemix, is_vip, dailyDownloadCount } = await req.json();

        if (!userId) {
            return new NextResponse("UserId é obrigatório", { status: 400 });
        }

        // Preparar dados para atualização
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
        if (email !== undefined) updateData.email = email;
        if (password !== undefined && password.trim()) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        if (valor !== undefined) updateData.valor = valor;
        if (vencimento !== undefined) updateData.vencimento = vencimento ? new Date(vencimento) : null;
        if (dataPagamento !== undefined) updateData.dataPagamento = dataPagamento ? new Date(dataPagamento) : null;
        if (status !== undefined) updateData.status = status;
        if (typeof deemix === 'boolean') updateData.deemix = deemix;
        if (typeof is_vip === 'boolean') updateData.is_vip = is_vip;
        if (typeof dailyDownloadCount === 'number') updateData.dailyDownloadCount = dailyDownloadCount;

        const updatedProfile = await prisma.profile.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                is_vip: true,
            }
        });

        return NextResponse.json({
            message: `Usuário atualizado com sucesso`,
            profile: updatedProfile
        });
    } catch (error) {
        console.error("[USERS_PATCH_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}
