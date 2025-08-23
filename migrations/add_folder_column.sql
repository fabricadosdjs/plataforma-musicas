-- Migração para adicionar a coluna FOLDER na tabela Track
-- Esta coluna permitirá organizar músicas por pasta/álbum no servidor

-- Adicionar a coluna folder na tabela Track
ALTER TABLE "Track" ADD COLUMN folder VARCHAR(255);

-- Adicionar comentário explicativo
COMMENT ON COLUMN "Track".folder IS 'Coluna para organizar músicas por pasta/álbum no servidor';

-- Criar índice para melhorar performance de consultas por folder
CREATE INDEX idx_track_folder ON "Track"(folder);

-- Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Track' AND column_name = 'folder';
