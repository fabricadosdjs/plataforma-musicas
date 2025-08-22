-- CreateTable
CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "albumArt" TEXT NOT NULL,
    "description" TEXT,
    "genre" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "trackCount" INTEGER NOT NULL DEFAULT 0,
    "duration" TEXT,
    "label" TEXT,
    "producer" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "exclusive" BOOLEAN NOT NULL DEFAULT false,
    "streaming" JSONB,
    "social" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Release_title_idx" ON "Release"("title");
CREATE INDEX "Release_artist_idx" ON "Release"("artist");
CREATE INDEX "Release_genre_idx" ON "Release"("genre");
CREATE INDEX "Release_releaseDate_idx" ON "Release"("releaseDate");
CREATE INDEX "Release_featured_idx" ON "Release"("featured");
CREATE INDEX "Release_exclusive_idx" ON "Release"("exclusive");
