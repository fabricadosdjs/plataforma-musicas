-- Migration para adicionar tabela YouTubeDownload
-- Execute este script no seu banco de dados PostgreSQL

-- Criar tabela YouTubeDownload
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

-- Criar índices
CREATE INDEX IF NOT EXISTS "YouTubeDownload_userId_idx" ON "YouTubeDownload"("userId");
CREATE INDEX IF NOT EXISTS "YouTubeDownload_createdAt_idx" ON "YouTubeDownload"("createdAt");
CREATE INDEX IF NOT EXISTS "YouTubeDownload_expiresAt_idx" ON "YouTubeDownload"("expiresAt");

-- Adicionar foreign key
ALTER TABLE "YouTubeDownload" ADD CONSTRAINT "YouTubeDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
