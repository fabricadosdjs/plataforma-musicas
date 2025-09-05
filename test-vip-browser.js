// Teste para verificar o status VIP no navegador
// Execute este código no console do navegador

console.log('🔍 Verificando status VIP no navegador...');

// Verificar se há uma sessão ativa
fetch('/api/auth/session')
    .then(response => response.json())
    .then(data => {
        console.log('📋 Dados da sessão:', data);

        if (data.user) {
            const user = data.user;
            console.log('👤 Análise do usuário:');
            console.log('  - Email:', user.email);
            console.log('  - Nome:', user.name);
            console.log('  - is_vip:', user.is_vip);
            console.log('  - isAdmin:', user.isAdmin);
            console.log('  - plan:', user.plan);
            console.log('  - valor:', user.valor);
            console.log('  - vencimento:', user.vencimento);

            // Verificar se é admin
            const isAdmin = user.email === 'edersonleonardo@nexorrecords.com.br';
            console.log('  - É admin?', isAdmin);

            // Verificar se é VIP
            const isVip = user.is_vip;
            console.log('  - É VIP?', isVip);

            // Verificar se pode usar o player
            const canUsePlayer = isVip || isAdmin;
            console.log('  - Pode usar player?', canUsePlayer);

            if (!canUsePlayer) {
                console.log('❌ PROBLEMA: Usuário não pode usar o player!');
                console.log('   - Não é VIP e não é admin');
                console.log('   - Isso pode estar causando problemas no player');
            } else {
                console.log('✅ Usuário pode usar o player normalmente');
            }
        } else {
            console.log('❌ Nenhum usuário na sessão');
        }
    })
    .catch(error => {
        console.log('❌ Erro:', error);
    });
