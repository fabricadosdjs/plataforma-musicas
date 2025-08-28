-- ============================================
-- SCRIPT PARA REMOVER TRACKS ESPECÍFICAS
-- ============================================
-- Folder: 90's EXTENDED & CLUB SERIES
-- Data: 2024-12-19
-- ============================================

-- 1. VERIFICAR AS TRACKS ANTES DE REMOVER
-- ============================================
SELECT 
    id,
    "songName",
    artist,
    folder,
    "createdAt"
FROM "Track" 
WHERE folder = '90''s EXTENDED & CLUB SERIES'
AND (
    ("songName" = 'BARBIE GIRL' AND artist = 'AQUA' AND "version" = 'EXTENDED VERSION')
    OR ("songName" = 'AYLA PART II' AND artist = 'AYLA' AND "version" = 'EXTENDED MIX')
    OR ("songName" = 'SEVEN DAYS AND ONE WEEK' AND artist = 'B.B.E.' AND "version" = 'CLUB MIX')
);

-- 2. VERIFICAR SE EXISTEM DOWNLOADS/LIKES RELACIONADOS
-- ============================================
SELECT 
    t.id,
    t."songName",
    t.artist,
    COUNT(d.id) as download_count,
    COUNT(l.id) as like_count
FROM "Track" t
LEFT JOIN "Download" d ON t.id = d."trackId"
LEFT JOIN "Like" l ON t.id = l."trackId"
WHERE t.folder = '90''s EXTENDED & CLUB SERIES'
AND (
    (t."songName" = 'BARBIE GIRL' AND t.artist = 'AQUA' AND t."version" = 'EXTENDED VERSION')
    OR (t."songName" = 'AYLA PART II' AND t.artist = 'AYLA' AND t."version" = 'EXTENDED MIX')
    OR (t."songName" = 'SEVEN DAYS AND ONE WEEK' AND t.artist = 'B.B.E.' AND t."version" = 'CLUB MIX')
)
GROUP BY t.id, t."songName", t.artist;

-- 3. REMOVER DOWNLOADS RELACIONADOS (CASCADE)
-- ============================================
DELETE FROM "Download" 
WHERE "trackId" IN (
    SELECT id FROM "Track" 
    WHERE folder = '90''s EXTENDED & CLUB SERIES'
    AND (
        ("songName" = 'BARBIE GIRL' AND artist = 'AQUA' AND "version" = 'EXTENDED VERSION')
        OR ("songName" = 'AYLA PART II' AND artist = 'AYLA' AND "version" = 'EXTENDED MIX')
        OR ("songName" = 'SEVEN DAYS AND ONE WEEK' AND artist = 'B.B.E.' AND "version" = 'CLUB MIX')
    )
);

-- 4. REMOVER LIKES RELACIONADOS (CASCADE)
-- ============================================
DELETE FROM "Like" 
WHERE "trackId" IN (
    SELECT id FROM "Track" 
    WHERE folder = '90''s EXTENDED & CLUB SERIES'
    AND (
        ("songName" = 'BARBIE GIRL' AND artist = 'AQUA' AND "version" = 'EXTENDED VERSION')
        OR ("songName" = 'AYLA PART II' AND artist = 'AYLA' AND "version" = 'EXTENDED MIX')
        OR ("songName" = 'SEVEN DAYS AND ONE WEEK' AND artist = 'B.B.E.' AND "version" = 'CLUB MIX')
    )
);

-- 5. REMOVER AS TRACKS PRINCIPAIS
-- ============================================
DELETE FROM "Track" 
WHERE folder = '90''s EXTENDED & CLUB SERIES'
AND (
    ("songName" = 'BARBIE GIRL' AND artist = 'AQUA' AND "version" = 'EXTENDED VERSION')
    OR ("songName" = 'AYLA PART II' AND artist = 'AYLA' AND "version" = 'EXTENDED MIX')
    OR ("songName" = 'SEVEN DAYS AND ONE WEEK' AND artist = 'B.B.E.' AND "version" = 'CLUB MIX')
);

-- 6. VERIFICAR SE AS REMOÇÕES FORAM BEM-SUCEDIDAS
-- ============================================
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Todas as tracks foram removidas com sucesso!'
        ELSE '⚠️ Ainda existem ' || COUNT(*) || ' tracks para remover'
    END as removal_status
FROM "Track" 
WHERE folder = '90''s EXTENDED & CLUB SERIES'
AND (
    ("songName" = 'BARBIE GIRL' AND artist = 'AQUA' AND "version" = 'EXTENDED VERSION')
    OR ("songName" = 'AYLA PART II' AND artist = 'AYLA' AND "version" = 'EXTENDED MIX')
    OR ("songName" = 'SEVEN DAYS AND ONE WEEK' AND artist = 'B.B.E.' AND "version" = 'CLUB MIX')
);

-- 7. VERIFICAR O TOTAL DE TRACKS RESTANTES NO FOLDER
-- ============================================
SELECT 
    COUNT(*) as total_tracks_remaining,
    '90''s EXTENDED & CLUB SERIES' as folder_name
FROM "Track" 
WHERE folder = '90''s EXTENDED & CLUB SERIES';

-- ============================================
-- RESUMO DAS OPERAÇÕES
-- ============================================
-- ✅ Downloads relacionados removidos
-- ✅ Likes relacionados removidos  
-- ✅ Tracks principais removidas
-- ✅ Verificação de integridade realizada
-- ============================================
