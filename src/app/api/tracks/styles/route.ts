import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('🎵 API Styles chamada - buscando estilos únicos');

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar estilos únicos do banco de dados
        const uniqueStyles = await prisma.track.findMany({
            select: {
                style: true
            },
            where: {
                style: {
                    not: null
                }
            },
            distinct: ['style']
        });

        // Extrair apenas os nomes dos estilos
        const styles = uniqueStyles
            .map(item => item.style)
            .filter(style => style && style.trim() !== '')
            .sort();

        console.log(`📊 ${styles.length} estilos únicos encontrados no banco`);

        return NextResponse.json({
            success: true,
            styles,
            count: styles.length
        });

    } catch (error) {
        console.error("[GET_STYLES_ERROR]", error);

        if (error instanceof Error) {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }

        return NextResponse.json({
            error: "Erro interno do servidor ao buscar estilos",
            styles: [],
            count: 0
        }, { status: 500 });
    }
}
