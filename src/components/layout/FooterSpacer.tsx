"use client";

import React from 'react';

interface FooterSpacerProps {
    className?: string;
}

const FooterSpacer: React.FC<FooterSpacerProps> = ({ className = "h-6" }) => {
    // Detectar se é dispositivo móvel (apenas no cliente)
    const isMobile = typeof window !== 'undefined' && typeof navigator !== 'undefined' 
        ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        : false;
    
    // Em mobile, não adicionar espaçamento (footer player não é visível)
    if (isMobile) return null;
    
    // Em desktop, adicionar espaçamento para o footer player
    return <div className={className} />;
};

export default FooterSpacer;
