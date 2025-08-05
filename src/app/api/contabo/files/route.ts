import { ContaboStorage } from '@/lib/contabo-storage';
import { NextRequest, NextResponse } from 'next/server';

// Função para criar instância do storage
function createStorage() {
    return new ContaboStorage({
        endpoint: process.env.CONTABO_ENDPOINT!,
        region: process.env.CONTABO_REGION!,
        accessKeyId: process.env.CONTABO_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CONTABO_SECRET_ACCESS_KEY!,
        bucketName: process.env.CONTABO_BUCKET_NAME!,
    });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const prefix = searchParams.get('prefix') || undefined;
        const audioOnly = searchParams.get('audioOnly') === 'true';
        const search = searchParams.get('search') || undefined;

        console.log('🔍 Listando arquivos do Contabo Storage:', { prefix, audioOnly, search });

        const storage = createStorage();
        let files;

        if (search) {
            // Busca por arquivos específicos
            files = await storage.searchFiles(search, prefix);
        } else if (audioOnly) {
            // Lista apenas arquivos de áudio
            files = await storage.listAudioFiles(prefix);
        } else {
            // Lista todos os arquivos
            files = await storage.listFiles(prefix);
        }

        console.log(`✅ ${files.length} arquivos encontrados`);

        return NextResponse.json({
            success: true,
            files,
            count: files.length,
            audioCount: files.filter(f => f.isAudio).length,
        });

    } catch (error) {
        console.error('❌ Erro ao listar arquivos do Contabo:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao conectar com o Contabo Storage',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, key } = body;
        const storage = createStorage();

        if (action === 'getSignedUrl' && key) {
            // Gera URL assinada temporária
            const signedUrl = await storage.getSignedUrl(key, 3600); // 1 hora

            return NextResponse.json({
                success: true,
                signedUrl,
                expiresIn: 3600
            });
        }

        if (action === 'delete' && key) {
            // Deleta um arquivo
            await storage.deleteFile(key);

            return NextResponse.json({
                success: true,
                message: 'Arquivo deletado com sucesso'
            });
        }

        return NextResponse.json(
            { success: false, error: 'Ação não reconhecida' },
            { status: 400 }
        );

    } catch (error) {
        console.error('❌ Erro na operação do Contabo Storage:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro na operação',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
