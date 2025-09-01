-- ========================================
-- 🎵 PLATAFORMA DE MÚSICAS - BANCO DE DADOS
-- ========================================
-- Estrutura completa do banco de dados para PHP
-- Baseado na estrutura atual do Next.js

CREATE DATABASE IF NOT EXISTS plataforma_musicas_php;
USE plataforma_musicas_php;

-- Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('ativo', 'inativo', 'pendente') DEFAULT 'ativo',
    valor DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Campos VIP
    deemix BOOLEAN DEFAULT FALSE,
    deezer_premium BOOLEAN DEFAULT FALSE,
    
    -- Campos Uploader
    is_uploader BOOLEAN DEFAULT FALSE,
    uploader_plan_type ENUM('FREE', 'BASIC', 'PRO', 'ELITE') DEFAULT 'FREE',
    uploader_level INT DEFAULT 0,
    uploader_status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    uploader_monthly_fee DECIMAL(10,2) DEFAULT 0.00,
    uploader_benefits JSON,
    uploader_expiration TIMESTAMP NULL,
    
    -- Campos administrativos
    is_admin BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_uploader (is_uploader, uploader_plan_type)
);

-- Tabela de tracks/músicas
CREATE TABLE tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    song_name VARCHAR(500) NOT NULL,
    artist VARCHAR(500) NOT NULL,
    style VARCHAR(200),
    version VARCHAR(200),
    pool VARCHAR(200),
    folder VARCHAR(200),
    release_date DATE,
    
    -- URLs
    preview_url TEXT,
    download_url TEXT,
    image_url TEXT,
    
    -- Metadados
    duration_seconds INT,
    file_size_mb DECIMAL(8,2),
    quality VARCHAR(50) DEFAULT '320kbps',
    
    -- Contadores
    download_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    
    -- Flags
    is_community BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_artist (artist),
    INDEX idx_style (style),
    INDEX idx_pool (pool),
    INDEX idx_folder (folder),
    INDEX idx_release_date (release_date),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    FULLTEXT(song_name, artist, style)
);

-- Tabela de downloads
CREATE TABLE downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    track_id INT NOT NULL,
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    
    INDEX idx_user_downloads (user_id, download_date),
    INDEX idx_track_downloads (track_id, download_date),
    INDEX idx_download_date (download_date)
);

-- Tabela de likes
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    track_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_like (user_id, track_id),
    INDEX idx_user_likes (user_id),
    INDEX idx_track_likes (track_id)
);

-- Tabela de playlists
CREATE TABLE playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_playlists (user_id),
    INDEX idx_public_playlists (is_public)
);

-- Tabela de tracks nas playlists
CREATE TABLE playlist_tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_id INT NOT NULL,
    track_id INT NOT NULL,
    position INT DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_playlist_track (playlist_id, track_id),
    INDEX idx_playlist_order (playlist_id, position)
);

-- Tabela de sessões
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    data TEXT,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_expires (expires),
    INDEX idx_user_sessions (user_id)
);

-- Tabela de logs de atividade
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_activity (user_id, created_at),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Tabela de configurações do sistema
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key)
);

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir configurações padrão
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'Nexor Records Pools', 'Nome da plataforma'),
('max_downloads_per_day', '50', 'Máximo de downloads por dia para usuários gratuitos'),
('maintenance_mode', '0', 'Modo de manutenção (0=desabilitado, 1=habilitado)'),
('registration_enabled', '1', 'Permitir novos registros (0=não, 1=sim)'),
('version', '1.0.0', 'Versão atual da plataforma');

-- Criar usuário administrador padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (email, name, password, is_admin, status) VALUES
('admin@nexorrecords.com.br', 'Administrador', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, 'ativo');

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View de estatísticas de usuários
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.status,
    u.valor,
    u.is_uploader,
    u.uploader_plan_type,
    COUNT(DISTINCT d.id) as total_downloads,
    COUNT(DISTINCT l.id) as total_likes,
    u.created_at
FROM users u
LEFT JOIN downloads d ON u.id = d.user_id
LEFT JOIN likes l ON u.id = l.user_id
GROUP BY u.id;

-- View de tracks populares
CREATE VIEW popular_tracks AS
SELECT 
    t.*,
    COUNT(DISTINCT d.id) as download_count_real,
    COUNT(DISTINCT l.id) as like_count_real
FROM tracks t
LEFT JOIN downloads d ON t.id = d.track_id
LEFT JOIN likes l ON t.id = l.track_id
WHERE t.is_active = TRUE
GROUP BY t.id
ORDER BY download_count_real DESC, like_count_real DESC;

-- View de tracks recentes
CREATE VIEW recent_tracks AS
SELECT *
FROM tracks
WHERE is_active = TRUE
ORDER BY created_at DESC
LIMIT 50;
