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
                fileKey = urlParts.slice(bucketIndex + 1).join('/');
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

        console.log('🔍 Download Proxy: URL completa recebida:', request.url);
        console.log('🔍 Download Proxy: Parâmetros de busca:', Object.fromEntries(searchParams.entries()));
        console.log('🔍 Download Proxy: Chave do arquivo extraída:', fileKey);
        console.log('🔍 Download Proxy: Chave do arquivo processada:', fileKey);
        console.log('🔍 Download Proxy: Chave do arquivo decodificada:', fileKey);

        try {
            // Obter URL assinada do Contabo Storage
            const signedUrl = await contaboStorage.getSignedUrl(fileKey, 300); // 5 minutos de validade

            if (!signedUrl) {
                console.error('❌ Download Proxy: Falha ao gerar URL assinada para:', fileKey);
                return NextResponse.json({ error: 'Falha ao gerar URL de download' }, { status: 500 });
            }

            console.log('🔍 Download Proxy: URL assinada gerada para:', fileKey);

            // Fazer proxy do arquivo
            const fileResponse = await fetch(signedUrl);

            if (!fileResponse.ok) {
                console.error('❌ Download Proxy: Erro ao buscar arquivo:', fileResponse.status, fileResponse.statusText);
                return NextResponse.json({
                    error: 'Erro ao buscar arquivo no storage',
                    status: fileResponse.status
                }, { status: fileResponse.status });
            }

            // Obter o arquivo como blob
            const fileBlob = await fileResponse.blob();

            if (fileBlob.size === 0) {
                console.error('❌ Download Proxy: Arquivo vazio recebido para:', fileKey);
                return NextResponse.json({ error: 'Arquivo vazio' }, { status: 500 });
            }

            console.log('✅ Download Proxy: Arquivo servido com sucesso:', fileKey, 'Tamanho:', fileBlob.size);

            // Extrair nome do arquivo da chave
            const fileName = fileKey.split('/').pop() || 'arquivo.mp3';

            // Retornar o arquivo
            return new NextResponse(fileBlob, {
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Disposition': `attachment; filename="${fileName}"`,
                    'Content-Length': fileBlob.size.toString(),
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

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
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}
