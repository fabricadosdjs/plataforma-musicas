import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { VIP_PLANS_CONFIG, getVipPlan, PlanType } from '@/lib/plans-config';

// Session type is already extended in src/types/next-auth.d.ts

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
            select: {
                id: true,
                name: true,
                email: true,
                whatsapp: true,
                valor: true,
                vencimento: true,
                dataPagamento: true,
                dataPrimeiroPagamento: true,
                status: true,
                is_vip: true,
                deemix: true,
                deezerPremium: true,
                deezerEmail: true,
                deezerPassword: true,
                planName: true,
                isUploader: true,
                dailyDownloadCount: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true,
                lastDownloadReset: true,
                lastWeekReset: true,
                _count: {
                    select: {
                        downloads: true,
                        likes: true,
                    }
                }
            }
        });

        // ========== DEFINIÇÃO DOS BENEFÍCIOS DOS PLANOS ==========
        const VIP_BENEFITS = {
            // ========== 🥉 PLANO VIP BÁSICO ==========
            BASICO: {
                icon: VIP_PLANS_CONFIG.BASICO.icon,
                name: VIP_PLANS_CONFIG.BASICO.name,
                driveAccess: VIP_PLANS_CONFIG.BASICO.benefits.driveAccess,
                packRequestsLimit: VIP_PLANS_CONFIG.BASICO.limits.weeklyPackRequests,
                playlistDownloadsLimit: VIP_PLANS_CONFIG.BASICO.limits.weeklyPlaylistDownloads,
                deezerPremium: VIP_PLANS_CONFIG.BASICO.benefits.deezerPremium
            },

            // ========== 🥈 PLANO VIP PADRÃO ==========
            PADRAO: {
                icon: VIP_PLANS_CONFIG.PADRAO.icon,
                name: VIP_PLANS_CONFIG.PADRAO.name,
                driveAccess: VIP_PLANS_CONFIG.PADRAO.benefits.driveAccess,
                packRequestsLimit: VIP_PLANS_CONFIG.PADRAO.limits.weeklyPackRequests,
                playlistDownloadsLimit: VIP_PLANS_CONFIG.PADRAO.limits.weeklyPlaylistDownloads,
                deezerPremium: VIP_PLANS_CONFIG.PADRAO.benefits.deezerPremium
            },

            // ========== 🥇 PLANO VIP COMPLETO ==========
            COMPLETO: {
                icon: VIP_PLANS_CONFIG.COMPLETO.icon,
                name: VIP_PLANS_CONFIG.COMPLETO.name,
                driveAccess: VIP_PLANS_CONFIG.COMPLETO.benefits.driveAccess,
                packRequestsLimit: VIP_PLANS_CONFIG.COMPLETO.limits.weeklyPackRequests,
                playlistDownloadsLimit: VIP_PLANS_CONFIG.COMPLETO.limits.weeklyPlaylistDownloads,
                deezerPremium: VIP_PLANS_CONFIG.COMPLETO.benefits.deezerPremium
            }
        };

        // ========== FUNÇÃO PARA DETECTAR PLANO VIP DO USUÁRIO ==========
        // Usar função centralizada da configuração de planos

        // ========== MAPEAMENTO DOS USUÁRIOS COM BENEFÍCIOS ==========

        const usersWithBenefits = users.map((user: any) => {
            const planKey = getVipPlan(user.valor);
            const benefits = planKey ? VIP_BENEFITS[planKey] : null;
            const planName = user.planName && user.planName.trim() !== '' ? user.planName : (benefits?.name || 'Sem Plano');
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                whatsapp: user.whatsapp,
                valor: user.valor,
                vencimento: user.vencimento,
                dataPagamento: user.dataPagamento,
                dataPrimeiroPagamento: user.dataPrimeiroPagamento,
                status: user.status,
                is_vip: user.is_vip,
                plan: planKey,
                planIcon: benefits?.icon || '📦',
                planName,
                planType: user.planType,
                deemix: user.deemix,
                deezerPremium: user.deezerPremium,
                deezerEmail: user.deezerEmail,
                deezerPassword: user.deezerPassword,
                isUploader: user.isUploader,
                dailyDownloadCount: user.dailyDownloadCount,
                weeklyPackRequests: user.weeklyPackRequests,
                weeklyPlaylistDownloads: user.weeklyPlaylistDownloads,
                lastDownloadReset: user.lastDownloadReset,
                lastWeekReset: user.lastWeekReset,
                downloadsCount: user._count?.downloads ?? 0,
                likesCount: user._count?.likes ?? 0,
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

// ========== 👤 POST: ADICIONAR NOVO USUÁRIO ==========
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, isAdmin, whatsapp, valor, vencimento, dataPagamento, dataPrimeiroPagamento, planName, status, deemix, deezerPremium, deezerEmail, deezerPassword, is_vip, isPro, dailyDownloadCount, lastDownloadReset, weeklyPackRequests, weeklyPlaylistDownloads, lastWeekReset, customBenefits, isUploader } = body;

        // ========== ✅ VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS ==========
        if (!name || !email || !password) {
            return new NextResponse("Nome, email e senha são obrigatórios", { status: 400 });
        }

        // ========== 🔍 VERIFICAÇÃO DE EMAIL EXISTENTE ==========
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return new NextResponse("Email já cadastrado", { status: 409 });
        }

        // ========== 🔐 CRIPTOGRAFIA DA SENHA ==========
        const hashedPassword = await bcrypt.hash(password, 10);

        // ========== 💾 CRIAÇÃO DO NOVO USUÁRIO ==========
        const newUser = await prisma.user.create({
            data: {
                // ========== 📋 DADOS BÁSICOS ==========
                name,
                email,
                password: hashedPassword,
                whatsapp,

                // ========== 🏆 STATUS E PERMISSÕES ==========
                isPro: isPro ?? !!isAdmin,
                is_vip: !!is_vip,
                status,

                // ========== 💰 INFORMAÇÕES FINANCEIRAS ==========
                valor: valor !== undefined ? valor : null,
                vencimento: parseDateInput(vencimento),
                dataPagamento: parseDateInput(dataPagamento),
                dataPrimeiroPagamento: parseDateInput(dataPrimeiroPagamento),

                // ========== 🎵 ADD-ONS E SERVIÇOS ==========
                deemix: !!deemix,
                deezerPremium: !!deezerPremium,
                deezerEmail: deezerEmail || null,
                deezerPassword: deezerPassword || null,
                isUploader: !!isUploader,

                // ========== 📊 CONFIGURAÇÕES DE USO ==========
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

// ========== ✏️ PATCH: ATUALIZAR USUÁRIO ==========
export async function PATCH(req: Request) {
    try {
        // ========== 🔐 VERIFICAÇÃO DE AUTENTICAÇÃO ==========
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // ========== 📥 OBTENÇÃO DOS DADOS DE ATUALIZAÇÃO ==========
        const body = await req.json();
        const { userId, ...updateData } = body;

        // ========== ✅ VALIDAÇÃO DO USER ID ==========
        if (!userId) {
            return new NextResponse("UserId é obrigatório", { status: 400 });
        }


        // ========== 🔐 PROCESSAMENTO DA SENHA ==========
        if (updateData.password && updateData.password.trim()) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password; // Não atualiza a senha se estiver vazia
        }

        // ========== PERMITIR SALVAR planName ==========
        // planName agora é persistido no banco, não remover

        // ========== 📅 PROCESSAMENTO DE DATAS ==========
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

        // ========== 💰 RECÁLCULO AUTOMÁTICO DE VALORES ==========
        // Se Deemix, Deezer Premium ou Uploader estão sendo alterados, precisa recalcular o valor
        if ((updateData.deemix !== undefined || updateData.deezerPremium !== undefined || updateData.isUploader !== undefined) && updateData.valor === undefined) {
            // Busca o usuário atual para pegar o valor existente
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { valor: true, deemix: true, deezerPremium: true, isUploader: true }
            });

            if (currentUser && currentUser.valor) {
                // Recalcula o valor baseado nos novos add-ons
                const newDeemix = updateData.deemix !== undefined ? updateData.deemix : (currentUser.deemix || false);
                const newDeezerPremium = updateData.deezerPremium !== undefined ? updateData.deezerPremium : (currentUser.deezerPremium || false);
                const newUploader = updateData.isUploader !== undefined ? updateData.isUploader : (currentUser.isUploader || false);

                updateData.valor = calculateNewValue(
                    currentUser.valor,
                    currentUser.deemix || false,
                    currentUser.deezerPremium || false,
                    newDeemix,
                    newDeezerPremium,
                    newUploader
                );
            }
        }

        // ========== 📤 PERSISTÊNCIA DO STATUS UPLOADER ==========
        if (updateData.isUploader !== undefined) {
            updateData.isUploader = !!updateData.isUploader;
        }

        // ========== 💾 ATUALIZAÇÃO NO BANCO DE DADOS ==========
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

// ========== 🔧 FUNÇÃO AUXILIAR PARA RECALCULAR VALORES ==========
function calculateNewValue(currentTotal: number, oldDeemix: boolean, oldDeezerPremium: boolean, newDeemix: boolean, newDeezerPremium: boolean, newUploader?: boolean): number {
    // ========== DEFINIÇÕES DE PREÇOS DOS PLANOS E ADD-ONS ==========
    const VIP_PLANS: Record<PlanType, number> = {
        BASICO: VIP_PLANS_CONFIG.BASICO.value,     // 🥉 VIP BÁSICO
        PADRAO: VIP_PLANS_CONFIG.PADRAO.value,     // 🥈 VIP PADRÃO
        COMPLETO: VIP_PLANS_CONFIG.COMPLETO.value  // 🥇 VIP COMPLETO
    };

    // ========== IMPORTANTE: DEEMIX E DEEZER PREMIUM NÃO ALTERAM PREÇO ==========
    // Eles apenas definem se o usuário tem acesso às credenciais/funcionalidades
    // O preço é definido pelo plano escolhido no dropdown

    // ========== UPLOADER PRICING ==========
    const UPLOADER_MONTHLY = 10; // 📤 Uploader R$ 10,00/mês

    // Começar com o valor atual sem modificações de add-ons antigos
    let basePrice = currentTotal;

    // Remover valor do uploader antigo se existia
    // (assumindo que se valor > plano base, tinha uploader)
    const possibleBasePrices = [35, 38, 42, 60]; // Valores base possíveis
    for (const possible of possibleBasePrices) {
        if (Math.abs(currentTotal - possible - UPLOADER_MONTHLY) < 0.01) {
            basePrice = possible; // Era esse plano + uploader
            break;
        } else if (Math.abs(currentTotal - possible) < 0.01) {
            basePrice = possible; // Era só esse plano
            break;
        }
    }

    // Calcular novo valor
    let newTotal = basePrice;

    // Adicionar uploader se ativo
    if (newUploader && basePrice >= 35) {
        newTotal += UPLOADER_MONTHLY;
    }

    return Math.round(newTotal * 100) / 100; // Arredonda para 2 casas decimais
}

// ========== FUNÇÃO AUXILIAR PARA DETECTAR PLANO BASE DO USUÁRIO ==========
// Usar função centralizada da configuração de planos
const getBasePlan = getVipPlan;