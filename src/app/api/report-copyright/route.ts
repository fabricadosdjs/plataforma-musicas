// src/app/api/report-copyright/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma'; // Importe o Prisma para buscar o usuário completo
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { trackId, trackName, artistName } = await req.json();

    if (!trackId || !trackName || !artistName) {
      return new NextResponse("Dados da música incompletos para denúncia.", { status: 400 });
    }

    // --- BUSCA O USUÁRIO COMPLETO DO BANCO DE DADOS (via Prisma) ---
    // Isso garante que temos os dados mais precisos, incluindo nome e email, se estiverem no seu User model.
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            // Adicione outros campos que você possa querer do usuário, se existirem
        }
    });

    // Informações do usuário que está denunciando
    const reportingUserEmail = user?.email || 'Email não disponível'; // Prefere o email do DB
    const reportingUserName = user?.name || 'Nome não disponível';   // Prefere o nome do DB

    // --- Configuração do Transportador de E-mail (Resend via SMTP) ---
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `Denúncia de Copyright: ${trackName} por ${artistName}`,
      html: `
        <h1>Denúncia de Direitos Autorais</h1>
        <p>A seguinte música foi denunciada por direitos autorais:</p>
        <ul>
          <li><strong>ID da Música:</strong> ${trackId}</li>
          <li><strong>Nome da Música:</strong> ${trackName}</li>
          <li><strong>Artista:</strong> ${artistName}</li>
          <li><strong>URL de Download:</strong> A ser buscada no DB pela TrackId se necessário</li>
        </ul>
        <p>Denunciado por:</p>
        <ul>
          <li><strong>ID do Usuário:</strong> ${userId}</li>
          <li><strong>Nome do Usuário:</strong> ${reportingUserName}</li>
          <li><strong>Email do Usuário:</strong> ${reportingUserEmail}</li>
        </ul>
        <p>Por favor, investigue.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Denúncia enviada com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error("[REPORT_COPYRIGHT_ERROR]", error);
    return new NextResponse("Erro interno do servidor ao processar a denúncia.", { status: 500 });
  }
}