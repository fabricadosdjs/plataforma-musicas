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

                    // Retornar dados mínimos para sessão
                    // isPro não existe no modelo User aqui, assumindo que is_vip é o correto
                    return {
                        id: dbUser.id,
                        email: dbUser.email,
                        name: dbUser.name || dbUser.email.split('@')[0],
                        is_vip: dbUser.is_vip, // Corrected from isPro
                        // Ensure other properties are included if needed in the session/JWT process from dbUser
                        valor: dbUser.valor,
                        status: dbUser.status,
                        deemix: dbUser.deemix, // Assuming this exists in dbUser
                        dailyDownloadCount: dbUser.dailyDownloadCount,
                        lastDownloadReset: dbUser.lastDownloadReset,
                        weeklyPackRequests: dbUser.weeklyPackRequests,
                        weeklyPlaylistDownloads: dbUser.weeklyPlaylistDownloads,
                        lastWeekReset: dbUser.lastWeekReset,
                        customBenefits: dbUser.customBenefits,
                        vencimento: dbUser.vencimento,
                        dataPagamento: dbUser.dataPagamento,
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
                token.is_vip = (user as any).is_vip;
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
                token.lastDownloadReset = (user as any).lastDownloadReset;
                token.lastWeekReset = (user as any).lastWeekReset;
                token.customBenefits = (user as any).customBenefits;

            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).is_vip = token.is_vip as boolean;
                (session.user as any).valor = token.valor as string;
                (session.user as any).benefits = token.benefits as any;
                (session.user as any).status = token.status as string;
                (session.user as any).dailyDownloadCount = token.dailyDownloadCount as number;
                (session.user as any).weeklyPackRequests = token.weeklyPackRequests as number;
                (session.user as any).weeklyPlaylistDownloads = token.weeklyPlaylistDownloads as number;
                (session.user as any).vencimento = token.vencimento as string;
                // Ensure these are also correctly typed and passed if needed
                (session.user as any).deemix = token.deemix as boolean;
                (session.user as any).lastDownloadReset = token.lastDownloadReset as string;
                (session.user as any).lastWeekReset = token.lastWeekReset as string;
                (session.user as any).customBenefits = token.customBenefits as any;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/sign-in',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development', // Adicionar debug em desenvolvimento
};