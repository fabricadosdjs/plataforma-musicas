<?php
/**
 * 🔐 SISTEMA DE AUTENTICAÇÃO
 * Gerenciamento de usuários, login e sessões
 */

require_once __DIR__ . '/../config/database.php';

class Auth {
    private $db;
    
    public function __construct() {
        $this->db = getDB();
        $this->startSession();
    }
    
    /**
     * Inicia a sessão se não estiver ativa
     */
    private function startSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * 📝 REGISTRO DE USUÁRIO
     */
    public function register($email, $name, $password, $confirmPassword) {
        // Validações
        $errors = [];
        
        if (!isValidEmail($email)) {
            $errors[] = "Email inválido";
        }
        
        if (strlen($name) < 2) {
            $errors[] = "Nome deve ter pelo menos 2 caracteres";
        }
        
        if (strlen($password) < 6) {
            $errors[] = "Senha deve ter pelo menos 6 caracteres";
        }
        
        if ($password !== $confirmPassword) {
            $errors[] = "Senhas não coincidem";
        }
        
        // Verificar se email já existe
        if ($this->emailExists($email)) {
            $errors[] = "Email já cadastrado";
        }
        
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }
        
        // Criar usuário
        $hashedPassword = hashPassword($password);
        $sql = "INSERT INTO users (email, name, password) VALUES (?, ?, ?)";
        $userId = $this->db->insert($sql, [$email, $name, $hashedPassword]);
        
        if ($userId) {
            logActivity($userId, 'user_registered', "Usuário {$name} se registrou");
            return ['success' => true, 'user_id' => $userId];
        }
        
        return ['success' => false, 'errors' => ['Erro interno. Tente novamente.']];
    }
    
    /**
     * 🔑 LOGIN
     */
    public function login($email, $password, $rememberMe = false) {
        $sql = "SELECT * FROM users WHERE email = ? AND status = 'ativo'";
        $user = $this->db->selectOne($sql, [$email]);
        
        if (!$user || !verifyPassword($password, $user['password'])) {
            logActivity(null, 'login_failed', "Tentativa de login falhada para {$email}", $_SERVER['REMOTE_ADDR'] ?? '');
            return ['success' => false, 'error' => 'Email ou senha incorretos'];
        }
        
        // Atualizar último login
        $this->db->update("UPDATE users SET last_login = NOW() WHERE id = ?", [$user['id']]);
        
        // Criar sessão
        $this->createSession($user, $rememberMe);
        
        logActivity($user['id'], 'user_login', "Usuário logou no sistema");
        
        return ['success' => true, 'user' => $this->sanitizeUserData($user)];
    }
    
    /**
     * 🚪 LOGOUT
     */
    public function logout() {
        if (isset($_SESSION['user'])) {
            logActivity($_SESSION['user']['id'], 'user_logout', "Usuário saiu do sistema");
        }
        
        session_destroy();
        setcookie('remember_token', '', time() - 3600, '/');
        
        return ['success' => true];
    }
    
    /**
     * 👤 OBTER USUÁRIO ATUAL
     */
    public function getCurrentUser() {
        // Verificar sessão
        if (isset($_SESSION['user'])) {
            return $this->refreshUserData($_SESSION['user']['id']);
        }
        
        // Verificar cookie "lembrar-me"
        if (isset($_COOKIE['remember_token'])) {
            return $this->loginByToken($_COOKIE['remember_token']);
        }
        
        return null;
    }
    
    /**
     * ✅ VERIFICAR SE USUÁRIO ESTÁ LOGADO
     */
    public function isLoggedIn() {
        return $this->getCurrentUser() !== null;
    }
    
    /**
     * 👑 VERIFICAR SE USUÁRIO É ADMIN
     */
    public function isAdmin() {
        $user = $this->getCurrentUser();
        return $user && $user['is_admin'];
    }
    
    /**
     * 📤 VERIFICAR SE USUÁRIO É UPLOADER
     */
    public function isUploader() {
        $user = $this->getCurrentUser();
        return $user && $user['is_uploader'];
    }
    
    /**
     * 💎 VERIFICAR SE USUÁRIO É VIP
     */
    public function isVip() {
        $user = $this->getCurrentUser();
        return $user && ($user['deemix'] || $user['deezer_premium'] || $user['valor'] > 0);
    }
    
    /**
     * 🔄 ATUALIZAR PERFIL
     */
    public function updateProfile($userId, $data) {
        $allowedFields = ['name', 'email'];
        $updateData = [];
        $params = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[] = "{$field} = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($updateData)) {
            return ['success' => false, 'error' => 'Nenhum campo para atualizar'];
        }
        
        // Verificar se email já existe (se estiver sendo alterado)
        if (isset($data['email'])) {
            $existingUser = $this->db->selectOne("SELECT id FROM users WHERE email = ? AND id != ?", [$data['email'], $userId]);
            if ($existingUser) {
                return ['success' => false, 'error' => 'Email já está em uso'];
            }
        }
        
        $params[] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $updateData) . " WHERE id = ?";
        
        if ($this->db->update($sql, $params)) {
            logActivity($userId, 'profile_updated', 'Perfil atualizado');
            return ['success' => true];
        }
        
        return ['success' => false, 'error' => 'Erro ao atualizar perfil'];
    }
    
    /**
     * 🔐 ALTERAR SENHA
     */
    public function changePassword($userId, $currentPassword, $newPassword, $confirmPassword) {
        // Verificar senha atual
        $user = $this->db->selectOne("SELECT password FROM users WHERE id = ?", [$userId]);
        if (!$user || !verifyPassword($currentPassword, $user['password'])) {
            return ['success' => false, 'error' => 'Senha atual incorreta'];
        }
        
        // Validar nova senha
        if (strlen($newPassword) < 6) {
            return ['success' => false, 'error' => 'Nova senha deve ter pelo menos 6 caracteres'];
        }
        
        if ($newPassword !== $confirmPassword) {
            return ['success' => false, 'error' => 'Senhas não coincidem'];
        }
        
        // Atualizar senha
        $hashedPassword = hashPassword($newPassword);
        $sql = "UPDATE users SET password = ? WHERE id = ?";
        
        if ($this->db->update($sql, [$hashedPassword, $userId])) {
            logActivity($userId, 'password_changed', 'Senha alterada');
            return ['success' => true];
        }
        
        return ['success' => false, 'error' => 'Erro ao alterar senha'];
    }
    
    /**
     * MÉTODOS PRIVADOS
     */
    
    private function emailExists($email) {
        $sql = "SELECT id FROM users WHERE email = ?";
        return $this->db->selectOne($sql, [$email]) !== false;
    }
    
    private function createSession($user, $rememberMe = false) {
        $_SESSION['user'] = $this->sanitizeUserData($user);
        
        if ($rememberMe) {
            $token = generateToken(64);
            $expires = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
            
            // Salvar token no banco
            $this->db->insert("INSERT INTO sessions (id, user_id, expires) VALUES (?, ?, ?)", 
                            [$token, $user['id'], $expires]);
            
            // Criar cookie
            setcookie('remember_token', $token, time() + SESSION_LIFETIME, '/');
        }
    }
    
    private function loginByToken($token) {
        $sql = "SELECT u.* FROM users u 
                JOIN sessions s ON u.id = s.user_id 
                WHERE s.id = ? AND s.expires > NOW() AND u.status = 'ativo'";
        
        $user = $this->db->selectOne($sql, [$token]);
        
        if ($user) {
            $_SESSION['user'] = $this->sanitizeUserData($user);
            return $this->sanitizeUserData($user);
        }
        
        // Token inválido, remover cookie
        setcookie('remember_token', '', time() - 3600, '/');
        return null;
    }
    
    private function refreshUserData($userId) {
        $sql = "SELECT * FROM users WHERE id = ? AND status = 'ativo'";
        $user = $this->db->selectOne($sql, [$userId]);
        
        if ($user) {
            $_SESSION['user'] = $this->sanitizeUserData($user);
            return $this->sanitizeUserData($user);
        }
        
        // Usuário não encontrado ou inativo
        session_destroy();
        return null;
    }
    
    private function sanitizeUserData($user) {
        unset($user['password']);
        return $user;
    }
}

/**
 * 🛡️ MIDDLEWARE DE AUTENTICAÇÃO
 */
function requireLogin() {
    $auth = new Auth();
    if (!$auth->isLoggedIn()) {
        header('Location: /login.php');
        exit;
    }
    return $auth->getCurrentUser();
}

function requireAdmin() {
    $auth = new Auth();
    if (!$auth->isAdmin()) {
        header('HTTP/1.1 403 Forbidden');
        die('Acesso negado. Permissões de administrador necessárias.');
    }
    return $auth->getCurrentUser();
}

function requireUploader() {
    $auth = new Auth();
    if (!$auth->isUploader()) {
        header('HTTP/1.1 403 Forbidden');
        die('Acesso negado. Permissões de uploader necessárias.');
    }
    return $auth->getCurrentUser();
}

/**
 * 📊 FUNÇÕES DE ESTATÍSTICAS DE USUÁRIO
 */
function getUserStats($userId) {
    $db = getDB();
    
    // Contadores
    $downloadsCount = $db->selectOne("SELECT COUNT(*) as count FROM downloads WHERE user_id = ?", [$userId])['count'];
    $likesCount = $db->selectOne("SELECT COUNT(*) as count FROM likes WHERE user_id = ?", [$userId])['count'];
    $playlistsCount = $db->selectOne("SELECT COUNT(*) as count FROM playlists WHERE user_id = ?", [$userId])['count'];
    
    // Downloads hoje
    $downloadsToday = $db->selectOne("SELECT COUNT(*) as count FROM downloads 
                                     WHERE user_id = ? AND DATE(download_date) = CURDATE()", [$userId])['count'];
    
    return [
        'total_downloads' => $downloadsCount,
        'total_likes' => $likesCount,
        'total_playlists' => $playlistsCount,
        'downloads_today' => $downloadsToday
    ];
}

function getDailyDownloadLimit($user) {
    if ($user['is_admin']) return -1; // Ilimitado para admin
    if ($user['is_uploader']) return UPLOADER_DAILY_DOWNLOADS;
    if ($user['deemix'] || $user['deezer_premium'] || $user['valor'] > 0) return VIP_DAILY_DOWNLOADS;
    
    return DEFAULT_DAILY_DOWNLOADS;
}

function canUserDownload($userId) {
    $user = (new Auth())->getCurrentUser();
    if (!$user) return false;
    
    $limit = getDailyDownloadLimit($user);
    if ($limit === -1) return true; // Ilimitado
    
    $stats = getUserStats($userId);
    return $stats['downloads_today'] < $limit;
}
?>
