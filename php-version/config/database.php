<?php
/**
 * 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS
 * Configurações de conexão e constantes do sistema
 */

// ========================================
// CONFIGURAÇÕES DO BANCO DE DADOS
// ========================================
define('DB_HOST', 'localhost');
define('DB_NAME', 'plataforma_musicas_php');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// ========================================
// CONFIGURAÇÕES DA APLICAÇÃO
// ========================================
define('SITE_URL', 'http://localhost/plataforma-musicas/php-version');
define('SITE_NAME', 'Nexor Records Pools');
define('SITE_DESCRIPTION', 'A melhor plataforma de músicas eletrônicas para DJs');

// ========================================
// CONFIGURAÇÕES DE SEGURANÇA
// ========================================
define('SECRET_KEY', 'your-secret-key-here-change-this');
define('SESSION_LIFETIME', 3600 * 24 * 7); // 7 dias
define('BCRYPT_COST', 12);

// ========================================
// CONFIGURAÇÕES DE UPLOAD/DOWNLOAD
// ========================================
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_AUDIO_TYPES', ['mp3', 'wav', 'flac', 'm4a']);

// ========================================
// CONFIGURAÇÕES DE LIMITES
// ========================================
define('DEFAULT_DAILY_DOWNLOADS', 10);
define('VIP_DAILY_DOWNLOADS', 50);
define('UPLOADER_DAILY_DOWNLOADS', 100);

// ========================================
// CONFIGURAÇÕES DE EMAIL (opcional)
// ========================================
define('SMTP_HOST', '');
define('SMTP_PORT', 587);
define('SMTP_USER', '');
define('SMTP_PASS', '');
define('FROM_EMAIL', 'noreply@nexorrecords.com.br');
define('FROM_NAME', 'Nexor Records Pools');

// ========================================
// TIMEZONE
// ========================================
date_default_timezone_set('America/Sao_Paulo');

// ========================================
// CONFIGURAÇÕES DE DEBUG
// ========================================
define('DEBUG_MODE', true);
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

/**
 * 🔗 CLASSE DE CONEXÃO COM BANCO DE DADOS
 */
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            if (DEBUG_MODE) {
                die("Erro de conexão com banco: " . $e->getMessage());
            } else {
                die("Erro interno do servidor. Tente novamente mais tarde.");
            }
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Executa uma query de seleção
     */
    public function select($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->logError("SELECT Error: " . $e->getMessage() . " | SQL: " . $sql);
            return false;
        }
    }
    
    /**
     * Executa uma query de seleção única
     */
    public function selectOne($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            $this->logError("SELECT ONE Error: " . $e->getMessage() . " | SQL: " . $sql);
            return false;
        }
    }
    
    /**
     * Executa uma query de inserção
     */
    public function insert($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $result = $stmt->execute($params);
            return $result ? $this->connection->lastInsertId() : false;
        } catch (PDOException $e) {
            $this->logError("INSERT Error: " . $e->getMessage() . " | SQL: " . $sql);
            return false;
        }
    }
    
    /**
     * Executa uma query de atualização
     */
    public function update($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            $this->logError("UPDATE Error: " . $e->getMessage() . " | SQL: " . $sql);
            return false;
        }
    }
    
    /**
     * Executa uma query de exclusão
     */
    public function delete($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            $this->logError("DELETE Error: " . $e->getMessage() . " | SQL: " . $sql);
            return false;
        }
    }
    
    /**
     * Inicia uma transação
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Confirma uma transação
     */
    public function commit() {
        return $this->connection->commit();
    }
    
    /**
     * Desfaz uma transação
     */
    public function rollback() {
        return $this->connection->rollback();
    }
    
    /**
     * Log de erros
     */
    private function logError($message) {
        if (DEBUG_MODE) {
            error_log("[" . date('Y-m-d H:i:s') . "] DB Error: " . $message);
        }
    }
}

/**
 * 🔧 FUNÇÕES AUXILIARES
 */

/**
 * Função para obter instância do banco
 */
function getDB() {
    return Database::getInstance();
}

/**
 * Função para sanitizar entrada
 */
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Função para validar email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Função para gerar hash de senha
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
}

/**
 * Função para verificar senha
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Função para gerar token único
 */
function generateToken($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Função para formatar bytes
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

/**
 * Função para validar extensão de arquivo
 */
function isValidAudioFile($filename) {
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return in_array($extension, ALLOWED_AUDIO_TYPES);
}

/**
 * Função para log de atividade
 */
function logActivity($userId, $action, $description = '', $ipAddress = null) {
    $db = getDB();
    $ipAddress = $ipAddress ?: $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $sql = "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?)";
    
    return $db->insert($sql, [$userId, $action, $description, $ipAddress, $userAgent]);
}

/**
 * Função para obter configuração do sistema
 */
function getSystemSetting($key, $default = null) {
    $db = getDB();
    $sql = "SELECT setting_value FROM system_settings WHERE setting_key = ?";
    $result = $db->selectOne($sql, [$key]);
    
    return $result ? $result['setting_value'] : $default;
}

/**
 * Função para definir configuração do sistema
 */
function setSystemSetting($key, $value, $description = '') {
    $db = getDB();
    $sql = "INSERT INTO system_settings (setting_key, setting_value, description) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value), 
            description = VALUES(description)";
    
    return $db->insert($sql, [$key, $value, $description]);
}
?>
