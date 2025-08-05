import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Verificar se é VIP ou admin
        const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
        if (!session.user.is_vip && !isAdmin) {
            return NextResponse.json({ error: 'Recurso apenas para usuários VIP' }, { status: 403 });
        }

        const body = await request.json();
        const { trackId, duration, completed, deviceInfo } = body;

        if (!trackId) {
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        // Verificar se a música existe
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) }
        });

        if (!track) {
            return NextResponse.json({ error: 'Música não encontrada' }, { status: 404 });
        }

        // Verificar se é um usuário admin especial (já definido acima)
        const isSpecialAdmin = session.user.id === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess;

        // Se for admin, retornar sucesso sem registrar no banco
        if (isAdmin || isSpecialAdmin) {
            return NextResponse.json({
                success: true,
                message: 'Reprodução registrada com sucesso (Admin)'
            });
        }

        // Verificar se o userId é válido (UUID ou CUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const cuidRegex = /^[a-z0-9]{25}$/i; // CUID format: 25 caracteres alfanuméricos

        if (!uuidRegex.test(session.user.id) && !cuidRegex.test(session.user.id)) {
            console.error('ID de usuário inválido detectado na API de play:', session.user.id);
            return NextResponse.json(
                { error: "ID de usuário inválido" },
                { status: 400 }
            );
        }

        // Obter informações do request
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ipAddress = forwarded?.split(',')[0] || realIp || 'Unknown';

        // Registrar a reprodução usando raw SQL
        try {
            await prisma.$executeRaw`
                INSERT INTO "Play" (
                    "trackId", "userId", "duration", "completed", "deviceInfo", "ipAddress", "createdAt"
                ) VALUES (
                    ${parseInt(trackId)}, ${session.user.id}, ${duration || null}, ${completed || false}, 
                    ${deviceInfo || userAgent}, ${ipAddress}, NOW()
                )
            `;
        } catch (insertError) {
            console.error('Erro ao inserir na tabela Play:', insertError);
            return NextResponse.json({
                error: 'Erro ao registrar reprodução no banco de dados'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Reprodução registrada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao registrar reprodução:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}
