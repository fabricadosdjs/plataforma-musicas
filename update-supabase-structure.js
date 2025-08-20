import { PrismaClient } from '@prisma/client';

async function updateSupabaseStructure() {
    try {
        console.log('🔧 ATUALIZANDO ESTRUTURA DO SUPABASE...');

        const prisma = new PrismaClient();

        try {
            await prisma.$connect();
            console.log('✅ Conectado ao Supabase!');

            // 1. ADICIONAR COLUNAS NA TABELA User
            console.log('\n👥 Adicionando colunas na tabela User...');

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyPackRequestsUsed" INTEGER DEFAULT 0;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyPlaylistDownloadsUsed" INTEGER DEFAULT 0;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deezerPremium" BOOLEAN DEFAULT false;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deezerEmail" TEXT;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deezerPassword" TEXT;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isUploader" BOOLEAN DEFAULT false;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dataPrimeiroPagamento" TIMESTAMP;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planName" TEXT;
      `);

            console.log('✅ Colunas adicionadas na tabela User!');

            // 2. ADICIONAR COLUNAS NA TABELA Track
            console.log('\n🎵 Adicionando colunas na tabela Track...');

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "pool" TEXT;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "isCommunity" BOOLEAN DEFAULT false;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT;
      `);

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "aiMeta" JSONB;
      `);

            console.log('✅ Colunas adicionadas na tabela Track!');

            // 3. CRIAR TABELAS NOVAS
            console.log('\n🏗️ Criando tabelas novas...');

            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Request" (
          "id" TEXT NOT NULL,
          "songName" TEXT NOT NULL,
          "artist" TEXT NOT NULL,
          "genre" TEXT,
          "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "requestedBy" TEXT NOT NULL,
          "requestedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "notes" TEXT,
          "estimatedCompletion" TIMESTAMP,
          "completedAt" TIMESTAMP,
          "completedBy" TEXT,
          "trackId" INTEGER,
          CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
        );
      `);

            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Play" (
          "id" SERIAL PRIMARY KEY,
          "trackId" INTEGER NOT NULL,
          "userId" TEXT,
          "duration" INTEGER,
          "completed" BOOLEAN DEFAULT false,
          "deviceInfo" TEXT,
          "ipAddress" TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AdminMessage" (
          "id" SERIAL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "isActive" BOOLEAN DEFAULT true,
          "createdBy" TEXT NOT NULL
        );
      `);

            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CustomItem" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "type" TEXT NOT NULL,
          "isActive" BOOLEAN DEFAULT true,
          "icon" TEXT,
          "color" TEXT,
          "order" INTEGER NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "createdBy" TEXT NOT NULL
        );
      `);

            console.log('✅ Tabelas novas criadas!');

            // 4. ADICIONAR COLUNAS NA TABELA Download
            console.log('\n⬇️ Adicionando colunas na tabela Download...');

            await prisma.$executeRawUnsafe(`
        ALTER TABLE "Download" ADD COLUMN IF NOT EXISTS "nextAllowedDownload" TIMESTAMP;
      `);

            console.log('✅ Colunas adicionadas na tabela Download!');

            // 5. VERIFICAR ESTRUTURA
            console.log('\n🔍 Verificando estrutura atualizada...');

            const userColumns = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name = 'User';
      `);

            const trackColumns = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name = 'Track';
      `);

            const downloadColumns = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name = 'Download';
      `);

            const likeColumns = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name = 'Like';
      `);

            console.log(`📊 Colunas na tabela User: ${userColumns[0].count}`);
            console.log(`📊 Colunas na tabela Track: ${trackColumns[0].count}`);
            console.log(`📊 Colunas na tabela Download: ${downloadColumns[0].count}`);
            console.log(`📊 Colunas na tabela Like: ${likeColumns[0].count}`);

            console.log('\n🎉 ESTRUTURA DO SUPABASE ATUALIZADA COM SUCESSO!');
            console.log('💡 Agora você pode executar a migração de dados!');

        } catch (error) {
            console.log('❌ Erro durante a atualização:', error.message);
        } finally {
            await prisma.$disconnect();
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

updateSupabaseStructure();



