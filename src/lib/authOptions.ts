// src/lib/authOptions.ts
import prisma from '@/lib/prisma';
import { User } from '../types/user';
import { UserBenefits } from '../types/benefits';
import bcrypt from 'bcryptjs';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Admin mestre via variáveis de ambiente
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_ID = 'admin-nextor-001';
const ADMIN_NAME = 'Administrador Nexor';

// Admin específico para gerenciamento de imagens
const IMAGE_ADMIN_EMAIL = 'edersonleonardo@nexorrecords.com.br';
const IMAGE_ADMIN_PASSWORD = 'Eclipse2025*';
const IMAGE_ADMIN_ID = 'admin-image-001';
const IMAGE_ADMIN_NAME = 'Ederson Leonardo';

// Função para obter benefícios do usuário
function getUserBenefits(user: User): UserBenefits {
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
    const valor = (typeof user === 'object' && 'profile' in user && user.profile && typeof user.profile === 'object' && 'valor' in user.profile ? (user.profile as { valor?: number | string })?.valor : undefined) || user.valor || 0;
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);

    if (valorNumerico >= 43) return { plan: 'COMPLETO', ...VIP_BENEFITS.COMPLETO };
    if (valorNumerico >= 36) return { plan: 'PADRÃO', ...VIP_BENEFITS.PADRÃO };
    if (valorNumerico >= 30) return { plan: 'BÁSICO', ...VIP_BENEFITS.BÁSICO };

    return {
        plan: 'GRATUITO',
        packRequestsPerWeek: 0,
        playlistsPerWeek: 0,
        downloadsPerDay: 5,
        directDownload: false,
        deemixAccess: false,
        trackRequest: false,
        exclusiveGenres: false,
        prioritySupport: false
    };
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
                            email: ADMIN_EMAIL!,
                            name: ADMIN_NAME,
                            is_vip: true,
                            valor: 999,
                            status: 'ativo',
                            dailyDownloadCount: 0,
                            weeklyPackRequests: 0,
                            weeklyPlaylistDownloads: 0,
                            vencimento: null,
                            isAdmin: true,
                            deemix: true,
                            deezerPremium: true,
                            planName: 'ADMIN',
                            planType: 'ADMIN',
                            period: 'ADMIN',
                            customBenefits: undefined,
                            dataPagamento: null,
                            lastDownloadReset: null,
                            lastWeekReset: null,
                            whatsapp: undefined,
                            isUploader: false,
                            dataPrimeiroPagamento: null,
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
                            valor: 999,
                            status: 'ativo',
                            dailyDownloadCount: 0,
                            weeklyPackRequests: 0,
                            weeklyPlaylistDownloads: 0,
                            vencimento: null,
                            isAdmin: true,
                            deemix: true,
                            deezerPremium: true,
                            planName: 'ADMIN',
                            planType: 'ADMIN',
                            period: 'ADMIN',
                            customBenefits: undefined,
                            dataPagamento: null,
                            lastDownloadReset: null,
                            lastWeekReset: null,
                            whatsapp: undefined,
                            isUploader: false,
                            dataPrimeiroPagamento: null,
                        };
                    }

                    // Buscar usuário no banco de dados (tabela User, sem profile)
                    const dbUser = await prisma.user.findFirst({
                        where: { email: credentials.email }
                    }) as User | null;


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
                    const userBenefits = dbUser ? getUserBenefits(dbUser) : { plan: 'GRATUITO', packRequestsPerWeek: 0, playlistsPerWeek: 0, downloadsPerDay: 5, directDownload: false, deemixAccess: false, trackRequest: false, exclusiveGenres: false, prioritySupport: false };
                    const hasValidVencimento = dbUser?.vencimento && new Date(dbUser.vencimento) > new Date();
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
                    if (typeof dbUser.is_vip === 'boolean' && dbUser.is_vip !== isVip) {
                        await prisma.user.update({
                            where: { id: dbUser.id },
                            data: { is_vip: !!isVip }
                        });
                        console.log('🔄 Campo is_vip atualizado no banco:', isVip);
                    }

                    // Retornar dados mínimos para sessão
                    function toDateOrNull(val: unknown): Date | null | undefined {
                        if (!val) return null;
                        if (val instanceof Date) return val;
                        const d = new Date(val as string);
                        return isNaN(d.getTime()) ? null : d;
                    }
                    return {
                        id: dbUser.id,
                        email: dbUser.email,
                        name: dbUser.name || dbUser.email.split('@')[0],
                        is_vip: typeof isVip === 'boolean' ? isVip : !!isVip,
                        isAdmin: dbUser.isAdmin,
                        valor: dbUser.valor,
                        status: dbUser.status,
                        deemix: dbUser.deemix,
                        deezerPremium: dbUser.deezerPremium,
                        deezerEmail: dbUser.deezerEmail,
                        deezerPassword: dbUser.deezerPassword,
                        dailyDownloadCount: dbUser.dailyDownloadCount,
                        lastDownloadReset: toDateOrNull(dbUser.lastDownloadReset),
                        weeklyPackRequests: dbUser.weeklyPackRequests,
                        weeklyPlaylistDownloads: dbUser.weeklyPlaylistDownloads,
                        lastWeekReset: toDateOrNull(dbUser.lastWeekReset),
                        customBenefits: dbUser.customBenefits,
                        vencimento: toDateOrNull(dbUser.vencimento),
                        dataPagamento: toDateOrNull(dbUser.dataPagamento),
                        whatsapp: dbUser.whatsapp,
                        planName: dbUser.planName,
                        planType: dbUser.planType,
                        period: dbUser.period,
                        isUploader: dbUser.isUploader,
                        dataPrimeiroPagamento: toDateOrNull(dbUser.dataPrimeiroPagamento),
                    };

                } catch (error) {
                    console.error('[AUTH_ERROR]', error);
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
            if (user && 'id' in user && 'email' in user) {
                const u = user as User;
                token.id = u.id;
                token.isVip = u.is_vip;
                token.isAdmin = u.isAdmin;
                token.valor = u.valor;
                token.benefits = getUserBenefits(u);
                token.status = u.status;
                token.dailyDownloadCount = u.dailyDownloadCount;
                token.weeklyPackRequests = u.weeklyPackRequests;
                token.weeklyPlaylistDownloads = u.weeklyPlaylistDownloads;
                token.vencimento = u.vencimento;
                token.deemix = u.deemix;
                token.deezerPremium = u.deezerPremium;
                token.deezerEmail = u.deezerEmail;
                token.deezerPassword = u.deezerPassword;
                token.lastDownloadReset = u.lastDownloadReset;
                token.lastWeekReset = u.lastWeekReset;
                token.customBenefits = u.customBenefits;
                token.whatsapp = u.whatsapp;
                token.planName = u.planName;
                token.planType = u.planType;
                token.period = u.period;
                token.isUploader = u.isUploader;
                token.updatedAt = u.updatedAt;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const userObj = session.user as Record<string, unknown>;
                userObj.id = token.id as string;
                userObj.isVip = token.isVip as boolean;
                userObj.isAdmin = token.isAdmin as boolean;
                userObj.valor = token.valor;
                userObj.benefits = token.benefits;
                userObj.status = token.status;
                userObj.dailyDownloadCount = token.dailyDownloadCount;
                userObj.weeklyPackRequests = token.weeklyPackRequests;
                userObj.weeklyPlaylistDownloads = token.weeklyPlaylistDownloads;
                userObj.vencimento = token.vencimento;
                userObj.deemix = token.deemix;
                userObj.deezerPremium = token.deezerPremium;
                userObj.deezerEmail = token.deezerEmail;
                userObj.deezerPassword = token.deezerPassword;
                userObj.lastDownloadReset = token.lastDownloadReset;
                userObj.lastWeekReset = token.lastWeekReset;
                userObj.customBenefits = token.customBenefits;
                userObj.whatsapp = token.whatsapp;
                userObj.planName = token.planName;
                userObj.planType = token.planType;
                userObj.period = token.period;
                userObj.isUploader = token.isUploader;
                userObj.updatedAt = token.updatedAt;
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