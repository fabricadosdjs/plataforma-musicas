import React, { useState } from 'react';
import { Menu, X, Search, Filter } from 'lucide-react';

interface SidebarProps {
    children?: React.ReactNode;
    onSearch: (query: string) => void;
    searchQuery: string;
    onFilterClick: () => void;
    hasActiveFilters: boolean;
}

export default function Sidebar({ children, onSearch, searchQuery, onFilterClick, hasActiveFilters }: SidebarProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Sanduíche para mobile */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#181828] text-white shadow-lg"
                onClick={() => setOpen(true)}
                aria-label="Abrir menu"
            >
                <Menu className="h-6 w-6" />
            </button>
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-[#181828] shadow-2xl z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:w-64`}
            >
                <div className="flex items-center justify-between px-6 py-6 border-b border-[#232232]">
                    <span className="text-xl font-extrabold text-white tracking-widest">NEXOR</span>
                    <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setOpen(false)} aria-label="Fechar menu">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                {/* Barra de pesquisa */}
                <div className="px-6 py-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar músicas..."
                            value={searchQuery}
                            onChange={e => onSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#232232] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#232232]"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search className="h-5 w-5" />
                        </span>
                        <button
                            onClick={onFilterClick}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300"
                            aria-label="Filtros"
                        >
                            <Filter className="h-5 w-5" />
                            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>}
                        </button>
                    </div>
                </div>
                {/* Espaço para filtros adicionais ou navegação */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {children}
                </div>
            </aside>
            {/* Overlay para mobile */}
            {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}
        </>
    );
}
