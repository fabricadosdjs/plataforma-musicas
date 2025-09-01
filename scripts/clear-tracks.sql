-- Script SQL para remover TODAS as músicas do banco de dados
-- ⚠️ ATENÇÃO: Este script é DESTRUTIVO e irá remover TODAS as músicas!
-- 
-- Uso:
-- 1. Conecte ao banco PostgreSQL
-- 2. Execute: \i scripts/clear-tracks.sql
-- 
-- OU execute diretamente:
-- psql -d SEU_BANCO -f scripts/clear-tracks.sql

-- Verificar o total de músicas antes da remoção
SELECT 
    'ANTES DA REMOÇÃO' as status,
    COUNT(*) as total_musicas,
    COUNT(DISTINCT artist) as total_artistas,
    COUNT(DISTINCT genre) as total_generos
FROM track;

-- Mostrar algumas estatísticas por gênero
SELECT 
    genre,
    COUNT(*) as quantidade
FROM track 
GROUP BY genre 
ORDER BY quantidade DESC 
LIMIT 10;

-- Mostrar algumas estatísticas por artista
SELECT 
    artist,
    COUNT(*) as quantidade
FROM track 
GROUP BY artist 
ORDER BY quantidade DESC 
LIMIT 10;

-- CONFIRMAÇÃO: Descomente a linha abaixo para executar a remoção
-- DELETE FROM track;

-- Verificar se as músicas foram removidas
SELECT 
    'APÓS A REMOÇÃO' as status,
    COUNT(*) as total_musicas
FROM track;

-- Verificar se há outras tabelas relacionadas que podem ter dados
SELECT 
    'VERIFICAÇÃO DE TABELAS RELACIONADAS' as info,
    schemaname,
    tablename,
    n_tup_ins as registros_inseridos
FROM pg_stat_user_tables 
WHERE tablename LIKE '%track%' 
   OR tablename LIKE '%music%' 
   OR tablename LIKE '%song%'
ORDER BY n_tup_ins DESC;

-- Comentário: Se você quiser executar a remoção, descomente a linha DELETE acima
-- e execute novamente este script.
