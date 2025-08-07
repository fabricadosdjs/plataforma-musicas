const bcrypt = require('bcryptjs');

async function testSpecificPassword() {
    try {
        console.log('🔍 Testando senha específica...');

        const storedHash = '$2b$10$nXJ7KTK8iQ7c/CsW8gJVKe.YnIl1nzXyBDqQq9fztf.PhB4Ld1DEa';
        console.log('📋 Hash armazenada:', storedHash);

        // Perguntar ao usuário qual senha ele definiu
        console.log('\n💡 Por favor, me diga qual senha você definiu no admin:');
        console.log('📝 Digite a senha exata (sem espaços extras):');

        // Simular entrada do usuário - você pode modificar esta linha
        const userPassword = '123456'; // ⚠️ SUBSTITUA AQUI pela senha que você definiu no admin

        console.log(`\n🔐 Testando senha: "${userPassword}"`);

        const isValid = await bcrypt.compare(userPassword, storedHash);

        if (isValid) {
            console.log('✅ SENHA VÁLIDA!');
            console.log('📧 Email: poseidomatlas7@gmail.com');
            console.log('🔑 Senha:', userPassword);
            console.log('\n💡 Use essas credenciais para fazer login');
        } else {
            console.log('❌ Senha inválida');
            console.log('\n💡 Possíveis problemas:');
            console.log('1. A senha pode ter espaços extras no início ou fim');
            console.log('2. A senha pode ter caracteres especiais');
            console.log('3. A senha pode ter sido digitada diferente');
            console.log('4. Pode ter havido um problema no salvamento');

            // Testar variações da senha
            const variations = [
                userPassword.trim(),
                userPassword.trim().toLowerCase(),
                userPassword.trim().toUpperCase(),
                userPassword.replace(/\s+/g, ''),
                userPassword.replace(/[^\w]/g, '')
            ];

            console.log('\n🔍 Testando variações da senha...');
            for (const variation of variations) {
                if (variation !== userPassword) {
                    const isValidVariation = await bcrypt.compare(variation, storedHash);
                    console.log(`📋 "${variation}": ${isValidVariation ? '✅ VÁLIDA' : '❌ inválida'}`);
                    if (isValidVariation) {
                        console.log(`\n🎉 VARIAÇÃO ENCONTRADA!`);
                        console.log(`📧 Email: poseidomatlas7@gmail.com`);
                        console.log(`🔑 Senha: ${variation}`);
                        return;
                    }
                }
            }
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

testSpecificPassword();
