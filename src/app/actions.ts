// app/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Inicializar Prisma Client
const prisma = new PrismaClient();

// =====================
// FUNÇÕES DE DADOS
// =====================

export async function getData() {
    try {
        const data = { current_time: new Date() };
        return { success: true, data };
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        return { success: false, error: 'Erro ao buscar dados' };
    }
}

// =====================
// FUNÇÕES DE USUÁRIO
// =====================

export async function getUserById(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, isAdmin: true, createdAt: true }
        });
        return { success: true, user };
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        return { success: false, error: 'Erro ao buscar usuário' };
    }
}

export async function createUser(userData: {
    email: string;
    name: string;
    password: string;
    role?: string;
}) {
    try {
        const newUser = await prisma.user.create({
            data: {
                email: userData.email,
                name: userData.name,
                password: userData.password,
                isAdmin: userData.role === 'admin'
            },
            select: { id: true, email: true, name: true, isAdmin: true, createdAt: true }
        });

        revalidatePath('/admin/users');
        return { success: true, user: newUser };
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        return { success: false, error: 'Erro ao criar usuário' };
    }
}

// =====================
// FUNÇÕES DE TRACKS
// =====================

export async function getTracks(limit: number = 10, offset: number = 0) {
    try {
        const tracks = await prisma.track.findMany({
            select: { id: true, songName: true, artist: true, style: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
        return { success: true, tracks };
    } catch (error) {
        console.error('❌ Erro ao buscar tracks:', error);
        return { success: false, error: 'Erro ao buscar tracks' };
    }
}

export async function getTrackById(trackId: string) {
    try {
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) },
            select: { id: true, songName: true, artist: true, style: true, downloadUrl: true, createdAt: true }
        });
        return { success: true, track };
    } catch (error) {
        console.error('❌ Erro ao buscar track:', error);
        return { success: false, error: 'Erro ao buscar track' };
    }
}

// =====================
// FUNÇÕES DE ESTATÍSTICAS
// =====================

export async function getStats() {
    try {
        const [totalUsers, totalTracks, totalDownloads] = await Promise.all([
            prisma.user.count(),
            prisma.track.count(),
            prisma.download.count()
        ]);

        const stats = { total_users: totalUsers, total_tracks: totalTracks, total_downloads: totalDownloads };
        return { success: true, stats };
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        return { success: false, error: 'Erro ao buscar estatísticas' };
    }
}

// =====================
// FUNÇÕES DE DOWNLOAD
// =====================

export async function recordDownload(trackId: string, userId: string) {
    try {
        await prisma.download.create({
            data: {
                trackId: parseInt(trackId),
                userId: userId,
                downloadedAt: new Date()
            }
        });

        revalidatePath('/tracks');
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao registrar download:', error);
        return { success: false, error: 'Erro ao registrar download' };
    }
}

// =====================
// FUNÇÕES DE ADMIN
// =====================

export async function isAdmin(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isAdmin: true }
        });
        return { success: true, isAdmin: user?.isAdmin || false };
    } catch (error) {
        console.error('❌ Erro ao verificar admin:', error);
        return { success: false, error: 'Erro ao verificar admin' };
    }
}

// =====================
// FUNÇÕES DE VALIDAÇÃO
// =====================

export async function validateEmail(email: string) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
            select: { id: true }
        });
        return { success: true, exists: !!existingUser };
    } catch (error) {
        console.error('❌ Erro ao validar email:', error);
        return { success: false, error: 'Erro ao validar email' };
    }
}

// =====================
// FUNÇÕES DE LIMPEZA
// =====================

export async function cleanupOldData() {
    try {
        // Limpar downloads antigos (mais de 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await prisma.download.deleteMany({
            where: {
                downloadedAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        revalidatePath('/admin/dashboard');
        return { success: true, deleted: result.count };
    } catch (error) {
        console.error('❌ Erro ao limpar dados antigos:', error);
        return { success: false, error: 'Erro ao limpar dados antigos' };
    }
}
