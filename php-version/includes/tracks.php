<?php
/**
 * 🎵 GERENCIADOR DE TRACKS
 * Sistema completo para gerenciar músicas
 */

require_once __DIR__ . '/../config/database.php';

class TracksManager {
    private $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * 📋 LISTAR TRACKS
     */
    public function getTracks($filters = [], $limit = 50, $offset = 0) {
        $conditions = ["t.is_active = 1"];
        $params = [];
        
        // Aplicar filtros
        if (!empty($filters['search'])) {
            $conditions[] = "(MATCH(t.song_name, t.artist, t.style) AGAINST (?) OR t.song_name LIKE ? OR t.artist LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $filters['search'];
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        if (!empty($filters['style'])) {
            $conditions[] = "t.style = ?";
            $params[] = $filters['style'];
        }
        
        if (!empty($filters['pool'])) {
            $conditions[] = "t.pool = ?";
            $params[] = $filters['pool'];
        }
        
        if (!empty($filters['folder'])) {
            $conditions[] = "t.folder = ?";
            $params[] = $filters['folder'];
        }
        
        if (!empty($filters['artist'])) {
            $conditions[] = "t.artist LIKE ?";
            $params[] = '%' . $filters['artist'] . '%';
        }
        
        // Ordenação
        $orderBy = "t.created_at DESC";
        switch ($filters['sort'] ?? 'newest') {
            case 'popular':
                $orderBy = "t.download_count DESC, t.created_at DESC";
                break;
            case 'liked':
                $orderBy = "t.like_count DESC, t.created_at DESC";
                break;
            case 'alphabetical':
                $orderBy = "t.artist ASC, t.song_name ASC";
                break;
            case 'oldest':
                $orderBy = "t.created_at ASC";
                break;
        }
        
        $whereClause = implode(' AND ', $conditions);
        
        $sql = "SELECT t.*, 
                       COUNT(DISTINCT l.id) as like_count_real,
                       COUNT(DISTINCT d.id) as download_count_real
                FROM tracks t
                LEFT JOIN likes l ON t.id = l.track_id
                LEFT JOIN downloads d ON t.id = d.track_id
                WHERE {$whereClause}
                GROUP BY t.id
                ORDER BY {$orderBy}
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        
        return $this->db->select($sql, $params);
    }
    
    /**
     * 🆕 TRACKS RECENTES
     */
    public function getRecentTracks($limit = 12) {
        $sql = "SELECT t.*, 
                       COUNT(DISTINCT l.id) as like_count_real,
                       COUNT(DISTINCT d.id) as download_count_real
                FROM tracks t
                LEFT JOIN likes l ON t.id = l.track_id
                LEFT JOIN downloads d ON t.id = d.track_id
                WHERE t.is_active = 1
                GROUP BY t.id
                ORDER BY t.created_at DESC
                LIMIT ?";
        
        return $this->db->select($sql, [$limit]);
    }
    
    /**
     * 🔥 TRACKS POPULARES
     */
    public function getPopularTracks($limit = 12) {
        $sql = "SELECT t.*, 
                       COUNT(DISTINCT l.id) as like_count_real,
                       COUNT(DISTINCT d.id) as download_count_real
                FROM tracks t
                LEFT JOIN likes l ON t.id = l.track_id
                LEFT JOIN downloads d ON t.id = d.track_id
                WHERE t.is_active = 1
                GROUP BY t.id
                ORDER BY download_count_real DESC, like_count_real DESC, t.created_at DESC
                LIMIT ?";
        
        return $this->db->select($sql, [$limit]);
    }
    
    /**
     * 🎯 OBTER TRACK POR ID
     */
    public function getTrackById($trackId, $userId = null) {
        $sql = "SELECT t.*, 
                       COUNT(DISTINCT l.id) as like_count_real,
                       COUNT(DISTINCT d.id) as download_count_real";
        
        if ($userId) {
            $sql .= ", (SELECT COUNT(*) FROM likes ul WHERE ul.track_id = t.id AND ul.user_id = ?) as user_liked";
        }
        
        $sql .= " FROM tracks t
                  LEFT JOIN likes l ON t.id = l.track_id
                  LEFT JOIN downloads d ON t.id = d.track_id
                  WHERE t.id = ? AND t.is_active = 1
                  GROUP BY t.id";
        
        $params = $userId ? [$userId, $trackId] : [$trackId];
        
        return $this->db->selectOne($sql, $params);
    }
    
    /**
     * ➕ ADICIONAR NOVA TRACK
     */
    public function addTrack($data) {
        $requiredFields = ['song_name', 'artist', 'download_url'];
        
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return ['success' => false, 'error' => "Campo obrigatório: {$field}"];
            }
        }
        
        // Verificar se já existe
        $existing = $this->db->selectOne(
            "SELECT id FROM tracks WHERE song_name = ? AND artist = ? AND download_url = ?",
            [$data['song_name'], $data['artist'], $data['download_url']]
        );
        
        if ($existing) {
            return ['success' => false, 'error' => 'Música já existe no sistema'];
        }
        
        $sql = "INSERT INTO tracks (
                    song_name, artist, style, version, pool, folder, 
                    release_date, preview_url, download_url, image_url,
                    duration_seconds, file_size_mb, quality, is_community
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $data['song_name'],
            $data['artist'],
            $data['style'] ?? null,
            $data['version'] ?? null,
            $data['pool'] ?? null,
            $data['folder'] ?? null,
            $data['release_date'] ?? date('Y-m-d'),
            $data['preview_url'] ?? null,
            $data['download_url'],
            $data['image_url'] ?? null,
            $data['duration_seconds'] ?? null,
            $data['file_size_mb'] ?? null,
            $data['quality'] ?? '320kbps',
            $data['is_community'] ?? false
        ];
        
        $trackId = $this->db->insert($sql, $params);
        
        if ($trackId) {
            return ['success' => true, 'track_id' => $trackId];
        }
        
        return ['success' => false, 'error' => 'Erro ao adicionar música'];
    }
    
    /**
     * ✏️ ATUALIZAR TRACK
     */
    public function updateTrack($trackId, $data) {
        $allowedFields = [
            'song_name', 'artist', 'style', 'version', 'pool', 'folder',
            'release_date', 'preview_url', 'download_url', 'image_url',
            'duration_seconds', 'file_size_mb', 'quality', 'is_community', 'is_featured'
        ];
        
        $updateFields = [];
        $params = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "{$field} = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($updateFields)) {
            return ['success' => false, 'error' => 'Nenhum campo para atualizar'];
        }
        
        $params[] = $trackId;
        $sql = "UPDATE tracks SET " . implode(', ', $updateFields) . " WHERE id = ?";
        
        $result = $this->db->update($sql, $params);
        
        if ($result !== false) {
            return ['success' => true];
        }
        
        return ['success' => false, 'error' => 'Erro ao atualizar música'];
    }
    
    /**
     * 🗑️ REMOVER TRACK
     */
    public function deleteTrack($trackId) {
        // Soft delete - apenas desativar
        $result = $this->db->update("UPDATE tracks SET is_active = 0 WHERE id = ?", [$trackId]);
        
        if ($result) {
            return ['success' => true];
        }
        
        return ['success' => false, 'error' => 'Erro ao remover música'];
    }
    
    /**
     * ❤️ CURTIR/DESCURTIR TRACK
     */
    public function toggleLike($trackId, $userId) {
        // Verificar se já curtiu
        $existing = $this->db->selectOne(
            "SELECT id FROM likes WHERE track_id = ? AND user_id = ?",
            [$trackId, $userId]
        );
        
        if ($existing) {
            // Remover like
            $this->db->delete("DELETE FROM likes WHERE id = ?", [$existing['id']]);
            $liked = false;
        } else {
            // Adicionar like
            $this->db->insert("INSERT INTO likes (track_id, user_id) VALUES (?, ?)", [$trackId, $userId]);
            $liked = true;
        }
        
        // Atualizar contador na tabela tracks
        $likeCount = $this->db->selectOne(
            "SELECT COUNT(*) as count FROM likes WHERE track_id = ?",
            [$trackId]
        )['count'];
        
        $this->db->update("UPDATE tracks SET like_count = ? WHERE id = ?", [$likeCount, $trackId]);
        
        return [
            'success' => true,
            'liked' => $liked,
            'like_count' => $likeCount
        ];
    }
    
    /**
     * 📥 REGISTRAR DOWNLOAD
     */
    public function recordDownload($trackId, $userId, $ipAddress = null, $userAgent = null) {
        // Verificar se pode baixar
        $auth = new Auth();
        $user = $auth->getCurrentUser();
        
        if (!canUserDownload($userId)) {
            return ['success' => false, 'error' => 'Limite de downloads diário atingido'];
        }
        
        // Registrar download
        $sql = "INSERT INTO downloads (user_id, track_id, ip_address, user_agent) VALUES (?, ?, ?, ?)";
        $downloadId = $this->db->insert($sql, [$userId, $trackId, $ipAddress, $userAgent]);
        
        if ($downloadId) {
            // Atualizar contador na tabela tracks
            $this->db->update("UPDATE tracks SET download_count = download_count + 1 WHERE id = ?", [$trackId]);
            
            return ['success' => true, 'download_id' => $downloadId];
        }
        
        return ['success' => false, 'error' => 'Erro ao registrar download'];
    }
    
    /**
     * 📊 ESTATÍSTICAS DO SISTEMA
     */
    public function getSystemStats() {
        $stats = [];
        
        $stats['total_tracks'] = $this->db->selectOne("SELECT COUNT(*) as count FROM tracks WHERE is_active = 1")['count'];
        $stats['total_downloads'] = $this->db->selectOne("SELECT COUNT(*) as count FROM downloads")['count'];
        $stats['total_users'] = $this->db->selectOne("SELECT COUNT(*) as count FROM users WHERE status = 'ativo'")['count'];
        $stats['total_likes'] = $this->db->selectOne("SELECT COUNT(*) as count FROM likes")['count'];
        
        // Estatísticas mensais
        $stats['downloads_this_month'] = $this->db->selectOne(
            "SELECT COUNT(*) as count FROM downloads WHERE MONTH(download_date) = MONTH(NOW()) AND YEAR(download_date) = YEAR(NOW())"
        )['count'];
        
        $stats['new_tracks_this_month'] = $this->db->selectOne(
            "SELECT COUNT(*) as count FROM tracks WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) AND is_active = 1"
        )['count'];
        
        return $stats;
    }
    
    /**
     * 🎨 OBTER GÊNEROS
     */
    public function getGenres() {
        $result = $this->db->select(
            "SELECT DISTINCT style as genre, COUNT(*) as count 
             FROM tracks 
             WHERE is_active = 1 AND style IS NOT NULL AND style != '' 
             GROUP BY style 
             ORDER BY count DESC, style ASC"
        );
        
        return array_column($result, 'genre');
    }
    
    /**
     * 🏊 OBTER POOLS
     */
    public function getPools() {
        $result = $this->db->select(
            "SELECT DISTINCT pool, COUNT(*) as count 
             FROM tracks 
             WHERE is_active = 1 AND pool IS NOT NULL AND pool != '' 
             GROUP BY pool 
             ORDER BY count DESC, pool ASC"
        );
        
        return array_column($result, 'pool');
    }
    
    /**
     * 📁 OBTER FOLDERS
     */
    public function getFolders() {
        $result = $this->db->select(
            "SELECT DISTINCT folder, COUNT(*) as count 
             FROM tracks 
             WHERE is_active = 1 AND folder IS NOT NULL AND folder != '' 
             GROUP BY folder 
             ORDER BY count DESC, folder ASC"
        );
        
        return array_column($result, 'folder');
    }
    
    /**
     * 🔍 BUSCAR TRACKS
     */
    public function searchTracks($query, $limit = 50) {
        if (strlen($query) < 2) {
            return [];
        }
        
        $sql = "SELECT t.*, 
                       COUNT(DISTINCT l.id) as like_count_real,
                       COUNT(DISTINCT d.id) as download_count_real,
                       MATCH(t.song_name, t.artist, t.style) AGAINST (?) as relevance
                FROM tracks t
                LEFT JOIN likes l ON t.id = l.track_id
                LEFT JOIN downloads d ON t.id = d.track_id
                WHERE t.is_active = 1 AND (
                    MATCH(t.song_name, t.artist, t.style) AGAINST (?) OR
                    t.song_name LIKE ? OR
                    t.artist LIKE ? OR
                    t.style LIKE ?
                )
                GROUP BY t.id
                ORDER BY relevance DESC, download_count_real DESC
                LIMIT ?";
        
        $searchTerm = '%' . $query . '%';
        $params = [$query, $query, $searchTerm, $searchTerm, $searchTerm, $limit];
        
        return $this->db->select($sql, $params);
    }
    
    /**
     * 📈 TRACKS EM ALTA
     */
    public function getTrendingTracks($limit = 12, $days = 7) {
        $sql = "SELECT t.*, 
                       COUNT(DISTINCT l.id) as like_count_real,
                       COUNT(DISTINCT d.id) as download_count_real,
                       COUNT(DISTINCT recent_d.id) as recent_downloads
                FROM tracks t
                LEFT JOIN likes l ON t.id = l.track_id
                LEFT JOIN downloads d ON t.id = d.track_id
                LEFT JOIN downloads recent_d ON t.id = recent_d.track_id 
                    AND recent_d.download_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
                WHERE t.is_active = 1
                GROUP BY t.id
                HAVING recent_downloads > 0
                ORDER BY recent_downloads DESC, like_count_real DESC
                LIMIT ?";
        
        return $this->db->select($sql, [$days, $limit]);
    }
    
    /**
     * 🎵 TRACKS POR GÊNERO
     */
    public function getTracksByGenre($genre, $limit = 50, $offset = 0) {
        return $this->getTracks(['style' => $genre], $limit, $offset);
    }
    
    /**
     * 🏊 TRACKS POR POOL
     */
    public function getTracksByPool($pool, $limit = 50, $offset = 0) {
        return $this->getTracks(['pool' => $pool], $limit, $offset);
    }
    
    /**
     * 📁 TRACKS POR FOLDER
     */
    public function getTracksByFolder($folder, $limit = 50, $offset = 0) {
        return $this->getTracks(['folder' => $folder], $limit, $offset);
    }
    
    /**
     * 👤 TRACKS CURTIDAS PELO USUÁRIO
     */
    public function getUserLikedTracks($userId, $limit = 50, $offset = 0) {
        $sql = "SELECT t.*, 
                       COUNT(DISTINCT all_l.id) as like_count_real,
                       COUNT(DISTINCT d.id) as download_count_real,
                       1 as user_liked
                FROM tracks t
                JOIN likes user_l ON t.id = user_l.track_id AND user_l.user_id = ?
                LEFT JOIN likes all_l ON t.id = all_l.track_id
                LEFT JOIN downloads d ON t.id = d.track_id
                WHERE t.is_active = 1
                GROUP BY t.id
                ORDER BY user_l.created_at DESC
                LIMIT ? OFFSET ?";
        
        return $this->db->select($sql, [$userId, $limit, $offset]);
    }
    
    /**
     * 🔄 SINCRONIZAR CONTADORES
     */
    public function syncCounters() {
        // Sincronizar contadores de likes
        $this->db->update("
            UPDATE tracks t 
            SET like_count = (
                SELECT COUNT(*) FROM likes l WHERE l.track_id = t.id
            )
        ");
        
        // Sincronizar contadores de downloads
        $this->db->update("
            UPDATE tracks t 
            SET download_count = (
                SELECT COUNT(*) FROM downloads d WHERE d.track_id = t.id
            )
        ");
        
        return ['success' => true, 'message' => 'Contadores sincronizados'];
    }
}
?>
