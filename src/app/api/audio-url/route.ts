import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ContaboStorage } from '@/lib/contabo-storage';

const storage = new ContaboStorage({
    endpoint: process.env.CONTABO_ENDPOINT!,
    region: process.env.CONTABO_REGION!,
    accessKeyId: process.env.CONTABO_ACCESS_KEY!,
    secretAccessKey: process.env.CONTABO_SECRET_KEY!,
    bucketName: process.env.CONTABO_BUCKET_NAME!,
});

export async function GET(request: NextRequest) {
    try {
        console.log('🎵 API audio-url: Iniciando requisição');

        // Permitir acesso para todos os usuários (logados e não logados) para reprodução
        // A autenticação é mantida apenas para downloads

        const { searchParams } = new URL(request.url);
        let key = searchParams.get('key');

        if (!key) {
            console.log('🎵 API audio-url: Chave não fornecida');
            return NextResponse.json({ error: 'Chave do arquivo não fornecida' }, { status: 400 });
        }

        // Decodificar a chave que pode estar codificada
        try {
            key = decodeURIComponent(key);
            console.log('🎵 API audio-url: Chave decodificada:', key);
        } catch (error) {
            console.log('🎵 API audio-url: Erro ao decodificar chave:', error);
        }

        console.log('🎵 API audio-url: Gerando URL segura para chave:', key);

        // Gerar URL segura
        const secureUrl = await storage.getSecureUrl(key, 3600); // 1 hora de expiração

        console.log('🎵 API audio-url: URL segura gerada com sucesso');
        console.log('🎵 API audio-url: URL completa:', secureUrl);
        return NextResponse.json({ url: secureUrl });
    } catch (error) {
        console.error('🎵 API audio-url: Erro ao gerar URL segura:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 