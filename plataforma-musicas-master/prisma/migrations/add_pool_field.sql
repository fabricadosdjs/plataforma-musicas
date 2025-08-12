-- Adicionar campo pool na tabela Track
ALTER TABLE "Track" ADD COLUMN "pool" TEXT DEFAULT 'Nexor Records';

-- Criar índice para melhor performance nas consultas por pool
CREATE INDEX "Track_pool_idx" ON "Track"("pool"); 