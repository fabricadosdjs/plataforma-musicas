// Sistema de tracking híbrido para evitar operações no banco Neon
// Combina localStorage local com sincronização em lotes para o servidor

export interface TrackEvent {
    trackId: number;
    timestamp: number;
    type: 'download' | 'play' | 'like' | 'unlike';
    metadata?: {
        duration?: number;
        source?: string;
        userAgent?: string;
        sessionId?: string;
    };
}

export interface UserStats {
    totalDownloads: number;
    totalPlays: number;
    totalLikes: number;
    lastActivity: number;
    favoriteGenres: string[];
    favoriteArtists: string[];
}

export interface BatchSyncConfig {
    maxEvents: number;        // Máximo de eventos antes de sincronizar
    maxWaitTime: number;      // Tempo máximo de espera em ms
    retryAttempts: number;    // Tentativas de retry em caso de falha
    retryDelay: number;       // Delay entre tentativas em ms
}

export class TrackingStorage {
    private readonly STORAGE_KEYS = {
        TRACK_EVENTS: 'music_track_events',
        USER_STATS: 'music_user_stats',
        DOWNLOADED_TRACKS: 'music_downloaded_tracks',
        LIKED_TRACKS: 'music_liked_tracks',
        PLAYED_TRACKS: 'music_played_tracks',
        PENDING_SYNC: 'music_pending_sync',
        LAST_SYNC: 'music_last_sync',
        SYNC_FAILURES: 'music_sync_failures'
    };

    private readonly DEFAULT_CONFIG: BatchSyncConfig = {
        maxEvents: 10,           // Sincronizar a cada 10 eventos
        maxWaitTime: 300000,     // Ou a cada 5 minutos
        retryAttempts: 3,
        retryDelay: 5000
    };

    private syncTimeout: NodeJS.Timeout | null = null;
    private isSyncing = false;
    private config: BatchSyncConfig;

    constructor(config?: Partial<BatchSyncConfig>) {
        this.config = { ...this.DEFAULT_CONFIG, ...config };
        this.initializeStorage();
        this.setupPeriodicSync();
        this.attemptSyncOnStartup();
    }

    /**
     * Inicializa o storage se necessário
     */
    private initializeStorage(): void {
        if (typeof window === 'undefined') return;

        // Inicializar arrays se não existirem
        if (!localStorage.getItem(this.STORAGE_KEYS.TRACK_EVENTS)) {
            localStorage.setItem(this.STORAGE_KEYS.TRACK_EVENTS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.USER_STATS)) {
            localStorage.setItem(this.STORAGE_KEYS.USER_STATS, JSON.stringify(this.getDefaultUserStats()));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.DOWNLOADED_TRACKS)) {
            localStorage.setItem(this.STORAGE_KEYS.DOWNLOADED_TRACKS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.LIKED_TRACKS)) {
            localStorage.setItem(this.STORAGE_KEYS.LIKED_TRACKS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PLAYED_TRACKS)) {
            localStorage.setItem(this.STORAGE_KEYS.PLAYED_TRACKS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PENDING_SYNC)) {
            localStorage.setItem(this.STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC)) {
            localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, Date.now().toString());
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.SYNC_FAILURES)) {
            localStorage.setItem(this.STORAGE_KEYS.SYNC_FAILURES, '0');
        }
    }

    /**
     * Estatísticas padrão do usuário
     */
    private getDefaultUserStats(): UserStats {
        return {
            totalDownloads: 0,
            totalPlays: 0,
            totalLikes: 0,
            lastActivity: Date.now(),
            favoriteGenres: [],
            favoriteArtists: []
        };
    }

    /**
     * Registra um evento de track com batching inteligente
     */
    recordTrackEvent(trackId: number, type: TrackEvent['type'], metadata?: TrackEvent['metadata']): void {
        if (typeof window === 'undefined') return;

        try {
            // Adicionar sessionId para rastreamento
            const enhancedMetadata = {
                ...metadata,
                sessionId: this.getSessionId()
            };

            // Registrar evento localmente
            const events: TrackEvent[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TRACK_EVENTS) || '[]');
            const newEvent: TrackEvent = {
                trackId,
                timestamp: Date.now(),
                type,
                metadata: enhancedMetadata
            };

            events.push(newEvent);

            // Manter apenas os últimos 1000 eventos para não sobrecarregar o localStorage
            if (events.length > 1000) {
                events.splice(0, events.length - 1000);
            }

            localStorage.setItem(this.STORAGE_KEYS.TRACK_EVENTS, JSON.stringify(events));

            // Atualizar estatísticas locais
            this.updateUserStats(type);
            this.updateTrackLists(trackId, type);

            // Adicionar à fila de sincronização
            this.addToPendingSync(newEvent);

            // Verificar se deve sincronizar
            this.checkAndScheduleSync();

            // Debug: Verificar se o evento foi registrado
            const syncStatus = this.getSyncStatus();
            console.log(`📊 Evento registrado e será sincronizado automaticamente: ${trackId}`);
            console.log(`📊 Status da sincronização:`, syncStatus);
        } catch (error) {
            console.error('Erro ao registrar evento de track:', error);
        }
    }

    /**
     * Adiciona evento à fila de sincronização pendente
     */
    private addToPendingSync(event: TrackEvent): void {
        try {
            const pending: TrackEvent[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PENDING_SYNC) || '[]');
            pending.push(event);
            localStorage.setItem(this.STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        } catch (error) {
            console.error('Erro ao adicionar à fila de sincronização:', error);
        }
    }

    /**
     * Verifica se deve sincronizar e agenda se necessário
     */
    private checkAndScheduleSync(): void {
        try {
            const pending: TrackEvent[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PENDING_SYNC) || '[]');
            const lastSync = parseInt(localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC) || '0');
            const now = Date.now();

            // Sincronizar se atingiu limite de eventos ou tempo
            if (pending.length >= this.config.maxEvents ||
                (now - lastSync) >= this.config.maxWaitTime) {
                this.scheduleSync();
            }
        } catch (error) {
            console.error('Erro ao verificar sincronização:', error);
        }
    }

    /**
     * Agenda sincronização para execução
     */
    private scheduleSync(): void {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }

        // Aguardar um pouco para agrupar mais eventos
        this.syncTimeout = setTimeout(() => {
            this.syncWithServer();
        }, 1000);
    }

    /**
     * Configura sincronização periódica
     */
    private setupPeriodicSync(): void {
        if (typeof window === 'undefined') return;

        // Sincronizar a cada 5 minutos como fallback
        setInterval(() => {
            this.checkAndScheduleSync();
        }, 300000); // 5 minutos
    }

    /**
     * Tenta sincronizar na inicialização
     */
    private attemptSyncOnStartup(): void {
        if (typeof window === 'undefined') return;

        // Aguardar um pouco para a aplicação carregar
        setTimeout(() => {
            this.checkAndScheduleSync();
        }, 5000);
    }

    /**
     * Sincroniza eventos pendentes com o servidor
     */
    private async syncWithServer(): Promise<void> {
        if (this.isSyncing) return;

        try {
            this.isSyncing = true;
            const pending: TrackEvent[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PENDING_SYNC) || '[]');

            if (pending.length === 0) {
                this.isSyncing = false;
                return;
            }

            console.log(`🔄 Iniciando sincronização automática de ${pending.length} eventos...`);

            try {
                const response = await fetch('/api/tracking/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ events: pending }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log(`✅ Sincronização automática concluída: ${result.processed} eventos processados`);

                // Limpar eventos sincronizados
                this.cleanupOldPendingEvents();

                return result;
            } catch (error) {
                console.error('❌ Erro na sincronização automática:', error);
                throw error;
            }

        } catch (error) {
            console.error('Erro crítico na sincronização:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Limpa eventos pendentes antigos em caso de muitas falhas
     */
    private cleanupOldPendingEvents(): void {
        try {
            const pending: TrackEvent[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PENDING_SYNC) || '[]');
            const oneHourAgo = Date.now() - (60 * 60 * 1000);

            const recentEvents = pending.filter(event => event.timestamp > oneHourAgo);

            if (recentEvents.length < pending.length) {
                localStorage.setItem(this.STORAGE_KEYS.PENDING_SYNC, JSON.stringify(recentEvents));
                console.log(`🧹 Limpeza: ${pending.length - recentEvents.length} eventos antigos removidos`);
            }
        } catch (error) {
            console.error('Erro ao limpar eventos antigos:', error);
        }
    }

    /**
     * Gera ou recupera ID de sessão único
     */
    private getSessionId(): string {
        if (typeof window === 'undefined') return 'server';

        let sessionId = localStorage.getItem('music_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('music_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Atualiza estatísticas do usuário
     */
    private updateUserStats(type: TrackEvent['type']): void {
        try {
            const stats: UserStats = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_STATS) || '{}');

            switch (type) {
                case 'download':
                    stats.totalDownloads++;
                    break;
                case 'play':
                    stats.totalPlays++;
                    break;
                case 'like':
                    stats.totalLikes++;
                    break;
                case 'unlike':
                    stats.totalLikes = Math.max(0, stats.totalLikes - 1);
                    break;
            }

            stats.lastActivity = Date.now();
            localStorage.setItem(this.STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
        }
    }

    /**
     * Atualiza listas de tracks
     */
    private updateTrackLists(trackId: number, type: TrackEvent['type']): void {
        try {
            switch (type) {
                case 'download':
                    this.addToDownloadedTracks(trackId);
                    break;
                case 'like':
                    this.addToLikedTracks(trackId);
                    break;
                case 'unlike':
                    this.removeFromLikedTracks(trackId);
                    break;
                case 'play':
                    this.addToPlayedTracks(trackId);
                    break;
            }
        } catch (error) {
            console.error('Erro ao atualizar listas de tracks:', error);
        }
    }

    /**
     * Adiciona track aos downloads
     */
    private addToDownloadedTracks(trackId: number): void {
        const downloaded: number[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DOWNLOADED_TRACKS) || '[]');
        if (!downloaded.includes(trackId)) {
            downloaded.push(trackId);
            localStorage.setItem(this.STORAGE_KEYS.DOWNLOADED_TRACKS, JSON.stringify(downloaded));
        }
    }

    /**
     * Adiciona track aos likes
     */
    private addToLikedTracks(trackId: number): void {
        const liked: number[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.LIKED_TRACKS) || '[]');
        if (!liked.includes(trackId)) {
            liked.push(trackId);
            localStorage.setItem(this.STORAGE_KEYS.LIKED_TRACKS, JSON.stringify(liked));
        }
    }

    /**
     * Remove track dos likes
     */
    private removeFromLikedTracks(trackId: number): void {
        const liked: number[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.LIKED_TRACKS) || '[]');
        const filtered = liked.filter(id => id !== trackId);
        localStorage.setItem(this.STORAGE_KEYS.LIKED_TRACKS, JSON.stringify(filtered));
    }

    /**
     * Adiciona track aos plays
     */
    private addToPlayedTracks(trackId: number): void {
        const played: number[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PLAYED_TRACKS) || '[]');
        if (!played.includes(trackId)) {
            played.push(trackId);
            localStorage.setItem(this.STORAGE_KEYS.PLAYED_TRACKS, JSON.stringify(played));
        }
    }

    /**
     * Força sincronização imediata (útil para logout ou fechamento da página)
     */
    async forceSync(): Promise<any> {
        console.log('🔄 Sincronização manual solicitada pelo usuário...');

        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }

        return this.syncWithServer();
    }

    /**
     * Verifica se uma track foi baixada
     */
    isTrackDownloaded(trackId: number): boolean {
        if (typeof window === 'undefined') return false;
        try {
            const downloaded: number[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DOWNLOADED_TRACKS) || '[]');
            return downloaded.includes(trackId);
        } catch (error) {
            console.error('Erro ao verificar download:', error);
            return false;
        }
    }

    /**
     * Verifica se uma track foi curtida
     */
    isTrackLiked(trackId: number): boolean {
        if (typeof window === 'undefined') return false;
        try {
            const liked: number[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.LIKED_TRACKS) || '[]');
            return liked.includes(trackId);
        } catch (error) {
            console.error('Erro ao verificar like:', error);
            return false;
        }
    }

    /**
     * Verifica se uma track foi tocada
     */
    isTrackPlayed(trackId: number): boolean {
        if (typeof window === 'undefined') return false;
        try {
            const played: number[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PLAYED_TRACKS) || '[]');
            return played.includes(trackId);
        } catch (error) {
            console.error('Erro ao verificar play:', error);
            return false;
        }
    }

    /**
     * Obtém todas as tracks baixadas
     */
    getDownloadedTracks(): number[] {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DOWNLOADED_TRACKS) || '[]');
        } catch (error) {
            console.error('Erro ao obter tracks baixadas:', error);
            return [];
        }
    }

    /**
     * Obtém todas as tracks curtidas
     */
    getLikedTracks(): number[] {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.LIKED_TRACKS) || '[]');
        } catch (error) {
            console.error('Erro ao obter tracks curtidas:', error);
            return [];
        }
    }

    /**
     * Obtém todas as tracks tocadas
     */
    getPlayedTracks(): number[] {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PLAYED_TRACKS) || '[]');
        } catch (error) {
            console.error('Erro ao obter tracks tocadas:', error);
            return [];
        }
    }

    /**
     * Obtém estatísticas do usuário
     */
    getUserStats(): UserStats {
        if (typeof window === 'undefined') return this.getDefaultUserStats();
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_STATS) || '{}');
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return this.getDefaultUserStats();
        }
    }

    /**
     * Obtém histórico de eventos
     */
    getTrackEvents(limit: number = 100): TrackEvent[] {
        if (typeof window === 'undefined') return [];
        try {
            const events: TrackEvent[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TRACK_EVENTS) || '[]');
            return events.slice(-limit).reverse(); // Mais recentes primeiro
        } catch (error) {
            console.error('Erro ao obter eventos:', error);
            return [];
        }
    }

    /**
     * Obtém status de sincronização
     */
    getSyncStatus(): {
        isSyncing: boolean;
        pendingEvents: number;
        lastSync: number;
        failures: number;
    } {
        if (typeof window === 'undefined') {
            return { isSyncing: false, pendingEvents: 0, lastSync: 0, failures: 0 };
        }

        try {
            const pending: TrackEvent[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PENDING_SYNC) || '[]');
            const lastSync = parseInt(localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC) || '0');
            const failures = parseInt(localStorage.getItem(this.STORAGE_KEYS.SYNC_FAILURES) || '0');

            return {
                isSyncing: this.isSyncing,
                pendingEvents: pending.length,
                lastSync,
                failures
            };
        } catch (error) {
            console.error('Erro ao obter status de sincronização:', error);
            return { isSyncing: false, pendingEvents: 0, lastSync: 0, failures: 0 };
        }
    }

    /**
     * Limpa dados antigos (mais de 30 dias)
     */
    cleanupOldData(): void {
        if (typeof window === 'undefined') return;

        try {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const events: TrackEvent[] = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TRACK_EVENTS) || '[]');

            const filteredEvents = events.filter(event => event.timestamp > thirtyDaysAgo);
            localStorage.setItem(this.STORAGE_KEYS.TRACK_EVENTS, JSON.stringify(filteredEvents));

            console.log(`🧹 Cleanup: ${events.length - filteredEvents.length} eventos antigos removidos`);
        } catch (error) {
            console.error('Erro ao limpar dados antigos:', error);
        }
    }

    /**
     * Exporta dados para backup
     */
    exportData(): string {
        if (typeof window === 'undefined') return '';

        try {
            const data = {
                trackEvents: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TRACK_EVENTS) || '[]'),
                userStats: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USER_STATS) || '{}'),
                downloadedTracks: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DOWNLOADED_TRACKS) || '[]'),
                likedTracks: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.LIKED_TRACKS) || '[]'),
                playedTracks: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PLAYED_TRACKS) || '[]'),
                pendingSync: JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PENDING_SYNC) || '[]'),
                lastSync: localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC),
                syncFailures: localStorage.getItem(this.STORAGE_KEYS.SYNC_FAILURES),
                exportDate: new Date().toISOString()
            };

            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            return '';
        }
    }

    /**
     * Importa dados de backup
     */
    importData(jsonData: string): boolean {
        if (typeof window === 'undefined') return false;

        try {
            const data = JSON.parse(jsonData);

            if (data.trackEvents) {
                localStorage.setItem(this.STORAGE_KEYS.TRACK_EVENTS, JSON.stringify(data.trackEvents));
            }
            if (data.userStats) {
                localStorage.setItem(this.STORAGE_KEYS.USER_STATS, JSON.stringify(data.userStats));
            }
            if (data.downloadedTracks) {
                localStorage.setItem(this.STORAGE_KEYS.DOWNLOADED_TRACKS, JSON.stringify(data.downloadedTracks));
            }
            if (data.likedTracks) {
                localStorage.setItem(this.STORAGE_KEYS.LIKED_TRACKS, JSON.stringify(data.likedTracks));
            }
            if (data.playedTracks) {
                localStorage.setItem(this.STORAGE_KEYS.PLAYED_TRACKS, JSON.stringify(data.playedTracks));
            }
            if (data.pendingSync) {
                localStorage.setItem(this.STORAGE_KEYS.PENDING_SYNC, JSON.stringify(data.pendingSync));
            }
            if (data.lastSync) {
                localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, data.lastSync);
            }
            if (data.syncFailures) {
                localStorage.setItem(this.STORAGE_KEYS.SYNC_FAILURES, data.syncFailures);
            }

            console.log('✅ Dados importados com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }

    /**
     * Destrutor para limpeza
     */
    destroy(): void {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }
    }
}

// Instância global
export const trackingStorage = new TrackingStorage();

// Limpar dados antigos automaticamente a cada 7 dias
if (typeof window !== 'undefined') {
    const lastCleanup = localStorage.getItem('last_tracking_cleanup');
    const now = Date.now();

    if (!lastCleanup || (now - parseInt(lastCleanup)) > (7 * 24 * 60 * 60 * 1000)) {
        trackingStorage.cleanupOldData();
        localStorage.setItem('last_tracking_cleanup', now.toString());
    }
}

// Sincronizar antes de fechar a página
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        trackingStorage.forceSync();
    });

    window.addEventListener('pagehide', () => {
        trackingStorage.forceSync();
    });
}
