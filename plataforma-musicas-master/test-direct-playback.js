// Teste simples para verificar se as URLs do Contabo funcionam diretamente
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function testDirectPlayback() {
    console.log('🎵 Testando reprodução direta das URLs do Contabo...\n');

    try {
        // Pegar uma música do banco
        const track = await prisma.track.findFirst({
            where: {
                previewUrl: { contains: '211285f2fbcc4760a62df1aff280735f' }
            }
        });

        if (!track) {
            console.log('❌ Nenhuma música encontrada no banco');
            return;
        }

        console.log(`🎧 Testando: ${track.artist} - ${track.songName}`);
        console.log(`📎 URL: ${track.previewUrl}`);

        // Testar se a URL é acessível
        const response = await fetch(track.previewUrl, {
            method: 'HEAD',
            headers: {
                'Accept': 'audio/mpeg, audio/*, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`\\n📊 Status da resposta: ${response.status}`);
        console.log(`📋 Headers relevantes:`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Content-Length: ${response.headers.get('content-length')}`);
        console.log(`   Accept-Ranges: ${response.headers.get('accept-ranges')}`);
        console.log(`   Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);

        if (response.ok) {
            console.log(`\\n✅ URL pública do Contabo está acessível!`);
            console.log(`💡 As músicas devem tocar normalmente.`);
            console.log(`\\n📝 Sobre as blob URLs:`);
            console.log(`   - São URLs temporárias criadas pelo WaveSurfer.js`);
            console.log(`   - Ajudam com problemas de CORS`);
            console.log(`   - São uma funcionalidade NORMAL e DESEJADA`);
            console.log(`   - As músicas ainda usam os arquivos originais do Contabo`);
        } else {
            console.log(`\\n❌ Problema de acesso: Status ${response.status}`);

            if (response.status === 403) {
                console.log(`🔒 Erro 403: O bucket pode ter restrições de acesso`);
                console.log(`💡 Verifique as configurações de CORS no Contabo`);
            } else if (response.status === 404) {
                console.log(`🔍 Erro 404: Arquivo não encontrado`);
            }
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testDirectPlayback();
