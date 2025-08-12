const { Client } = require('pg');

// Configuração do banco de dados
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'plataforma_musicas',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
};

// SQL da migração
const MIGRATION_SQL = `
-- Criar tabela DeezerDownload
CREATE TABLE IF NOT EXISTS "DeezerDownload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT '320',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeezerDownload_pkey" PRIMARY KEY ("id")
);

-- Criar índices para DeezerDownload (se não existirem)
CREATE INDEX IF NOT EXISTS "DeezerDownload_userId_idx" ON "DeezerDownload"("userId");
CREATE INDEX IF NOT EXISTS "DeezerDownload_createdAt_idx" ON "DeezerDownload"("createdAt");
CREATE INDEX IF NOT EXISTS "DeezerDownload_expiresAt_idx" ON "DeezerDownload"("expiresAt");

-- Adicionar foreign key (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'DeezerDownload_userId_fkey'
    ) THEN
        ALTER TABLE "DeezerDownload" ADD CONSTRAINT "DeezerDownload_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
`;

async function applyMigration() {
    const client = new Client(DB_CONFIG);

    try {
        console.log('🔗 Conectando ao banco de dados...');
        await client.connect();
        console.log('✅ Conectado com sucesso!');

        console.log('📝 Aplicando migração do Deezer...');

        // Executar migração
        await client.query(MIGRATION_SQL);

        console.log('✅ Migração aplicada com sucesso!');

        // Verificar se as tabelas foram criadas
        console.log('🔍 Verificando estrutura...');

        const userTableCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'User' AND column_name = 'deezerARL'
        `);

        if (userTableCheck.rows.length > 0) {
            console.log('✅ Campo deezerARL adicionado à tabela User');
        } else {
            console.log('❌ Campo deezerARL não encontrado na tabela User');
        }

        const deezerTableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'DeezerDownload'
        `);

        if (deezerTableCheck.rows.length > 0) {
            console.log('✅ Tabela DeezerDownload criada');

            // Verificar estrutura da tabela
            const columns = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'DeezerDownload'
                ORDER BY ordinal_position
            `);

            console.log('📋 Estrutura da tabela DeezerDownload:');
            columns.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
            });

        } else {
            console.log('❌ Tabela DeezerDownload não encontrada');
        }

        // Verificar índices
        const indexes = await client.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'DeezerDownload'
        `);

        console.log('🔍 Índices encontrados:');
        indexes.rows.forEach(idx => {
            console.log(`   - ${idx.indexname}`);
        });

        console.log('\n🎉 Migração concluída com sucesso!');
        console.log('💡 Próximos passos:');
        console.log('   1. Configure um ARL válido do Deezer');
        console.log('   2. Teste a funcionalidade com o script test-deezer-download.cjs');
        console.log('   3. Verifique se os usuários VIP podem acessar a ferramenta');

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        console.error('💡 Verifique:');
        console.error('   - Se o banco de dados está rodando');
        console.error('   - Se as credenciais estão corretas');
        console.error('   - Se você tem permissões para modificar o banco');
    } finally {
        await client.end();
    }
}

// Executar migração
applyMigration().catch(console.error); 