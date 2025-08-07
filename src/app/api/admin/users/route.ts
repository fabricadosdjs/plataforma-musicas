import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

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
        // Attempt to clean the string if it contains problematic prefixes like '+' for large years
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

// GET: Obter todos os usuários com performance otimizada
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // --- CORREÇÃO DE PERFORMANCE APLICADA ---
        // Busca todos os usuários e JÁ INCLUI a contagem de likes e downloads em uma única consulta
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        downloads: true, // Substitua 'downloads' pelo nome da sua relação no schema.prisma
                        likes: true,     // Substitua 'likes' pelo nome da sua relação no schema.prisma
                    },
                },
            },
        });

        // Definição dos benefícios dos planos
        const VIP_BENEFITS = {
            BASICO: { driveAccess: true, packRequestsLimit: 8, playlistDownloadsLimit: 7, deezerPremium: false },
            PADRAO: { driveAccess: true, packRequestsLimit: 15, playlistDownloadsLimit: 12, deezerPremium: true },
            COMPLETO: { driveAccess: true, packRequestsLimit: 999, playlistDownloadsLimit: 999, deezerPremium: true }
        };

        function getVipPlan(valor: number | null) {
            if (!valor) return null;
            if (valor >= 50) return 'COMPLETO';
            if (valor >= 42) return 'PADRAO';
            if (valor >= 35) return 'BASICO';
            return null;
        }

        // Mapeia os resultados que já vieram otimizados do banco de dados
        const usersWithBenefits = users.map(user => {
            const planKey = getVipPlan(user.valor);
            const benefits = planKey ? VIP_BENEFITS[planKey] : null;

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                whatsapp: user.whatsapp,
                valor: user.valor,
                vencimento: user.vencimento,
                dataPagamento: user.dataPagamento,
                status: user.status,
                is_vip: user.is_vip,
                deemix: user.deemix,
                deezerPremium: user.deezerPremium,
                deezerEmail: user.deezerEmail,
                deezerPassword: user.deezerPassword,
                dailyDownloadCount: user.dailyDownloadCount,
                weeklyPackRequests: user.weeklyPackRequests,
                weeklyPlaylistDownloads: user.weeklyPlaylistDownloads,
                lastDownloadReset: user.lastDownloadReset,
                lastWeekReset: user.lastWeekReset,
                // Acessa a contagem que já veio na consulta principal
                downloadsCount: user._count.downloads,
                likesCount: user._count.likes,
                plan: planKey,
                benefits: benefits ? {
                    driveAccess: benefits.driveAccess,
                    packRequestsLimit: benefits.packRequestsLimit,
                    packRequestsUsed: user.weeklyPackRequests || 0,
                    playlistDownloadsLimit: benefits.playlistDownloadsLimit,
                    playlistDownloadsUsed: user.weeklyPlaylistDownloads || 0,
                    deezerPremium: benefits.deezerPremium
                } : null
            };
        });

        return NextResponse.json({ users: usersWithBenefits });

    } catch (error) {
        console.error("[USERS_GET_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}

// DELETE: Excluir usuário pelo ID
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return new NextResponse(JSON.stringify({ error: 'UserId é obrigatório' }), { status: 400 });
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: 'Usuário excluído com sucesso' });

    } catch (error) {
        console.error("[USERS_DELETE_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}

/*
// --- ROTA INVÁLIDA COMENTADA ---
// Funções em arquivos 'route.ts' devem ter nomes de verbos HTTP (GET, POST, etc.).
// 'DELETE_BY_EMAIL' não é um verbo válido e esta rota não seria acessível.
// Se precisar desta funcionalidade, crie uma nova rota, por exemplo: /api/admin/users/by-email/route.ts

export async function DELETE_BY_EMAIL(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;
        if (!email) {
            return new NextResponse("Email é obrigatório", { status: 400 });
        }
        const deleted = await prisma.user.deleteMany({ where: { email } });
        if (deleted.count === 0) {
            return new NextResponse("Usuário não encontrado", { status: 404 });
        }
        return NextResponse.json({ message: "Usuário removido com sucesso" });
    } catch (error) {
        console.error("[USERS_DELETE_BY_EMAIL_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}
*/

// POST: Adicionar novo usuário
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, isAdmin, whatsapp, valor, vencimento, dataPagamento, status, deemix, deezerPremium, deezerEmail, deezerPassword, is_vip, isPro, dailyDownloadCount, lastDownloadReset, weeklyPackRequests, weeklyPlaylistDownloads, lastWeekReset, customBenefits } = body;

        if (!name || !email || !password) {
            return new NextResponse("Nome, email e senha são obrigatórios", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return new NextResponse("Email já cadastrado", { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isPro: isPro ?? !!isAdmin, // Assuming isPro is a boolean on User model
                is_vip: !!is_vip,
                whatsapp,
                valor: valor !== undefined ? valor : null,
                vencimento: parseDateInput(vencimento),
                dataPagamento: parseDateInput(dataPagamento),
                status,
                deemix: !!deemix,
                deezerPremium: !!deezerPremium,
                deezerEmail: deezerEmail || null,
                deezerPassword: deezerPassword || null,
                dailyDownloadCount: dailyDownloadCount ?? 0,
                lastDownloadReset: parseDateInput(lastDownloadReset),
                weeklyPackRequests: weeklyPackRequests ?? 0,
                weeklyPlaylistDownloads: weeklyPlaylistDownloads ?? 0,
                lastWeekReset: parseDateInput(lastWeekReset),
                customBenefits: customBenefits ?? {},
                updatedAt: new Date(),
            }
        });

        return NextResponse.json({
            message: isAdmin ? "Usuário admin criado com sucesso" : "Usuário criado com sucesso",
            user: newUser
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

        const body = await req.json();
        const { userId, ...updateData } = body;

        if (!userId) {
            return new NextResponse("UserId é obrigatório", { status: 400 });
        }

        if (updateData.password && updateData.password.trim()) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password; // Não atualiza a senha se estiver vazia
        }

        // Use the helper function for all date fields
        if (updateData.vencimento !== undefined) {
            updateData.vencimento = parseDateInput(updateData.vencimento);
        }
        if (updateData.dataPagamento !== undefined) {
            updateData.dataPagamento = parseDateInput(updateData.dataPagamento);
        }
        if (updateData.lastDownloadReset !== undefined) {
            updateData.lastDownloadReset = parseDateInput(updateData.lastDownloadReset);
        }
        if (updateData.lastWeekReset !== undefined) {
            updateData.lastWeekReset = parseDateInput(updateData.lastWeekReset);
        }

        // Se o valor está sendo atualizado diretamente, não precisa recalcular
        // Se Deemix ou Deezer Premium estão sendo alterados, precisa recalcular o valor
        if ((updateData.deemix !== undefined || updateData.deezerPremium !== undefined) && updateData.valor === undefined) {
            // Busca o usuário atual para pegar o valor existente
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { valor: true, deemix: true, deezerPremium: true }
            });

            if (currentUser && currentUser.valor) {
                // Recalcula o valor baseado nos novos add-ons
                const newDeemix = updateData.deemix !== undefined ? updateData.deemix : (currentUser.deemix || false);
                const newDeezerPremium = updateData.deezerPremium !== undefined ? updateData.deezerPremium : (currentUser.deezerPremium || false);

                updateData.valor = calculateNewValue(
                    currentUser.valor,
                    currentUser.deemix || false,
                    currentUser.deezerPremium || false,
                    newDeemix,
                    newDeezerPremium
                );
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return NextResponse.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error("[USERS_PATCH_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
}

// Tipos para os planos
type PlanType = 'BASICO' | 'PADRAO' | 'COMPLETO';

// Função auxiliar para recalcular o valor quando add-ons são alterados
function calculateNewValue(currentTotal: number, oldDeemix: boolean, oldDeezerPremium: boolean, newDeemix: boolean, newDeezerPremium: boolean): number {
    // Definições de preços dos planos e add-ons
    const VIP_PLANS: Record<PlanType, number> = {
        BASICO: 35,
        PADRAO: 42,
        COMPLETO: 50
    };

    const DEEMIX_PRICING: Record<PlanType, { value: number; discount: number }> = {
        BASICO: { value: 14.99, discount: 0.35 },
        PADRAO: { value: 14.99, discount: 0.42 },
        COMPLETO: { value: 14.99, discount: 0.60 }
    };

    const DEEZER_PREMIUM_PRICING = 9.75;

    // Primeiro, calcula o preço base removendo os add-ons antigos
    let basePrice = currentTotal;

    if (oldDeemix) {
        // Remove o preço do Deemix antigo
        const plan = getBasePlan(currentTotal);
        if (plan && DEEMIX_PRICING[plan]) {
            const deemixPrice = DEEMIX_PRICING[plan].value * (1 - DEEMIX_PRICING[plan].discount);
            basePrice -= deemixPrice;
        }
    }

    if (oldDeezerPremium) {
        // Remove o preço do Deezer Premium antigo (se não era gratuito)
        const plan = getBasePlan(currentTotal);
        if (plan === 'BASICO') {
            basePrice -= DEEZER_PREMIUM_PRICING;
        }
    }

    // Agora adiciona os novos add-ons
    let newTotal = basePrice;

    if (newDeemix) {
        const plan = getBasePlan(basePrice);
        if (plan && DEEMIX_PRICING[plan]) {
            const deemixPrice = DEEMIX_PRICING[plan].value * (1 - DEEMIX_PRICING[plan].discount);
            newTotal += deemixPrice;
        }
    }

    if (newDeezerPremium) {
        const plan = getBasePlan(basePrice);
        if (plan === 'BASICO') {
            newTotal += DEEZER_PREMIUM_PRICING;
        }
    }

    return Math.round(newTotal * 100) / 100; // Arredonda para 2 casas decimais
}

// Função auxiliar para determinar o plano base pelo valor
function getBasePlan(valor: number): PlanType | null {
    if (valor >= 50) return 'COMPLETO';
    if (valor >= 42) return 'PADRAO';
    if (valor >= 35) return 'BASICO';
    return null;
}