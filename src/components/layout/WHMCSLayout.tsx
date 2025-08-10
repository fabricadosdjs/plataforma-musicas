// src/components/layout/WHMCSLayout.tsx
"use client";

import React from "react";
import WHMCSHeader from "./WHMCSHeader";

import WHMCSBreadcrumb from "./WHMCSBreadcrumb";
import WHMCSSidebar from "./WHMCSSidebar";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface WHMCSLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    showSidebar?: boolean;
    className?: string;
}

const WHMCSLayout = ({
    children,
    title,
    breadcrumbs = [],
    showSidebar = true,
    className = ""
}: WHMCSLayoutProps) => {
    return (
        <div className="whmcs-layout">
            {/* Header */}
            <WHMCSHeader />

            {/* Breadcrumb */}
            {breadcrumbs.length > 0 && (
                <div className="whmcs-breadcrumb-wrapper">
                    <div className="whmcs-container">
                        <WHMCSBreadcrumb items={breadcrumbs} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`whmcs-main ${className}`}>
                <div className="whmcs-container">
                    {/* Page Title */}
                    {title && (
                        <div className="whmcs-page-header">
                            <h1 className="whmcs-page-title">{title}</h1>
                        </div>
                    )}

                    {/* Content Layout */}
                    <div className={`whmcs-content-layout ${showSidebar ? 'with-sidebar' : 'full-width'}`}>
                        {/* Sidebar */}
                        {showSidebar && (
                            <div className="whmcs-sidebar-wrapper">
                                <WHMCSSidebar />
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="whmcs-content-wrapper">
                            {children}
                        </div>
                    </div>
                </div>
            </main>


        </div>
    );
};

export default WHMCSLayout;

