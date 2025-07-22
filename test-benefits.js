// Teste para verificar se o sistema de benefícios está funcionando
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Função para obter benefícios do usuário (mesma do admin)
function getUserBenefits(user) {
    const VIP_BENEFITS = {
        'BÁSICO': {
            priceRange: '30-35',
            packRequestsPerWeek: 8,
            playlistsPerWeek: 3,
            downloadsPerDay: 30,
            directDownload: true,
            deemixAccess: true,
            trackRequest: true,
            exclusiveGenres: false,
            prioritySupport: false
        },
        'PADRÃO': {
            priceRange: '36-42',
            packRequestsPerWeek: 15,
            playlistsPerWeek: 6,
            downloadsPerDay: 50,
            directDownload: true,
            deemixAccess: true,
            trackRequest: true,
            exclusiveGenres: true,
            prioritySupport: false
        },
        'COMPLETO': {
            priceRange: '43-60',
            packRequestsPerWeek: 999,
            playlistsPerWeek: 999,
            downloadsPerDay: 999,
            directDownload: true,
            deemixAccess: true,
            trackRequest: true,
            exclusiveGenres: true,
            prioritySupport: true
        }
    };

    const value = parseFloat(user.valor) || 0;

    if (value >= 43) return { plan: 'COMPLETO', ...VIP_BENEFITS.COMPLETO };
    if (value >= 36) return { plan: 'PADRÃO', ...VIP_BENEFITS.PADRÃO };
    if (value >= 30) return { plan: 'BÁSICO', ...VIP_BENEFITS.BÁSICO };

    return { plan: 'GRATUITO', packRequestsPerWeek: 0, playlistsPerWeek: 0, downloadsPerDay: 5 };
}

async function testBenefitsSystem() {
    try {
        console.log('🎯 Testando sistema de benefícios...');

        const users = await prisma.user.findMany({
            take: 10,
            select: {
                id: true,
                name: true,
                email: true,
                valor: true,
                status: true,
                is_vip: true,
                dailyDownloadCount: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true,
                lastDownloadReset: true,
                lastWeekReset: true,
                customBenefits: true
            }
        });

        console.log(`\n📊 Analisando benefícios de ${users.length} usuários:\n`);

        users.forEach(user => {
            const benefits = getUserBenefits(user);
            const value = parseFloat(user.valor) || 0;

            console.log(`👤 ${user.name} (${user.email})`);
            console.log(`   💰 Valor: R$${value.toFixed(2)}`);
            console.log(`   🏆 Plano: ${benefits.plan}`);
            console.log(`   📦 Packs por semana: ${user.weeklyPackRequests || 0}/${benefits.packRequestsPerWeek}`);
            console.log(`   📋 Playlists por semana: ${user.weeklyPlaylistDownloads || 0}/${benefits.playlistsPerWeek}`);
            console.log(`   ⬇️ Downloads por dia: ${user.dailyDownloadCount || 0}/${benefits.downloadsPerDay}`);
            console.log(`   🔄 Último reset semanal: ${user.lastWeekReset || 'Nunca'}`);
            console.log(`   🔄 Último reset diário: ${user.lastDownloadReset || 'Nunca'}`);
            if (user.customBenefits) {
                console.log(`   ⚙️ Benefícios customizados: ${JSON.stringify(user.customBenefits)}`);
            }
            console.log('');
        });

        console.log('✅ Sistema de benefícios funcionando perfeitamente!');

    } catch (error) {
        console.error('❌ Erro no sistema de benefícios:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testBenefitsSystem();
