import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { contaboStorage } from '@/lib/contabo-storage';

export async function GET(request: NextRequest) {
    try {
        // Verificar se o usuário está autenticado
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário é admin
        const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
        if (!isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Acesso negado' },
                { status: 403 }
            );
        }

        console.log('🔍 Testando configuração do Contabo Storage...');

        // Verificar variáveis de ambiente
        const config = {
            endpoint: process.env.CONTABO_ENDPOINT,
            region: process.env.CONTABO_REGION,
            accessKeyId: process.env.CONTABO_ACCESS_KEY,
            secretAccessKey: process.env.CONTABO_SECRET_KEY,
            bucketName: process.env.CONTABO_BUCKET_NAME,
        };

        console.log('📋 Configuração:', {
            endpoint: config.endpoint ? '✅ Configurado' : '❌ Não configurado',
            region: config.region || 'Não configurado',
            accessKeyId: config.accessKeyId ? '✅ Configurado' : '❌ Não configurado',
            secretAccessKey: config.secretAccessKey ? '✅ Configurado' : '❌ Não configurado',
            bucketName: config.bucketName || 'Não configurado',
        });

        // Testar listagem de arquivos
        console.log('🔄 Testando listagem de arquivos...');
        const files = await contaboStorage.listFiles();
        console.log(`✅ Listagem bem-sucedida! Encontrados ${files.length} arquivos.`);

        // Testar upload de arquivo pequeno
        console.log('📤 Testando upload de arquivo...');
        const testBuffer = Buffer.from('test file content');
        const testKey = `test/admin-test-${Date.now()}.txt`;

        const uploadUrl = await contaboStorage.uploadFile(testKey, testBuffer, 'text/plain');
        console.log('✅ Upload bem-sucedido!');
        console.log('URL:', uploadUrl);

        // Limpar arquivo de teste
        console.log('🗑️ Limpando arquivo de teste...');
        await contaboStorage.deleteFile(testKey);
        console.log('✅ Arquivo de teste removido!');

        return NextResponse.json({
            success: true,
            message: 'Teste do Contabo Storage bem-sucedido!',
            config: {
                endpoint: config.endpoint ? 'Configurado' : 'Não configurado',
                region: config.region || 'Não configurado',
                accessKeyId: config.accessKeyId ? 'Configurado' : 'Não configurado',
                secretAccessKey: config.secretAccessKey ? 'Configurado' : 'Não configurado',
                bucketName: config.bucketName || 'Não configurado',
            },
            testResults: {
                filesCount: files.length,
                uploadSuccess: true,
                uploadUrl: uploadUrl,
                cleanupSuccess: true
            }
        });

    } catch (error) {
        console.error('❌ Erro no teste do Contabo:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro no teste do Contabo Storage',
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
} 