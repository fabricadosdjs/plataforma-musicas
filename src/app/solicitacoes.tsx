"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Music, Plus, Search, Clock, CheckCircle, XCircle,
  Star, Trash2, Edit, Eye
} from 'lucide-react';

interface MusicRequest {
  id: string;
  songName: string;
  artist: string;
  genre?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  requestedAt: string;
  notes?: string;
  estimatedCompletion?: string;
}

const SolicitacoesPage = () => {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState<{
    songName: string;
    artist: string;
    genre: string;
    priority: 'low' | 'medium' | 'high';
    notes: string;
  }>({
    songName: '',
    artist: '',
    genre: '',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // Buscar solicitações via API
      const response = await fetch('/api/requests');

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        throw new Error('Erro ao buscar solicitações');
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      // Dados de exemplo para demonstração
      setRequests([
        {
          id: '1',
          songName: 'Midnight Groove',
          artist: 'DJ Groove Master',
          genre: 'House',
          priority: 'high',
          status: 'pending',
          requestedBy: 'user@example.com',
          requestedAt: new Date().toISOString(),
          notes: 'Música muito solicitada pelos usuários'
        },
        {
          id: '2',
          songName: 'Deep Bass',
          artist: 'Bass Hunter',
          genre: 'Dubstep',
          priority: 'medium',
          status: 'approved',
          requestedBy: 'dj@example.com',
          requestedAt: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Aprovada para adição na próxima atualização'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.songName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || request.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleNewRequest = async () => {
    if (!newRequest.songName || !newRequest.artist) return;

    try {
      const requestData = {
        ...newRequest,
        status: 'pending',
        requestedBy: session?.user?.email || 'anonymous',
        requestedAt: new Date().toISOString()
      };

      // Criar solicitação via API
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        // Adicionar à lista local
        setRequests([data.request, ...requests]);
        setShowNewRequestModal(false);
        setNewRequest({ songName: '', artist: '', genre: '', priority: 'medium', notes: '' });
      } else {
        throw new Error('Erro ao criar solicitação');
      }
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: MusicRequest['status']) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setRequests(requests.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        ));
      } else {
        throw new Error('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRequests(requests.filter(req => req.id !== requestId));
      } else {
        throw new Error('Erro ao deletar solicitação');
      }
    } catch (error) {
      console.error('Erro ao deletar solicitação:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'approved': return 'text-blue-400 bg-blue-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando solicitações...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Solicitações de Músicas
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Gerencie e acompanhe as solicitações de músicas dos usuários
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-2">Pendentes</h3>
              <p className="text-3xl font-bold text-white">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-2">Aprovadas</h3>
              <p className="text-3xl font-bold text-white">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-2">Completadas</h3>
              <p className="text-3xl font-bold text-white">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-2">Rejeitadas</h3>
              <p className="text-3xl font-bold text-white">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por música ou artista..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovada</option>
                <option value="rejected">Rejeitada</option>
                <option value="completed">Completada</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas as prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>

              <button
                onClick={() => setShowNewRequestModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Nova Solicitação
              </button>
            </div>
          </div>

          {/* Lista de Solicitações */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Music className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{request.songName}</h3>
                        <p className="text-gray-300 mb-2">{request.artist}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {request.genre && (
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                              {request.genre}
                            </span>
                          )}
                          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(request.status)}`}>
                            {request.status === 'pending' && 'Pendente'}
                            {request.status === 'approved' && 'Aprovada'}
                            {request.status === 'rejected' && 'Rejeitada'}
                            {request.status === 'completed' && 'Completada'}
                          </span>
                          <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority === 'high' && 'Alta Prioridade'}
                            {request.priority === 'medium' && 'Média Prioridade'}
                            {request.priority === 'low' && 'Baixa Prioridade'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.notes && (
                      <p className="text-gray-400 text-sm mb-3">{request.notes}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {request.requestedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.requestedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'approved')}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          title="Aprovar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Rejeitar"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {request.status === 'approved' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'completed')}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Marcar como completada"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteRequest(request.id)}
                      className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira solicitação de música'
                }
              </p>
              {!searchQuery && selectedStatus === 'all' && selectedPriority === 'all' && (
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
                >
                  Criar Primeira Solicitação
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Nova Solicitação */}
        {showNewRequestModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Nova Solicitação</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Nome da Música</label>
                  <input
                    type="text"
                    value={newRequest.songName}
                    onChange={(e) => setNewRequest({ ...newRequest, songName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Midnight Groove"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Artista</label>
                  <input
                    type="text"
                    value={newRequest.artist}
                    onChange={(e) => setNewRequest({ ...newRequest, artist: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: DJ Groove Master"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Gênero (opcional)</label>
                  <input
                    type="text"
                    value={newRequest.genre}
                    onChange={(e) => setNewRequest({ ...newRequest, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: House, Techno, etc."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Prioridade</label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Observações (opcional)</label>
                  <textarea
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Informações adicionais sobre a música..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewRequestModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNewRequest}
                  disabled={!newRequest.songName || !newRequest.artist}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Solicitação
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SolicitacoesPage;
