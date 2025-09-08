import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.CONTABO_REGION!,
    endpoint: process.env.CONTABO_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.CONTABO_ACCESS_KEY!,
        secretAccessKey: process.env.CONTABO_SECRET_KEY!,
    },
});

export async function GET(request: NextRequest) {
    try {
        // Versão de teste - retorna dados mockados
        console.log('🔍 Testando API de álbuns - versão mockada');

        // Dados de exemplo para teste
        const mockFiles = [
            {
                key: 'albuns/Plus Soda Music/Ibiza Sessions 2025/01 - Opening Set.mp3',
                url: 'https://example.com/albums/01-opening-set.mp3',
                size: 10240000, // 10MB
                lastModified: new Date().toISOString(),
                filename: '01 - Opening Set.mp3',
                artist: 'Plus Soda Music',
                album: 'Ibiza Sessions 2025',
                track: '01 - Opening Set',
                genre: 'House',
                bpm: undefined,
                musicalKey: undefined,
                duration: undefined,
                selected: false
            },
            {
                key: 'albuns/Plus Soda Music/Ibiza Sessions 2025/02 - Sunset Vibes.mp3',
                url: 'https://example.com/albums/02-sunset-vibes.mp3',
                size: 11200000, // 11.2MB
                lastModified: new Date().toISOString(),
                filename: '02 - Sunset Vibes.mp3',
                artist: 'Plus Soda Music',
                album: 'Ibiza Sessions 2025',
                track: '02 - Sunset Vibes',
                genre: 'House',
                bpm: undefined,
                musicalKey: undefined,
                duration: undefined,
                selected: false
            },
            {
                key: 'albuns/Plus Soda Music/Ibiza Sessions 2025/03 - Poolside Groove.mp3',
                url: 'https://example.com/albums/03-poolside-groove.mp3',
                size: 9800000, // 9.8MB
                lastModified: new Date().toISOString(),
                filename: '03 - Poolside Groove.mp3',
                artist: 'Plus Soda Music',
                album: 'Ibiza Sessions 2025',
                track: '03 - Poolside Groove',
                genre: 'House',
                bpm: undefined,
                musicalKey: undefined,
                duration: undefined,
                selected: false
            }
        ];

        console.log(`📁 ${mockFiles.length} arquivos mockados retornados`);

        return NextResponse.json({
            files: mockFiles,
            total: mockFiles.length,
            prefix: 'albuns/',
            search: '',
            message: 'Dados de teste - configure o Contabo para dados reais'
        });

    } catch (error) {
        console.error('❌ Erro ao listar álbuns:', error);

        return NextResponse.json(
            { error: 'Erro interno do servidor', details: error instanceof Error ? (error as Error).message : 'Erro desconhecido' },
            { status: 500 }
        );
    }
}
