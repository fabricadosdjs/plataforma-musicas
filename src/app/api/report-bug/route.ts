// src/app/api/report-bug/route.ts
import prisma from '@/lib/prisma'; // Para puxar dados do usuário completo
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return new NextResponse("Não autorizado", { status: 401 });
        }

        const { trackId, trackName, artistName, downloadUrl } = await req.json();

        if (!trackId || !trackName || !artistName || !downloadUrl) {
            return new NextResponse("Dados da música incompletos para reporte de bug.", { status: 400 });
        }

        // Busca o usuário completo do banco de dados (via Prisma)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });

        const reportingUserEmail = user?.email || 'Email não disponível';
        const reportingUserName = user?.name || 'Nome não disponível';

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
            subject: `Reporte de Problema na Música: ${trackName} por ${artistName}`,
            html: `
        <h1>Reporte de Problema em Música</h1>
        <p>Um usuário reportou um problema com a seguinte música:</p>
        <ul>
          <li><strong>ID da Música:</strong> ${trackId}</li>
          <li><strong>Nome da Música:</strong> ${trackName}</li>
          <li><strong>Artista:</strong> ${artistName}</li>
          <li><strong>URL de Download:</strong> ${downloadUrl}</li>
          <li><strong>Tipo de Problema Sugerido:</strong> Link Off / Não Reproduz (conforme o contexto do botão)</li>
        </ul>
        <p>Reportado por:</p>
        <ul>
          <li><strong>ID do Usuário:</strong> ${userId}</li>
          <li><strong>Nome do Usuário:</strong> ${reportingUserName}</li>
          <li><strong>Email do Usuário:</strong> ${reportingUserEmail}</li>
        </ul>
        <p>Por favor, investigue este problema.</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Reporte de problema enviado com sucesso!' }, { status: 200 });

    } catch (error) {
        console.error("[REPORT_BUG_ERROR]", error);
        return new NextResponse("Erro interno do servidor ao processar o reporte de bug.", { status: 500 });
    }
}