// src/middleware.ts (Versão de Teste Simplificada)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // Não faz nada, apenas continua para a rota solicitada
    return NextResponse.next();
}

// Aplica o middleware a todas as rotas
export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};