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

        // Enviar email via Resend
        const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1B1C1D; color: white;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A855F7; margin: 0;">🎵 Novo Pedido Recebido</h1>
          <p style="color: #9CA3AF; margin: 10px 0;">Nexor Records Pools</p>
        </div>

        <div style="background-color: #374151; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #A855F7; margin-top: 0;">📋 Detalhes do Pedido</h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #E5E7EB;">Cliente:</strong> ${name}
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #E5E7EB;">Email:</strong> ${email}
          </div>
          
          ${phone ? `<div style="margin-bottom: 15px;">
            <strong style="color: #E5E7EB;">Telefone:</strong> ${phone}
          </div>` : ''}
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #E5E7EB;">Tipo de Serviço:</strong> ${serviceType === 'pack' ? 'Pack de Músicas' : serviceType === 'playlist' ? 'Playlist Personalizada' : 'Serviço Personalizado'}
          </div>
          
          ${genre ? `<div style="margin-bottom: 15px;">
            <strong style="color: #E5E7EB;">Gênero:</strong> ${genre}
          </div>` : ''}
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #E5E7EB;">Quantidade:</strong> ${quantity} músicas
          </div>
          
          ${deadline ? `<div style="margin-bottom: 15px;">
            <strong style="color: #E5E7EB;">Prazo Desejado:</strong> ${deadline}
          </div>` : ''}
          
          ${budget ? `<div style="margin-bottom: 15px;">
            <strong style="color: #E5E7EB;">Orçamento:</strong> ${budget}
          </div>` : ''}
        </div>

        <div style="background-color: #374151; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #A855F7; margin-top: 0;">📝 Descrição do Pedido</h3>
          <p style="color: #E5E7EB; line-height: 1.6; margin: 0;">${description}</p>
        </div>

        ${additionalInfo ? `<div style="background-color: #374151; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #A855F7; margin-top: 0;">ℹ️ Informações Adicionais</h3>
          <p style="color: #E5E7EB; line-height: 1.6; margin: 0;">${additionalInfo}</p>
        </div>` : ''}

        <div style="background-color: #374151; padding: 20px; border-radius: 10px;">
          <h3 style="color: #A855F7; margin-top: 0;">👤 Dados do Usuário</h3>
          <div style="margin-bottom: 10px;">
            <strong style="color: #E5E7EB;">ID do Usuário:</strong> ${userId}
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #E5E7EB;">Nome do Usuário:</strong> ${userName}
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #E5E7EB;">Email do Usuário:</strong> ${userEmail}
          </div>
          ${userWhatsApp ? `<div style="margin-bottom: 0;">
            <strong style="color: #E5E7EB;">WhatsApp do Usuário:</strong> ${userWhatsApp}
          </div>` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151;">
          <p style="color: #9CA3AF; margin: 0; font-size: 14px;">
            Este pedido foi enviado através da plataforma Nexor Records Pools
          </p>
        </div>
      </div>
    `;

        const { data, error } = await resend.emails.send({
            from: 'Nexor Records Pools <noreply@nexorrecords.com.br>',
            to: ['contato@nexorrecords.com.br'],
            subject: `🎵 Novo Pedido - ${name} - ${serviceType === 'pack' ? 'Pack' : serviceType === 'playlist' ? 'Playlist' : 'Serviço Personalizado'}`,
            html: emailContent,
        });

        if (error) {
            console.error('Erro ao enviar email:', error);
            return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
        }

        // Enviar email de confirmação para o cliente
        const confirmationEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1B1C1D; color: white;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A855F7; margin: 0;">✅ Pedido Recebido!</h1>
          <p style="color: #9CA3AF; margin: 10px 0;">Nexor Records Pools</p>
        </div>

        <div style="background-color: #374151; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #A855F7; margin-top: 0;">Olá ${name}!</h2>
          <p style="color: #E5E7EB; line-height: 1.6;">
            Recebemos seu pedido com sucesso e estamos analisando os detalhes. 
            Nossa equipe entrará em contato em breve para discutir os próximos passos.
          </p>
        </div>

        <div style="background-color: #374151; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #A855F7; margin-top: 0;">📋 Resumo do Pedido</h3>
          <div style="margin-bottom: 10px;">
            <strong style="color: #E5E7EB;">Serviço:</strong> ${serviceType === 'pack' ? 'Pack de Músicas' : serviceType === 'playlist' ? 'Playlist Personalizada' : 'Serviço Personalizado'}
          </div>
          <div style="margin-bottom: 10px;">
            <strong style="color: #E5E7EB;">Quantidade:</strong> ${quantity} músicas
          </div>
          ${genre ? `<div style="margin-bottom: 10px;">
            <strong style="color: #E5E7EB;">Gênero:</strong> ${genre}
          </div>` : ''}
          ${deadline ? `<div style="margin-bottom: 10px;">
            <strong style="color: #E5E7EB;">Prazo:</strong> ${deadline}
          </div>` : ''}
        </div>

        <div style="background-color: #374151; padding: 20px; border-radius: 10px;">
          <h3 style="color: #A855F7; margin-top: 0;">📞 Contato</h3>
          <p style="color: #E5E7EB; line-height: 1.6; margin-bottom: 10px;">
            Se tiver alguma dúvida, entre em contato conosco:
          </p>
          <div style="margin-bottom: 5px;">
            <strong style="color: #E5E7EB;">Email:</strong> contato@nexorrecords.com.br
          </div>
          <div style="margin-bottom: 5px;">
            <strong style="color: #E5E7EB;">WhatsApp:</strong> +55 (51) 93505-2274
          </div>
          <div style="margin-bottom: 0;">
            <strong style="color: #E5E7EB;">Chat:</strong> Disponível no site
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151;">
          <p style="color: #9CA3AF; margin: 0; font-size: 14px;">
            Obrigado por escolher a Nexor Records Pools!
          </p>
        </div>
      </div>
    `;

        await resend.emails.send({
            from: 'Nexor Records Pools <noreply@nexorrecords.com.br>',
            to: [email],
            subject: '✅ Pedido Recebido - Nexor Records Pools',
            html: confirmationEmail,
        });

        return NextResponse.json({
            success: true,
            message: 'Pedido enviado com sucesso',
            data: data
        });

    } catch (error) {
        console.error('Erro ao processar pedido:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 