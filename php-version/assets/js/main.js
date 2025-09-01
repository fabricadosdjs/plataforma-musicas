/**
 * 🎵 NEXOR RECORDS POOLS - JAVASCRIPT PRINCIPAL
 * Sistema completo de player, downloads e interações
 */

class MusicPlatform {
    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.audio = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.volume = 0.8;

        this.init();
    }

    /**
     * 🚀 INICIALIZAÇÃO
     */
    init() {
        this.bindEvents();
        this.initAudio();
        this.loadUserPreferences();
        this.checkForUpdates();
    }

    /**
     * 🎵 SISTEMA DE ÁUDIO
     */
    initAudio() {
        this.audio = new Audio();
        this.audio.volume = this.volume;

        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });

        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        this.audio.addEventListener('loadstart', () => {
            this.showLoading(true);
        });

        this.audio.addEventListener('canplay', () => {
            this.showLoading(false);
        });

        this.audio.addEventListener('error', () => {
            this.showError('Erro ao carregar áudio');
            this.showLoading(false);
        });
    }

    /**
     * 🎮 CONTROLES DO PLAYER
     */
    playTrack(trackData) {
        if (this.currentTrack?.id === trackData.id && this.isPlaying) {
            this.pauseTrack();
            return;
        }

        this.currentTrack = trackData;
        this.audio.src = trackData.preview_url;
        this.audio.play();
        this.isPlaying = true;

        this.updatePlayerUI();
        this.showPlayer();
        this.logActivity('track_played', trackData.id);
    }

    pauseTrack() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayerUI();
    }

    resumeTrack() {
        this.audio.play();
        this.isPlaying = true;
        this.updatePlayerUI();
    }

    stopTrack() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayerUI();
        this.hidePlayer();
    }

    nextTrack() {
        if (this.playlist.length > 0) {
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
            this.playTrack(this.playlist[this.currentIndex]);
        }
    }

    previousTrack() {
        if (this.playlist.length > 0) {
            this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
            this.playTrack(this.playlist[this.currentIndex]);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        this.saveUserPreferences();
    }

    seek(percentage) {
        if (this.audio.duration) {
            this.audio.currentTime = this.audio.duration * percentage;
        }
    }

    /**
     * 📱 INTERFACE DO PLAYER
     */
    updatePlayerUI() {
        const player = document.querySelector('.music-player');
        if (!player || !this.currentTrack) return;

        // Atualizar informações da música
        const title = player.querySelector('.player-title');
        const artist = player.querySelector('.player-artist');
        if (title) title.textContent = this.currentTrack.song_name;
        if (artist) artist.textContent = this.currentTrack.artist;

        // Atualizar botão play/pause
        const playBtn = player.querySelector('.play-pause-btn');
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying ?
                '<i class="fas fa-pause"></i>' :
                '<i class="fas fa-play"></i>';
        }

        // Atualizar botões nas cards
        this.updatePlayButtons();
    }

    updatePlayButtons() {
        document.querySelectorAll('.play-button').forEach(btn => {
            const trackId = btn.dataset.trackId;
            if (trackId == this.currentTrack?.id) {
                btn.innerHTML = this.isPlaying ?
                    '<i class="fas fa-pause"></i>' :
                    '<i class="fas fa-play"></i>';
                btn.classList.toggle('playing', this.isPlaying);
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i>';
                btn.classList.remove('playing');
            }
        });
    }

    updateProgress() {
        if (!this.audio.duration) return;

        const percentage = (this.audio.currentTime / this.audio.duration) * 100;
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

        // Atualizar tempo
        const currentTime = this.formatTime(this.audio.currentTime);
        const duration = this.formatTime(this.audio.duration);
        const timeDisplay = document.querySelector('.time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `${currentTime} / ${duration}`;
        }
    }

    showPlayer() {
        const player = document.querySelector('.music-player');
        if (player) {
            player.classList.add('active');
        }
    }

    hidePlayer() {
        const player = document.querySelector('.music-player');
        if (player) {
            player.classList.remove('active');
        }
    }

    /**
     * 📥 SISTEMA DE DOWNLOADS
     */
    async downloadTrack(trackId) {
        try {
            // Verificar se usuário pode baixar
            const canDownload = await this.checkDownloadPermission();
            if (!canDownload) {
                this.showError('Limite de downloads atingido. Considere assinar um plano VIP.');
                return;
            }

            this.showLoading(true, 'Preparando download...');

            const response = await fetch('/api/download.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ track_id: trackId })
            });

            const result = await response.json();

            if (result.success) {
                // Iniciar download
                const link = document.createElement('a');
                link.href = result.download_url;
                link.download = result.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                this.showSuccess('Download iniciado!');
                this.logActivity('track_downloaded', trackId);
                this.updateDownloadCount();
            } else {
                this.showError(result.error || 'Erro ao baixar música');
            }
        } catch (error) {
            this.showError('Erro de conexão. Tente novamente.');
            console.error('Download error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async checkDownloadPermission() {
        try {
            const response = await fetch('/api/check-permissions.php');
            const result = await response.json();
            return result.can_download;
        } catch (error) {
            console.error('Permission check error:', error);
            return false;
        }
    }

    updateDownloadCount() {
        // Atualizar contador de downloads na UI
        fetch('/api/user-stats.php')
            .then(response => response.json())
            .then(data => {
                const downloadCounter = document.querySelector('.download-counter');
                if (downloadCounter && data.downloads_today !== undefined) {
                    downloadCounter.textContent = data.downloads_today;
                }
            })
            .catch(error => console.error('Stats update error:', error));
    }

    /**
     * ❤️ SISTEMA DE LIKES
     */
    async toggleLike(trackId) {
        try {
            const response = await fetch('/api/like.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ track_id: trackId })
            });

            const result = await response.json();

            if (result.success) {
                this.updateLikeButton(trackId, result.liked, result.like_count);
                this.logActivity(result.liked ? 'track_liked' : 'track_unliked', trackId);
            } else {
                this.showError(result.error || 'Erro ao curtir música');
            }
        } catch (error) {
            this.showError('Erro de conexão. Tente novamente.');
            console.error('Like error:', error);
        }
    }

    updateLikeButton(trackId, liked, likeCount) {
        const likeBtn = document.querySelector(`[data-track-id="${trackId}"] .like-btn`);
        if (likeBtn) {
            likeBtn.classList.toggle('liked', liked);
            likeBtn.innerHTML = liked ?
                '<i class="fas fa-heart"></i>' :
                '<i class="far fa-heart"></i>';

            const countSpan = likeBtn.querySelector('.like-count');
            if (countSpan) {
                countSpan.textContent = likeCount;
            }
        }
    }

    /**
     * 🔍 SISTEMA DE BUSCA E FILTROS
     */
    initSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }

        // Filtros
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    async performSearch(query) {
        if (query.length < 2) {
            this.loadTracks();
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`/api/search.php?q=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success) {
                this.renderTracks(result.tracks);
            } else {
                this.showError(result.error || 'Erro na busca');
            }
        } catch (error) {
            this.showError('Erro de conexão na busca');
            console.error('Search error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async applyFilters() {
        const filters = {
            style: document.querySelector('#filter-style')?.value || '',
            pool: document.querySelector('#filter-pool')?.value || '',
            sort: document.querySelector('#filter-sort')?.value || 'newest'
        };

        try {
            this.showLoading(true);
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/tracks.php?${params}`);
            const result = await response.json();

            if (result.success) {
                this.renderTracks(result.tracks);
            } else {
                this.showError(result.error || 'Erro ao filtrar');
            }
        } catch (error) {
            this.showError('Erro de conexão nos filtros');
            console.error('Filter error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 🎨 RENDERIZAÇÃO DE CONTEÚDO
     */
    renderTracks(tracks) {
        const container = document.querySelector('.music-grid');
        if (!container) return;

        if (tracks.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-music"></i>
                    <h3>Nenhuma música encontrada</h3>
                    <p>Tente ajustar os filtros ou termo de busca</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tracks.map(track => this.createTrackCard(track)).join('');
        this.bindTrackEvents();
    }

    createTrackCard(track) {
        const imageUrl = track.image_url || '/assets/images/default-cover.jpg';
        const isLiked = track.user_liked || false;

        return `
            <div class="music-card fade-in" data-track-id="${track.id}">
                <div class="music-cover">
                    <img src="${imageUrl}" alt="${track.song_name}" onerror="this.src='/assets/images/default-cover.jpg'">
                    <div class="play-button" data-track-id="${track.id}">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="music-info">
                    <h3 class="music-title">${this.escapeHtml(track.song_name)}</h3>
                    <p class="music-artist">${this.escapeHtml(track.artist)}</p>
                    <div class="music-meta">
                        <span class="style">${this.escapeHtml(track.style || '')}</span>
                        <span class="duration">${this.formatDuration(track.duration_seconds)}</span>
                    </div>
                    <div class="music-actions">
                        <button class="btn btn-primary download-btn" data-track-id="${track.id}">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="btn like-btn ${isLiked ? 'liked' : ''}" data-track-id="${track.id}">
                            <i class="fas fa-heart"></i>
                            <span class="like-count">${track.like_count || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 🎪 EVENTOS E INTERAÇÕES
     */
    bindEvents() {
        // Player controls
        document.addEventListener('click', (e) => {
            if (e.target.closest('.play-pause-btn')) {
                if (this.isPlaying) {
                    this.pauseTrack();
                } else {
                    this.resumeTrack();
                }
            }

            if (e.target.closest('.next-btn')) {
                this.nextTrack();
            }

            if (e.target.closest('.prev-btn')) {
                this.previousTrack();
            }

            if (e.target.closest('.stop-btn')) {
                this.stopTrack();
            }
        });

        // Progress bar
        document.addEventListener('click', (e) => {
            const progressBar = e.target.closest('.progress-bar');
            if (progressBar) {
                const rect = progressBar.getBoundingClientRect();
                const percentage = (e.clientX - rect.left) / rect.width;
                this.seek(percentage);
            }
        });

        // Inicializar busca
        this.initSearch();

        // Bind track events
        this.bindTrackEvents();

        // Teclado shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                if (this.isPlaying) {
                    this.pauseTrack();
                } else {
                    this.resumeTrack();
                }
            }
        });
    }

    bindTrackEvents() {
        // Play buttons
        document.querySelectorAll('.play-button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const trackId = btn.dataset.trackId;
                const trackData = await this.getTrackData(trackId);
                if (trackData) {
                    this.playTrack(trackData);
                }
            });
        });

        // Download buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const trackId = btn.dataset.trackId;
                this.downloadTrack(trackId);
            });
        });

        // Like buttons
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const trackId = btn.dataset.trackId;
                this.toggleLike(trackId);
            });
        });
    }

    /**
     * 📊 DADOS E API
     */
    async getTrackData(trackId) {
        try {
            const response = await fetch(`/api/track.php?id=${trackId}`);
            const result = await response.json();
            return result.success ? result.track : null;
        } catch (error) {
            console.error('Error fetching track data:', error);
            return null;
        }
    }

    async loadTracks() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/tracks.php');
            const result = await response.json();

            if (result.success) {
                this.renderTracks(result.tracks);
                this.playlist = result.tracks;
            } else {
                this.showError(result.error || 'Erro ao carregar músicas');
            }
        } catch (error) {
            this.showError('Erro de conexão');
            console.error('Load tracks error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 💾 PERSISTÊNCIA E PREFERÊNCIAS
     */
    saveUserPreferences() {
        const preferences = {
            volume: this.volume,
            lastTrack: this.currentTrack?.id
        };
        localStorage.setItem('musicPlatformPrefs', JSON.stringify(preferences));
    }

    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('musicPlatformPrefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                if (prefs.volume !== undefined) {
                    this.setVolume(prefs.volume);
                }
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    /**
     * 📈 ANALYTICS E LOGS
     */
    async logActivity(action, trackId = null) {
        try {
            await fetch('/api/log-activity.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    track_id: trackId,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Activity log error:', error);
        }
    }

    /**
     * 🔄 ATUALIZAÇÕES E SYNC
     */
    checkForUpdates() {
        // Verificar atualizações a cada 5 minutos
        setInterval(() => {
            this.syncData();
        }, 5 * 60 * 1000);
    }

    async syncData() {
        try {
            const response = await fetch('/api/sync.php');
            const result = await response.json();

            if (result.updates_available) {
                this.showNotification('Novas músicas disponíveis!', 'info');
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    /**
     * 🔧 UTILITÁRIOS
     */
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatDuration(seconds) {
        if (!seconds) return '';
        return this.formatTime(seconds);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show, message = 'Carregando...') {
        const loading = document.querySelector('.loading-overlay');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
            const loadingText = loading.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

/**
 * 🚀 INICIALIZAÇÃO DA APLICAÇÃO
 */
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlatform = new MusicPlatform();

    // Carregar músicas iniciais
    window.musicPlatform.loadTracks();

    // Service Worker para PWA (opcional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
});

/**
 * 🎨 EFEITOS VISUAIS ADICIONAIS
 */
document.addEventListener('DOMContentLoaded', () => {
    // Parallax effect no hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animação de entrada para cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });

    document.querySelectorAll('.music-card').forEach(card => {
        observer.observe(card);
    });
});
