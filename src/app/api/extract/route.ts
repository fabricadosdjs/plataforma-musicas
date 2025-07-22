// src/app/api/extract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const mediafireUrl = req.nextUrl.searchParams.get('url');

  if (!mediafireUrl) {
    return NextResponse.json({ error: 'URL do MediaFire é obrigatória' }, { status: 400 });
  }

  try {
    const { data } = await axios.get(mediafireUrl, {
      headers: {
        // Emula um navegador real para evitar bloqueios simples
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // O seletor do botão de download no MediaFire é 'a#downloadButton'
    const downloadLink = $('#downloadButton').attr('href');

    if (downloadLink) {
      return NextResponse.json({
        name: $('div.dl-btn-label').attr('title') || 'Sem título',
        directDownloadUrl: downloadLink,
      });
    }

    return NextResponse.json({ error: 'Link de download não encontrado' }, { status: 404 });
  } catch (error) {
    console.error('[MEDIAFIRE_EXTRACT_ERROR]', error);
    return new NextResponse('Erro interno ao buscar o conteúdo', { status: 500 });
  }
}
