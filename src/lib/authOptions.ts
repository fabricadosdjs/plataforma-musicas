// src/lib/authOptions.ts
import prisma, { safeQuery } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Admin mestre via variáveis de ambiente
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_ID = 'admin-nextor-001';
const ADMIN_NAME = 'Administrador Nextor';

// Admin específico para gerenciamento de imagens
const IMAGE_ADMIN_EMAIL = 'edersonleonardo@nexorrecords.com.br';
const IMAGE_ADMIN_PASSWORD = 'Eclipse2025*';
const IMAGE_ADMIN_ID = 'admin-image-001';
const IMAGE_ADMIN_NAME = 'Ederson Leonardo';

// Função para obter benefícios do usuário
function getUserBenefits(user: any) {
    const VIP_BENEFITS = {
        'BÁSICO': {
            priceRange: '30-35',
            packRequestsPerWeek: 8,
            playlistsPerWeek: 3,
            downloadsPerDay: 50,
            directDownload: true,
            deemixAccess: true,
            trackRequest: true,
            exclusiveGenres: false,
            prioritySupport: false
        },
        'PADRÃO': {
            priceRange: '36-42',
            packRequestsPerWeek: 15,
            playlistsPerWeek: 6,
            downloadsPerDay: 100,
            directDownload: true,
            deemixAccess: true,
            trackRequest: true,
            exclusiveGenres: true,
            prioritySupport: false
        },
        'COMPLETO': {
            priceRange: '43-60',
            packRequestsPerWeek: 999,
            playlistsPerWeek: 999,
            downloadsPerDay: 150,
            directDownload: true,
            deemixAccess: true,
            trackRequest: true,
            exclusiveGenres: true,
            prioritySupport: true
        }
    };

    // Se for valor do Profile, usar a lógica correta
    const valor = user.profile?.valor || user.valor || 0;
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);

    if (valorNumerico >= 43) return { plan: 'COMPLETO', ...VIP_BENEFITS.COMPLETO };
    if (valorNumerico >= 36) return { plan: 'PADRÃO', ...VIP_BENEFITS.PADRÃO };
    if (valorNumerico >= 30) return { plan: 'BÁSICO', ...VIP_BENEFITS.BÁSICO };

    return { plan: 'GRATUITO', packRequestsPerWeek: 0, playlistsPerWeek: 0, downloadsPerDay: 5 };
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.log('❌ Credenciais incompletas');
                        return null;
                    }

                    // Verificar se é o admin mestre (ignorar banco para admin)
                    if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
                        console.log('✅ Login como admin master');
                        return {
                            id: ADMIN_ID,
                            email: ADMIN_EMAIL,
                            name: ADMIN_NAME,
                            is_vip: true,
                            valor: '999',
                            benefits: {
                                plan: 'ADMIN',
                                packRequestsPerWeek: 999999,
                                playlistsPerWeek: 999999,
                                downloadsPerDay: 999999,
                                directDownload: true,
                                deemixAccess: true,
                                trackRequest: true,
                                exclusiveGenres: true,
                                prioritySupport: true,
                                adminAccess: true
                            },
                            status: 'ativo',
                            dailyDownloadCount: 0,
                            weeklyPackRequests: 0,
                            weeklyPlaylistDownloads: 0,
                            vencimento: null,
                        };
                    }

                    // Verificar se é o admin de imagens
                    if (credentials.email === IMAGE_ADMIN_EMAIL && credentials.password === IMAGE_ADMIN_PASSWORD) {
                        console.log('✅ Login como admin de imagens');
                        return {
                            id: IMAGE_ADMIN_ID,
                            email: IMAGE_ADMIN_EMAIL,
                            name: IMAGE_ADMIN_NAME,
                            is_vip: true,
                            valor: '999',
                            benefits: {
                                plan: 'ADMIN',
                                packRequestsPerWeek: 999999,
                                playlistsPerWeek: 999999,
                                downloadsPerDay: 999999,
                                directDownload: true,
                                deemixAccess: true,
                                trackRequest: true,
                                exclusiveGenres: true,
                                prioritySupport: true,
                                adminAccess: true,
                                imageAdminAccess: true
                            },
                            status: 'ativo',
                            dailyDownloadCount: 0,
                            weeklyPackRequests: 0,
                            weeklyPlaylistDownloads: 0,
                            vencimento: null,
                        };
                    }

                    // Buscar usuário no banco de dados (tabela User, sem profile)
                    const dbUser = await safeQuery(
                        () => prisma.user.findFirst({
                            where: { email: credentials.email }
                        }),
                        null // You passed null here, ensure safeQuery accepts it for default behavior or adjust.
                    );

                    if (!dbUser) {
                        console.log('❌ Usuário não encontrado no banco');
                        return null;
                    }

                    console.log('✅ Usuário encontrado:', dbUser.email);

                    // Verificar senha
                    const isPasswordValid = dbUser.password && await bcrypt.compare(credentials.password, dbUser.password);
                    if (!isPasswordValid) {
                        console.log('❌ Senha incorreta');
                        return null;
                    }

                    console.log('✅ Senha validada com sucesso');

                    // Determinar status VIP baseado no valor da assinatura E vencimento
                    const userBenefits = getUserBenefits(dbUser);
                    const hasValidVencimento = dbUser.vencimento && new Date(dbUser.vencimento) > new Date();
                    const isVipByValue = userBenefits.plan !== 'GRATUITO';
                    const isVip = isVipByValue || hasValidVencimento;

                    // Se tem vencimento válido mas não tem valor, definir plano padrão
                    let finalPlan = userBenefits.plan;
                    if (hasValidVencimento && !isVipByValue) {
                        finalPlan = 'BÁSICO'; // Plano padrão para usuários com vencimento válido
                    }

                    console.log('🔍 Status VIP calculado:', {
                        valor: dbUser.valor,
                        vencimento: dbUser.vencimento,
                        hasValidVencimento,
                        planByValue: userBenefits.plan,
                        finalPlan,
                        isVipByValue,
                        isVip
                    });

                    // Atualizar o campo is_vip no banco para manter consistência
                    if (dbUser.is_vip !== isVip) {
                        await safeQuery(
                            () => prisma.user.update({
                                where: { id: dbUser.id },
                                data: { is_vip: isVip }
                            }),
                            null
                        );
                        console.log('🔄 Campo is_vip atualizado no banco:', isVip);
                    }

                    // Retornar dados mínimos para sessão
                    return {
                        id: dbUser.id,
                        email: dbUser.email,
                        name: dbUser.name || dbUser.email.split('@')[0],
                        is_vip: isVip, // Calculado dinamicamente baseado no valor E vencimento
                        isAdmin: dbUser.isAdmin, // Adicionar campo isAdmin
                        // Ensure other properties are included if needed in the session/JWT process from dbUser
                        valor: dbUser.valor,
                        status: dbUser.status,
                        deemix: dbUser.deemix, // Assuming this exists in dbUser
                        deezerPremium: dbUser.deezerPremium,
                        deezerEmail: dbUser.deezerEmail,
                        deezerPassword: dbUser.deezerPassword,
                        dailyDownloadCount: dbUser.dailyDownloadCount,
                        lastDownloadReset: dbUser.lastDownloadReset,
                        weeklyPackRequests: dbUser.weeklyPackRequests,
                        weeklyPlaylistDownloads: dbUser.weeklyPlaylistDownloads,
                        lastWeekReset: dbUser.lastWeekReset,
                        customBenefits: dbUser.customBenefits,
                        vencimento: dbUser.vencimento,
                        dataPagamento: dbUser.dataPagamento,
                        whatsapp: dbUser.whatsapp, // Adicionar campo whatsapp
                        plan: finalPlan, // Plano final considerando vencimento
                        planName: dbUser.planName, // Adicionar campo planName
                        planType: dbUser.planType, // Adicionar campo planType
                        period: dbUser.period, // Adicionar campo period
                        isUploader: dbUser.isUploader, // Adicionar campo isUploader
                    };

                } catch (error) {
                    console.error('[AUTH_ERROR]', error);
                    // Em caso de erro, tentar login como admin se as credenciais conferem
                    if (credentials?.email === ADMIN_EMAIL && credentials?.password === ADMIN_PASSWORD) {
                        console.log('✅ Fallback para admin master devido a erro de banco');
                        return {
                            id: ADMIN_ID,
                            email: ADMIN_EMAIL,
                            name: ADMIN_NAME,
                            is_vip: true,
                            valor: '999',
                            benefits: {
                                plan: 'ADMIN',
                                packRequestsPerWeek: 999999,
                                playlistsPerWeek: 999999,
                                downloadsPerDay: 999999,
                                directDownload: true,
                                deemixAccess: true,
                                trackRequest: true,
                                exclusiveGenres: true,
                                prioritySupport: true,
                                adminAccess: true
                            },
                            status: 'ativo',
                            dailyDownloadCount: 0,
                            weeklyPackRequests: 0,
                            weeklyPlaylistDownloads: 0,
                            vencimento: null,
                        };
                    }

                    // Fallback para admin de imagens
                    if (credentials?.email === IMAGE_ADMIN_EMAIL && credentials?.password === IMAGE_ADMIN_PASSWORD) {
                        console.log('✅ Fallback para admin de imagens devido a erro de banco');
                        return {
                            id: IMAGE_ADMIN_ID,
                            email: IMAGE_ADMIN_EMAIL,
                            name: IMAGE_ADMIN_NAME,
                            is_vip: true,
                            valor: '999',
                            benefits: {
                                plan: 'ADMIN',
                                packRequestsPerWeek: 999999,
                                playlistsPerWeek: 999999,
                                downloadsPerDay: 999999,
                                directDownload: true,
                                deemixAccess: true,
                                trackRequest: true,
                                exclusiveGenres: true,
                                prioritySupport: true,
                                adminAccess: true,
                                imageAdminAccess: true
                            },
                            status: 'ativo',
                            dailyDownloadCount: 0,
                            weeklyPackRequests: 0,
                            weeklyPlaylistDownloads: 0,
                            vencimento: null,
                        };
                    }
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.isVip = (user as any).is_vip;
                token.isAdmin = (user as any).isAdmin; // Adicionar isAdmin ao token
                token.valor = (user as any).valor;
                // Get benefits dynamically using the user data from the database or admin master
                token.benefits = getUserBenefits(user); // Use getUserBenefits to derive benefits
                token.status = (user as any).status;
                token.dailyDownloadCount = (user as any).dailyDownloadCount;
                token.weeklyPackRequests = (user as any).weeklyPackRequests;
                token.weeklyPlaylistDownloads = (user as any).weeklyPlaylistDownloads;
                token.vencimento = (user as any).vencimento;
                // Add any other user data from the database that you need in the token
                token.deemix = (user as any).deemix;
                token.deezerPremium = (user as any).deezerPremium;
                token.deezerEmail = (user as any).deezerEmail;
                token.deezerPassword = (user as any).deezerPassword;
                token.lastDownloadReset = (user as any).lastDownloadReset;
                token.lastWeekReset = (user as any).lastWeekReset;
                token.customBenefits = (user as any).customBenefits;
                token.whatsapp = (user as any).whatsapp;
                token.planName = (user as any).planName; // Adicionar campo planName
                token.planType = (user as any).planType; // Adicionar campo planType
                token.period = (user as any).period; // Adicionar campo period
                token.isUploader = (user as any).isUploader; // Adicionar campo isUploader
                token.updatedAt = (user as any).updatedAt; // Adicionar campo updatedAt

            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).isVip = token.isVip as boolean;
                (session.user as any).isAdmin = token.isAdmin as boolean; // Adicionar isAdmin à sessão
                (session.user as any).valor = token.valor as string;
                (session.user as any).benefits = token.benefits as any;
                (session.user as any).status = token.status as string;
                (session.user as any).dailyDownloadCount = token.dailyDownloadCount as number;
                (session.user as any).weeklyPackRequests = token.weeklyPackRequests as number;
                (session.user as any).weeklyPlaylistDownloads = token.weeklyPlaylistDownloads as number;
                (session.user as any).vencimento = token.vencimento as string;
                // Ensure these are also correctly typed and passed if needed
                (session.user as any).deemix = token.deemix as boolean;
                (session.user as any).deezerPremium = token.deezerPremium as boolean;
                (session.user as any).deezerEmail = token.deezerEmail as string;
                (session.user as any).deezerPassword = token.deezerPassword as string;
                (session.user as any).lastDownloadReset = token.lastDownloadReset as string;
                (session.user as any).lastWeekReset = token.lastWeekReset as string;
                (session.user as any).customBenefits = token.customBenefits as any;
                (session.user as any).whatsapp = token.whatsapp as string;
                (session.user as any).planName = token.planName as string; // Adicionar campo planName
                (session.user as any).planType = token.planType as string; // Adicionar campo planType
                (session.user as any).period = token.period as string; // Adicionar campo period
                (session.user as any).isUploader = token.isUploader as boolean; // Adicionar campo isUploader
                (session.user as any).updatedAt = token.updatedAt as string; // Adicionar campo updatedAt
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/sign-in',
        signOut: '/auth/sign-in',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Adicionar debug em desenvolvimento
};