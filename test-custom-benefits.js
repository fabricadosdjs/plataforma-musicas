// Script para testar a API de benefícios personalizados
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCustomBenefits() {
    try {
        console.log('🧪 Testando benefícios personalizados...');

        // 1. Verificar se existem usuários no banco
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                customBenefits: true
            },
            take: 3
        });

        console.log('👥 Usuários encontrados:', users.length);
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.id}): ${JSON.stringify(user.customBenefits)}`);
        });

        if (users.length === 0) {
            console.log('❌ Nenhum usuário encontrado para teste');
            return;
        }

        // 2. Testar atualização de benefícios personalizados
        const testUserId = users[0].id;
        const testBenefits = {
            packRequests: {
                limit: 10,
                enabled: true
            },
            playlistDownloads: {
                limit: 15,
                enabled: true
            },
            driveAccess: {
                enabled: true
            }
        };

        console.log(`\n💾 Testando atualização para usuário: ${testUserId}`);
        console.log('📋 Benefícios de teste:', testBenefits);

        const updatedUser = await prisma.user.update({
            where: { id: testUserId },
            data: {
                customBenefits: testBenefits
            },
            select: {
                id: true,
                email: true,
                customBenefits: true
            }
        });

        console.log('✅ Usuário atualizado com sucesso:');
        console.log(`  - ID: ${updatedUser.id}`);
        console.log(`  - Email: ${updatedUser.email}`);
        console.log(`  - Benefícios: ${JSON.stringify(updatedUser.customBenefits, null, 2)}`);

        // 3. Verificar se os dados foram salvos corretamente
        const verifyUser = await prisma.user.findUnique({
            where: { id: testUserId },
            select: {
                id: true,
                email: true,
                customBenefits: true
            }
        });

        console.log('\n🔍 Verificação dos dados salvos:');
        console.log(`  - Benefícios salvos: ${JSON.stringify(verifyUser?.customBenefits, null, 2)}`);

        if (JSON.stringify(verifyUser?.customBenefits) === JSON.stringify(testBenefits)) {
            console.log('✅ Dados salvos corretamente!');
        } else {
            console.log('❌ Dados não foram salvos corretamente');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o teste
testCustomBenefits(); 