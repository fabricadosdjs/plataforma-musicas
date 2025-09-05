import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Instância do Prisma para NextAuth
const prisma = new PrismaClient();

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            isAdmin?: boolean;
            is_vip?: boolean;
            isPro?: boolean;
            valor?: number | null;
            vencimento?: Date | string | null;
            deezerEmail?: string | null;
            deezerPassword?: string | null;
            deezerPremium?: boolean | null;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        isAdmin?: boolean;
        is_vip?: boolean;
        isPro?: boolean;
        valor?: number | null;
        vencimento?: Date | string | null;
        deezerEmail?: string | null;
        deezerPassword?: string | null;
        deezerPremium?: boolean | null;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<any> {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        isAdmin: user.isAdmin || false,
                        is_vip: user.is_vip || false,
                        isPro: user.isPro || false,
                        valor: user.valor,
                        vencimento: user.vencimento,
                        deezerEmail: user.deezerEmail,
                        deezerPassword: user.deezerPassword,
                        deezerPremium: user.deezerPremium
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = (user as any).isAdmin;
                token.is_vip = (user as any).is_vip;
                token.isPro = (user as any).isPro;
                token.valor = (user as any).valor;
                token.vencimento = (user as any).vencimento;
                token.deezerEmail = (user as any).deezerEmail;
                token.deezerPassword = (user as any).deezerPassword;
                token.deezerPremium = (user as any).deezerPremium;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.isAdmin = token.isAdmin;
                session.user.is_vip = token.is_vip;
                session.user.isPro = token.isPro;
                session.user.valor = token.valor;
                session.user.vencimento = token.vencimento;
                session.user.deezerEmail = token.deezerEmail;
                session.user.deezerPassword = token.deezerPassword;
                session.user.deezerPremium = token.deezerPremium;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
