-- Migration: Add credit system fields
-- This migration adds credit system fields to existing users without losing data

-- Add credit system columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "credits" INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS "lastCreditReset" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "totalCreditsUsed" INTEGER DEFAULT 0;

-- Update existing users to have initial credits if they don't have them
UPDATE "User" 
SET 
    "credits" = 10000,
    "lastCreditReset" = NOW(),
    "totalCreditsUsed" = 0
WHERE "credits" IS NULL;
