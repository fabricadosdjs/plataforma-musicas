-- ============================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS
-- ============================================

-- Conectar ao banco de dados
\c neondb;

-- ============================================
-- 1. CRIAR TABELA DEEZERDOWNLOAD
-- ============================================

CREATE TABLE IF NOT EXISTS "DeezerDownload" (
    "id" SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "trackId" BIGINT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT '128',
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "downloadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed'
);

-- ============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS "DeezerDownload_userId_idx" ON "DeezerDownload"("userId");
CREATE INDEX IF NOT EXISTS "DeezerDownload_downloadDate_idx" ON "DeezerDownload"("downloadDate");
CREATE INDEX IF NOT EXISTS "DeezerDownload_expiresAt_idx" ON "DeezerDownload"("expiresAt");
CREATE INDEX IF NOT EXISTS "DeezerDownload_trackId_idx" ON "DeezerDownload"("trackId");

-- ============================================
-- 3. VERIFICAR TABELAS EXISTENTES
-- ============================================

-- Verificar se a tabela User existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') 
        THEN '✅ Tabela User existe'
        ELSE '❌ Tabela User não existe'
    END as user_table_status;

-- Verificar se a tabela Track existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Track') 
        THEN '✅ Tabela Track existe'
        ELSE '❌ Tabela Track não existe'
    END as track_table_status;

-- Verificar se a tabela DeezerDownload foi criada
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'DeezerDownload') 
        THEN '✅ Tabela DeezerDownload criada com sucesso'
        ELSE '❌ Tabela DeezerDownload não foi criada'
    END as deezer_table_status;

-- ============================================
-- 4. CONTAR REGISTROS NAS TABELAS
-- ============================================

-- Contar usuários
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') 
        THEN (SELECT COUNT(*) FROM "User")::TEXT
        ELSE 'Tabela não existe'
    END as user_count;

-- Contar músicas
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Track') 
        THEN (SELECT COUNT(*) FROM "Track")::TEXT
        ELSE 'Tabela não existe'
    END as track_count;

-- Contar downloads do Deezer
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'DeezerDownload') 
        THEN (SELECT COUNT(*) FROM "DeezerDownload")::TEXT
        ELSE 'Tabela não existe'
    END as deezer_download_count;

-- ============================================
-- 5. VERIFICAR USUÁRIOS VIP
-- ============================================

-- Listar usuários VIP
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') 
        THEN (
            SELECT COUNT(*) 
            FROM "User" 
            WHERE "is_vip" = true
        )::TEXT
        ELSE 'Tabela não existe'
    END as vip_user_count;

-- ============================================
-- 6. INSERIR DADOS DE TESTE (OPCIONAL)
-- ============================================

-- Inserir um download de teste se a tabela existir
INSERT INTO "DeezerDownload" (
    "userId", 
    "url", 
    "title", 
    "artist", 
    "trackId", 
    "quality", 
    "fileName", 
    "filePath", 
    "fileSize", 
    "expiresAt"
) VALUES (
    'test-user-id',
    'https://www.deezer.com/br/track/123456789',
    'Música de Teste',
    'Artista de Teste',
    123456789,
    '128',
    'teste_musica.mp3',
    '/downloads/teste_musica.mp3',
    1024,
    CURRENT_TIMESTAMP + INTERVAL '5 days'
) ON CONFLICT DO NOTHING;

-- ============================================
-- 7. VERIFICAR ESTRUTURA FINAL
-- ============================================

-- Mostrar estrutura da tabela DeezerDownload
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'DeezerDownload'
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO FINAL
-- ============================================

SELECT 
    '🎉 CONFIGURAÇÃO DO BANCO CONCLUÍDA' as status,
    CURRENT_TIMESTAMP as timestamp;
