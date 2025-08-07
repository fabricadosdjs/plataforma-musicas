-- Adicionar campos para os planos Uploader separados
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderPlanType" VARCHAR(50) DEFAULT 'FREE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderExpirationDate" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderMonthlyFee" DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderBenefits" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "uploaderStatus" VARCHAR(20) DEFAULT 'INACTIVE';

-- Atualizar índice existente
DROP INDEX IF EXISTS "idx_user_uploader";
CREATE INDEX "idx_user_uploader_plans" ON "User"("isUploader", "uploaderPlanType", "uploaderStatus");

-- Comentários para documentação
COMMENT ON COLUMN "User"."uploaderPlanType" IS 'Tipo do plano: FREE, BASIC, PRO, ELITE';
COMMENT ON COLUMN "User"."uploaderExpirationDate" IS 'Data de expiração do plano Uploader';
COMMENT ON COLUMN "User"."uploaderMonthlyFee" IS 'Valor mensal do plano Uploader';
COMMENT ON COLUMN "User"."uploaderStatus" IS 'Status: INACTIVE, ACTIVE, EXPIRED, CANCELLED'; 