import fetch from 'node-fetch';

async function testReportEmail() {
    console.log('🧪 Testando envio de e-mails dos reports...\n');

    // Teste do report de bug
    console.log('1️⃣ Testando report de bug...');
    try {
        const bugResponse = await fetch('http://localhost:3000/api/report-bug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'next-auth.session-token=test-session' // Simular sessão
            },
            body: JSON.stringify({
                trackId: 123,
                trackName: 'Test Track - Bug Report',
                artist: 'Test Artist',
                issue: 'Problema de áudio detectado pelo usuário',
                userEmail: 'test@example.com'
            })
        });

        const bugResult = await bugResponse.json();
        console.log('✅ Bug Report:', bugResult);
    } catch (error) {
        console.error('❌ Erro no bug report:', error.message);
    }

    console.log('\n2️⃣ Testando report de copyright...');
    try {
        const copyrightResponse = await fetch('http://localhost:3000/api/report-copyright', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'next-auth.session-token=test-session' // Simular sessão
            },
            body: JSON.stringify({
                trackId: 456,
                trackName: 'Test Track - Copyright Report',
                artist: 'Test Artist',
                issue: 'Violação de copyright reportada pelo usuário',
                userEmail: 'test@example.com'
            })
        });

        const copyrightResult = await copyrightResponse.json();
        console.log('✅ Copyright Report:', copyrightResult);
    } catch (error) {
        console.error('❌ Erro no copyright report:', error.message);
    }

    console.log('\n📧 Verifique se os e-mails chegaram em: edersonleonardo@nexorrecords.com.br');
    console.log('📧 E-mails devem ter os assuntos:');
    console.log('   - 🐛 Bug Report - Test Track - Bug Report por Test Artist');
    console.log('   - ⚠️ Copyright Report - Test Track - Copyright Report por Test Artist');
}

testReportEmail().catch(console.error); 