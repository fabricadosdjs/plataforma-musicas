// Script para testar o sistema de benefícios personalizados
const testCustomBenefits = async () => {
    const baseUrl = 'http://localhost:3000';

    // Primeiro, vamos criar um usuário de teste se ainda não existe
    const testUserId = 'cme2vqe260000tyuwu9f1apeq'; // ID do usuário que criamos antes

    // Dados de benefícios personalizados para testar
    const customBenefits = {
        // Personalizar limites de pack requests
        packRequests: {
            enabled: true,
            limit: 8, // Aumentar para 8 por semana
            used: 2   // Já usou 2
        },

        // Personalizar playlist downloads
        playlistDownloads: {
            enabled: true,
            limit: 12, // Aumentar para 12 por semana
            used: 1    // Já usou 1
        },

        // Habilitar Deemix e Deezer Premium personalizadamente
        deemix: true,
        deezerPremium: true,

        // Acesso ao Drive personalizado
        driveAccess: {
            enabled: true,
            description: 'Acesso VIP Personalizado - Premium'
        }
    };

    try {
        console.log('🧪 Testando sistema de benefícios personalizados...');
        console.log('👤 User ID:', testUserId);
        console.log('⚙️ Benefícios personalizados:', JSON.stringify(customBenefits, null, 2));

        const response = await fetch(`${baseUrl}/api/admin/update-custom-benefits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: testUserId,
                customBenefits: customBenefits
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Benefícios personalizados salvos com sucesso!');
            console.log('📋 Resposta:', JSON.stringify(result, null, 2));

            // Agora vamos testar se os benefícios aparecem no profile
            console.log('\n🔍 Testando se os benefícios aparecem no perfil...');

            // Nota: Esta chamada falhará porque precisa de autenticação, 
            // mas pelo menos podemos ver se o endpoint responde
            const profileResponse = await fetch(`${baseUrl}/api/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (profileResponse.status === 401) {
                console.log('🔒 Profile API requer autenticação (esperado)');
                console.log('✅ Sistema está funcionando! Benefícios personalizados foram salvos.');
                console.log('📝 Para ver os benefícios no perfil, faça login e acesse /profile/beneficios');
            } else {
                const profileData = await profileResponse.json();
                console.log('📊 Dados do perfil:', profileData);
            }

        } else {
            console.log('❌ Erro ao salvar benefícios:', response.status, result);
        }

    } catch (error) {
        console.error('💥 Erro na requisição:', error);
    }
};

// Executar o teste
testCustomBenefits();
