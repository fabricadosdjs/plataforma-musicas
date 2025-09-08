import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { contaboStorage } from '@/lib/contabo-storage';

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Obter a URL do arquivo da query string
        const { searchParams } = new URL(request.url);
        let fileKey = searchParams.get('key');

        if (!fileKey) {
            return NextResponse.json({ error: 'Chave do arquivo não fornecida' }, { status: 400 });
        }

        // Se a chave for uma URL completa, extrair apenas a parte da chave
        if (fileKey.startsWith('https://')) {
            // Extrair a chave da URL do Contabo Storage
            const urlParts = fileKey.split('/');
            const bucketIndex = urlParts.findIndex(part => part.includes('plataforma-de-musicas'));
            if (bucketIndex !== -1) {
                // Pegar tudo após o bucket, incluindo parâmetros de query
                const pathParts = urlParts.slice(bucketIndex + 1);
                fileKey = pathParts.join('/');
            }
        }

        // Decodificar a chave (pode estar duplamente codificada)
        try {
            // Primeira decodificação
            fileKey = decodeURIComponent(fileKey);
            // Segunda decodificação se necessário (para casos de dupla codificação)
            if (fileKey.includes('%')) {
                fileKey = decodeURIComponent(fileKey);
            }
        } catch (error) {
            console.log('🔍 Download Proxy: Erro ao decodificar chave:', error);
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('🔍 Download Proxy:', {
                url: request.url,
                key: fileKey
            });
        }

        // Se a chave original era uma URL completa (já assinada), extrair a chave e gerar nova URL
        const originalKey = searchParams.get('key');
        if (originalKey && originalKey.startsWith('https://')) {
            if (process.env.NODE_ENV !== 'production') {
                console.log('🔍 Download Proxy: URL já assinada detectada, extraindo chave');
            }
            // Extrair a chave da URL do Contabo Storage
            const urlParts = originalKey.split('/');
            const bucketIndex = urlParts.findIndex(part => part.includes('plataforma-de-musicas'));
            if (bucketIndex !== -1) {
                // Pegar tudo após o bucket, mas antes dos parâmetros de query
                const pathParts = urlParts.slice(bucketIndex + 1);
                const pathWithoutQuery = pathParts.join('/').split('?')[0];
                fileKey = pathWithoutQuery;
            }
        }

        try {
            // Obter URL assinada do Contabo Storage
            const signedUrl = await contaboStorage.getSignedUrl(fileKey, 300); // 5 minutos de validade

            if (!signedUrl) {
                console.error('❌ Download Proxy: Falha ao gerar URL assinada para:', fileKey);
                return NextResponse.json({ error: 'Falha ao gerar URL de download' }, { status: 500 });
            }

            if (process.env.NODE_ENV !== 'production') {
                console.log('🔍 Download Proxy: Redirecionando para URL assinada');
            }

            // Redirecionar diretamente para a URL assinada (início de download quase instantâneo)
            return NextResponse.redirect(signedUrl, { status: 302 });

        } catch (storageError) {
            console.error('❌ Download Proxy: Erro no storage:', storageError);
            return NextResponse.json({
                error: 'Erro ao acessar arquivo no storage',
                details: storageError instanceof Error ? storageError.message : 'Erro desconhecido'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Download Proxy: Erro geral:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
        }, { status: 500 });
    }
}
