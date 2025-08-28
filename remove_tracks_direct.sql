-- COMANDO DIRETO PARA REMOVER AS 3 TRACKS
-- Execute este comando diretamente no seu banco PostgreSQL

DELETE FROM "Track" 
WHERE folder = '90''s EXTENDED & CLUB SERIES'
AND (
    ("songName" = 'BARBIE GIRL' AND artist = 'AQUA' AND "version" = 'EXTENDED VERSION')
    OR ("songName" = 'AYLA PART II' AND artist = 'AYLA' AND "version" = 'EXTENDED MIX')
    OR ("songName" = 'SEVEN DAYS AND ONE WEEK' AND artist = 'B.B.E.' AND "version" = 'CLUB MIX')
);
