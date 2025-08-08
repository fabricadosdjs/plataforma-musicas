import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import fs from 'fs';

// GET - Listar histórico de downloads
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
            await prisma.youTubeDownload.deleteMany({
                where: {
                    userId: user.id,
                    expiresAt: {
                        lt: new Date()
                    }
                }
            });

            // Buscar downloads ativos
            downloads = await prisma.youTubeDownload.findMany({
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
            console.log('Tabela YouTubeDownload não existe ainda. Retornando lista vazia.');
        }

        return NextResponse.json({
            downloads: downloads.map(download => ({
                id: download.id,
                title: download.title,
                fileName: download.fileName,
                fileSize: download.fileSize,
                downloadUrl: download.downloadUrl,
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
            download = await prisma.youTubeDownload.findFirst({
                where: {
                    id: downloadId,
                    userId: user.id
                }
            });
        } catch (error) {
            console.log('Tabela YouTubeDownload não existe ainda.');
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
            await prisma.youTubeDownload.delete({
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
