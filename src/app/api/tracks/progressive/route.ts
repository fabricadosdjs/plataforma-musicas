// src/app/api/tracks/progressive/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const daysPerPage = 7; // 7 dias por página
        const offset = (page - 1) * daysPerPage;

        console.log(`📊 API Progressive chamada - page: ${page}, daysPerPage: ${daysPerPage}, offset: ${offset}`);

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Contar total de músicas para saber se há mais
        const totalCount = await prisma.track.count();
        console.log(`📊 Total de tracks no banco: ${totalCount}`);

        if (totalCount === 0) {
            console.log('⚠️ Nenhuma música encontrada no banco de dados');
            return NextResponse.json({
                tracks: [],
                page,
                hasMore: false,
                totalCount: 0,
                daysPerPage,
                currentDays: 0
            });
        }

        // Buscar todas as músicas ordenadas por data
        const allTracks = await prisma.track.findMany({
            orderBy: [
                { releaseDate: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                version: true,
                releaseDate: true,
                createdAt: true,
                imageUrl: true,
                previewUrl: true,
                downloadUrl: true
            }
        });

        console.log(`📊 Total de músicas carregadas: ${allTracks.length}`);

        // Agrupar músicas por data
        const tracksByDate = new Map<string, any[]>();

        allTracks.forEach((track: any) => {
            let dateKey: string;

            if (track.releaseDate) {
                try {
                    const date = new Date(track.releaseDate);
                    if (!isNaN(date.getTime())) {
                        dateKey = date.toISOString().split('T')[0];
                    } else {
                        dateKey = 'no-date';
                    }
                } catch {
                    dateKey = 'no-date';
                }
            } else if (track.createdAt) {
                try {
                    const date = new Date(track.createdAt);
                    if (!isNaN(date.getTime())) {
                        dateKey = date.toISOString().split('T')[0];
                    } else {
                        dateKey = 'no-date';
                    }
                } catch {
                    dateKey = 'no-date';
                }
            } else {
                dateKey = 'no-date';
            }

            if (!tracksByDate.has(dateKey)) {
                tracksByDate.set(dateKey, []);
            }
            tracksByDate.get(dateKey)!.push(track);
        });

        // Ordenar datas (mais recente primeiro)
        const sortedDates = Array.from(tracksByDate.keys()).sort((a: any, b: any) => {
            if (a === 'no-date') return 1;
            if (b === 'no-date') return 1;
            return b.localeCompare(a);
        });

        console.log(`📊 Datas únicas encontradas: ${sortedDates.length}`);
        console.log(`📊 Primeiras 5 datas:`, sortedDates.slice(0, 5));

        // Calcular quais datas devem ser exibidas nesta página
        const startDateIndex = offset;
        const endDateIndex = Math.min(startDateIndex + daysPerPage, sortedDates.length);
        const datesForThisPage = sortedDates.slice(startDateIndex, endDateIndex);

        console.log(`📊 Página ${page}: datas ${startDateIndex + 1} a ${endDateIndex} de ${sortedDates.length}`);
        console.log(`📊 Datas desta página:`, datesForThisPage);

        // Coletar músicas das datas desta página
        const tracksForThisPage: any[] = [];
        datesForThisPage.forEach((dateKey: any) => {
            const tracksForDate = tracksByDate.get(dateKey) || [];
            tracksForThisPage.push(...tracksForDate);
        });

        // Calcular se há mais páginas
        const hasMore = endDateIndex < sortedDates.length;
        const totalPages = Math.ceil(sortedDates.length / daysPerPage);

        const response = {
            tracks: tracksForThisPage,
            page,
            hasMore,
            totalCount,
            daysPerPage,
            currentDays: datesForThisPage.length,
            totalPages,
            datesForThisPage,
            totalDates: sortedDates.length
        };

        console.log(`📊 Resposta: page=${page}, hasMore=${hasMore}, totalPages=${totalPages}, tracks=${tracksForThisPage.length}`);

        return NextResponse.json(response);

    } catch (error) {
        console.error("[GET_TRACKS_PROGRESSIVE_ERROR]", error);

        return NextResponse.json({
            error: "Erro interno do servidor ao buscar músicas progressivamente",
            tracks: [],
            page: 1,
            hasMore: false,
            totalCount: 0,
            daysPerPage: 7,
            currentDays: 0
        }, { status: 500 });
    }
}
