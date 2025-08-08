// Configuração centralizada dos planos e preços da plataforma de música
// Arquivo de configuração única para manter consistência em toda a aplicação

export type PlanType = 'BASICO' | 'PADRAO' | 'COMPLETO';
export type UploaderPlanType = 'BASIC' | 'PRO' | 'ELITE';
export type PeriodType = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';

// ========== BENEFÍCIOS DOS PLANOS ==========
export const VIP_BENEFITS = {
    BASICO: {
        dailyDownloads: { enabled: true, limit: 50, description: '50 músicas/dia' },
        driveAccess: { enabled: false, description: 'Não disponível' },
        packRequests: { enabled: false, description: 'Não disponível' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: false, description: 'Não disponível' },
        playlistDownloads: { enabled: true, limit: 2, description: '2 por dia' },
        deezerPremium: { enabled: false, description: 'R$ 9,75/mês' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 35,00/mês' },
        arlPremium: { enabled: false, description: 'Não disponível' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    PADRAO: {
        dailyDownloads: { enabled: true, limit: 100, description: '100 músicas/dia' },
        driveAccess: { enabled: true, description: 'Sim' },
        packRequests: { enabled: true, description: 'Sim' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 5, description: '5 por dia' },
        deezerPremium: { enabled: false, description: 'R$ 9,75/mês' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 35,00/mês' },
        arlPremium: { enabled: false, description: 'Não disponível' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    COMPLETO: {
        dailyDownloads: { enabled: true, limit: -1, description: 'Ilimitado' },
        driveAccess: { enabled: true, description: 'Sim' },
        packRequests: { enabled: true, description: 'Sim' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: -1, description: 'Ilimitado (máx. 4 por dia)' },
        deezerPremium: { enabled: true, description: 'Incluído' },
        deemixAccess: { enabled: false, description: 'Avulso R$ 35,00/mês' },
        arlPremium: { enabled: true, description: 'Sim (automático se Deemix)' },
        musicProduction: { enabled: true, description: 'Sim' }
    }
} as const;

// ========== DEFINIÇÕES DOS PLANOS VIP ==========
export const VIP_PLANS = {
    BASICO: {
        name: 'VIP BÁSICO',
        basePrice: 38,
        minValue: 38,
        maxValue: 41.99,
        color: 'bg-blue-600',
        gradient: 'from-blue-600 to-blue-700',
        icon: '🥉',
        benefits: VIP_BENEFITS.BASICO
    },
    PADRAO: {
        name: 'VIP PADRÃO',
        basePrice: 42,
        minValue: 42,
        maxValue: 59.99,
        color: 'bg-green-600',
        gradient: 'from-green-600 to-green-700',
        icon: '🥈',
        benefits: VIP_BENEFITS.PADRAO
    },
    COMPLETO: {
        name: 'VIP COMPLETO',
        basePrice: 60,
        minValue: 60,
        maxValue: 999,
        color: 'bg-purple-600',
        gradient: 'from-purple-600 to-purple-700',
        icon: '🥇',
        benefits: VIP_BENEFITS.COMPLETO
    }
} as const;

// ========== PLANOS UPLOADER ==========
export const UPLOADER_PLANS = {
    BASIC: {
        name: 'UPLOADER BÁSICO',
        basePrice: 15,
        color: 'bg-orange-500',
        gradient: 'from-orange-500 to-orange-600',
        icon: '📤'
    },
    PRO: {
        name: 'UPLOADER PRO',
        basePrice: 25,
        color: 'bg-orange-600',
        gradient: 'from-orange-600 to-orange-700',
        icon: '🚀'
    },
    ELITE: {
        name: 'UPLOADER ELITE',
        basePrice: 35,
        color: 'bg-orange-700',
        gradient: 'from-orange-700 to-orange-800',
        icon: '🏆'
    }
} as const;

// ========== PERÍODOS DE ASSINATURA ==========
export const SUBSCRIPTION_PERIODS = {
    MONTHLY: {
        name: 'Mensal',
        months: 1,
        discount: 0,
        deemixDiscount: 0,
        deemixFree: false
    },
    QUARTERLY: {
        name: 'Trimestral',
        months: 3,
        discount: 0.05, // 5% desconto no plano
        deemixDiscount: 0.08, // 8% desconto no Deemix
        deemixFree: false
    },
    SEMIANNUAL: {
        name: 'Semestral',
        months: 6,
        discount: 0.15, // 15% desconto no plano
        deemixDiscount: 0.50, // 50% desconto no Deemix
        deemixFree: false
    },
    ANNUAL: {
        name: 'Anual',
        months: 12,
        discount: 0.15, // 15% desconto no plano
        deemixDiscount: 0,
        deemixFree: true // Deemix grátis
    }
} as const;

// ========== PREÇOS DO DEEMIX ==========
export const DEEMIX_PRICING = {
    STANDALONE: 38, // Preço avulso para não-VIP (R$ 38,00)
    BASICO: {
        basePrice: 38,
        deemixPrice: 38,
        discount: 0.38, // 38% de desconto
        finalPrice: 38 - (38 * 0.38) // R$ 23,56
    },
    PADRAO: {
        basePrice: 42,
        deemixPrice: 38,
        discount: 0.42, // 42% de desconto (proporcional ao valor)
        finalPrice: 38 - (38 * 0.42) // R$ 22,04
    },
    COMPLETO: {
        basePrice: 60,
        deemixPrice: 38,
        discount: 0.60, // 60% de desconto (proporcional ao valor)
        finalPrice: 38 - (38 * 0.60) // R$ 15,20
    }
} as const;

// ========== PREÇOS DO DEEZER PREMIUM ==========
export const DEEZER_PREMIUM_PRICING = {
    STANDALONE: 9.75, // Preço avulso mensal
    INCLUDED_WITH_DEEMIX: 0 // Grátis quando Deemix está incluído
} as const;

// ========== OPÇÃO UPLOADER ==========
export const UPLOADER_OPTION = {
    name: 'UPLOADER',
    description: 'Opção adicional para fazer upload de músicas',
    monthlyPrice: 10.00, // R$ 10,00 a mais por mês
    features: [
        'Upload de até 10 músicas por mês',
        'Badge de Uploader',
        'Acesso à comunidade de uploaders'
    ]
} as const;

// ========== LABELS DOS BENEFÍCIOS ==========
export const BENEFIT_LABELS = {
    dailyDownloads: '🎵 Downloads Diários (tracks)',
    driveAccess: '📁 Acesso ao Drive Mensal',
    packRequests: '🎚️ Solicitação de Packs',
    individualContent: '📦 Conteúdos Avulsos',
    extraPacks: '🔥 Packs Extras',
    playlistDownloads: '🎵 Solicitação de Playlists',
    deezerPremium: '🎁 Deezer Premium Grátis',
    deemixAccess: 'Acesso Deemix',
    arlPremium: '🔐 ARL Premium para Deemix',
    musicProduction: '🎼 Produção da sua Música'
} as const;

// ========== FUNÇÕES UTILITÁRIAS ==========

/**
 * Calcula preço real baseado no plano + add-ons
 */
export const calculateUserRealPrice = (basePrice: number, hasDeemix: boolean, hasDeezerPremium: boolean): number => {
    let totalPrice = basePrice;

    // Se não é VIP, não pode ter add-ons
    if (basePrice < 35) {
        return basePrice;
    }

    // Determinar plano VIP baseado no preço base
    let planKey: keyof typeof DEEMIX_PRICING = 'BASICO';
    if (basePrice >= 50) {
        planKey = 'COMPLETO';
    } else if (basePrice >= 42) {
        planKey = 'PADRAO';
    }

    // Adicionar Deemix se ativo
    if (hasDeemix && planKey in DEEMIX_PRICING) {
        const deemixPricing = DEEMIX_PRICING[planKey];
        if (typeof deemixPricing === 'object' && 'finalPrice' in deemixPricing) {
            totalPrice += deemixPricing.finalPrice;
        }
    }

    // Adicionar Deezer Premium se ativo (e se não já incluído no plano)
    if (hasDeezerPremium) {
        // VIP Completo já inclui Deezer Premium grátis
        if (planKey !== 'COMPLETO') {
            // Se tem Deemix, Deezer Premium é grátis, senão paga
            if (!hasDeemix) {
                totalPrice += DEEZER_PREMIUM_PRICING.STANDALONE;
            }
        }
    }

    return Math.round(totalPrice * 100) / 100; // Arredondar para 2 casas decimais
};

/**
 * Obtém preço base a partir do preço total (cálculo reverso)
 */
export const getBasePriceFromTotal = (totalPrice: number, hasDeemix: boolean, hasDeezerPremium: boolean): number => {
    // Se é valor baixo, provavelmente é só o plano base
    if (totalPrice < 35) {
        return totalPrice;
    }

    // Tentar diferentes planos base para ver qual bate
    const basePrices = [35, 42, 50]; // BASICO, PADRAO, COMPLETO

    for (const basePrice of basePrices) {
        const calculatedTotal = calculateUserRealPrice(basePrice, hasDeemix, hasDeezerPremium);
        if (Math.abs(calculatedTotal - totalPrice) < 0.01) {
            return basePrice;
        }
    }

    // Se não encontrou correspondência exata, retornar o valor total mesmo
    return totalPrice;
};

/**
 * Determina o plano do usuário baseado no valor mensal
 */
export const getUserPlan = (valor: number | null, hasDeemix?: boolean, hasDeezerPremium?: boolean) => {
    if (!valor || valor < 35) {
        return null;
    }

    // Se temos informações sobre add-ons, calcular o preço base
    const basePrice = (hasDeemix !== undefined && hasDeezerPremium !== undefined)
        ? getBasePriceFromTotal(valor, hasDeemix, hasDeezerPremium)
        : valor;

    // VIP Plans baseados no preço BASE
    if (basePrice >= VIP_PLANS.BASICO.minValue && basePrice <= VIP_PLANS.BASICO.maxValue) {
        return { ...VIP_PLANS.BASICO, type: 'VIP' };
    }
    if (basePrice >= VIP_PLANS.PADRAO.minValue && basePrice <= VIP_PLANS.PADRAO.maxValue) {
        return { ...VIP_PLANS.PADRAO, type: 'VIP' };
    }
    if (basePrice >= VIP_PLANS.COMPLETO.minValue && basePrice <= VIP_PLANS.COMPLETO.maxValue) {
        return { ...VIP_PLANS.COMPLETO, type: 'VIP' };
    }

    // Para valores acima do máximo, considera como VIP COMPLETO
    if (basePrice > VIP_PLANS.COMPLETO.maxValue) {
        return { ...VIP_PLANS.COMPLETO, type: 'VIP' };
    }

    return null;
};

/**
 * Calcula preço do plano com uploader e período
 */
export const calculateUserPlanWithUploader = (
    basePrice: number,
    hasDeemix: boolean,
    hasDeezerPremium: boolean,
    isUploader: boolean,
    period: PeriodType
): number => {
    let total = calculateUserRealPrice(basePrice, hasDeemix, hasDeezerPremium);

    if (basePrice >= 35 && isUploader) {
        if (period === 'MONTHLY') {
            total += UPLOADER_OPTION.monthlyPrice;
        } else if (period === 'QUARTERLY') {
            total += UPLOADER_OPTION.monthlyPrice * 0.95; // 5% desconto
        } else if (period === 'SEMIANNUAL' || period === 'ANNUAL') {
            // Uploader grátis para semestral e anual
        }
    }

    return Math.round(total * 100) / 100;
};
