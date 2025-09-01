<?php
/**
 * 🎵 COMPONENTE: CARD DE MÚSICA
 * Template reutilizável para exibir informações de uma track
 */

// Verificar se a variável $track existe
if (!isset($track)) {
    return;
}

// Configurar valores padrão
$imageUrl = $track['image_url'] ?: '/assets/images/default-cover.jpg';
$duration = $track['duration_seconds'] ? gmdate("i:s", $track['duration_seconds']) : '';
$fileSize = $track['file_size_mb'] ? number_format($track['file_size_mb'], 1) . ' MB' : '';
$isLiked = isset($track['user_liked']) ? (bool)$track['user_liked'] : false;
$likeCount = $track['like_count_real'] ?? $track['like_count'] ?? 0;
$downloadCount = $track['download_count_real'] ?? $track['download_count'] ?? 0;

// Verificar se usuário está logado
$currentUser = null;
if (class_exists('Auth')) {
    $auth = new Auth();
    $currentUser = $auth->getCurrentUser();
}

// Badges do track
$badges = [];
if ($track['is_featured']) {
    $badges[] = '<span class="badge badge-primary"><i class="fas fa-star"></i> Destaque</span>';
}
if ($track['is_community']) {
    $badges[] = '<span class="badge badge-success"><i class="fas fa-users"></i> Comunidade</span>';
}

// Data de lançamento formatada
$releaseDate = '';
if ($track['release_date']) {
    $releaseDate = date('d/m/Y', strtotime($track['release_date']));
}
?>

<div class="music-card fade-in" data-track-id="<?php echo $track['id']; ?>">
    <!-- Capa da música -->
    <div class="music-cover">
        <img src="<?php echo htmlspecialchars($imageUrl); ?>" 
             alt="<?php echo htmlspecialchars($track['song_name']); ?>" 
             onerror="this.src='/assets/images/default-cover.jpg'"
             loading="lazy">
        
        <!-- Botão de play -->
        <div class="play-button" 
             data-track-id="<?php echo $track['id']; ?>"
             data-song-name="<?php echo htmlspecialchars($track['song_name']); ?>"
             data-artist="<?php echo htmlspecialchars($track['artist']); ?>"
             data-preview-url="<?php echo htmlspecialchars($track['preview_url'] ?? ''); ?>"
             title="Reproduzir">
            <i class="fas fa-play"></i>
        </div>
        
        <!-- Badges sobrepostos -->
        <?php if (!empty($badges)): ?>
            <div class="track-badges">
                <?php echo implode('', $badges); ?>
            </div>
        <?php endif; ?>
        
        <!-- Duração -->
        <?php if ($duration): ?>
            <div class="track-duration"><?php echo $duration; ?></div>
        <?php endif; ?>
    </div>
    
    <!-- Informações da música -->
    <div class="music-info">
        <!-- Título e artista -->
        <h3 class="music-title" title="<?php echo htmlspecialchars($track['song_name']); ?>">
            <?php echo htmlspecialchars($track['song_name']); ?>
        </h3>
        
        <p class="music-artist" title="<?php echo htmlspecialchars($track['artist']); ?>">
            <?php echo htmlspecialchars($track['artist']); ?>
        </p>
        
        <!-- Versão (se existir) -->
        <?php if (!empty($track['version'])): ?>
            <p class="music-version">
                <i class="fas fa-compact-disc"></i>
                <?php echo htmlspecialchars($track['version']); ?>
            </p>
        <?php endif; ?>
        
        <!-- Metadados -->
        <div class="music-meta">
            <div class="meta-row">
                <?php if (!empty($track['style'])): ?>
                    <span class="meta-item style" title="Estilo musical">
                        <i class="fas fa-music"></i>
                        <?php echo htmlspecialchars($track['style']); ?>
                    </span>
                <?php endif; ?>
                
                <?php if (!empty($track['pool'])): ?>
                    <span class="meta-item pool" title="Pool">
                        <i class="fas fa-swimming-pool"></i>
                        <?php echo htmlspecialchars($track['pool']); ?>
                    </span>
                <?php endif; ?>
            </div>
            
            <div class="meta-row">
                <?php if ($releaseDate): ?>
                    <span class="meta-item date" title="Data de lançamento">
                        <i class="fas fa-calendar"></i>
                        <?php echo $releaseDate; ?>
                    </span>
                <?php endif; ?>
                
                <?php if ($fileSize): ?>
                    <span class="meta-item size" title="Tamanho do arquivo">
                        <i class="fas fa-file-audio"></i>
                        <?php echo $fileSize; ?>
                    </span>
                <?php endif; ?>
            </div>
            
            <?php if (!empty($track['quality'])): ?>
                <div class="meta-row">
                    <span class="meta-item quality" title="Qualidade do áudio">
                        <i class="fas fa-signal"></i>
                        <?php echo htmlspecialchars($track['quality']); ?>
                    </span>
                </div>
            <?php endif; ?>
        </div>
        
        <!-- Estatísticas -->
        <div class="music-stats">
            <div class="stat-item">
                <i class="fas fa-download"></i>
                <span><?php echo number_format($downloadCount); ?></span>
            </div>
            <div class="stat-item">
                <i class="fas fa-heart"></i>
                <span class="like-count"><?php echo number_format($likeCount); ?></span>
            </div>
            <?php if (!empty($track['folder'])): ?>
                <div class="stat-item" title="Pasta: <?php echo htmlspecialchars($track['folder']); ?>">
                    <i class="fas fa-folder"></i>
                    <span><?php echo htmlspecialchars(substr($track['folder'], 0, 15)) . (strlen($track['folder']) > 15 ? '...' : ''); ?></span>
                </div>
            <?php endif; ?>
        </div>
        
        <!-- Ações -->
        <div class="music-actions">
            <?php if ($currentUser): ?>
                <!-- Botão de download -->
                <button class="btn btn-primary download-btn" 
                        data-track-id="<?php echo $track['id']; ?>"
                        title="Baixar música">
                    <i class="fas fa-download"></i>
                    <span class="btn-text">Download</span>
                </button>
                
                <!-- Botão de like -->
                <button class="btn like-btn <?php echo $isLiked ? 'liked' : ''; ?>" 
                        data-track-id="<?php echo $track['id']; ?>"
                        title="<?php echo $isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'; ?>">
                    <i class="fas fa-heart"></i>
                    <span class="like-count"><?php echo number_format($likeCount); ?></span>
                </button>
                
                <!-- Botão de playlist -->
                <button class="btn btn-secondary playlist-btn" 
                        data-track-id="<?php echo $track['id']; ?>"
                        title="Adicionar à playlist">
                    <i class="fas fa-plus"></i>
                </button>
                
                <!-- Menu de opções -->
                <div class="track-menu">
                    <button class="btn btn-ghost menu-toggle" title="Mais opções">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    
                    <div class="track-menu-dropdown">
                        <a href="/track.php?id=<?php echo $track['id']; ?>" class="menu-item">
                            <i class="fas fa-info-circle"></i>
                            Ver detalhes
                        </a>
                        
                        <?php if (!empty($track['preview_url'])): ?>
                            <a href="<?php echo htmlspecialchars($track['preview_url']); ?>" 
                               target="_blank" class="menu-item">
                                <i class="fas fa-external-link-alt"></i>
                                Preview externo
                            </a>
                        <?php endif; ?>
                        
                        <button class="menu-item share-btn" 
                                data-track-id="<?php echo $track['id']; ?>">
                            <i class="fas fa-share-alt"></i>
                            Compartilhar
                        </button>
                        
                        <button class="menu-item report-btn" 
                                data-track-id="<?php echo $track['id']; ?>">
                            <i class="fas fa-flag"></i>
                            Reportar
                        </button>
                    </div>
                </div>
            <?php else: ?>
                <!-- Usuário não logado -->
                <a href="/login.php" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i>
                    Login para Download
                </a>
                
                <a href="/register.php" class="btn btn-outline">
                    <i class="fas fa-user-plus"></i>
                    Cadastrar
                </a>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Overlay de loading (para downloads) -->
    <div class="track-loading" style="display: none;">
        <div class="loading-spinner"></div>
        <div class="loading-text">Preparando download...</div>
    </div>
</div>

<style>
/* Estilos específicos para o card de música */
.music-card {
    position: relative;
    overflow: visible;
}

.track-badges {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.track-duration {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.music-version {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.music-meta {
    margin-bottom: 1rem;
}

.meta-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    white-space: nowrap;
}

.meta-item i {
    width: 12px;
    text-align: center;
}

.music-stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: var(--bg-tertiary);
    border-radius: 0.25rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.music-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    position: relative;
}

.music-actions .btn {
    flex: 1;
    min-width: 0;
    justify-content: center;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
}

.btn-text {
    display: none;
}

@media (min-width: 380px) {
    .btn-text {
        display: inline;
    }
}

.like-btn.liked {
    background: var(--error-color);
    color: white;
}

.track-menu {
    position: relative;
}

.track-menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--bg-card);
    border: 1px solid var(--bg-tertiary);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-lg);
    min-width: 150px;
    z-index: 10;
    display: none;
}

.track-menu.active .track-menu-dropdown {
    display: block;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    color: var(--text-primary);
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: var(--transition);
    font-size: 0.875rem;
}

.menu-item:hover {
    background: var(--bg-hover);
}

.track-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 20;
    border-radius: var(--border-radius);
}

.loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid var(--bg-tertiary);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
}

.loading-text {
    color: white;
    font-size: 0.875rem;
}

/* Responsividade */
@media (max-width: 480px) {
    .meta-row {
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .music-stats {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .music-actions {
        flex-direction: column;
    }
    
    .music-actions .btn {
        flex: none;
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Toggle menu de opções
    document.querySelectorAll('.menu-toggle').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const menu = this.closest('.track-menu');
            
            // Fechar outros menus
            document.querySelectorAll('.track-menu.active').forEach(activeMenu => {
                if (activeMenu !== menu) {
                    activeMenu.classList.remove('active');
                }
            });
            
            menu.classList.toggle('active');
        });
    });
    
    // Fechar menus ao clicar fora
    document.addEventListener('click', function() {
        document.querySelectorAll('.track-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    });
    
    // Botão de compartilhar
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', function() {
            const trackId = this.dataset.trackId;
            const url = `${window.location.origin}/track.php?id=${trackId}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Confira esta música',
                    url: url
                });
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    alert('Link copiado para a área de transferência!');
                });
            }
        });
    });
    
    // Botão de reportar
    document.querySelectorAll('.report-btn').forEach(button => {
        button.addEventListener('click', function() {
            const trackId = this.dataset.trackId;
            
            if (confirm('Deseja reportar esta música?')) {
                fetch('/api/report.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        track_id: trackId,
                        reason: 'Conteúdo inadequado'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Obrigado pelo reporte. Nossa equipe irá analisar.');
                    } else {
                        alert('Erro ao enviar reporte. Tente novamente.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Erro de conexão. Tente novamente.');
                });
            }
        });
    });
});
</script>
