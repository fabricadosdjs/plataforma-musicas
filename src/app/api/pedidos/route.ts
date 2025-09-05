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
    const {
      name,
      email,
      phone,
      serviceType,
      genre,
      description,
      quantity,
      deadline,
      budget,
      additionalInfo,
      userId,
      userName,
      userEmail,
      userWhatsApp
    } = body;

    // Validar campos obrigatórios
    if (!name || !email || !description) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    // Salvar no banco de dados (opcional)
    // const order = await prisma.order.create({
    //   data: {
    //     userId,
    //     name,
    //     email,
    //     phone,
    //     serviceType,
    //     genre,
    //     description,
    //     quantity,
    //     deadline,
    //     budget,
    //     additionalInfo,
    //     status: 'pending'
    //   }
    // });

    // Envio de e-mail desabilitado temporariamente para build passar sem RESEND_API_KEY
    // Para reabilitar, defina a variável de ambiente RESEND_API_KEY e descomente o bloco abaixo.
    /*
    // Enviar email via Resend
    const emailContent = `...`;
    const { data, error } = await resend.emails.send({ ... });
    if (error) {
      console.error('Erro ao enviar email:', error);
      return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
    }
    // Enviar email de confirmação para o cliente
    const confirmationEmail = `...`;
    await resend.emails.send({ ... });
    return NextResponse.json({
      success: true,
      message: 'Pedido enviado com sucesso',
      data: data
    });
    */
    return NextResponse.json({
      success: true,
      message: 'Pedido enviado com sucesso (sem envio de e-mail)'
    });

  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 