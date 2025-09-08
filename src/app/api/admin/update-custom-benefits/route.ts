import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        console.log('🔧 API update-custom-benefits chamada');

        const session = await getServerSession(authOptions);
        console.log('👤 Session:', session?.user?.email);

        if (!session?.user?.id) {
            console.log('❌ Usuário não autenticado');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        console.log('📥 Body recebido:', body);

        const { userId, customBenefits } = body;

        if (!userId) {
            console.log('❌ userId é obrigatório');
            return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
        }

        // Verificar se o usuário existe
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, customBenefits: true }
        });

        console.log('🎯 Target user:', targetUser);

        if (!targetUser) {
            console.log('❌ Usuário não encontrado');
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        console.log('💾 Salvando customBenefits:', customBenefits);

        // Preparar os dados para atualização - usar o método PATCH da nossa API existente
        const updateData: any = {
            customBenefits: customBenefits || {}
        };

        // Se há customBenefits, extrair e salvar os valores nos campos diretos da tabela também
        if (customBenefits) {
            if (customBenefits.weeklyPackRequests !== undefined) {
                updateData.weeklyPackRequests = customBenefits.weeklyPackRequests;
            }
            if (customBenefits.weeklyPlaylistDownloads !== undefined) {
                updateData.weeklyPlaylistDownloads = customBenefits.weeklyPlaylistDownloads;
            }
            if (customBenefits.weeklyPackRequestsUsed !== undefined) {
                updateData.weeklyPackRequestsUsed = customBenefits.weeklyPackRequestsUsed;
            }
            if (customBenefits.weeklyPlaylistDownloadsUsed !== undefined) {
                updateData.weeklyPlaylistDownloadsUsed = customBenefits.weeklyPlaylistDownloadsUsed;
            }
            if (customBenefits.deemix !== undefined) {
                updateData.deemix = customBenefits.deemix;
            }
            if (customBenefits.deezerPremium !== undefined) {
                updateData.deezerPremium = customBenefits.deezerPremium;
            }
        }

        console.log('📊 Dados para atualização:', updateData);

        // Usar nossa API existente para atualizar - chamada interna
        const updateRequest = {
            userId: userId,
            ...updateData
        };

        // Chama a função PATCH da nossa API de users
        const patchResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/users`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify(updateRequest)
        });

        if (!patchResponse.ok) {
            const errorData = await patchResponse.text();
            console.error('❌ Erro ao atualizar via API users:', errorData);
            return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
        }

        console.log('✅ Usuário atualizado via API users');

        // Buscar dados atualizados
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                customBenefits: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true,
                weeklyPackRequestsUsed: true,
                weeklyPlaylistDownloadsUsed: true,
                deemix: true,
                deezerPremium: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Benefícios personalizados atualizados com sucesso',
            user: updatedUser
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar benefícios personalizados:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
        }, { status: 500 });
    }
}