"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function FeaturedPage() {
    
    const PageContent = () => {
        return (
            <div className="flex-grow p-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Músicas em Destaque</h1>
                <p className="mt-4 text-gray-600">O conteúdo desta página será implementado em breve.</p>
            </div>
        );
    };

    return (
        <MainLayout>
            {() => <PageContent />}
        </MainLayout>
    );
}
