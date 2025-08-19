const fs = require('fs');
const path = require('path');

async function configureEnvironment() {
    try {
        console.log('🔧 Configurando variáveis de ambiente para Supabase...');

        const envContent = `# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.viffcgeoqtkovryrbalu:Hu3AhxdGya01q8dX@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.viffcgeoqtkovryrbalu:Hu3AhxdGya01q8dX@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
`;

        // Criar arquivo .env
        fs.writeFileSync('.env', envContent);
        console.log('✅ Arquivo .env criado com as URLs do Supabase');

        // Verificar se o arquivo foi criado
        if (fs.existsSync('.env')) {
            const content = fs.readFileSync('.env', 'utf8');
            console.log('📝 Conteúdo do .env:');
            console.log(content);
        }

        console.log('\n🎉 Configuração de ambiente concluída!');
        console.log('📝 Agora você pode executar: npx prisma generate');

    } catch (error) {
        console.error('❌ Erro na configuração:', error.message);
    }
}

// Executar configuração
configureEnvironment();
