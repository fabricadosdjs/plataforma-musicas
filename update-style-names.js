// Script para atualizar nomes dos estilos para versões mais curtas
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function updateStyleNames() {
    console.log('✂️ Atualizando nomes dos estilos para versões mais curtas...\n');

    try {
        // Mapeamento de nomes antigos para novos (mais curtos)
        const styleMapping = {
            'Big Room House': 'Big Room',
            'Future House': 'Future',
            'Progressive House': 'Progressive',
            'Electro House': 'Electro',
            'Electronic R&B': 'R&B',
            'Hip Hop Electronic': 'Hip Hop',
            'Commercial Dance': 'Dance',
            'Club House': 'Club',
            'Tropical House': 'Tropical',
            'Minimal Techno': 'Minimal',
            'Progressive Trance': 'Prog Trance',
            'Drum & Bass': 'DnB',
            'Liquid DnB': 'Liquid',
            'Italo Disco': 'Italo',
            'Funk Brasileiro': 'Funk'
        };

        console.log('📊 Verificando estilos antes da atualização...');
        const beforeStats = await prisma.track.groupBy({
            by: ['style'],
            _count: { style: true },
            orderBy: { _count: { style: 'desc' } }
        });

        console.log('\n📋 Estilos atuais:');
        for (const stat of beforeStats) {
            console.log(`   ${stat.style}: ${stat._count.style} música(s)`);
        }

        console.log('\n🔄 Atualizando nomes dos estilos...');

        for (const [oldName, newName] of Object.entries(styleMapping)) {
            const updateResult = await prisma.track.updateMany({
                where: { style: oldName },
                data: { style: newName }
            });

            if (updateResult.count > 0) {
                console.log(`   ✅ ${oldName} → ${newName} (${updateResult.count} música(s))`);
            }
        }

        console.log('\n📊 Verificando estilos após atualização...');
        const afterStats = await prisma.track.groupBy({
            by: ['style'],
            _count: { style: true },
            orderBy: { _count: { style: 'desc' } }
        });

        console.log('\n📋 Estilos atualizados:');
        for (const stat of afterStats) {
            const nameLength = stat.style.length;
            const statusIcon = nameLength <= 8 ? '✅' : nameLength <= 12 ? '⚠️' : '❌';
            console.log(`   ${statusIcon} ${stat.style}: ${stat._count.style} música(s) (${nameLength} chars)`);
        }

        // Estatísticas de comprimento
        const maxLength = Math.max(...afterStats.map(s => s.style.length));
        const avgLength = afterStats.reduce((sum, s) => sum + s.style.length, 0) / afterStats.length;

        console.log('\n📏 Estatísticas de comprimento dos nomes:');
        console.log(`   📊 Comprimento máximo: ${maxLength} caracteres`);
        console.log(`   📊 Comprimento médio: ${avgLength.toFixed(1)} caracteres`);
        console.log(`   ✅ Nomes ≤ 8 chars: ${afterStats.filter(s => s.style.length <= 8).length}`);
        console.log(`   ⚠️ Nomes 9-12 chars: ${afterStats.filter(s => s.style.length > 8 && s.style.length <= 12).length}`);
        console.log(`   ❌ Nomes > 12 chars: ${afterStats.filter(s => s.style.length > 12).length}`);

        console.log('\n🎉 Atualização de nomes concluída!');
        console.log('💡 Os nomes agora são mais curtos e não devem quebrar linha na interface.');

    } catch (error) {
        console.error('❌ Erro durante a atualização:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar atualização
updateStyleNames();
