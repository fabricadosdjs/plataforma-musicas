// src/app/api/report-copyright/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Verificar se a API key do Resend está disponível
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email sending');
      return NextResponse.json({ 
        success: true, 
        message: 'Denúncia recebida (email não configurado)' 
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { track, user, timestamp } = await req.json();

    if (!track || !track.songName || !track.artist) {
      return new NextResponse("Dados da música incompletos para denúncia.", { status: 400 });
    }

    const emailContent = `
      <h2>🚨 Denúncia de Direitos Autorais</h2>
      
      <h3>Informações da Música:</h3>
      <ul>
        <li><strong>ID:</strong> ${track.id}</li>
        <li><strong>Nome:</strong> ${track.songName}</li>
        <li><strong>Artista:</strong> ${track.artist}</li>
        <li><strong>Imagem:</strong> <a href="${track.imageUrl}">Ver capa</a></li>
      </ul>
      
      <h3>Informações do Usuário:</h3>
      <ul>
        <li><strong>Email:</strong> ${user}</li>
        <li><strong>Data/Hora:</strong> ${new Date(timestamp).toLocaleString('pt-BR')}</li>
      </ul>
      
      <p><em>Esta denúncia foi enviada automaticamente através da plataforma.</em></p>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@nexorrecords.com.br',
      to: [process.env.RESEND_TO_EMAIL || 'edersonleonardo@nexorrecords.com.br'],
      subject: `🚨 Copyright Report - ${track.songName} by ${track.artist}`,
      html: emailContent,
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return new NextResponse("Erro ao enviar denúncia", { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Denúncia de direitos autorais enviada com sucesso",
      emailId: data?.id
    });

  } catch (error) {
    console.error('Erro na API report-copyright:', error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
