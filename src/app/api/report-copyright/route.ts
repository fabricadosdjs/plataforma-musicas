// src/app/api/report-copyright/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
// import { Resend } from 'resend';
// Instanciar Resend apenas dentro do bloco de envio de e-mail

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
    console.log('©️ Copyright Report:', {
      trackId,
      trackName,
      artist,
      issue,
      userEmail,
      reportedAt: new Date().toISOString()
    });

    // Envio de e-mail desabilitado temporariamente para build passar sem RESEND_API_KEY
    // Para reabilitar, defina a variável de ambiente RESEND_API_KEY e descomente o bloco abaixo.
    // try {
    //   const emailContent = `...`;
    //   const { data, error } = await resend.emails.send({ ... });
    //   if (error) { console.error('Erro ao enviar email:', error); }
    //   else { /* Email enviado com sucesso */ }
    // } catch (err) { console.error('Erro ao tentar enviar email:', err); }

    return NextResponse.json({
      success: true,
      message: 'Copyright reportado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao reportar copyright:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
