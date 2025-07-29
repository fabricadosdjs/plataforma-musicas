// src/app/api/downloads/batch-control/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    let requestBody: any = null;
    
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.log('❌ Usuário não autorizado');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        console.log('✅ Usuário autenticado:', session.user.id);

        // Parse do body da requisição com tratamento de erro
        try {
            requestBody = await request.json();
            console.log('✅ JSON parseado:', JSON.stringify(requestBody));
        } catch (jsonError) {
            console.error('❌ Erro ao fazer parse do JSON:', jsonError);
            return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
        }

        const { trackIds } = requestBody;
        console.log('📋 trackIds recebidos:', trackIds, 'Tipo:', typeof trackIds, 'É array:', Array.isArray(trackIds));

        if (!trackIds) {
            console.log('❌ trackIds está undefined ou null');
            return NextResponse.json({ error: 'trackIds é obrigatório' }, { status: 400 });
        }

        if (!Array.isArray(trackIds)) {
            console.log('❌ trackIds não é um array');
            return NextResponse.json({ error: 'trackIds deve ser um array' }, { status: 400 });
        }

        if (trackIds.length === 0) {
            console.log('❌ trackIds está vazio');
            return NextResponse.json({ error: 'trackIds não pode estar vazio' }, { status: 400 });
        }

        // Aumentar o limite para 500 tracks por vez (ou remover o limite completamente)
        if (trackIds.length > 500) {
            console.log('❌ Muitos trackIds:', trackIds.length);
            return NextResponse.json({ error: 'Máximo 500 tracks por requisição' }, { status: 400 });
        }

        console.log('✅ Validações básicas passaram. Total de tracks:', trackIds.length);

        // Verificar se é um usuário admin especial (não precisa de controle de download)
        if (session.user.id === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess) {
            console.log('👑 Usuário admin detectado - permitindo todos os downloads');
            const result: Record<number, any> = {};
            trackIds.forEach(trackId => {
                result[trackId] = {
                    canDownload: true,
                    hasDownloaded: false,
                    nextAllowedDownload: null,
                    isAdmin: true
                };
            });
            console.log('✅ Resultado gerado para', Object.keys(result).length, 'tracks');
        return NextResponse.json(result);
        }

        // Verificar se o userId é válido (UUID ou CUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const cuidRegex = /^[a-z0-9]{25}$/i;

        if (!uuidRegex.test(session.user.id) && !cuidRegex.test(session.user.id)) {
            console.error('❌ ID de usuário inválido detectado:', session.user.id);
            return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 });
        }

        // Converter trackIds para números e validar
        const validTrackIds: number[] = [];
        trackIds.forEach(id => {
            const trackId = parseInt(id);
            if (!isNaN(trackId) && trackId > 0) {
                validTrackIds.push(trackId);
            }
        });

        if (validTrackIds.length === 0) {
            console.log('❌ Nenhum trackId válido encontrado');
            return NextResponse.json({ error: 'Nenhum trackId válido fornecido' }, { status: 400 });
        }

        console.log('📊 Processando', validTrackIds.length, 'tracks válidos');

        // Buscar downloads em lotes para evitar sobrecarga do banco
        const downloads: any[] = [];
        const BATCH_SIZE = 100; // Processar em lotes de 100
        
        for (let i = 0; i < validTrackIds.length; i += BATCH_SIZE) {
            const batch = validTrackIds.slice(i, i + BATCH_SIZE);
            console.log(`🔄 Processando lote ${Math.floor(i/BATCH_SIZE) + 1}:`, batch.length, 'tracks');
            
            const batchDownloads = await prisma.download.findMany({
                where: {
                    userId: session.user.id,
                    trackId: { in: batch }
                },
                orderBy: {
                    downloadedAt: 'desc'
                }
            });
            
            downloads.push(...batchDownloads);
        }

        // Mapear downloads por trackId (pegar apenas o mais recente de cada track)
        const downloadMap = new Map<number, any>();
        downloads.forEach(download => {
            if (!downloadMap.has(download.trackId)) {
                downloadMap.set(download.trackId, download);
            }
        });

        // Criar resultado para cada track solicitado
        const result: Record<string, any> = {};
        trackIds.forEach(trackId => {
            const numericTrackId = parseInt(trackId);
            const download = downloadMap.get(numericTrackId);
            
            let canDownload = true;
            if (download && download.nextAllowedDownload) {
                canDownload = new Date() >= new Date(download.nextAllowedDownload);
            }

            result[trackId] = {
                canDownload,
                hasDownloaded: !!download,
                nextAllowedDownload: download?.nextAllowedDownload,
                downloadedAt: download?.downloadedAt
            };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Erro ao verificar controle de download em lote:', error);

        // Fallback para resposta padrão em caso de erro
        const fallbackTrackIds = requestBody?.trackIds || [];
        const result: Record<string, any> = {};
        
        if (Array.isArray(fallbackTrackIds)) {
            fallbackTrackIds.forEach((trackId: any) => {
                result[trackId] = {
                    canDownload: true,
                    hasDownloaded: false,
                    nextAllowedDownload: null,
                    error: 'Erro interno - usando valores padrão'
                };
            });
        }

        return NextResponse.json(result, { status: 200 });
    }
}

// Adicionar método GET para verificação de saúde do endpoint
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        return NextResponse.json({ 
            message: 'Endpoint batch-control funcionando',
            userId: session.user.id,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro no GET batch-control:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}