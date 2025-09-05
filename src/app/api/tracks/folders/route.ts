import { NextRequest, NextResponse } from 'next/server';
import { ContaboStorage } from '@/lib/contabo-storage';

// Função para criar instância do storage
function createStorage() {
    return new ContaboStorage({
        endpoint: process.env.CONTABO_ENDPOINT!,
        region: process.env.CONTABO_REGION!,
        accessKeyId: process.env.CONTABO_ACCESS_KEY!,
        secretAccessKey: process.env.CONTABO_SECRET_KEY!,
        bucketName: process.env.CONTABO_BUCKET_NAME!,
    });
}

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Buscando pastas do Contabo Storage...');

        const storage = createStorage();
        const files = await storage.listFiles();

        // Extrair pastas únicas dos arquivos
        const folders = new Set<string>();

        files.forEach(file => {
            const parts = file.key.split('/');
            if (parts.length > 1) {
                // Adicionar a primeira pasta (nível raiz)
                folders.add(parts[0]);

                // Adicionar subpastas se existirem
                if (parts.length > 2) {
                    folders.add(parts.slice(0, 2).join('/'));
                }
            }
        });

        const folderNames = Array.from(folders).sort();

        console.log(`✅ ${folderNames.length} pastas encontradas:`, folderNames);

        return NextResponse.json({
            success: true,
            folders: folderNames
        });

    } catch (error) {
        console.error('Error fetching storage folders:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao conectar com o storage',
                folders: []
            },
            { status: 500 }
        );
    }
}
