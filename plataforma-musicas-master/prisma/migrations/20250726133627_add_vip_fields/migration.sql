-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_vip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT DEFAULT 'ativo',
ADD COLUMN     "valor" DOUBLE PRECISION,
ADD COLUMN     "vencimento" TIMESTAMP(3);
