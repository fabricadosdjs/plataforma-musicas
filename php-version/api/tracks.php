<?php
/**
 * 🎵 API: LISTAR E FILTRAR TRACKS
 * Endpoint principal para buscar músicas
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../includes/auth.php';
require_once '../includes/tracks.php';

// Tratar OPTIONS request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $tracksManager = new TracksManager();
    $auth = new Auth();
    $user = $auth->getCurrentUser();
    
    // Parâmetros de filtro
    $filters = [
        'search' => $_GET['q'] ?? $_GET['search'] ?? '',
        'style' => $_GET['style'] ?? $_GET['genre'] ?? '',
        'pool' => $_GET['pool'] ?? '',
        'folder' => $_GET['folder'] ?? '',
        'artist' => $_GET['artist'] ?? '',
        'sort' => $_GET['sort'] ?? 'newest'
    ];
    
    // Parâmetros de paginação
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, max(1, intval($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;
    
    // Buscar tracks
    $tracks = $tracksManager->getTracks($filters, $limit, $offset);
    
    // Adicionar informações de like do usuário (se logado)
    if ($user) {
        foreach ($tracks as &$track) {
            $likeCheck = getDB()->selectOne(
                "SELECT COUNT(*) as liked FROM likes WHERE track_id = ? AND user_id = ?",
                [$track['id'], $user['id']]
            );
            $track['user_liked'] = $likeCheck['liked'] > 0;
        }
    }
    
    // Metadados adicionais
    $totalTracks = getDB()->selectOne("SELECT COUNT(*) as total FROM tracks WHERE is_active = 1")['total'];
    $hasNextPage = ($offset + $limit) < $totalTracks;
    
    // Resposta
    $response = [
        'success' => true,
        'tracks' => $tracks,
        'pagination' => [
            'current_page' => $page,
            'limit' => $limit,
            'total_tracks' => intval($totalTracks),
            'has_next_page' => $hasNextPage,
            'total_pages' => ceil($totalTracks / $limit)
        ],
        'filters_applied' => array_filter($filters),
        'timestamp' => date('c')
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("API Error (tracks): " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => DEBUG_MODE ? $e->getMessage() : 'Erro interno do servidor',
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE);
}
?>
