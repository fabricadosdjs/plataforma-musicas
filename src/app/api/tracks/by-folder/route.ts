import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Track } from '@prisma/client';


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const folder = searchParams.get('folder');
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        if (!folder) {
            return new NextResponse('Parâmetro folder é obrigatório', { status: 400 });
        }

        console.log('🔍 Buscando músicas por folder:', folder, 'limit:', limit, 'offset:', offset);

        let tracks: Track[] = [];

        // Buscar por folder exato com paginação
        try {
            const exactFolderTracks = await prisma.$queryRaw<Track[]>`
                SELECT * FROM "Track"
                WHERE folder = ${folder}
                ORDER BY "releaseDate" DESC NULLS LAST, "createdAt" DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            if (exactFolderTracks && exactFolderTracks.length > 0) {
                tracks = exactFolderTracks;
                console.log(`✅ Encontradas ${tracks.length} músicas com folder exato: ${folder}`);
            }
        } catch (error) {
            console.log('⚠️ Erro ao buscar por folder exato, tentando por data...');
        }

        // Se não encontrar por folder exato, tentar buscar por data (também paginado)
        if (tracks.length === 0) {
            console.log('🔍 Folder não encontrado, tentando buscar por data...');

            let searchDate: Date | null = null;

            // Formato brasileiro: "23 de agosto de 2025"
            const brazilianDateMatch = folder.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
            if (brazilianDateMatch) {
                const [, day, month, year] = brazilianDateMatch;
                const months: { [key: string]: number } = {
                    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
                    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
                };
                if (months[month.toLowerCase()] !== undefined) {
                    searchDate = new Date(parseInt(year), months[month.toLowerCase()], parseInt(day));
                    console.log('📅 Data brasileira convertida:', searchDate);
                }
            }

            // Formato DD/MM/YYYY
            const slashDateMatch = folder.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (slashDateMatch && !searchDate) {
                const [, day, month, year] = slashDateMatch;
                searchDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                console.log('📅 Data com barras convertida:', searchDate);
            }

            if (searchDate) {
                const startOfDay = new Date(searchDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(searchDate);
                endOfDay.setHours(23, 59, 59, 999);

                console.log('🔍 Buscando músicas entre:', startOfDay, 'e', endOfDay);

                try {
                    const dateTracks = await prisma.$queryRaw<Track[]>`
                        SELECT * FROM "Track"
                        WHERE ("createdAt" >= ${startOfDay} AND "createdAt" <= ${endOfDay})
                           OR ("updatedAt" >= ${startOfDay} AND "updatedAt" <= ${endOfDay})
                           OR ("releaseDate" >= ${startOfDay} AND "releaseDate" <= ${endOfDay})
                        ORDER BY "releaseDate" DESC NULLS LAST, "createdAt" DESC
                        LIMIT ${limit} OFFSET ${offset}
                    `;

                    tracks = dateTracks;
                    console.log(`✅ Encontradas ${tracks.length} músicas na data: ${folder}`);
                } catch (error) {
                    console.log('⚠️ Erro ao buscar por data, usando método alternativo...');
                    const fallbackTracks = await prisma.track.findMany({
                        where: {
                            OR: [
                                {
                                    createdAt: {
                                        gte: startOfDay,
                                        lte: endOfDay
                                    }
                                },
                                {
                                    updatedAt: {
                                        gte: startOfDay,
                                        lte: endOfDay
                                    }
                                }
                            ]
                        },
                        orderBy: [
                            { createdAt: 'desc' }
                        ],
                        take: limit,
                        skip: offset
                    });
                    tracks = fallbackTracks;
                    console.log(`✅ Encontradas ${tracks.length} músicas usando fallback: ${folder}`);
                }
            } else {
                console.log('❌ Não foi possível converter o folder para data');
            }
        }

        return NextResponse.json({
            success: true,
            folder: folder,
            tracks: tracks,
            count: tracks.length
        });

    } catch (error) {
        console.error('❌ Erro ao buscar músicas por folder:', error);
        return new NextResponse('Erro interno do servidor', { status: 500 });
    }
}
