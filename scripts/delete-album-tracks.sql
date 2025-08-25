-- Script para deletar todas as músicas do álbum "250 Prime Change Ahead"
-- Execute este script com cuidado, pois não pode ser desfeito!

-- 1. Primeiro, vamos ver quantas músicas existem deste álbum
SELECT COUNT(*) as total_musicas FROM "Track" 
WHERE "artist" LIKE '%DJ LOADED%' 
AND "songName" LIKE '%250 PRIME CHANGE AHEAD%';

-- 2. Verificar algumas músicas antes de deletar (opcional)
SELECT id, "songName", "artist", "style", "downloadUrl" 
FROM "Track" 
WHERE "artist" LIKE '%DJ LOADED%' 
AND "songName" LIKE '%250 PRIME CHANGE AHEAD%'
LIMIT 10;

-- 3. DELETAR todas as músicas do álbum (DESCOMENTE A LINHA ABAIXO PARA EXECUTAR)
-- DELETE FROM "Track" 
-- WHERE "artist" LIKE '%DJ LOADED%' 
-- AND "songName" LIKE '%250 PRIME CHANGE AHEAD%';

-- 4. Verificar se foram deletadas (execute após o DELETE)
-- SELECT COUNT(*) as musicas_restantes FROM "Track" 
-- WHERE "artist" LIKE '%DJ LOADED%' 
-- AND "songName" LIKE '%250 PRIME CHANGE AHEAD%';

-- 5. Limpar cache e resetar contadores (opcional)
-- VACUUM ANALYZE;


