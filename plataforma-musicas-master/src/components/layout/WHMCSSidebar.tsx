// src/components/layout/WHMCSSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    Settings,
    Activity,
    CreditCard,
    Download,
    Star,
    Bell,
    Shield,
    Key,
    Database,
    Crown,
    ChevronRight
} from "lucide-react";

interface SidebarItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
    description?: string;
}

const sidebarItems: SidebarItem[] = [
    {
        label: "Visão Geral",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
        description: "Resumo da conta e estatísticas"
    },
    {
        label: "Meus Dados",
        href: "/profile/dados",
        icon: <Settings className="h-5 w-5" />,
        description: "Informações pessoais e configurações"
    },
    {
        label: "Meu Plano",
        href: "/profile/meu-plano",
        icon: <Crown className="h-5 w-5" />,
        description: "Detalhes da assinatura VIP"
    },
    {
        label: "Benefícios",
        href: "/profile/beneficios",
        icon: <Star className="h-5 w-5" />,
        description: "Recursos disponíveis para o seu plano"
    },
    {
        label: "Atividade",
        href: "/profile/atividade",
        icon: <Activity className="h-5 w-5" />,
        description: "Histórico de downloads e ações"
    },
    {
        label: "Deemix",
        href: "/profile/deemix",
        icon: <Download className="h-5 w-5" />,
        description: "Ferramenta de download Deezer"
    },
    {
        label: "Allavsoft",
        href: "/profile/allavsoft",
        icon: <Database className="h-5 w-5" />,
        description: "Ferramenta de download universal"
    }
];

const WHMCSSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="whmcs-sidebar">
            <div className="whmcs-sidebar-header">
                <h3 className="whmcs-sidebar-title">Minha Conta</h3>
                <p className="whmcs-sidebar-subtitle">Gerencie sua conta e configurações</p>
            </div>

            <nav className="whmcs-sidebar-nav">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`whmcs-sidebar-item ${isActive ? 'active' : ''}`}
                        >
                            <div className="whmcs-sidebar-item-content">
                                <div className="whmcs-sidebar-item-icon">
                                    {item.icon}
                                </div>
                                <div className="whmcs-sidebar-item-text">
                                    <span className="whmcs-sidebar-item-label">{item.label}</span>
                                    {item.description && (
                                        <span className="whmcs-sidebar-item-desc">{item.description}</span>
                                    )}
                                </div>
                                {item.badge && (
                                    <span className="whmcs-sidebar-badge">{item.badge}</span>
                                )}
                            </div>
                            <ChevronRight className="whmcs-sidebar-arrow" />
                        </Link>
                    );
                })}
            </nav>

            {/* VIP Upgrade Banner */}
            <div className="whmcs-sidebar-banner">
                <div className="whmcs-banner-icon">
                    <Crown className="h-6 w-6" />
                </div>
                <div className="whmcs-banner-content">
                    <h4 className="whmcs-banner-title">Upgrade para VIP</h4>
                    <p className="whmcs-banner-text">
                        Desbloqueie recursos exclusivos e benefícios premium
                    </p>
                    <Link href="/plans" className="whmcs-banner-btn">
                        Ver Planos
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default WHMCSSidebar;

