// app/actions.ts
"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

// Inicializar conexão Neon
const sql = neon(process.env.DATABASE_URL!);

// =====================
// FUNÇÕES DE DADOS
// =====================

export async function getData() {
    try {
        const data = await sql`SELECT NOW() as current_time`;
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
        const user = await sql`
            SELECT id, email, name, role, created_at 
            FROM users 
            WHERE id = ${userId}
        `;
        return { success: true, user: user[0] };
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
        const newUser = await sql`
            INSERT INTO users (email, name, password_hash, role, created_at)
            VALUES (${userData.email}, ${userData.name}, ${userData.password}, ${userData.role || 'user'}, NOW())
            RETURNING id, email, name, role, created_at
        `;

        revalidatePath('/admin/users');
        return { success: true, user: newUser[0] };
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
        const tracks = await sql`
            SELECT id, title, artist, genre, duration, created_at
            FROM tracks 
            ORDER BY created_at DESC 
            LIMIT ${limit} OFFSET ${offset}
        `;
        return { success: true, tracks };
    } catch (error) {
        console.error('❌ Erro ao buscar tracks:', error);
        return { success: false, error: 'Erro ao buscar tracks' };
    }
}

export async function getTrackById(trackId: string) {
    try {
        const track = await sql`
            SELECT id, title, artist, genre, duration, file_path, created_at
            FROM tracks 
            WHERE id = ${trackId}
        `;
        return { success: true, track: track[0] };
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
        const stats = await sql`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM tracks) as total_tracks,
                (SELECT COUNT(*) FROM downloads) as total_downloads
        `;
        return { success: true, stats: stats[0] };
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
        await sql`
            INSERT INTO downloads (track_id, user_id, downloaded_at)
            VALUES (${trackId}, ${userId}, NOW())
        `;

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
        const user = await sql`
            SELECT role FROM users WHERE id = ${userId}
        `;
        return { success: true, isAdmin: user[0]?.role === 'admin' };
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
        const existingUser = await sql`
            SELECT id FROM users WHERE email = ${email}
        `;
        return { success: true, exists: existingUser.length > 0 };
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
        const result = await sql`
            DELETE FROM downloads 
            WHERE downloaded_at < NOW() - INTERVAL '30 days'
        `;

        revalidatePath('/admin/dashboard');
        return { success: true, deleted: result.length };
    } catch (error) {
        console.error('❌ Erro ao limpar dados antigos:', error);
        return { success: false, error: 'Erro ao limpar dados antigos' };
    }
}
