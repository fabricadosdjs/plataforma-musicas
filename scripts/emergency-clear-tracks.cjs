#!/usr/bin/env node

/**
 * Script de EMERGÊNCIA para remover TODAS as músicas
 * ⚠️ ATENÇÃO: Este script é DESTRUTIVO e irá remover TODAS as músicas!
 * 
 * Uso:
 * node scripts/emergency-clear-tracks.js
 */

const { PrismaClient } = require('@prisma/client');

// Configuração do Prisma
const prisma = new PrismaClient();

async function emergencyClearTracks() {
    try {
        console.log('🚨 SCRIPT DE EMERGÊNCIA - REMOÇÃO DE MÚSICAS 🚨');
        console.log('==================================================');
        console.log('⚠️  ATENÇÃO: Este script irá remover TODAS as músicas!');
        console.log('==================================================\n');

        // Contar músicas atuais
        const count = await prisma.track.count();
        console.log(`📊 Total de músicas no banco: ${count}`);

        if (count === 0) {
            console.log('ℹ️  Nenhuma música encontrada para remover');
            return;
        }

        // Confirmação final
        console.log('\n🚨 ÚLTIMA CHANCE:');
        console.log('   Digite "EMERGENCIA" para confirmar a remoção de TODAS as músicas:');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise((resolve) => {
            rl.question('Confirmação: ', resolve);
        });

        rl.close();

        if (answer !== 'EMERGENCIA') {
            console.log('❌ Operação cancelada');
            return;
        }

        // Executar remoção
        console.log('\n🗑️  Removendo todas as músicas...');
        const result = await prisma.track.deleteMany({});

        console.log(`✅ Remoção concluída!`);
        console.log(`📊 Músicas removidas: ${result.count}`);

        // Verificar resultado
        const finalCount = await prisma.track.count();
        console.log(`📊 Músicas restantes: ${finalCount}`);

    } catch (error) {
        console.error('❌ Erro durante a remoção:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    emergencyClearTracks()
        .then(() => {
            console.log('\n✅ Script executado com sucesso!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Erro fatal:', error);
            process.exit(1);
        });
}

module.exports = { emergencyClearTracks };
