"use client";

import { AlertCircle, CheckCircle, Loader2, Music } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useState } from 'react';

export default function AddMusicPage() {
    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoaded = status !== 'loading';
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        jsonData: ''
    });

    if (isLoaded && !user) {
        redirect('/auth/sign-in');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/tracks/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: formData.jsonData
            });

            const result = await response.text();

            if (response.ok) {
                setIsSuccess(true);
                setMessage('Músicas adicionadas com sucesso!');
                setFormData({ jsonData: '' });
            } else {
                setIsSuccess(false);
                setMessage(result || 'Erro ao adicionar músicas');
            }
        } catch (error) {
            console.error('Erro:', error);
            setIsSuccess(false);
            setMessage('Erro de rede ou servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 p-4">
                <div className="flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-2">
                        <Music size={24} />
                        <span className="text-xl font-bold">DJ Pool - Adicionar Música</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span>Olá, {user?.name || user?.email}</span>
                        <Link href="/admin" className="bg-blue-600 px-4 py-2 rounded text-sm">
                            Voltar ao Admin
                        </Link>
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Adicionar Músicas em Lote</h1>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${isSuccess ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                        {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            JSON das Músicas
                        </label>
                        <textarea
                            value={formData.jsonData}
                            onChange={(e) => setFormData({ ...formData, jsonData: e.target.value })}
                            className="w-full h-96 p-4 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none font-mono text-sm"
                            placeholder='Cole aqui o JSON das músicas...'
                            required
                            disabled={isLoading}
                        />
                        <p className="text-gray-400 text-sm mt-2">
                            Cole aqui um array JSON com as músicas para adicionar ao banco de dados.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !formData.jsonData.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processando...
                            </>
                        ) : (
                            'Adicionar Músicas'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
