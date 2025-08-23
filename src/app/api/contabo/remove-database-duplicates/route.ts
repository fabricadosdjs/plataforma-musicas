// API para remover arquivos do storage que já existem no banco de dados
import { ContaboStorage } from '@/lib/contabo-storage';
import { NextRequest, NextResponse } from 'next/server';

interface RemovalResult {
    key: string;
    filename: string;
    success: boolean;
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { duplicates, confirmRemoval = false } = await request.json();

        if (!Array.isArray(duplicates) || duplicates.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Lista de duplicatas é obrigatória'
            }, { status: 400 });
        }

        if (!confirmRemoval) {
            return NextResponse.json({
                success: false,
                error: 'Confirmação de remoção é obrigatória (confirmRemoval: true)'
            }, { status: 400 });
        }

        console.log(`🗑️ Iniciando remoção de ${duplicates.length} duplicatas do storage...`);

        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT!,
            region: process.env.CONTABO_REGION!,
            accessKeyId: process.env.CONTABO_ACCESS_KEY!,
            secretAccessKey: process.env.CONTABO_SECRET_KEY!,
            bucketName: process.env.CONTABO_BUCKET_NAME!,
        });

        const results: RemovalResult[] = [];
        let successCount = 0;
        let errorCount = 0;
        let totalSizeRemoved = 0;

        // Processar remoções em lotes para evitar sobrecarga
        const batchSize = 10;
        for (let i = 0; i < duplicates.length; i += batchSize) {
            const batch = duplicates.slice(i, i + batchSize);

            const batchPromises = batch.map(async (duplicate: any) => {
                try {
                    const fileKey = duplicate.storageFile.key;
                    const filename = duplicate.storageFile.filename;
                    const fileSize = duplicate.storageFile.size;

                    console.log(`🗑️ Removendo: ${filename} (${fileKey})`);

                    // Tentar remover o arquivo
                    await storage.deleteFile(fileKey);

                    totalSizeRemoved += fileSize;
                    successCount++;

                    return {
                        key: fileKey,
                        filename,
                        success: true
                    };

                } catch (error) {
                    console.error(`❌ Erro ao remover ${duplicate.storageFile.filename}:`, error);
                    errorCount++;

                    return {
                        key: duplicate.storageFile.key,
                        filename: duplicate.storageFile.filename,
                        success: false,
                        error: error instanceof Error ? error.message : 'Erro desconhecido'
                    };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Pequena pausa entre lotes para não sobrecarregar
            if (i + batchSize < duplicates.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`✅ Remoção concluída:`);
        console.log(`   ✅ Sucessos: ${successCount}`);
        console.log(`   ❌ Erros: ${errorCount}`);
        console.log(`   💾 Espaço liberado: ${formatBytes(totalSizeRemoved)}`);

        return NextResponse.json({
            success: true,
            message: `Remoção concluída: ${successCount} sucessos, ${errorCount} erros`,
            results,
            statistics: {
                totalProcessed: duplicates.length,
                successCount,
                errorCount,
                totalSizeRemoved,
                formattedSizeRemoved: formatBytes(totalSizeRemoved)
            }
        });

    } catch (error) {
        console.error('❌ Erro na remoção de duplicatas:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno na remoção de duplicatas',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

