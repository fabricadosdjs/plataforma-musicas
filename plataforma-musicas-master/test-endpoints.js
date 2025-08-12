// Script para testar diferentes endpoints da Contabo
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testContaboEndpoints() {
    console.log('🔍 Testando diferentes endpoints da Contabo...\n');

    const endpoints = [
        'https://eu2.contabostorage.com',
        'https://usc1.contabostorage.com',
        'https://eu1.contabostorage.com',
        'https://ap1.contabostorage.com'
    ];

    const regions = ['eu-central-1', 'us-central-1', 'eu-west-1', 'ap-southeast-1'];

    for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        const region = regions[i];

        console.log(`🌐 Testando: ${endpoint} (região: ${region})`);

        try {
            const s3Client = new S3Client({
                endpoint,
                region,
                credentials: {
                    accessKeyId: process.env.CONTABO_ACCESS_KEY || '',
                    secretAccessKey: process.env.CONTABO_SECRET_KEY || ''
                },
                forcePathStyle: true
            });

            const command = new ListBucketsCommand({});
            const response = await s3Client.send(command);

            console.log(`✅ SUCESSO com ${endpoint}!`);
            console.log(`📊 Buckets encontrados: ${response.Buckets?.length || 0}`);

            if (response.Buckets && response.Buckets.length > 0) {
                console.log('📋 Buckets disponíveis:');
                response.Buckets.forEach(bucket => {
                    console.log(`   - ${bucket.Name}`);
                });
            }

            console.log(`✨ Use este endpoint: ${endpoint}`);
            console.log(`✨ Use esta região: ${region}\n`);
            break;

        } catch (error) {
            console.log(`❌ Falhou: ${error.message}\n`);
        }
    }

    console.log('📋 DICAS:');
    console.log('1. Verifique no painel da Contabo qual região você escolheu');
    console.log('2. As credenciais devem ser do tipo "S3 API Keys"');
    console.log('3. O bucket deve existir na região correta');
}

testContaboEndpoints();
