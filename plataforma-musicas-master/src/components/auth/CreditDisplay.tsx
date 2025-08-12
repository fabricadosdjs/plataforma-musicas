// src/components/auth/CreditDisplay.tsx
"use client";

import React from 'react';
import { Coins, Crown } from 'lucide-react';

import Link from 'next/link';

// Sistema de créditos removido

const loading = false; // Defina o valor conforme necessário

const CreditDisplay: React.FC = () => {
    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-xl">
                <div className="w-4 h-4 bg-gray-600 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">Carregando...</span>
            </div>
        );
    }

    // Adicione aqui o conteúdo padrão do componente quando não estiver carregando
    return null;
};

export default CreditDisplay;
