-- Script para adicionar campos de tracking de usuário
-- Execute este script no Supabase SQL Editor se o Prisma não conseguir aplicar as mudanças

-- Adicionar campos de tracking semanal
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "packRequestsUsedWeek" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "playlistsUsedWeek" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastWeeklyReset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Adicionar campos de tracking diário
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "downloadsUsedDay" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastDailyReset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Adicionar campos de benefícios customizados
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customBenefits" JSONB;

-- Adicionar campo de senha
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Verificar se os campos foram adicionados
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('packRequestsUsedWeek', 'playlistsUsedWeek', 'lastWeeklyReset', 'downloadsUsedDay', 'lastDailyReset', 'customBenefits', 'password');
