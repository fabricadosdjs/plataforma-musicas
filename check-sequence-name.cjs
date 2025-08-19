const { PrismaClient } = require('@prisma/client');

// Carregar variáveis de ambiente
require('dotenv').config();

const prisma = new PrismaClient();

async function checkSequenceName() {
    try {
        console.log('🔍 Verificando nome da sequência de auto-incremento...');

        // Conectar ao banco
        await prisma.$connect();
        console.log('✅ Conexão estabelecida!');

        // Verificar todas as sequências relacionadas à tabela Track
        console.log('📊 Verificando sequências disponíveis...');
        const sequencesResult = await prisma.$queryRaw`
      SELECT sequence_name, data_type, start_value, minimum_value, maximum_value, increment
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name;
    `;
        console.log('🔢 Sequências encontradas:', sequencesResult);

        // Verificar a estrutura da tabela Track
        console.log('📋 Verificando estrutura da tabela Track...');
        const tableResult = await prisma.$queryRaw`
      SELECT column_name, column_default, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = 'Track' AND column_name = 'id'
      ORDER BY ordinal_position;
    `;
        console.log('📊 Coluna ID da tabela Track:', tableResult);

        // Verificar se há constraints na tabela
        console.log('🔒 Verificando constraints da tabela Track...');
        const constraintsResult = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'Track';
    `;
        console.log('🔐 Constraints encontradas:', constraintsResult);

    } catch (error) {
        console.error('❌ Erro durante a verificação:', error);
    } finally {
        await prisma.$disconnect();
        console.log('🔌 Conexão fechada');
    }
}

checkSequenceName();
