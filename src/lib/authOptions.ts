// src/lib/authOptions.ts
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Lista de administradores especiais (não ficam na tabela VIP)
const ADMIN_USERS = [
    {
        email: 'admin@nextor.com',
        password: 'admin123', // Senha padrão - será hasheada automaticamente
        name: 'Administrador Nextor',
        id: 'admin-nextor-001'
    }
];

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

    const value = parseFloat(user.valor) || 0;

    if (value >= 43) return { plan: 'COMPLETO', ...VIP_BENEFITS.COMPLETO };
    if (value >= 36) return { plan: 'PADRÃO', ...VIP_BENEFITS.PADRÃO };
    if (value >= 30) return { plan: 'BÁSICO', ...VIP_BENEFITS.BÁSICO };

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
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Credenciais inválidas');
                }

                // Verificar se é um admin especial primeiro
                const adminUser = ADMIN_USERS.find(admin => admin.email === credentials.email);
                if (adminUser) {
                    // Verificar senha do admin
                    if (credentials.password === adminUser.password) {
                        // Retornar dados do admin com privilégios máximos
                        return {
                            id: adminUser.id,
                            email: adminUser.email,
                            name: adminUser.name,
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
                    } else {
                        throw new Error('Senha incorreta');
                    }
                }

                // Buscar usuário no nosso banco (usuários VIP normais)
                const dbUser = await prisma.user.findUnique({
                    where: { email: credentials.email }
                }) as any;

                if (!dbUser) {
                    throw new Error('Usuário não encontrado');
                }

                // Verificar senha (se não tiver senha, permitir qualquer senha temporariamente)
                if (dbUser.password) {
                    const isPasswordValid = await bcrypt.compare(credentials.password, dbUser.password);
                    if (!isPasswordValid) {
                        throw new Error('Senha incorreta');
                    }
                } else {
                    // Se não tem senha cadastrada, aceitar qualquer senha e definir a senha
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);
                    await prisma.user.update({
                        where: { id: dbUser.id },
                        data: { password: hashedPassword } as any
                    });
                }

                // Verificar se o usuário está ativo
                if (dbUser.status !== 'ativo') {
                    throw new Error('Conta inativa. Entre em contato com o suporte.');
                }

                // Obter benefícios do usuário
                const benefits = getUserBenefits(dbUser);

                return {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name,
                    is_vip: dbUser.is_vip,
                    valor: dbUser.valor?.toString() || '0',
                    benefits: benefits,
                    status: dbUser.status,
                    dailyDownloadCount: dbUser.dailyDownloadCount || 0,
                    weeklyPackRequests: dbUser.weeklyPackRequests || 0,
                    weeklyPlaylistDownloads: dbUser.weeklyPlaylistDownloads || 0,
                    vencimento: dbUser.vencimento?.toISOString() || null,
                };
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
                token.benefits = (user as any).benefits;
                token.status = (user as any).status;
                token.dailyDownloadCount = (user as any).dailyDownloadCount;
                token.weeklyPackRequests = (user as any).weeklyPackRequests;
                token.weeklyPlaylistDownloads = (user as any).weeklyPlaylistDownloads;
                token.vencimento = (user as any).vencimento;
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
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/sign-in',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
