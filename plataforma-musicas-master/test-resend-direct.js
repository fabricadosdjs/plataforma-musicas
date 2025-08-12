import { Resend } from 'resend';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendDirect() {
    console.log('🧪 Testando Resend diretamente...\n');
    console.log('📧 API Key:', process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ Não configurado');
    console.log('📧 From Email:', process.env.RESEND_FROM_EMAIL);
    console.log('📧 To Email:', process.env.RESEND_TO_EMAIL);

    try {
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #e74c3c; margin-bottom: 20px; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
                        🧪 Teste de Email - Resend
                    </h2>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #2c3e50; margin-bottom: 10px;">Teste de Funcionamento:</h3>
                        <p>Este é um teste para verificar se o Resend está funcionando corretamente.</p>
                        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
                        <p style="margin: 0; color: #6c757d; font-size: 14px;">
                            Se você recebeu este email, o Resend está funcionando corretamente! 🎉
                        </p>
                    </div>
                </div>
            </div>
        `;

        console.log('\n📤 Enviando email de teste...');

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Nexor Records <noreply@nexorrecords.com.br>',
            to: process.env.RESEND_TO_EMAIL || 'edersonleonardo@nexorrecords.com.br',
            subject: '🧪 Teste Resend - Funcionamento',
            html: emailContent,
        });

        if (error) {
            console.error('❌ Erro ao enviar email:', error);
        } else {
            console.log('✅ Email enviado com sucesso!');
            console.log('📧 ID do email:', data?.id);
            console.log('📧 Verifique sua caixa de entrada em:', process.env.RESEND_TO_EMAIL);
        }
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testResendDirect().catch(console.error); 