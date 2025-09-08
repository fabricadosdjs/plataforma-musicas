import { contaboStorage } from '@/lib/contabo-storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || '';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Nenhum arquivo enviado' },
                { status: 400 }
            );
        }

        console.log(`📤 Fazendo upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        // Gera chave única para o arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitiza nome
        const key = folder ? `${folder}/${timestamp}_${fileName}` : `${timestamp}_${fileName}`;

        // Converte arquivo para buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Faz upload para o Contabo
        const url = await contaboStorage.uploadFile(key, buffer, file.type);

        console.log(`✅ Upload concluído: ${url}`);

        return NextResponse.json({
            success: true,
            message: 'Arquivo enviado com sucesso',
            file: {
                key,
                url,
                filename: file.name,
                size: file.size,
                type: file.type,
                isAudio: contaboStorage['isAudioFile'](file.name)
            }
        });

    } catch (error) {
        console.error('❌ Erro no upload:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro durante o upload',
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json(
                { success: false, error: 'Chave do arquivo é obrigatória' },
                { status: 400 }
            );
        }

        console.log(`🗑️ Deletando arquivo: ${key}`);

        await contaboStorage.deleteFile(key);

        console.log(`✅ Arquivo deletado: ${key}`);

        return NextResponse.json({
            success: true,
            message: 'Arquivo deletado com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao deletar:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao deletar arquivo',
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
