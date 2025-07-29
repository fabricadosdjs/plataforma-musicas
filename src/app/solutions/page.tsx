// src/app/solutions/page.tsx
"use client"; // Esta página é um Client Component, pois terá interatividade.

import React from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowLeft, Lightbulb } from 'lucide-react'; // Ícones úteis

// Definição da interface para uma solução
interface SolutionItem {
    title: string;
    description: string;
    status: 'ok' | 'nok' | 'pending'; // ok: concluído, nok: não concluído/com problema, pending: pendente
    dateUpdated: string; // Data da última atualização da solução
    details?: string[]; // Detalhes opcionais sobre a implementação ou problemas
}

// Lista de todas as soluções/funcionalidades
const allSolutions: SolutionItem[] = [
    {
        title: 'Remoção do Drizzle e migração para Prisma',
        description: 'Todo o backend migrado para Prisma, removendo vestígios do Drizzle. Endpoints e scripts ajustados.',
        status: 'ok',
        dateUpdated: '2025-07-20',
    },
    {
        title: 'Correção de erros de sintaxe e build',
        description: 'Erros de import/export, headers/cookies, e problemas de Next.js 14+ resolvidos (várias iterações).',
        status: 'ok',
        dateUpdated: '2025-07-21',
    },
    {
        title: 'Autenticação NextAuth',
        description: 'Login funcional, autenticação robusta, integração com tabela de usuários.',
        status: 'ok',
        dateUpdated: '2025-07-22',
    },
    {
        title: 'Página de perfil (User Profile Page)',
        description: 'Implementação da página /profile mostrando informações do usuário. **Status atual: Não concluído.**',
        status: 'nok',
        dateUpdated: '2025-07-28',
        details: [
            "Página /profile mostra todas as informações do usuário (nome, email, whatsapp, plano, valor, vencimento, data pagamento, status, deemix, total downloads, total likes).",
            "Ainda precisa de depuração para garantir que todos os dados do usuário (como histórico de downloads/likes) sejam carregados corretamente."
        ]
    },
    {
        title: 'Tabela de músicas (MusicTable) - UI/UX',
        description: 'UI/UX refinada, dark theme aplicado, botões de ação (download, like, report, copyright), carregamento assíncrono.',
        status: 'ok',
        dateUpdated: '2025-07-25',
    },
    {
        title: 'Botão Curtir (Like)',
        description: 'Botão de curtir funcional. Fica azul quando ativo, persiste o status no banco de dados e carrega corretamente o histórico.',
        status: 'ok',
        dateUpdated: '2025-07-26',
    },
    {
        title: 'Botão Baixar (Download) - Persistência de Cor',
        description: 'O botão muda para azul após o download, mas a persistência da cor "Baixado" após o recarregamento da página **ainda não está funcionando**. Volta a ser cinza.',
        status: 'nok',
        dateUpdated: '2025-07-28',
        details: [
            "O estado `downloadedTracks` no `AppContext` e `MusicTable` está correto na lógica de cor.",
            "O problema está na persistência dos dados de downloads do usuário, possivelmente na API `GET /api/user-data` ou na forma como o download é salvo no DB (`POST /api/downloads/control`) ou na leitura do `AppContext`."
        ]
    },
    {
        title: 'Contador de Downloads (24h) e Limites',
        description: 'O sistema de controle de downloads por 24 horas está implementado. Alerta o usuário e exige confirmação para re-downloads no período. **Status atual: O contador regressivo no botão ainda não está exibido.**',
        status: 'nok',
        dateUpdated: '2025-07-28',
        details: [
            "Limite de 50 downloads/dia para VIPs (aviso em tela).",
            "Controle de 24h para re-download da mesma música.",
            "Contador regressivo (ex: '23h', '15m') para próximo download no botão ainda não está visível.",
            "A API `/api/downloads/batch-control` para status em lote foi corrigida."
        ]
    },
    {
        title: 'Notificações Globais',
        description: 'Sistema de notificações pop-up global (usando `Alert.tsx` no `AppContext`) está funcional e unificado.',
        status: 'ok',
        dateUpdated: '2025-07-28',
    },
    {
        title: 'Botão Reportar Erro (Bug Report)',
        description: 'Botão vermelho na MusicTable. Envio de relatório de bug diretamente via API, sem modal.',
        status: 'ok',
        dateUpdated: '2025-07-24',
    },
    {
        title: 'Botão Copyright Report',
        description: 'Botão na MusicTable. Envio de relatório de copyright diretamente via API, sem modal.',
        status: 'ok',
        dateUpdated: '2025-07-24',
    },
    {
        title: 'Página de Relatórios (/relatorios)',
        description: 'Página criada com tema escuro e visual moderno, mostrando o status das funcionalidades e removendo duplicatas.',
        status: 'ok',
        dateUpdated: '2025-07-28',
    },
    {
        title: 'Cadastro e Gerenciamento de Usuários (Admin)',
        description: 'Sistema completo de cadastro, edição e exclusão de usuários VIP e regulares na área de admin.',
        status: 'ok',
        dateUpdated: '2025-07-22',
    },
    {
        title: 'Adição de Música via JSON (Admin)',
        description: 'Funcionalidade para importar músicas em lote usando arquivos JSON, com validação e integração ao banco.',
        status: 'ok',
        dateUpdated: '2025-07-23',
    },
    {
        title: 'Importação Inteligente de Músicas',
        description: 'Sistema de importação que evita duplicatas e gerencia metadados de forma eficiente.',
        status: 'ok',
        dateUpdated: '2025-07-23',
    },
    {
        title: 'Paginação em Tabelas',
        description: 'Implementação de paginação eficiente em tabelas de usuários e músicas para melhor navegação.',
        status: 'ok',
        dateUpdated: '2025-07-24',
    },
    {
        title: 'Filtros Avançados',
        description: 'Filtros por status, VIP, estilo, artista e outros campos nas tabelas.',
        status: 'ok',
        dateUpdated: '2025-07-24',
    },
    {
        title: 'Barra de Pesquisa',
        description: 'Funcionalidade de pesquisa rápida para encontrar usuários e músicas.',
        status: 'ok',
        dateUpdated: '2025-07-24',
    },
    {
        title: 'Player de Músicas',
        description: 'Funcionalidade de reprodução de músicas na página, com controle de play/pause e navegação. **Status atual: Não concluído.**',
        status: 'nok',
        dateUpdated: '2025-07-28',
        details: [
            "Reprodução funcional para VIPs.",
            "Controle de play/pause e navegação (próxima/anterior) em implementação.",
            "Registro de plays no banco de dados."
        ]
    },
];

export default function SolutionsPage() {
    return (
        <main className="min-h-screen bg-[#18181b] text-gray-200 font-sans flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-3xl rounded-2xl shadow-lg bg-[#232326] border border-gray-800 p-8">
                <h1 className="text-3xl font-bold mb-6 text-white text-center tracking-tight flex items-center justify-center gap-3">
                    <Lightbulb className="w-8 h-8 text-yellow-400" />
                    Registro de Soluções e Funcionalidades
                </h1>
                <p className="text-gray-400 text-center mb-8">
                    Este é um registro detalhado de todas as funcionalidades implementadas e problemas corrigidos no sistema, incluindo o status atual de cada item.
                </p>
                <ul className="space-y-6">
                    {allSolutions.sort((a, b) => {
                        // Ordenar por status (nok primeiro, depois pending, depois ok)
                        const statusOrder = { 'nok': 1, 'pending': 2, 'ok': 3 };
                        if (statusOrder[a.status] !== statusOrder[b.status]) {
                            return statusOrder[a.status] - statusOrder[b.status];
                        }
                        // Depois por título para consistência
                        return a.title.localeCompare(b.title);
                    }).map((item, idx) => (
                        <li key={idx} className="rounded-xl bg-[#202124] border border-gray-700 p-5 flex flex-col gap-2 shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-white">{item.title}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${item.status === "ok"
                                    ? "bg-green-700 text-green-200 border border-green-600"
                                    : item.status === "nok"
                                        ? "bg-red-700 text-red-200 border border-red-600"
                                        : "bg-yellow-700 text-yellow-200 border border-yellow-600"
                                    }`}>
                                    {item.status === "ok" ? <CheckCircle size={16} /> : item.status === "nok" ? <XCircle size={16} /> : <Lightbulb size={16} />} {/* Ícone para pendente */}
                                    {item.status === "ok" ? "Concluído" : item.status === "nok" ? "Não concluído" : "Pendente"}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                            {item.details && item.details.length > 0 && (
                                <ul className="list-disc list-inside text-xs text-gray-400 mt-2 space-y-1">
                                    {item.details.map((detail, dIdx) => (
                                        <li key={dIdx}>{detail}</li>
                                    ))}
                                </ul>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                                Última atualização: {new Date(item.dateUpdated).toLocaleDateString('pt-BR')}
                            </p>
                        </li>
                    ))}
                </ul>
                <div className="mt-10 flex justify-center">
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium shadow-lg transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Voltar à Home
                    </Link>
                </div>
            </div>
        </main>
    );
}