/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Download` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Download" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customBenefits" JSONB,
ADD COLUMN     "dataPagamento" TIMESTAMP(3),
ADD COLUMN     "lastWeekReset" TIMESTAMP(3),
ADD COLUMN     "weeklyPackRequests" INTEGER,
ADD COLUMN     "weeklyPlaylistDownloads" INTEGER,
ADD COLUMN     "whatsapp" TEXT;
