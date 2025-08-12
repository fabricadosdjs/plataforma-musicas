"use client";

import { Crown, Download, Package, PlaySquare, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function UserBenefits() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    const user = session.user as any;
    const benefits = user.benefits;

    if (!benefits) return null;

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'BÁSICO': return 'bg-blue-500';
            case 'PADRÃO': return 'bg-purple-500';
            case 'COMPLETO': return 'bg-gold-500 bg-gradient-to-r from-yellow-400 to-yellow-600';
            default: return 'bg-gray-500';
        }
    };

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'BÁSICO': return <Star className="w-4 h-4" />;
            case 'PADRÃO': return <Crown className="w-4 h-4" />;
            case 'COMPLETO': return <Crown className="w-4 h-4 text-yellow-300" />;
            default: return <Star className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
                <div className={`${getPlanColor(benefits.plan)} text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold`}>
                    {getPlanIcon(benefits.plan)}
                    Plano {benefits.plan}
                </div>
                <div className="text-sm text-gray-600">
                    R$ {user.valor}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Downloads hoje:</span>
                    <span className="font-semibold">
                        {user.dailyDownloadCount || 0}/{benefits.downloadsPerDay === 999 ? '∞' : benefits.downloadsPerDay}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Packs esta semana:</span>
                    <span className="font-semibold">
                        {user.weeklyPackRequests || 0}/{benefits.packRequestsPerWeek === 999 ? '∞' : benefits.packRequestsPerWeek}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <PlaySquare className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">Playlists esta semana:</span>
                    <span className="font-semibold">
                        {user.weeklyPlaylistDownloads || 0}/{benefits.playlistsPerWeek === 999 ? '∞' : benefits.playlistsPerWeek}
                    </span>
                </div>
            </div>

            {benefits.plan !== 'GRATUITO' && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                    {benefits.deemixAccess && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Deemix Access
                        </span>
                    )}
                    {benefits.exclusiveGenres && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            Gêneros Exclusivos
                        </span>
                    )}
                    {benefits.prioritySupport && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            Suporte Prioritário
                        </span>
                    )}
                    {benefits.trackRequest && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            Solicitação de Músicas
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
