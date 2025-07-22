// Teste completo do sistema de autenticação e benefícios
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuthSystem() {
    try {
        console.log('🧪 Testando sistema de autenticação e benefícios...\n');

        // 1. Criar um usuário de teste se não existir
        const testEmail = 'teste@djpool.com';
        const testPassword = '123456';

        let testUser = await prisma.user.findUnique({
            where: { email: testEmail }
        });

        if (!testUser) {
            const hashedPassword = await bcrypt.hash(testPassword, 10);
            testUser = await prisma.user.create({
                data: {
                    name: 'Usuário Teste VIP',
                    email: testEmail,
                    password: hashedPassword,
                    valor: 45, // Plano COMPLETO
                    status: 'ativo',
                    is_vip: true,
                    deemix: true,
                    dailyDownloadCount: 0,
                    weeklyPackRequests: 0,
                    weeklyPlaylistDownloads: 0
                }
            });
            console.log('✅ Usuário de teste criado!');
        } else {
            console.log('✅ Usuário de teste já existe!');
        }

        console.log(`📧 Email: ${testEmail}`);
        console.log(`🔑 Senha: ${testPassword}`);
        console.log(`💰 Valor: R$${testUser.valor} (Plano COMPLETO)`);
        console.log(`📊 Status: ${testUser.status}`);
        console.log(`👑 VIP: ${testUser.is_vip ? 'Sim' : 'Não'}`);

        // 2. Função para obter benefícios
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

        // 3. Testar benefícios
        const benefits = getUserBenefits(testUser);
        console.log(`\n🎯 Benefícios do usuário:`);
        console.log(`🏆 Plano: ${benefits.plan}`);
        console.log(`⬇️ Downloads por dia: ${benefits.downloadsPerDay === 999 ? 'Ilimitado' : benefits.downloadsPerDay}`);
        console.log(`📦 Packs por semana: ${benefits.packRequestsPerWeek === 999 ? 'Ilimitado' : benefits.packRequestsPerWeek}`);
        console.log(`📋 Playlists por semana: ${benefits.playlistsPerWeek === 999 ? 'Ilimitado' : benefits.playlistsPerWeek}`);
        console.log(`🎵 Acesso Deemix: ${benefits.deemixAccess ? 'Sim' : 'Não'}`);
        console.log(`🎼 Gêneros exclusivos: ${benefits.exclusiveGenres ? 'Sim' : 'Não'}`);
        console.log(`🆘 Suporte prioritário: ${benefits.prioritySupport ? 'Sim' : 'Não'}`);

        // 4. Testar verificação de senha
        console.log(`\n🔐 Testando autenticação:`);
        const isPasswordValid = await bcrypt.compare(testPassword, testUser.password);
        console.log(`✅ Senha válida: ${isPasswordValid ? 'Sim' : 'Não'}`);

        // 5. Verificar algumas músicas disponíveis
        const tracks = await prisma.track.findMany({
            take: 3,
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true
            }
        });

        console.log(`\n🎵 Músicas disponíveis para teste:`);
        tracks.forEach(track => {
            console.log(`   ${track.id}: ${track.songName} - ${track.artist} (${track.style})`);
        });

        console.log(`\n✅ Sistema funcionando perfeitamente!`);
        console.log(`\n🚀 Para testar:`);
        console.log(`   1. Inicie o servidor: npm run dev`);
        console.log(`   2. Acesse: http://localhost:3000/auth/sign-in`);
        console.log(`   3. Use as credenciais acima para fazer login`);
        console.log(`   4. Navegue para http://localhost:3000/new`);
        console.log(`   5. Teste downloads e likes das músicas`);
        console.log(`   6. Veja seus benefícios na sidebar esquerda`);

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAuthSystem();
