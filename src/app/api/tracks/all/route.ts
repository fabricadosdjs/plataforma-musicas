// src/app/api/tracks/all/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('📊 API Tracks All chamada - carregando todas as músicas para agrupamento');

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar todas as músicas ordenadas por data
        const allTracks = await prisma.track.findMany({
            orderBy: [
                { releaseDate: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                artist: true,
                style: true,
                pool: true,
                version: true,
                folder: true, // Adicionando o campo folder
                releaseDate: true,
                createdAt: true,
                duration: true,
                bpm: true,
                key: true,
                price: true,
                imageUrl: true,
                audioUrl: true,
                downloadUrl: true
            }
        });

        console.log(`📊 Total de músicas carregadas: ${allTracks.length}`);

        return NextResponse.json(allTracks);

    } catch (error) {
        console.error("[GET_TRACKS_ALL_ERROR]", error);

        // Log mais detalhado do erro
        if (error instanceof Error) {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }

        return NextResponse.json({
            error: "Erro interno do servidor ao buscar todas as músicas"
        }, { status: 500 });
    }
}

