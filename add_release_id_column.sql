-- Adicionar coluna releaseId na tabela Track
-- Execute este script diretamente no seu banco PostgreSQL

-- Verificar se a coluna já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Track' AND column_name = 'releaseId'
    ) THEN
        ALTER TABLE "Track" ADD COLUMN "releaseId" INTEGER;
        RAISE NOTICE 'Coluna releaseId adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna releaseId já existe';
    END IF;
END $$;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS "idx_track_release" ON "Track"("releaseId");

-- Verificar se a coluna foi criada
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Track' AND column_name = 'releaseId';
