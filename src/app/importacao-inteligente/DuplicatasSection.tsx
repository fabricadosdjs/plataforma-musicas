// src/app/importacao-inteligente/DuplicatasSection.tsx
"use client";
import { useEffect, useState } from "react";

export default function DuplicatasSection() {
  const [duplicatas, setDuplicatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/contabo/smart-import?status=duplicata")
      .then(res => res.json())
      .then(data => {
        setDuplicatas(data.duplicatas || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  async function handleDeleteSelected() {
    if (selected.length === 0) return;
    setDeleting(true);
    try {
      for (const key of selected) {
        await fetch('/api/contabo/delete-object', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
      }
      setDuplicatas(duplicatas.filter(track => !selected.includes(track.key)));
      setSelected([]);
      alert('Arquivos apagados com sucesso!');
    } catch (err) {
      alert('Erro ao apagar arquivos: ' + err);
    } finally {
      setDeleting(false);
    }
  }
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-red-400 mb-4">Duplicatas</h2>
      {loading && <div className="text-gray-300">Carregando...</div>}
      {!loading && duplicatas.length === 0 && (
        <div className="text-gray-400">Nenhuma música duplicada encontrada.</div>
      )}
      {selected.length > 0 && (
        <button
          onClick={handleDeleteSelected}
          disabled={deleting}
          className={`mb-4 px-6 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {deleting ? 'Apagando...' : 'APAGAR SELECIONADOS'}
        </button>
      )}
      <ul className="space-y-4">
        {duplicatas.map(track => (
          <li key={track.key} className="bg-[#232323] rounded-lg p-4 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(track.key)}
                onChange={() => handleSelect(track.key)}
                className="accent-red-500 h-5 w-5"
              />
              <span className="text-white font-semibold">{track.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
