-- Adicionar campos para o plano Uploader
ALTER TABLE "User" ADD COLUMN "isUploader" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "uploaderLevel" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "uploaderExpiration" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "uploaderBenefits" JSONB;
ALTER TABLE "User" ADD COLUMN "uploaderPlan" VARCHAR(50) DEFAULT 'FREE';

-- Adicionar índice para melhor performance
CREATE INDEX "idx_user_uploader" ON "User"("isUploader", "uploaderPlan"); 