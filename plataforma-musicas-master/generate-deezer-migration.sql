-- Adicionar campo deezerARL à tabela User
ALTER TABLE "User" ADD COLUMN "deezerARL" TEXT;

-- Criar tabela DeezerDownload
CREATE TABLE "DeezerDownload" (
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

-- Criar índices para DeezerDownload
CREATE INDEX "DeezerDownload_userId_idx" ON "DeezerDownload"("userId");
CREATE INDEX "DeezerDownload_createdAt_idx" ON "DeezerDownload"("createdAt");
CREATE INDEX "DeezerDownload_expiresAt_idx" ON "DeezerDownload"("expiresAt");

-- Adicionar foreign key
ALTER TABLE "DeezerDownload" ADD CONSTRAINT "DeezerDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
