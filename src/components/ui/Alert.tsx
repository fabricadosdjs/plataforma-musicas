"use client";

import { Info, X } from 'lucide-react';
import { memo } from 'react';

const Alert = memo(function Alert({ message, onClose }: { message: string, onClose: () => void }) {
    if (!message) return null;

    return (
        <div className="fixed top-24 right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-fade-in-down">
            <Info size={24} />
            <span>{message}</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                <X size={18} />
            </button>
        </div>
    );
});

export default Alert;
