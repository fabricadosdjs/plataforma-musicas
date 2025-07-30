// Script para testar a API de benefícios personalizados
import fetch from 'node-fetch';

async function testCustomBenefitsAPI() {
    try {
        console.log('🧪 Testando API de benefícios personalizados...');

        const testData = {
            userId: 'cmdlzbz3d0000ty9g6ld7w6ft', // ID do primeiro usuário do teste anterior
            customBenefits: {
                packRequests: {
                    limit: 8,
                    enabled: true
                },
                playlistDownloads: {
                    limit: 12,
                    enabled: true
                },
                driveAccess: {
                    enabled: true
                },
                individualContent: {
                    enabled: true
                },
                extraPacks: {
                    enabled: true
                },
                deezerPremium: {
                    enabled: true
                },
                deemixDiscount: {
                    enabled: true,
                    percentage: 15
                },
                arlPremium: {
                    enabled: true
                },
                musicProduction: {
                    enabled: false
                }
            }
        };

        console.log('📤 Enviando dados para API:');
        console.log(JSON.stringify(testData, null, 2));

        const response = await fetch('http://localhost:3001/api/admin/update-custom-benefits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log(`📡 Status da resposta: ${response.status}`);
        console.log(`📡 Headers:`, Object.fromEntries(response.headers.entries()));

        const responseData = await response.text();
        console.log('📡 Resposta da API:');
        console.log(responseData);

        if (response.ok) {
            console.log('✅ API funcionando corretamente!');
        } else {
            console.log('❌ Erro na API');
        }

    } catch (error) {
        console.error('❌ Erro ao testar API:', error);
    }
}

// Executar o teste
testCustomBenefitsAPI(); 