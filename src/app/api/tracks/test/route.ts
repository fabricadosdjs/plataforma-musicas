import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        console.log('🧪 API /tracks/test: Rota de teste chamada');

        return NextResponse.json({
            message: 'API de teste funcionando!',
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url
        });
    } catch (error) {
        console.error('❌ Erro na API de teste:', error);
        return NextResponse.json({ error: 'Erro no teste' }, { status: 500 });
    }
}


