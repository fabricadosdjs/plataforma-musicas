const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateYouTubeSchema() {
    try {
        console.log('🔍 Atualizando schema do YouTube Downloader...');

        // Atualizar tabela YouTubeDownload
        await prisma.$executeRaw`
            ALTER TABLE "YouTubeDownload" 
            ADD COLUMN IF NOT EXISTS "isPlaylist" BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS "playlistId" TEXT;
        `;

        console.log('✅ Tabela YouTubeDownload atualizada!');

        // Criar índices para YouTubeDownload
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "YouTubeDownload_playlistId_idx" ON "YouTubeDownload"("playlistId");
        `;

        console.log('✅ Índices da YouTubeDownload criados!');

        // Criar tabela YouTubePlaylist
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "YouTubePlaylist" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "url" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "zipFileName" TEXT NOT NULL,
                "zipFileSize" INTEGER,
                "zipDownloadUrl" TEXT NOT NULL,
                "totalVideos" INTEGER NOT NULL,
                "downloadedVideos" INTEGER NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'processing',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "YouTubePlaylist_pkey" PRIMARY KEY ("id")
            );
        `;

        console.log('✅ Tabela YouTubePlaylist criada!');

        // Criar índices para YouTubePlaylist
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "YouTubePlaylist_userId_idx" ON "YouTubePlaylist"("userId");
        `;

        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "YouTubePlaylist_createdAt_idx" ON "YouTubePlaylist"("createdAt");
        `;

        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS "YouTubePlaylist_expiresAt_idx" ON "YouTubePlaylist"("expiresAt");
        `;

        console.log('✅ Índices da YouTubePlaylist criados!');

        // Adicionar foreign key para YouTubePlaylist
        try {
            await prisma.$executeRaw`
                ALTER TABLE "YouTubePlaylist" ADD CONSTRAINT "YouTubePlaylist_userId_fkey" 
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            `;
            console.log('✅ Foreign key da YouTubePlaylist criada!');
        } catch (error) {
            console.log('⚠️ Foreign key da YouTubePlaylist já existe ou não foi possível criar:', error.message);
        }

        // Adicionar foreign key para YouTubeDownload -> YouTubePlaylist
        try {
            await prisma.$executeRaw`
                ALTER TABLE "YouTubeDownload" ADD CONSTRAINT "YouTubeDownload_playlistId_fkey" 
                FOREIGN KEY ("playlistId") REFERENCES "YouTubePlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            `;
            console.log('✅ Foreign key da YouTubeDownload -> YouTubePlaylist criada!');
        } catch (error) {
            console.log('⚠️ Foreign key da YouTubeDownload -> YouTubePlaylist já existe ou não foi possível criar:', error.message);
        }

        console.log('🎉 Schema do YouTube Downloader atualizado completamente!');

    } catch (error) {
        console.error('❌ Erro ao atualizar schema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateYouTubeSchema();
