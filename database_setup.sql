-- Script para configurar a tabela de releases
-- Execute este script diretamente no seu banco PostgreSQL

-- 1. Criar a tabela de releases
CREATE TABLE IF NOT EXISTS "Release" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "artist" VARCHAR(255) NOT NULL,
    "albumArt" TEXT NOT NULL,
    "description" TEXT,
    "genre" VARCHAR(100) NOT NULL,
    "releaseDate" TIMESTAMP NOT NULL,
    "trackCount" INTEGER DEFAULT 0,
    "duration" VARCHAR(50),
    "label" VARCHAR(255),
    "producer" VARCHAR(255),
    "featured" BOOLEAN DEFAULT false,
    "exclusive" BOOLEAN DEFAULT false,
    "streaming" JSONB,
    "social" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Adicionar coluna releaseId na tabela Track (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Track' AND column_name = 'releaseId'
    ) THEN
        ALTER TABLE "Track" ADD COLUMN "releaseId" INTEGER;
    END IF;
END $$;

-- 3. Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS "idx_release_artist" ON "Release"("artist");
CREATE INDEX IF NOT EXISTS "idx_release_genre" ON "Release"("genre");
CREATE INDEX IF NOT EXISTS "idx_release_date" ON "Release"("releaseDate");
CREATE INDEX IF NOT EXISTS "idx_track_release" ON "Track"("releaseId");

-- 4. Inserir alguns dados de exemplo
INSERT INTO "Release" (
    "title", "artist", "albumArt", "description", "genre", 
    "releaseDate", "trackCount", "duration", "label", "producer", 
    "featured", "exclusive", "streaming", "social"
) VALUES 
(
    'Summer Vibes 2024',
    'DJ Jéssika Luana',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    'Coletânea de músicas eletrônicas para o verão, com batidas contagiantes e melodias energéticas.',
    'Electronic',
    '2024-01-15',
    12,
    '1:15:30',
    'Plataforma Músicas',
    'DJ Jéssika Luana',
    true,
    false,
    '{"spotify": "https://open.spotify.com/album/example", "deezer": "https://deezer.com/album/example"}',
    '{"instagram": "@djessikaluana", "facebook": "DJ Jéssika Luana"}'
),
(
    'Deep House Collection',
    'Various Artists',
    'https://images.unsplash.com/photo-1511379938545-c1e474798dcd?w=400&h=400&fit=crop',
    'Seleção das melhores músicas deep house da plataforma, perfeita para momentos de relaxamento.',
    'Deep House',
    '2024-01-10',
    8,
    '58:45',
    'Plataforma Músicas',
    'Various',
    false,
    true,
    '{"spotify": "https://open.spotify.com/album/example2", "apple": "https://music.apple.com/album/example2"}',
    '{"website": "https://plataforma-musicas.com"}'
),
(
    'Progressive House Hits',
    'DJ Carlos Silva',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
    'Os maiores sucessos de progressive house, com batidas progressivas e melodias cativantes.',
    'Progressive House',
    '2024-01-05',
    15,
    '1:45:20',
    'Plataforma Músicas',
    'DJ Carlos Silva',
    true,
    false,
    '{"spotify": "https://open.spotify.com/album/example3", "deezer": "https://deezer.com/album/example3"}',
    '{"instagram": "@djcarlossilva", "youtube": "DJ Carlos Silva"}'
),
(
    'Techno Underground',
    'Various Artists',
    'https://images.unsplash.com/photo-1511379938545-c1e474798dcd?w=400&h=400&fit=crop',
    'Coletânea underground de techno, com artistas emergentes e sons experimentais.',
    'Techno',
    '2024-01-01',
    10,
    '1:20:15',
    'Plataforma Músicas',
    'Various',
    false,
    false,
    '{"spotify": "https://open.spotify.com/album/example4"}',
    '{"discord": "https://discord.gg/techno"}'
),
(
    'Trance Classics',
    'DJ Maria Santos',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    'Clássicos do trance que marcaram época, com melodias épicas e batidas energéticas.',
    'Trance',
    '2023-12-20',
    20,
    '2:15:45',
    'Plataforma Músicas',
    'DJ Maria Santos',
    true,
    true,
    '{"spotify": "https://open.spotify.com/album/example5", "deezer": "https://deezer.com/album/example5", "apple": "https://music.apple.com/album/example5"}',
    '{"instagram": "@djmaria", "facebook": "DJ Maria Santos", "youtube": "DJ Maria Santos"}'
);

-- 5. Verificar se tudo foi criado corretamente
SELECT 
    'Releases criados:' as info,
    COUNT(*) as total
FROM "Release";

SELECT 
    'Tracks com release:' as info,
    COUNT(*) as total
FROM "Track" 
WHERE "releaseId" IS NOT NULL;
