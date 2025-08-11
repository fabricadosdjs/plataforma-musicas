// Endpoint temporário para debug do valor da DATABASE_URL em produção
// ATENÇÃO: Remova após o teste para não expor informações sensíveis

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV !== 'production') {
        return res.status(403).json({ error: 'Apenas disponível em produção.' });
    }
    res.status(200).json({
        DATABASE_URL: process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA',
        DATABASE_URL_VALUE: process.env.DATABASE_URL || null
    });
}
