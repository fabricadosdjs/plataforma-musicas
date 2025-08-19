-- 🔧 ATUALIZANDO SUPABASE PARA TER ESTRUTURA COMPLETA DO NEON
-- Execute este script no Supabase SQL Editor

-- 1. ADICIONAR COLUNAS NA TABELA User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyPackRequestsUsed" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyPlaylistDownloadsUsed" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deezerPremium" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deezerEmail" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deezerPassword" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isUploader" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dataPrimeiroPagamento" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planName" TEXT;

-- 2. ADICIONAR COLUNAS NA TABELA Track
ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "pool" TEXT;
ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "isCommunity" BOOLEAN DEFAULT false;
ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT;
ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "aiMeta" JSONB;

-- 3. CRIAR TABELAS NOVAS
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

CREATE TABLE IF NOT EXISTS "AdminMessage" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN DEFAULT true,
    "createdBy" TEXT NOT NULL
);

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

-- 4. ADICIONAR COLUNAS NA TABELA Download
ALTER TABLE "Download" ADD COLUMN IF NOT EXISTS "nextAllowedDownload" TIMESTAMP;

-- 5. CRIAR ENUMS
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- 6. VERIFICAR ESTRUTURA
SELECT 'User' as table_name, COUNT(*) as columns FROM information_schema.columns WHERE table_name = 'User'
UNION ALL
SELECT 'Track' as table_name, COUNT(*) as columns FROM information_schema.columns WHERE table_name = 'Track'
UNION ALL
SELECT 'Download' as table_name, COUNT(*) as columns FROM information_schema.columns WHERE table_name = 'Download'
UNION ALL
SELECT 'Like' as table_name, COUNT(*) as columns FROM information_schema.columns WHERE table_name = 'Like';

