import React from "react";
import { CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import Link from "next/link";

// Definição original de relatórios (com status)
const relatoriosBase = [
  {
    title: 'Contador do botão Baixar',
    description: 'O contador regressivo (horas/minutos/segundos) não está sendo exibido após o download. Precisa corrigir para mostrar o tempo restante até liberar novamente.',
    status: 'nok',
  },
  {
    title: 'Remoção do Drizzle e migração para Prisma',
    description: 'Todo o backend foi migrado para Prisma, removendo vestígios do Drizzle. Endpoints e scripts ajustados.',
    status: 'ok',
  },
  {
    title: 'Correção de erros de sintaxe e build',
    description: 'Erros de import/export, headers/cookies, e problemas de Next.js 14+ foram resolvidos.',
    status: 'ok',
  },
  {
    title: 'Autenticação NextAuth',
    description: 'Login funcional, autenticação robusta, integração com tabela de usuários.',
    status: 'ok',
  },
  {
    title: 'Página de perfil completa',
    // ATUALIZADO: Status e descrição para 'Não concluído'
    description: 'Página /profile mostra todas as informações do usuário.',
    status: 'nok',
  },
  {
    title: 'Tabela de músicas (MusicTable)',
    description: 'UI/UX refinada, dark theme, botões coloridos, download, like, report, copyright, notificações globais.',
    status: 'ok',
  },
  {
    title: 'Botão Like',
    description: 'O botão de curtir fica vermelho quando ativo e salva o status corretamente no banco de dados.',
    status: 'ok',
  },
  {
    title: 'Botão Baixar',
    description: 'O botão muda de cor após o download, mas a persistência da cor "Baixado" após o recarregamento da página ainda não está funcionando. Além disso, o contador regressivo não está sendo exibido.',
    status: 'nok',
  },
  {
    title: 'Notificações globais',
    // ATUALIZADO: Status e descrição para 'Não concluído'
    description: 'Notificações com react-toastify, topo da página, estilizadas, visíveis e responsivas.',
    status: 'nok',
  },
  {
    title: 'Botão Reportar erro',
    description: 'Botão vermelho, report enviado diretamente, modal removido conforme solicitado.',
    status: 'ok',
  },
  {
    title: 'Página de relatórios',
    description: 'Página /relatorios criada com tema escuro, visual moderno e status das tarefas.',
    status: 'ok',
  },
];

// Definição original de completedItems
const completedItemsBase = [
  {
    title: "Cadastro de Usuários",
    description: "Sistema de cadastro, edição e exclusão de usuários VIP e regulares.",
  },
  {
    title: "Adição de música via JSON",
    description: "Importação de músicas em lote usando arquivos JSON, com validação automática.",
  },
  {
    title: "Favoritos Funcionando", // Corresponde a "Botão Like"
    description: "Sistema de likes/favoritos para músicas, integrado ao perfil do usuário.",
  },
  {
    title: "Botão Bug Report", // Corresponde a "Botão Reportar erro"
    description: "Botão para reportar bugs diretamente pela interface, integrado à API.",
  },
  {
    title: "Botão Copyright Report",
    description: "Botão para reportar problemas de copyright nas músicas, integrado à API.",
  },
  {
    title: "Importação Inteligente",
    description: "Importação automática e inteligente de músicas, evitando duplicatas e erros.",
  },
  {
    title: "Paginação",
    description: "Paginação eficiente nas tabelas de usuários e músicas para melhor navegação.",
  },
  {
    title: "Filtros",
    description: "Filtros avançados por status, VIP, estilo, artista e outros campos.",
  },
  {
    title: "Pesquisa",
    description: "Barra de pesquisa rápida para encontrar usuários e músicas facilmente.",
  },
];

// Combina as listas e remove duplicatas, priorizando relatoriosBase
const combinedFeatures = (() => {
  const featuresMap = new Map();

  // Adiciona todos os itens de relatoriosBase ao mapa
  relatoriosBase.forEach(item => {
    featuresMap.set(item.title, { ...item }); // Clona o item para não modificar o original
  });

  // Adiciona itens de completedItemsBase que não estão no mapa, ou atualiza se o status for "ok" (se relatoriosBase tinha "nok" e completedItems é "ok")
  completedItemsBase.forEach(item => {
    // Normaliza títulos para correspondência
    const normalizedTitle = item.title.replace('Botão Bug Report', 'Botão Reportar erro')
      .replace('Favoritos Funcionando', 'Botão Like');

    // Verifica se já existe um item com o título original ou normalizado
    const existing = featuresMap.get(item.title) || featuresMap.get(normalizedTitle);

    if (!existing) {
      // Se não existe, adiciona como 'ok'
      featuresMap.set(item.title, { ...item, status: 'ok' });
    } else {
      // Se já existe, atualiza apenas se o status existente for 'nok'
      // Exceção: 'Botão Baixar', 'Página de perfil completa', 'Notificações globais' devem permanecer 'nok' se relatoriosBase os define assim
      const titlesToKeepNok = ['Botão Baixar', 'Página de perfil completa', 'Notificações globais'];

      if (existing.status === 'nok' && !titlesToKeepNok.includes(existing.title)) {
        // Se o item existente estava como 'nok' e NÃO é um dos itens que deve SEMPRE ser 'nok'
        featuresMap.set(item.title, { ...existing, status: 'ok' });
      } else if (existing.status !== 'nok' && titlesToKeepNok.includes(existing.title)) {
        // Caso em que completedItemsBase pode tentar sobrescrever um 'nok' que queremos manter
        // Esta condição garante que 'nok' de relatoriosBase prevaleça para os itens específicos
        featuresMap.set(existing.title, { ...existing, status: 'nok' }); // Reafirma 'nok'
      }
    }
  });

  return Array.from(featuresMap.values());
})();


export default function RelatoriosPage() {
  return (
    <main className="min-h-screen bg-[#18181b] text-gray-200 font-sans flex flex-col items-center py-12 px-4 z-0" style={{ zIndex: 0 }}>
      <div className="w-full max-w-2xl rounded-2xl shadow-lg bg-[#232326] border border-gray-800 p-8">
        <h1 className="text-3xl font-bold mb-6 text-white text-center tracking-tight">Relatório de Funcionalidades</h1>
        <ul className="space-y-6">
          {combinedFeatures.map((item, idx) => ( // Usando a lista combinada
            <li key={idx} className="rounded-xl bg-[#202124] border border-gray-700 p-5 flex flex-col gap-2 shadow">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">{item.title}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${item.status === "ok"
                  ? "bg-green-700 text-green-200 border border-green-600"
                  : item.status === "nok"
                    ? "bg-red-700 text-red-200 border border-red-600"
                    : "bg-yellow-700 text-yellow-200 border border-yellow-600"
                  }`}>
                  {item.status === "ok" ? <CheckCircle size={16} /> : item.status === "nok" ? <XCircle size={16} /> : <Clock size={16} />}
                  {item.status === "ok" ? "Concluído" : item.status === "nok" ? "Não concluído" : "Pendente"}
                </span>
              </div>
              <p className="text-gray-300 text-sm mt-1">{item.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center text-xs text-gray-500">Atualizado em 25/07/2025</div>
        <div className="flex justify-center mt-6">
          <a href="/new" className="inline-block px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base shadow transition-all duration-200 border border-blue-900">
            Ir para Nova Música
          </a>
        </div>
      </div>
      {/* Removido o segundo bloco "Funcionalidades Concluídas" duplicado */}
    </main>
  );
}