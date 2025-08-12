-- Add Deezer Premium fields to User table
ALTER TABLE "User" ADD COLUMN "deezerPremium" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "deezerEmail" TEXT;
ALTER TABLE "User" ADD COLUMN "deezerPassword" TEXT; 