const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createYouTubeDownloadsTable() {
    try {
        console.log('🔍 Verificando se a tabela YouTubeDownload existe...');
        
        // Tentar criar a tabela usando SQL direto
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "YouTubeDownload" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "url" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "fileName" TEXT NOT NULL,
                "fileSize" INTEGER,
                "downloadUrl" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "YouTubeDownload_pkey" PRIMARY KEY ("id")
            );
        `;
        
        console.log('✅ Tabela YouTubeDownload criada com sucesso!');
        
        // Criar índices
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "YouTubeDownload_userId_idx" ON "YouTubeDownload"("userId");
        `;
        
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "YouTubeDownload_createdAt_idx" ON "YouTubeDownload"("createdAt");
        `;
        
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "YouTubeDownload_expiresAt_idx" ON "YouTubeDownload"("expiresAt");
        `;
        
        console.log('✅ Índices criados com sucesso!');
        
        // Adicionar foreign key
        try {
            await prisma.$executeRaw`
                ALTER TABLE "YouTubeDownload" ADD CONSTRAINT "YouTubeDownload_userId_fkey" 
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            `;
            console.log('✅ Foreign key criada com sucesso!');
        } catch (error) {
            console.log('⚠️ Foreign key já existe ou não foi possível criar:', error.message);
        }
        
        console.log('🎉 Tabela YouTubeDownload configurada completamente!');
        
    } catch (error) {
        console.error('❌ Erro ao criar tabela:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createYouTubeDownloadsTable();
