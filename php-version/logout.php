<?php
/**
 * 🚪 PÁGINA DE LOGOUT
 * Sistema de logout de usuários
 */

require_once 'includes/auth.php';

$auth = new Auth();

// Fazer logout
$auth->logout();

// Redirecionar para home com mensagem
header('Location: /?message=logged_out');
exit;
?>
