import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

// GET - Buscar todas as solicitações
export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      orderBy: {
        requestedAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova solicitação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { songName, artist, genre, priority, notes, requestedBy } = body;

    if (!songName || !artist || !requestedBy) {
      return NextResponse.json(
        { error: 'Nome da música, artista e solicitante são obrigatórios' },
        { status: 400 }
      );
    }

    const newRequest = await prisma.request.create({
      data: {
        songName,
        artist,
        genre,
        priority: priority || 'MEDIUM',
        notes,
        requestedBy,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      message: 'Solicitação criada com sucesso',
      request: newRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}



