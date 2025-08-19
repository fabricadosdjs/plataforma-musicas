"use client";

import React from 'react';

interface FooterSpacerProps {
    className?: string;
}

const FooterSpacer: React.FC<FooterSpacerProps> = ({ className = "h-6" }) => {
    // Detectar se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Em mobile, não adicionar espaçamento (footer player não é visível)
    if (isMobile) return null;
    
    // Em desktop, adicionar espaçamento para o footer player
    return <div className={className} />;
};

export default FooterSpacer;
