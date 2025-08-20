import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('🎭 API Styles: Carregando estilos musicais...');

        // Buscar estilos únicos ordenados por popularidade
        const styles = await prisma.track.groupBy({
            by: ['style'],
            _count: {
                style: true
            },
            orderBy: {
                _count: {
                    style: 'desc'
                }
            },
            where: {
                style: {
                    not: null
                }
            }
        });

        // Formatar resultado
        const formattedStyles = styles
            .filter(style => style.style && style.style !== 'N/A')
            .map(style => ({
                name: style.style,
                count: style._count.style
            }));

        console.log(`✅ ${formattedStyles.length} estilos carregados`);

        return NextResponse.json({
            success: true,
            styles: formattedStyles,
            total: formattedStyles.length
        });

    } catch (error) {
        console.error('❌ Erro ao carregar estilos:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                styles: [],
                total: 0
            },
            { status: 500 }
        );
    }
}
