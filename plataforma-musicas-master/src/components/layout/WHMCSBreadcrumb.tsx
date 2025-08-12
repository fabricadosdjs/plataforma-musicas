// src/components/layout/WHMCSBreadcrumb.tsx
"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface WHMCSBreadcrumbProps {
    items: BreadcrumbItem[];
}

const WHMCSBreadcrumb = ({ items }: WHMCSBreadcrumbProps) => {
    return (
        <nav className="whmcs-breadcrumb">
            <ol className="whmcs-breadcrumb-list">
                <li className="whmcs-breadcrumb-item">
                    <Link href="/" className="whmcs-breadcrumb-link">
                        <Home className="h-4 w-4" />
                        <span>Início</span>
                    </Link>
                    <ChevronRight className="whmcs-breadcrumb-separator" />
                </li>

                {items.map((item, index) => (
                    <li key={index} className="whmcs-breadcrumb-item">
                        {item.href && index < items.length - 1 ? (
                            <>
                                <Link href={item.href} className="whmcs-breadcrumb-link">
                                    {item.label}
                                </Link>
                                <ChevronRight className="whmcs-breadcrumb-separator" />
                            </>
                        ) : (
                            <span className="whmcs-breadcrumb-current">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default WHMCSBreadcrumb;

