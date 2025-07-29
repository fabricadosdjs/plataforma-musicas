// Script para identificar valores inválidos enviados para campos DateTime no endpoint de criação de usuário
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Simula payloads problemáticos para identificar o erro
const testPayloads = [
  { vencimento: '+272025-08-21T03:00:00.000Z', dataPagamento: '+272025-08-21T03:00:00.000Z' },
  { vencimento: { $type: 'DateTime', value: '+272025-08-21T03:00:00.000Z' }, dataPagamento: { $type: 'DateTime', value: '+272025-08-21T03:00:00.000Z' } },
  { vencimento: '2025-08-21', dataPagamento: '2025-08-21' },
  { vencimento: new Date('2025-08-21'), dataPagamento: new Date('2025-08-21') },
  { vencimento: null, dataPagamento: null },
];

function isValidDate(val) {
  if (!val) return false;
  if (typeof val === 'string' && val[0] === '+') return false;
  if (val.$type) return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
}

async function main() {
  for (const [i, payload] of testPayloads.entries()) {
    console.log(`\n--- Teste ${i + 1} ---`);
    console.log('Payload:', payload);
    try {
      const vencimento = isValidDate(payload.vencimento) ? new Date(payload.vencimento) : null;
      const dataPagamento = isValidDate(payload.dataPagamento) ? new Date(payload.dataPagamento) : null;
      console.log('vencimento convertido:', vencimento);
      console.log('dataPagamento convertido:', dataPagamento);
      // Não cria usuário real, apenas simula conversão
    } catch (error) {
      console.error('Erro ao converter:', error);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });
