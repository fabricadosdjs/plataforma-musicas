const fs = require('fs');
const { execSync } = require('child_process');

async function setupSupabase() {
    try {
        console.log('🔧 Configurando Prisma para Supabase...');

        // 1. Atualizar o schema do Prisma para usar o Supabase
        const schemaPath = 'prisma/schema.prisma';
        let schemaContent = fs.readFileSync(schemaPath, 'utf8');

        // Substituir a URL do banco
        schemaContent = schemaContent.replace(
            /url\s*=\s*env\("DATABASE_URL"\)/,
            'url = "postgresql://postgres:Hu3AhxdGya01q8dX@db.viffcgeoqtkovryrbalu.supabase.co:5432/postgres"'
        );

        fs.writeFileSync(schemaPath, schemaContent);
        console.log('✅ Schema do Prisma atualizado para Supabase');

        // 2. Gerar cliente Prisma
        console.log('📦 Gerando cliente Prisma...');
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✅ Cliente Prisma gerado');

        // 3. Fazer push do schema para o Supabase
        console.log('🚀 Fazendo push do schema para Supabase...');
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('✅ Schema enviado para Supabase');

        console.log('\n🎉 Configuração do Supabase concluída!');
        console.log('📝 Agora você pode executar a migração de dados');

    } catch (error) {
        console.error('❌ Erro na configuração:', error.message);
    }
}

setupSupabase();
