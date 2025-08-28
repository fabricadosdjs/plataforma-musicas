-- ============================================
-- COMANDO SIMPLES PARA REMOVER TRACKS
-- ============================================
-- Execute este comando diretamente no seu banco

-- REMOVER AS 3 TRACKS ESPECÍFICAS DO FOLDER 90's EXTENDED & CLUB SERIES
DELETE FROM "Track" 
WHERE folder = '90''s EXTENDED & CLUB SERIES'
AND (
    ("songName" = 'BARBIE GIRL' AND artist = 'AQUA' AND "version" = 'EXTENDED VERSION')
    OR ("songName" = 'AYLA PART II' AND artist = 'AYLA' AND "version" = 'EXTENDED MIX')
    OR ("songName" = 'SEVEN DAYS AND ONE WEEK' AND artist = 'B.B.E.' AND "version" = 'CLUB MIX')
);

-- VERIFICAR SE FORAM REMOVIDAS
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Tracks removidas com sucesso!'
        ELSE '⚠️ Ainda existem ' || COUNT(*) || ' tracks'
    END as status
FROM "Track" 
WHERE folder = '90''s EXTENDED & CLUB SERIES'
AND (
    ("songName" = 'BARBIE GIRL' AND artist = 'AQUA' AND "version" = 'EXTENDED VERSION')
    OR ("songName" = 'AYLA PART II' AND artist = 'AYLA' AND "version" = 'EXTENDED MIX')
    OR ("songName" = 'SEVEN DAYS AND ONE WEEK' AND artist = 'B.B.E.' AND "version" = 'CLUB MIX')
);
