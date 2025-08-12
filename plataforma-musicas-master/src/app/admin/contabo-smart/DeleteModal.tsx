import { useEffect } from 'react';

interface DeleteModalProps {
    open: boolean;
    filename: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function DeleteModal({ open, filename, onCancel, onConfirm }: DeleteModalProps) {
    useEffect(() => {
        if (!open) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onCancel]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#23233a] border border-[#3a3a3a] rounded-xl shadow-2xl p-8 min-w-[320px] max-w-[90vw] text-center animate-fade-in">
                <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-red-500 to-orange-400 rounded-full p-3 mb-2">
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    <h2 className="text-xl font-bold text-white mb-1">Remover arquivo?</h2>
                    <p className="text-gray-300 text-sm">Tem certeza que deseja apagar <span className="font-semibold text-orange-400">{filename}</span> do storage?</p>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-black transition"
                        onClick={onCancel}
                    >Cancelar</button>
                    <button
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold shadow hover:from-red-600 hover:to-orange-500 transition"
                        onClick={onConfirm}
                    >Apagar</button>
                </div>
            </div>
        </div>
    );
}
