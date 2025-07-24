"use client";

import { UserCircle2 } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center shadow-lg">
                <div className="flex justify-center mb-6">
                    <UserCircle2 className="w-20 h-20 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Perfil do Usuário</h1>
                <p className="text-gray-400 mb-6">Gerencie suas informações e benefícios VIP.</p>
                <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-left">
                        <p className="text-gray-300"><span className="font-semibold text-white">Nome:</span> Seu Nome</p>
                        <p className="text-gray-300"><span className="font-semibold text-white">Email:</span> seuemail@exemplo.com</p>
                        <p className="text-gray-300"><span className="font-semibold text-white">Status:</span> VIP</p>
                    </div>
                    <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">Editar Perfil</button>
                </div>
            </div>
        </div>
    );
}
