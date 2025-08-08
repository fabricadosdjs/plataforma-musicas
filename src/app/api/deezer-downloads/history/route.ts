import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// GET - Listar histórico de downloads do Deezer
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Verificar se é VIP
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { is_vip: true, id: true }
        });

        if (!user?.is_vip) {
            return NextResponse.json({
                error: 'Acesso negado. Apenas usuários VIP podem usar esta ferramenta.'
            }, { status: 403 });
        }

        // Verificar se a tabela existe antes de tentar acessá-la
        let downloads = [];

        try {
            // Limpar downloads expirados
            await prisma.deezerDownload.deleteMany({
                where: {
                    userId: user.id,
                    expiresAt: {
                        lt: new Date()
                    }
                }
            });

            // Buscar downloads ativos
            downloads = await prisma.deezerDownload.findMany({
                where: {
                    userId: user.id,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error) {
            console.log('Banco de dados não disponível, usando arquivo local');

            // Usar arquivo local de histórico
            const historyFile = path.join(process.cwd(), 'downloads', 'download_history.json');

            if (fs.existsSync(historyFile)) {
                try {
                    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
                    const now = new Date();

                    // Filtrar downloads do usuário e não expirados
                    downloads = history.filter(download =>
                        download.userId === user.id &&
                        new Date(download.expiresAt) > now
                    );

                    // Limpar downloads expirados do arquivo
                    const activeDownloads = history.filter(download =>
                        new Date(download.expiresAt) > now
                    );

                    if (activeDownloads.length !== history.length) {
                        fs.writeFileSync(historyFile, JSON.stringify(activeDownloads, null, 2));
                    }
                } catch (e) {
                    console.log('Erro ao ler arquivo de histórico:', e);
                    downloads = [];
                }
            }
        }

        return NextResponse.json({
            downloads: downloads.map(download => ({
                id: download.id,
                title: download.title,
                artist: download.artist,
                fileName: download.fileName,
                fileSize: download.fileSize,
                downloadUrl: download.downloadUrl,
                quality: download.quality,
                createdAt: download.createdAt,
                expiresAt: download.expiresAt,
                daysRemaining: Math.ceil((new Date(download.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            }))
        });

    } catch (error) {
        console.error('Erro ao buscar histórico de downloads:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}

// DELETE - Deletar download específico
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Verificar se é VIP
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { is_vip: true, id: true }
        });

        if (!user?.is_vip) {
            return NextResponse.json({
                error: 'Acesso negado. Apenas usuários VIP podem usar esta ferramenta.'
            }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const downloadId = searchParams.get('id');

        if (!downloadId) {
            return NextResponse.json({ error: 'ID do download é obrigatório' }, { status: 400 });
        }

        // Verificar se o download pertence ao usuário
        let download = null;
        try {
            download = await prisma.deezerDownload.findFirst({
                where: {
                    id: downloadId,
                    userId: user.id
                }
            });
        } catch (error) {
            console.log('Tabela DeezerDownload não existe ainda.');
            return NextResponse.json({ error: 'Sistema de histórico não disponível' }, { status: 503 });
        }

        if (!download) {
            return NextResponse.json({ error: 'Download não encontrado' }, { status: 404 });
        }

        // Deletar o arquivo físico se existir
        const filePath = `downloads/${download.fileName}`;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Deletar do banco de dados
        try {
            await prisma.deezerDownload.delete({
                where: {
                    id: downloadId
                }
            });
        } catch (error) {
            console.log('Erro ao deletar do banco de dados:', error);
        }

        return NextResponse.json({
            success: true,
            message: 'Download deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar download:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}
