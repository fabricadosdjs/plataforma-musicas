// API de teste simplificada
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('🔍 API de teste chamada');

        return NextResponse.json({
            success: true,
            message: 'API funcionando',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[TEST_API_ERROR]", error);
        return NextResponse.json({
            error: "Erro interno do servidor",
            success: false
        }, { status: 500 });
    }
} 