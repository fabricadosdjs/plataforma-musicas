// Script para reiniciar e verificar conexão com banco
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function restartDatabase() {
    console.log('🔧 Reiniciando conexão com banco de dados...\n');

    try {
        // 1. Desconectar instâncias existentes
        console.log('1️⃣ Desconectando instâncias existentes...');
        await prisma.$disconnect();

        // 2. Aguardar um momento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Tentar conectar novamente
        console.log('2️⃣ Reconectando ao banco...');
        await prisma.$connect();

        // 4. Testar conectividade
        console.log('3️⃣ Testando conectividade...');
        const result = await prisma.$executeRaw`SELECT 1 as test`;
        console.log('✅ Teste de conectividade passou:', result);

        // 5. Verificar se as tabelas existem
        console.log('4️⃣ Verificando tabelas...');
        const trackCount = await prisma.track.count();
        const userCount = await prisma.user.count();

        console.log(`📊 Tracks no banco: ${trackCount}`);
        console.log(`👥 Usuários no banco: ${userCount}`);

        // 6. Teste de escrita (criar usuário temporário)
        console.log('5️⃣ Testando escrita no banco...');

        const testUserId = `test-${Date.now()}`;

        try {
            const testUser = await prisma.user.create({
                data: {
                    id: testUserId,
                    email: 'test@example.com',
                    name: 'Test User',
                    dailyDownloadCount: 0,
                    lastDownloadReset: new Date(),
                }
            });

            console.log('✅ Escrita funcionando - usuário teste criado');

            // Remover usuário teste
            await prisma.user.delete({
                where: { id: testUserId }
            });

            console.log('✅ Limpeza concluída - usuário teste removido');

        } catch (writeError) {
            console.error('❌ Erro na escrita:', writeError);
        }

        console.log('\n🎉 REINICIALIZAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('💡 O banco de dados está funcionando normalmente.');

    } catch (error) {
        console.error('\n❌ ERRO NA REINICIALIZAÇÃO:', error);
        console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verificar se PostgreSQL está rodando');
        console.log('2. Verificar DATABASE_URL no .env.local');
        console.log('3. Executar: npx prisma db push');
        console.log('4. Verificar firewall/portas');
        console.log('5. Reiniciar PostgreSQL service');

        // Mostrar configuração atual
        console.log('\n📋 CONFIGURAÇÃO ATUAL:');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : '❌ Não definida');

    } finally {
        await prisma.$disconnect();
    }
}

restartDatabase();
