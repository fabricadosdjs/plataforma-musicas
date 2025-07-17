// app/api/extract/route.ts
import { NextRequest } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const mediafireUrl = req.nextUrl.searchParams.get('url');
  if (!mediafireUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  try {
    const response = await axios.get(mediafireUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0', // Emula navegador real
      },
    });

    const $ = cheerio.load(response.data);
    const downloadLink = $('a[href*="download"]').attr('href');

    if (downloadLink) {
      return Response.json({
        name: $('meta[property="og:title"]').attr('content') || 'Sem título',
        directDownload: downloadLink,
      });
    }

    return new Response('Download link not found', { status: 404 });
  } catch (error) {
    return new Response('Erro ao buscar conteúdo', { status: 500 });
  }
}
