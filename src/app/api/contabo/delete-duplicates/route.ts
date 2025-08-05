// API para excluir arquivos duplicados selecionados do storage do Contabo
import { ContaboStorage } from '@/lib/contabo-storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { filesToDelete } = body;

        console.log('📥 Dados recebidos na API delete-duplicates:', body);

        if (!filesToDelete || !Array.isArray(filesToDelete)) {
            console.error('❌ Lista de arquivos inválida:', filesToDelete);
            return NextResponse.json({
                success: false,
                error: 'Lista de arquivos para excluir é obrigatória'
            }, { status: 400 });
        }

        console.log(`🗑️ Iniciando exclusão de ${filesToDelete.length} arquivos duplicados...`);
        console.log('📋 Arquivos a serem excluídos:', filesToDelete);

        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT!,
            region: process.env.CONTABO_REGION!,
            accessKeyId: process.env.CONTABO_ACCESS_KEY!,
            secretAccessKey: process.env.CONTABO_SECRET_KEY!,
            bucketName: process.env.CONTABO_BUCKET_NAME!,
        });

        const deletedFiles: string[] = [];
        const failedFiles: string[] = [];
        let totalSizeDeleted = 0;

        for (const fileKey of filesToDelete) {
            try {
                console.log(`🗑️ Excluindo arquivo: ${fileKey}`);
                
                // Buscar informações do arquivo antes de excluir
                const fileInfo = await storage.getFileInfo(fileKey);
                if (fileInfo) {
                    totalSizeDeleted += fileInfo.size;
                }

                // Excluir o arquivo
                await storage.deleteFile(fileKey);
                deletedFiles.push(fileKey);
                
                console.log(`✅ Arquivo excluído com sucesso: ${fileKey}`);
            } catch (error) {
                console.error(`❌ Erro ao excluir arquivo ${fileKey}:`, error);
                failedFiles.push(fileKey);
            }
        }

        console.log(`🎯 Exclusão concluída:`);
        console.log(`   ✅ Arquivos excluídos: ${deletedFiles.length}`);
        console.log(`   ❌ Falhas: ${failedFiles.length}`);
        console.log(`   💾 Espaço liberado: ${formatBytes(totalSizeDeleted)}`);

        const result = {
            success: true,
            deletedFiles: deletedFiles.length,
            failedFiles: failedFiles.length,
            totalSizeDeleted: totalSizeDeleted,
            deleted: deletedFiles,
            failed: failedFiles,
            message: `${deletedFiles.length} arquivos excluídos com sucesso${failedFiles.length > 0 ? `, ${failedFiles.length} falhas` : ''}`
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Erro ao excluir duplicatas:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro ao excluir duplicatas',
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