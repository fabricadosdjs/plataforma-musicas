// Teste simples da conexão Contabo usando fetch diretamente
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testContaboSimple() {
    console.log('🔍 Testando conexão com Contabo Object Storage...\n');

    try {
        // Configuração do cliente S3
        const s3Client = new S3Client({
            endpoint: process.env.CONTABO_ENDPOINT || 'https://eu2.contabostorage.com',
            region: process.env.CONTABO_REGION || 'eu-central-1',
            credentials: {
                accessKeyId: process.env.CONTABO_ACCESS_KEY || '',
                secretAccessKey: process.env.CONTABO_SECRET_KEY || ''
            },
            forcePathStyle: true,
            apiVersion: '2006-03-01'
        });

        const bucketName = process.env.CONTABO_BUCKET_NAME || '';

        console.log('📋 Configuração:');
        console.log(`   Endpoint: ${process.env.CONTABO_ENDPOINT}`);
        console.log(`   Região: ${process.env.CONTABO_REGION}`);
        console.log(`   Bucket: ${bucketName}`);
        console.log(`   Access Key: ${process.env.CONTABO_ACCESS_KEY?.substring(0, 8)}...`);

        // Teste 1: Listar objetos do bucket
        console.log('\n📁 Listando objetos do bucket...');

        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            MaxKeys: 10
        });

        const response = await s3Client.send(command);

        console.log(`✅ Sucesso! Conexão estabelecida!`);
        console.log(`📊 Encontrados ${response.KeyCount || 0} objetos`);

        if (response.Contents && response.Contents.length > 0) {
            console.log('\n📋 Primeiros arquivos encontrados:');
            response.Contents.slice(0, 5).forEach((obj, index) => {
                const sizeKB = (obj.Size / 1024).toFixed(1);
                console.log(`   ${index + 1}. ${obj.Key} (${sizeKB} KB)`);
            });

            // Contar arquivos de áudio
            const audioFiles = response.Contents.filter(obj =>
                obj.Key.match(/\.(mp3|wav|flac|m4a|aac|ogg)$/i)
            );
            console.log(`\n🎵 Arquivos de áudio: ${audioFiles.length}`);
        }

        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('💡 Sua integração com o Contabo está funcionando!');
        console.log('🚀 Próximo passo: Execute "npm run contabo:import" para importar músicas');

    } catch (error) {
        console.error('\n❌ ERRO NA CONEXÃO:', error.message);

        if (error.message.includes('InvalidAccessKeyId')) {
            console.log('\n🔧 PROBLEMA: Access Key inválida');
            console.log('   Verifique se CONTABO_ACCESS_KEY está correto no .env.local');
        } else if (error.message.includes('SignatureDoesNotMatch')) {
            console.log('\n🔧 PROBLEMA: Secret Key inválida');
            console.log('   Verifique se CONTABO_SECRET_KEY está correto no .env.local');
        } else if (error.message.includes('NoSuchBucket')) {
            console.log('\n🔧 PROBLEMA: Bucket não encontrado');
            console.log('   Verifique se CONTABO_BUCKET_NAME está correto no .env.local');
        } else {
            console.log('\n🔧 DICAS PARA RESOLVER:');
            console.log('   1. Verifique todas as credenciais no .env.local');
            console.log('   2. Confirme se o endpoint está correto para sua região');
            console.log('   3. Teste as credenciais no painel da Contabo');
        }
    }
}

testContaboSimple();
