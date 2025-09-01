<?php
/**
 * 📥 API: DOWNLOAD DE MÚSICA
 * Gerencia downloads e verifica permissões
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
    
    // Verificar se usuário pode baixar
    if (!canUserDownload($user['id'])) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Limite de downloads diário atingido',
            'user_stats' => getUserStats($user['id']),
            'daily_limit' => getDailyDownloadLimit($user)
        ]);
        exit;
    }
    
    // Registrar o download
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $downloadResult = $tracksManager->recordDownload(
        $trackId, 
        $user['id'], 
        $ipAddress, 
        $userAgent
    );
    
    if (!$downloadResult['success']) {
        http_response_code(500);
        echo json_encode($downloadResult);
        exit;
    }
    
    // Log da atividade
    logActivity($user['id'], 'track_downloaded', "Download: {$track['artist']} - {$track['song_name']}", $ipAddress);
    
    // Gerar nome do arquivo para download
    $filename = sanitize($track['artist']) . ' - ' . sanitize($track['song_name']);
    if ($track['version']) {
        $filename .= ' (' . sanitize($track['version']) . ')';
    }
    
    // Adicionar extensão baseada na URL ou usar MP3 como padrão
    $extension = pathinfo(parse_url($track['download_url'], PHP_URL_PATH), PATHINFO_EXTENSION);
    if (!$extension) {
        $extension = 'mp3';
    }
    $filename .= '.' . $extension;
    
    // Limpar filename para evitar problemas
    $filename = preg_replace('/[^a-zA-Z0-9\s\-_\(\)\.]/u', '', $filename);
    $filename = preg_replace('/\s+/', ' ', $filename);
    
    // Resposta de sucesso
    $response = [
        'success' => true,
        'download_url' => $track['download_url'],
        'filename' => $filename,
        'track' => [
            'id' => $track['id'],
            'song_name' => $track['song_name'],
            'artist' => $track['artist'],
            'version' => $track['version'],
            'style' => $track['style'],
            'file_size_mb' => $track['file_size_mb'],
            'quality' => $track['quality']
        ],
        'user_stats' => getUserStats($user['id']),
        'download_id' => $downloadResult['download_id'],
        'timestamp' => date('c')
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("API Error (download): " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => DEBUG_MODE ? $e->getMessage() : 'Erro interno do servidor',
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE);
}
?>
