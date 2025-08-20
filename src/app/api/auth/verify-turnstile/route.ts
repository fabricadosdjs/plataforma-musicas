import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Token do Turnstile é obrigatório' },
                { status: 400 }
            );
        }

        // Validar token com Cloudflare
        const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: token,
                remoteip: request.headers.get('x-forwarded-for') || request.ip || 'unknown'
            }),
        });

        const verificationResult = await verificationResponse.json();

        if (!verificationResult.success) {
            console.error('❌ Falha na verificação Turnstile:', verificationResult);
            return NextResponse.json(
                { error: 'Falha na verificação do captcha' },
                { status: 400 }
            );
        }

        console.log('✅ Turnstile verificado com sucesso');

        return NextResponse.json({
            success: true,
            message: 'Captcha verificado com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro na verificação Turnstile:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
