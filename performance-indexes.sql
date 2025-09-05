-- Índices otimizados para melhorar performance das queries

-- Índice composto para a query principal de /new (ordenação por releaseDate + createdAt)
CREATE INDEX IF NOT EXISTS idx_track_release_created_desc 
ON "Track" ("releaseDate" DESC, "createdAt" DESC) 
WHERE "releaseDate" IS NOT NULL;

-- Índice para style (usado na query de estilos mais baixados)
CREATE INDEX IF NOT EXISTS idx_track_style 
ON "Track" ("style") 
WHERE "style" IS NOT NULL AND "style" != 'N/A';

-- Índice para folder (usado na query de folders recentes)
CREATE INDEX IF NOT EXISTS idx_track_folder_updated 
ON "Track" ("folder", "updatedAt" DESC) 
WHERE "folder" IS NOT NULL;

-- Índice para downloads por trackId (usado nas joins)
CREATE INDEX IF NOT EXISTS idx_download_trackid 
ON "Download" ("trackId");

-- Índice para updatedAt (usado para ordenação de folders)
CREATE INDEX IF NOT EXISTS idx_track_updated_desc 
ON "Track" ("updatedAt" DESC);

-- Índice composto para imageUrl não nula
CREATE INDEX IF NOT EXISTS idx_track_folder_image 
ON "Track" ("folder", "imageUrl") 
WHERE "folder" IS NOT NULL AND "imageUrl" IS NOT NULL;

-- Análise das tabelas para otimizar o query planner
ANALYZE "Track";
ANALYZE "Download";

-- Verificar estatísticas dos índices
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as "Index Scans",
    idx_tup_read as "Tuples Read",
    idx_tup_fetch as "Tuples Fetched"
FROM pg_stat_user_indexes 
WHERE tablename IN ('Track', 'Download')
ORDER BY idx_scan DESC;

-- Verificar tamanho dos índices
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelname::regclass)) as "Index Size"
FROM pg_stat_user_indexes 
WHERE tablename IN ('Track', 'Download')
ORDER BY pg_relation_size(indexrelname::regclass) DESC;
