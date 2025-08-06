// src/app/api/report-bug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { trackId, trackName, artist, issue, userEmail } = body;

        if (!trackId || !trackName || !artist) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }

        // Log do report
        console.log('🐛 Bug Report:', {
            trackId,
            trackName,
            artist,
            issue,
            userEmail,
            reportedAt: new Date().toISOString()
        });

        // Enviar email via Resend
        try {
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #e74c3c; margin-bottom: 20px; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
                            🐛 Novo Report de Bug
                        </h2>
                        
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">Detalhes da Música:</h3>
                            <p><strong>Nome:</strong> ${trackName}</p>
                            <p><strong>Artista:</strong> ${artist}</p>
                            <p><strong>ID da Track:</strong> ${trackId}</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">Problema Reportado:</h3>
                            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #e74c3c;">
                                ${issue}
                            </p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">Informações do Usuário:</h3>
                            <p><strong>Email:</strong> ${userEmail}</p>
                            <p><strong>Data do Report:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
                            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                                Este é um report automático do sistema. Por favor, verifique a música reportada e tome as medidas necessárias.
                            </p>
                        </div>
                    </div>
                </div>
            `;

            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Nexor Records <noreply@nexorrecords.com.br>',
                to: process.env.RESEND_TO_EMAIL || 'edersonleonardo@nexorrecords.com.br',
                subject: `🐛 Bug Report - ${trackName} por ${artist}`,
                html: emailContent,
            });

            if (error) {
                console.error('Erro ao enviar email:', error);
                // Não falhar o request se o email falhar
            } else {
                console.log('✅ Email de bug report enviado com sucesso:', data);
            }
        } catch (emailError) {
            console.error('Erro ao enviar email de bug report:', emailError);
            // Não falhar o request se o email falhar
        }

        return NextResponse.json({
            success: true,
            message: 'Problema reportado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao reportar bug:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}
