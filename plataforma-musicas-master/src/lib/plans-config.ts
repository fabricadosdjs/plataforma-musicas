// ========== 🏆 CONFIGURAÇÃO CENTRALIZADA DOS PLANOS ==========

export type PlanType = 'BASICO' | 'PADRAO' | 'COMPLETO';

// ========== 📊 DEFINIÇÕES DOS PLANOS VIP ==========
export const VIP_PLANS_CONFIG = {
    BASICO: {
        id: 'BASICO',
        icon: '🥉',
        name: 'VIP BÁSICO',
        value: 38,
        color: '#CD7F32', // Bronze
        features: [
            '50 Downloads/dia',
            'Acesso ao Drive',
            'Até 4 packs/semana',
            'Até 7 playlists/semana'
        ],
        limits: {
            dailyDownloads: 50,
            weeklyPackRequests: 4,
            weeklyPlaylistDownloads: 7
        },
        benefits: {
            driveAccess: true,
            deezerPremium: false,
            deemix: false,
            musicProduction: false
        }
    },
    PADRAO: {
        id: 'PADRAO',
        icon: '🥈',
        name: 'VIP PADRÃO',
        value: 42,
        color: '#C0C0C0', // Silver
        features: [
            '75 Downloads/dia',
            'Drive + Packs',
            'Até 6 packs/semana',
            'Até 9 playlists/semana'
        ],
        limits: {
            dailyDownloads: 75,
            weeklyPackRequests: 6,
            weeklyPlaylistDownloads: 9
        },
        benefits: {
            driveAccess: true,
            deezerPremium: false,
            deemix: false,
            musicProduction: false
        }
    },
    COMPLETO: {
        id: 'COMPLETO',
        icon: '🥇',
        name: 'VIP COMPLETO',
        value: 60,
        color: '#FFD700', // Gold
        features: [
            '150 Downloads/dia',
            'Drive + Deemix*',
            'Até 10 packs/semana',
            'Playlists ilimitadas',
            'Deezer Premium',
            'Produção Musical'
        ],
        limits: {
            dailyDownloads: 150,
            weeklyPackRequests: 10,
            weeklyPlaylistDownloads: 999
        },
        benefits: {
            driveAccess: true,
            deezerPremium: true,
            deemix: false, // Disponível como add-on
            musicProduction: true
        }
    }
} as const;

// ========== 🎵 ADD-ONS DISPONÍVEIS ==========
export const ADDONS_CONFIG = {
    DEEMIX: {
        id: 'DEEMIX',
        icon: '🎧',
        name: 'Deemix',
        basePrice: 50,
        discounts: {
            BASICO: 0.35,   // 35% de desconto
            PADRAO: 0.42,   // 42% de desconto
            COMPLETO: 0.60  // 60% de desconto
        }
    },
    DEEZER_PREMIUM: {
        id: 'DEEZER_PREMIUM',
        icon: '🎁',
        name: 'Deezer Premium',
        price: 9.75,
        freeForPlans: ['COMPLETO'] as const // Incluído no VIP COMPLETO
    },
    UPLOADER: {
        id: 'UPLOADER',
        icon: '📤',
        name: 'Uploader',
        price: 10,
        discounts: {
            quarterly: 0.05,  // 5% desconto trimestral
            semiannual: 1.0,  // Grátis semestral
            annual: 1.0       // Grátis anual
        }
    }
} as const;

// ========== 🔍 FUNÇÃO PARA DETECTAR PLANO DO USUÁRIO ==========
export function getVipPlan(valor: number | null): PlanType | null {
    if (!valor) return null;

    if (valor >= 60) return 'COMPLETO';  // 🥇 VIP COMPLETO
    if (valor >= 42) return 'PADRAO';    // 🥈 VIP PADRÃO  
    if (valor >= 38) return 'BASICO';    // 🥉 VIP BÁSICO

    return null; // 📦 Usuário Free/Sem Plano
}

// ========== 📝 FUNÇÃO PARA OBTER INFORMAÇÕES DO PLANO ==========
export function getPlanInfo(valor: number | null) {
    const planType = getVipPlan(valor);

    if (!planType) {
        return {
            id: null,
            icon: '📦',
            name: 'Sem Plano',
            value: 0,
            color: '#6B7280',
            features: [],
            limits: null,
            benefits: null
        };
    }

    return VIP_PLANS_CONFIG[planType];
}

// ========== 💰 FUNÇÃO PARA CALCULAR PREÇO DO DEEMIX ==========
export function getDeemixPrice(planType: PlanType | null): number {
    const addon = ADDONS_CONFIG.DEEMIX;

    if (!planType) {
        return addon.basePrice; // Preço cheio se não tiver plano
    }

    const discount = addon.discounts[planType] || 0;
    return addon.basePrice * (1 - discount);
}

// ========== 🎁 FUNÇÃO PARA VERIFICAR SE DEEZER É GRÁTIS ==========
export function isDeezerFree(planType: PlanType | null): boolean {
    if (!planType) return false;

    return (ADDONS_CONFIG.DEEZER_PREMIUM.freeForPlans as readonly PlanType[]).includes(planType);
}

// ========== 📤 FUNÇÃO PARA CALCULAR PREÇO DO UPLOADER ==========
export function getUploaderPrice(period: 'monthly' | 'quarterly' | 'semiannual' | 'annual' = 'monthly'): number {
    const addon = ADDONS_CONFIG.UPLOADER;
    const basePrice = addon.price;

    switch (period) {
        case 'quarterly':
            return basePrice * (1 - addon.discounts.quarterly);
        case 'semiannual':
        case 'annual':
            return 0; // Grátis
        default:
            return basePrice;
    }
}
