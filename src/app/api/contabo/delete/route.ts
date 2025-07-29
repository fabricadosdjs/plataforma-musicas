import { contaboStorage } from '@/lib/contabo-storage';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { key } = await req.json();
        if (!key) {
            return NextResponse.json({ error: 'Chave do arquivo não informada.' }, { status: 400 });
        }
        await contaboStorage.deleteFile(key);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE_FILE_ERROR]', error);
        return NextResponse.json({ error: error?.message || 'Erro ao deletar arquivo.' }, { status: 500 });
    }
}
