const bcrypt = require('bcryptjs');

async function testPoseidonHash() {
    try {
        console.log('🔍 Testando hash do usuário poseidomatlas7@gmail.com...');
        
        const storedHash = '$2b$10$nXJ7KTK8iQ7c/CsW8gJVKe.YnIl1nzXyBDqQq9fztf.PhB4Ld1DEa';
        console.log('📋 Hash armazenada:', storedHash);
        
        // Testar com diferentes senhas comuns
        const testPasswords = [
            '123456',
            '123456789',
            'password',
            'admin',
            'poseidomatlas7',
            'poseidomatlas',
            'atlas7',
            'poseidon',
            'teste',
            'test',
            'senha',
            '123',
            '1234',
            '12345',
            '1234567',
            '12345678',
            '1234567890'
        ];
        
        console.log('\n🔐 Testando senhas...');
        
        for (const password of testPasswords) {
            const isValid = await bcrypt.compare(password, storedHash);
            console.log(`📋 "${password}": ${isValid ? '✅ VÁLIDA' : '❌ inválida'}`);
            
            if (isValid) {
                console.log(`\n🎉 SENHA ENCONTRADA!`);
                console.log(`📧 Email: poseidomatlas7@gmail.com`);
                console.log(`🔑 Senha: ${password}`);
                console.log(`\n💡 Use essas credenciais para fazer login`);
                return;
            }
        }
        
        console.log('\n❌ Nenhuma das senhas testadas funcionou');
        console.log('💡 Sugestões:');
        console.log('1. Verifique se a senha não tem espaços extras');
        console.log('2. Verifique se a senha não tem caracteres especiais');
        console.log('3. Tente a senha exata que você definiu no admin');
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

testPoseidonHash();
