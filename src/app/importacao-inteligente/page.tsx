// src/app/importacao-inteligente/page.tsx
"use client";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { useState } from "react";
import DuplicatasSection from "./DuplicatasSection";

// Exemplo de lista de músicas recusadas (substitua por dados reais da sua API)
const mockRejectedTracks = [
  { key: "musica1.mp3", name: "Música 1" },
  { key: "musica2.mp3", name: "Música 2" },
];

export default function ImportacaoInteligentePage() {
  const [tracks, setTracks] = useState(mockRejectedTracks);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Configuração do S3/Contabo
  const s3 = new S3Client({
    region: "eu-central-1", // ajuste para sua região
    endpoint: "https://<SEU_ENDPOINT_CONTABO>", // ajuste para seu endpoint
    credentials: {
      accessKeyId: "<SEU_ACCESS_KEY>",
      secretAccessKey: "<SEU_SECRET_KEY>",
    },
    forcePathStyle: true,
  });

  async function handleDelete(key: string) {
    setDeleting(key);
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: "<SEU_BUCKET>", // ajuste para seu bucket
        Key: key,
      }));
      setTracks(tracks.filter(track => track.key !== key));
      alert("Arquivo apagado com sucesso!");
    } catch (err) {
      alert("Erro ao apagar arquivo: " + err);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] py-8 px-4 font-raleway">
      <h1 className="text-2xl font-bold text-white mb-6">Importação Inteligente</h1>
      <h2 className="text-lg text-gray-300 mb-4">Arquivos no Storage</h2>
      <ul className="space-y-4">
        {tracks.map(track => (
          <li key={track.key} className="bg-[#232323] rounded-lg p-4 flex items-center justify-between">
            <span className="text-white font-semibold">{track.name}</span>
            <button
              onClick={() => handleDelete(track.key)}
              disabled={deleting === track.key}
              className={`px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition ${deleting === track.key ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {deleting === track.key ? "Apagando..." : "Apagar do Storage"}
            </button>
          </li>
        ))}
        {tracks.length === 0 && <li className="text-gray-400">Nenhum arquivo no Storage.</li>}
      </ul>
      {/* Seção Duplicatas */}
      <DuplicatasSection />
    </div>
  );
}
