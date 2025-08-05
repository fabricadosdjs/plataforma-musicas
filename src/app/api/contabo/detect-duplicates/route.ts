// API para detectar arquivos duplicados no storage do Contabo
import { ContaboStorage } from '@/lib/contabo-storage';
import { NextRequest, NextResponse } from 'next/server';

interface DuplicateGroup {
    files: Array<{
        key: string;
        url: string;
        size: number;
        lastModified: string;
        filename: string;
    }>;
    totalSize: number;
    count: number;
}

export async function GET(request: NextRequest) {
    return await detectDuplicates(request);
}

export async function POST(request: NextRequest) {
    return await detectDuplicates(request);
}

async function detectDuplicates(request: NextRequest) {
    try {
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT!,
            region: process.env.CONTABO_REGION!,
            accessKeyId: process.env.CONTABO_ACCESS_KEY_ID!,
            secretAccessKey: process.env.CONTABO_SECRET_ACCESS_KEY!,
            bucketName: process.env.CONTABO_BUCKET_NAME!,
        });

        console.log('🔍 Iniciando detecção de duplicatas...');

        // Buscar todos os arquivos de áudio do Contabo
        const audioFiles = await storage.listAudioFiles();
        console.log(`📁 Encontrados ${audioFiles.length} arquivos de áudio no Contabo`);

        // Agrupar arquivos por nome (sem extensão)
        const fileGroups = new Map<string, Array<{
            key: string;
            url: string;
            size: number;
            lastModified: string;
            filename: string;
        }>>();

        for (const file of audioFiles) {
            // Remover extensão para comparação
            const nameWithoutExt = file.filename.replace(/\.(mp3|wav|flac|m4a|aac|ogg)$/i, '');
            const normalizedName = nameWithoutExt.toLowerCase().trim();

            if (!fileGroups.has(normalizedName)) {
                fileGroups.set(normalizedName, []);
            }
            fileGroups.get(normalizedName)!.push({
                key: file.key,
                url: file.url,
                size: file.size,
                lastModified: file.lastModified,
                filename: file.filename
            });
        }

        // Filtrar apenas grupos com mais de 1 arquivo (duplicatas)
        const duplicateGroups: DuplicateGroup[] = [];
        let totalDuplicates = 0;
        let totalSizeSaved = 0;

        for (const [name, files] of fileGroups.entries()) {
            if (files.length > 1) {
                const totalSize = files.reduce((sum, file) => sum + file.size, 0);
                const largestFile = files.reduce((largest, file) =>
                    file.size > largest.size ? file : largest
                );

                duplicateGroups.push({
                    files: files,
                    totalSize: totalSize,
                    count: files.length
                });

                totalDuplicates += files.length - 1; // -1 porque um arquivo é mantido
                totalSizeSaved += totalSize - largestFile.size; // Tamanho que pode ser economizado
            }
        }

        console.log(`🎯 Encontradas ${duplicateGroups.length} grupos de duplicatas`);
        console.log(`📊 Total de arquivos duplicados: ${totalDuplicates}`);
        console.log(`💾 Espaço que pode ser economizado: ${formatBytes(totalSizeSaved)}`);

        const result = {
            success: true,
            totalFiles: audioFiles.length,
            duplicateGroups: duplicateGroups.length,
            totalDuplicates: totalDuplicates,
            totalSizeSaved: totalSizeSaved,
            duplicates: duplicateGroups,
            summary: {
                totalFiles: audioFiles.length,
                uniqueFiles: audioFiles.length - totalDuplicates,
                duplicateGroups: duplicateGroups.length,
                totalDuplicates: totalDuplicates,
                sizeSaved: totalSizeSaved
            }
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Erro ao detectar duplicatas:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro ao detectar duplicatas',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 