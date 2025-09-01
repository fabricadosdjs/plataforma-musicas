<?php
/**
 * ❤️ API: CURTIR/DESCURTIR MÚSICA
 * Sistema de likes para tracks
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../includes/auth.php';
require_once '../includes/tracks.php';

// Tratar OPTIONS request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Apenas POST é permitido
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido'
    ]);
    exit;
}

try {
    $auth = new Auth();
    $user = $auth->getCurrentUser();
    
    // Verificar se usuário está logado
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Login necessário'
        ]);
        exit;
    }
    
    // Obter dados da requisição
    $input = json_decode(file_get_contents('php://input'), true);
    $trackId = $input['track_id'] ?? null;
    
    if (!$trackId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'ID da música é obrigatório'
        ]);
        exit;
    }
    
    $tracksManager = new TracksManager();
    
    // Verificar se a música existe
    $track = $tracksManager->getTrackById($trackId);
    if (!$track) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Música não encontrada'
        ]);
        exit;
    }
    
    // Toggle like
    $result = $tracksManager->toggleLike($trackId, $user['id']);
    
    if ($result['success']) {
        // Log da atividade
        $action = $result['liked'] ? 'track_liked' : 'track_unliked';
        $description = ($result['liked'] ? 'Curtiu' : 'Descurtiu') . ": {$track['artist']} - {$track['song_name']}";
        logActivity($user['id'], $action, $description);
        
        echo json_encode([
            'success' => true,
            'liked' => $result['liked'],
            'like_count' => $result['like_count'],
            'track' => [
                'id' => $track['id'],
                'song_name' => $track['song_name'],
                'artist' => $track['artist']
            ],
            'message' => $result['liked'] ? 'Música adicionada aos favoritos' : 'Música removida dos favoritos',
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erro ao processar like',
            'timestamp' => date('c')
        ]);
    }
    
} catch (Exception $e) {
    error_log("API Error (like): " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => DEBUG_MODE ? $e->getMessage() : 'Erro interno do servidor',
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE);
}
?>
