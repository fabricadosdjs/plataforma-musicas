-- Adicionar campos para músicas da comunidade
ALTER TABLE "Track" ADD COLUMN "isCommunity" BOOLEAN DEFAULT false;
ALTER TABLE "Track" ADD COLUMN "uploadedBy" TEXT;

-- Adicionar foreign key para uploadedBy
ALTER TABLE "Track" ADD CONSTRAINT "Track_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL; 