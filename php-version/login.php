<?php
/**
 * 🔐 PÁGINA DE LOGIN
 * Sistema de autenticação de usuários
 */

require_once 'includes/auth.php';

$auth = new Auth();
$errors = [];
$success = '';

// Se já estiver logado, redirecionar
if ($auth->isLoggedIn()) {
    header('Location: /');
    exit;
}

// Processar formulário de login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $rememberMe = isset($_POST['remember_me']);
    
    if (empty($email)) {
        $errors[] = 'Email é obrigatório';
    }
    
    if (empty($password)) {
        $errors[] = 'Senha é obrigatória';
    }
    
    if (empty($errors)) {
        $result = $auth->login($email, $password, $rememberMe);
        
        if ($result['success']) {
            // Redirecionar para página anterior ou home
            $redirect = $_GET['redirect'] ?? '/';
            header("Location: {$redirect}");
            exit;
        } else {
            $errors[] = $result['error'];
        }
    }
}

$pageTitle = 'Login - Nexor Records Pools';
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    
    <style>
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gradient-primary);
            padding: 2rem;
        }
        
        .auth-card {
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            padding: 3rem;
            width: 100%;
            max-width: 400px;
        }
        
        .auth-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .auth-logo {
            font-size: 2rem;
            font-weight: 700;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }
        
        .auth-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-primary);
        }
        
        .form-input {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid var(--bg-tertiary);
            border-radius: var(--border-radius);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 1rem;
            transition: var(--transition);
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-checkbox {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .form-checkbox input {
            width: 18px;
            height: 18px;
        }
        
        .form-checkbox label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            cursor: pointer;
        }
        
        .auth-submit {
            width: 100%;
            padding: 0.875rem;
            background: var(--gradient-primary);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            margin-bottom: 1.5rem;
        }
        
        .auth-submit:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-lg);
        }
        
        .auth-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .auth-divider {
            text-align: center;
            margin: 1.5rem 0;
            position: relative;
        }
        
        .auth-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: var(--bg-tertiary);
        }
        
        .auth-divider span {
            background: var(--bg-card);
            padding: 0 1rem;
            color: var(--text-muted);
            font-size: 0.875rem;
        }
        
        .auth-links {
            text-align: center;
        }
        
        .auth-links a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .auth-links a:hover {
            color: var(--primary-dark);
        }
        
        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--error-color);
            color: var(--error-color);
            padding: 0.75rem 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
        }
        
        .success-message {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid var(--success-color);
            color: var(--success-color);
            padding: 0.75rem 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
        }
        
        .forgot-password {
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .forgot-password a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.875rem;
            transition: var(--transition);
        }
        
        .forgot-password a:hover {
            color: var(--primary-color);
        }
        
        .social-login {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .social-btn {
            flex: 1;
            padding: 0.75rem;
            border: 2px solid var(--bg-tertiary);
            border-radius: var(--border-radius);
            background: transparent;
            color: var(--text-secondary);
            cursor: pointer;
            transition: var(--transition);
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }
        
        .social-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }
        
        .back-home {
            position: absolute;
            top: 2rem;
            left: 2rem;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: var(--transition);
        }
        
        .back-home:hover {
            color: white;
        }
        
        @media (max-width: 480px) {
            .auth-container {
                padding: 1rem;
            }
            
            .auth-card {
                padding: 2rem 1.5rem;
            }
            
            .back-home {
                position: relative;
                top: auto;
                left: auto;
                margin-bottom: 1rem;
                color: var(--text-secondary);
            }
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <a href="/" class="back-home">
            <i class="fas fa-arrow-left"></i>
            Voltar ao início
        </a>
        
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-logo">Nexor Records</div>
                <div class="auth-subtitle">Faça login em sua conta</div>
            </div>
            
            <!-- Mensagens de erro -->
            <?php if (!empty($errors)): ?>
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <?php foreach ($errors as $error): ?>
                        <div><?php echo htmlspecialchars($error); ?></div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            
            <!-- Mensagem de sucesso -->
            <?php if ($success): ?>
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <?php echo htmlspecialchars($success); ?>
                </div>
            <?php endif; ?>
            
            <!-- Formulário de login -->
            <form method="POST" id="loginForm">
                <div class="form-group">
                    <label for="email" class="form-label">
                        <i class="fas fa-envelope"></i>
                        Email
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        class="form-input"
                        value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                        placeholder="seu@email.com"
                        required
                        autocomplete="email"
                    >
                </div>
                
                <div class="form-group">
                    <label for="password" class="form-label">
                        <i class="fas fa-lock"></i>
                        Senha
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-input"
                        placeholder="Sua senha"
                        required
                        autocomplete="current-password"
                    >
                </div>
                
                <div class="form-checkbox">
                    <input 
                        type="checkbox" 
                        id="remember_me" 
                        name="remember_me"
                        <?php echo isset($_POST['remember_me']) ? 'checked' : ''; ?>
                    >
                    <label for="remember_me">Manter-me conectado</label>
                </div>
                
                <button type="submit" class="auth-submit" id="submitBtn">
                    <i class="fas fa-sign-in-alt"></i>
                    Entrar
                </button>
            </form>
            
            <div class="forgot-password">
                <a href="/forgot-password.php">Esqueceu sua senha?</a>
            </div>
            
            <!-- Login social (opcional) -->
            <!--
            <div class="auth-divider">
                <span>ou continue com</span>
            </div>
            
            <div class="social-login">
                <a href="/auth/google" class="social-btn">
                    <i class="fab fa-google"></i>
                    Google
                </a>
                <a href="/auth/facebook" class="social-btn">
                    <i class="fab fa-facebook"></i>
                    Facebook
                </a>
            </div>
            -->
            
            <div class="auth-divider">
                <span>Não tem uma conta?</span>
            </div>
            
            <div class="auth-links">
                <a href="/register.php<?php echo isset($_GET['redirect']) ? '?redirect=' . urlencode($_GET['redirect']) : ''; ?>">
                    Criar conta gratuita
                </a>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('loginForm');
            const submitBtn = document.getElementById('submitBtn');
            
            // Efeito de loading no botão
            form.addEventListener('submit', function() {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
            });
            
            // Auto-focus no primeiro campo vazio
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            if (!emailInput.value) {
                emailInput.focus();
            } else {
                passwordInput.focus();
            }
            
            // Mostrar/ocultar senha
            const togglePassword = document.createElement('button');
            togglePassword.type = 'button';
            togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
            togglePassword.style.cssText = `
                position: absolute;
                right: 0.75rem;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.25rem;
            `;
            
            const passwordGroup = passwordInput.closest('.form-group');
            passwordGroup.style.position = 'relative';
            passwordGroup.appendChild(togglePassword);
            
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                this.innerHTML = type === 'password' ? 
                    '<i class="fas fa-eye"></i>' : 
                    '<i class="fas fa-eye-slash"></i>';
            });
            
            // Validação em tempo real
            const inputs = [emailInput, passwordInput];
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    this.style.borderColor = this.checkValidity() ? 
                        'var(--success-color)' : 
                        'var(--bg-tertiary)';
                });
            });
            
            // Lembrar email (localStorage)
            if (localStorage.getItem('rememberedEmail') && !emailInput.value) {
                emailInput.value = localStorage.getItem('rememberedEmail');
            }
            
            form.addEventListener('submit', function() {
                const rememberMe = document.getElementById('remember_me').checked;
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', emailInput.value);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
            });
        });
        
        // Detectar se o usuário está chegando de uma tentativa de acesso
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('message') === 'login_required') {
            const notification = document.createElement('div');
            notification.className = 'error-message';
            notification.innerHTML = '<i class="fas fa-info-circle"></i> Você precisa fazer login para acessar esta página';
            document.querySelector('.auth-card').insertBefore(notification, document.querySelector('form'));
        }
    </script>
</body>
</html>
