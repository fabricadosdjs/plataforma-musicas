/*
  Warnings:

  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "User_id_key";

-- AlterTable
ALTER TABLE "Download" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deemix" BOOLEAN DEFAULT false,
ADD COLUMN     "isPro" BOOLEAN DEFAULT false,
ADD COLUMN     "password" TEXT,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "dailyDownloadCount" DROP NOT NULL,
ALTER COLUMN "is_vip" DROP NOT NULL,
ALTER COLUMN "weeklyPackRequests" SET DEFAULT 0,
ALTER COLUMN "weeklyPlaylistDownloads" SET DEFAULT 0;
