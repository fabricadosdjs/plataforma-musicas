"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import Head from 'next/head';
import Header from '@/components/layout/Header'; // Supondo que o Header esteja em /components
import { Download, Loader2 } from 'lucide-react';

type Track = {
  id: number;
  songName: string;
  artist: string;
  imageUrl: string;
  downloadUrl: string;
  actionDate: string; // Data da ação (like ou download)
};

function HistoryList({ title, tracks }: { title: string, tracks: Track[] }) {
  const groupedByDate = useMemo(() => {
    return tracks.reduce((acc, track) => {
      const date = new Date(track.actionDate).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(track);
      return acc;
    }, {} as Record<string, Track[]>);
  }, [tracks]);

  if (tracks.length === 0) {
    return null; // Não renderiza a seção se não houver músicas
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dateTracks]) => (
          <div key={date}>
            <h3 className="text-md font-semibold text-gray-500 mb-3">{date}</h3>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
              {dateTracks.map(track => (
                <div key={track.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <img src={track.imageUrl} alt={track.songName} className="w-12 h-12 rounded-md object-cover" />
                    <div>
                      <div className="font-semibold text-gray-800">{track.songName}</div>
                      <div className="text-sm text-gray-500">{track.artist}</div>
                    </div>
                  </div>
                  <a href={track.downloadUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-green-100" title="Baixar Novamente">
                    <Download size={20} className="text-green-600" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          const userDataRes = await fetch('/api/user-data');
          if (!userDataRes.ok) throw new Error('Falha ao buscar dados do usuário');
          const { likes, downloads } = await userDataRes.json();

          setLikedTracks(likes || []);
          setDownloadedTracks(downloads || []);

        } catch (error) {
          console.error("Erro no perfil:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserData();
    } else if (isLoaded && !user) {
        setIsLoading(false);
    }
  }, [user, isLoaded]);

  return (
    <>
      <Head>
        <title>Meu Perfil - DJ Pool</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div className="bg-gray-50 text-gray-800 font-nunito min-h-screen">
        <Header onSearchChange={() => {}} />
        <main className="container mx-auto max-w-4xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Foto do Perfil" className="w-full h-full rounded-full object-cover"/>
              ) : (
                <span className="text-4xl font-bold text-gray-500">{user?.firstName?.[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">{user?.fullName || 'Meu Perfil'}</h1>
              <p className="text-lg text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-16">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : (
            <>
              <HistoryList title="Músicas Curtidas" tracks={likedTracks} />
              <HistoryList title="Histórico de Downloads" tracks={downloadedTracks} />
              
              {/* CORREÇÃO: Adicionada mensagem para quando não há atividades. */}
              {!isLoading && likedTracks.length === 0 && downloadedTracks.length === 0 && (
                <div className="text-center text-gray-500 p-16 border-2 border-dashed border-gray-300 rounded-lg mt-8">
                    <h3 className="text-xl font-semibold">Nenhuma atividade ainda!</h3>
                    <p className="mt-2">Suas músicas curtidas e baixadas aparecerão aqui.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
