<?php
/**
 * 📝 PÁGINA DE REGISTRO
 * Sistema de criação de contas
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

// Processar formulário de registro
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $terms = isset($_POST['terms']);
    
    // Validações
    if (empty($name)) {
        $errors[] = 'Nome é obrigatório';
    } elseif (strlen($name) < 2) {
        $errors[] = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (empty($email)) {
        $errors[] = 'Email é obrigatório';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Email inválido';
    }
    
    if (empty($password)) {
        $errors[] = 'Senha é obrigatória';
    } elseif (strlen($password) < 6) {
        $errors[] = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if ($password !== $confirmPassword) {
        $errors[] = 'Confirmação de senha não confere';
    }
    
    if (!$terms) {
        $errors[] = 'Você deve aceitar os termos de uso';
    }
    
    // Verificar se email já existe
    if (empty($errors)) {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            $errors[] = 'Este email já está cadastrado';
        }
    }
    
    // Criar usuário
    if (empty($errors)) {
        $result = $auth->register($name, $email, $password);
        
        if ($result['success']) {
            $success = 'Conta criada com sucesso! Você já está logado.';
            
            // Auto login após registro
            $loginResult = $auth->login($email, $password);
            
            if ($loginResult['success']) {
                // Redirecionar após sucesso
                $redirect = $_GET['redirect'] ?? '/';
                header("Location: {$redirect}");
                exit;
            }
        } else {
            $errors[] = $result['error'];
        }
    }
}

$pageTitle = 'Criar Conta - Nexor Records Pools';
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
            max-width: 450px;
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
        
        .form-input.valid {
            border-color: var(--success-color);
        }
        
        .form-input.invalid {
            border-color: var(--error-color);
        }
        
        .password-strength {
            margin-top: 0.5rem;
            font-size: 0.875rem;
        }
        
        .strength-bar {
            height: 4px;
            background: var(--bg-tertiary);
            border-radius: 2px;
            margin: 0.5rem 0;
            overflow: hidden;
        }
        
        .strength-fill {
            height: 100%;
            transition: var(--transition);
            border-radius: 2px;
        }
        
        .strength-weak { background: var(--error-color); width: 25%; }
        .strength-fair { background: orange; width: 50%; }
        .strength-good { background: var(--warning-color); width: 75%; }
        .strength-strong { background: var(--success-color); width: 100%; }
        
        .form-checkbox {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .form-checkbox input {
            width: 18px;
            height: 18px;
            margin-top: 2px;
            flex-shrink: 0;
        }
        
        .form-checkbox label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            cursor: pointer;
            line-height: 1.4;
        }
        
        .form-checkbox a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        .form-checkbox a:hover {
            text-decoration: underline;
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
        
        .auth-submit:hover:not(:disabled) {
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
        
        .field-requirements {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }
        
        .field-requirements.visible {
            color: var(--text-secondary);
        }
        
        .requirement-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            margin: 0.25rem 0;
        }
        
        .requirement-item.valid {
            color: var(--success-color);
        }
        
        .requirement-item.invalid {
            color: var(--error-color);
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
                <div class="auth-subtitle">Crie sua conta gratuita</div>
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
            
            <!-- Formulário de registro -->
            <form method="POST" id="registerForm">
                <div class="form-group">
                    <label for="name" class="form-label">
                        <i class="fas fa-user"></i>
                        Nome completo
                    </label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        class="form-input"
                        value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>"
                        placeholder="Seu nome completo"
                        required
                        autocomplete="name"
                    >
                    <div class="field-requirements" id="nameRequirements">
                        <div class="requirement-item" id="nameLength">
                            <i class="fas fa-circle"></i>
                            Pelo menos 2 caracteres
                        </div>
                    </div>
                </div>
                
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
                    <div class="field-requirements" id="emailRequirements">
                        <div class="requirement-item" id="emailValid">
                            <i class="fas fa-circle"></i>
                            Email válido
                        </div>
                    </div>
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
                        placeholder="Crie uma senha segura"
                        required
                        autocomplete="new-password"
                    >
                    <div class="password-strength" id="passwordStrength">
                        <div class="strength-bar">
                            <div class="strength-fill" id="strengthFill"></div>
                        </div>
                        <div class="strength-text" id="strengthText"></div>
                    </div>
                    <div class="field-requirements" id="passwordRequirements">
                        <div class="requirement-item" id="passwordLength">
                            <i class="fas fa-circle"></i>
                            Pelo menos 6 caracteres
                        </div>
                        <div class="requirement-item" id="passwordLetter">
                            <i class="fas fa-circle"></i>
                            Contém letras
                        </div>
                        <div class="requirement-item" id="passwordNumber">
                            <i class="fas fa-circle"></i>
                            Contém números
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="confirm_password" class="form-label">
                        <i class="fas fa-lock"></i>
                        Confirmar senha
                    </label>
                    <input 
                        type="password" 
                        id="confirm_password" 
                        name="confirm_password" 
                        class="form-input"
                        placeholder="Digite a senha novamente"
                        required
                        autocomplete="new-password"
                    >
                    <div class="field-requirements" id="confirmRequirements">
                        <div class="requirement-item" id="passwordMatch">
                            <i class="fas fa-circle"></i>
                            Senhas conferem
                        </div>
                    </div>
                </div>
                
                <div class="form-checkbox">
                    <input 
                        type="checkbox" 
                        id="terms" 
                        name="terms"
                        required
                        <?php echo isset($_POST['terms']) ? 'checked' : ''; ?>
                    >
                    <label for="terms">
                        Eu aceito os <a href="/terms.php" target="_blank">termos de uso</a> 
                        e a <a href="/privacy.php" target="_blank">política de privacidade</a>
                    </label>
                </div>
                
                <button type="submit" class="auth-submit" id="submitBtn" disabled>
                    <i class="fas fa-user-plus"></i>
                    Criar conta
                </button>
            </form>
            
            <div class="auth-divider">
                <span>Já tem uma conta?</span>
            </div>
            
            <div class="auth-links">
                <a href="/login.php<?php echo isset($_GET['redirect']) ? '?redirect=' . urlencode($_GET['redirect']) : ''; ?>">
                    Fazer login
                </a>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('registerForm');
            const submitBtn = document.getElementById('submitBtn');
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm_password');
            const termsInput = document.getElementById('terms');
            
            // Elementos de validação
            const nameLength = document.getElementById('nameLength');
            const emailValid = document.getElementById('emailValid');
            const passwordLength = document.getElementById('passwordLength');
            const passwordLetter = document.getElementById('passwordLetter');
            const passwordNumber = document.getElementById('passwordNumber');
            const passwordMatch = document.getElementById('passwordMatch');
            
            const strengthFill = document.getElementById('strengthFill');
            const strengthText = document.getElementById('strengthText');
            
            // Estado de validação
            let validation = {
                name: false,
                email: false,
                password: false,
                confirmPassword: false,
                terms: false
            };
            
            // Função para atualizar requirement item
            function updateRequirement(element, isValid) {
                element.classList.toggle('valid', isValid);
                element.classList.toggle('invalid', !isValid);
                element.querySelector('i').className = isValid ? 'fas fa-check' : 'fas fa-circle';
            }
            
            // Função para verificar se o formulário é válido
            function checkFormValidity() {
                const isValid = Object.values(validation).every(v => v);
                submitBtn.disabled = !isValid;
                return isValid;
            }
            
            // Validação do nome
            nameInput.addEventListener('input', function() {
                const isValid = this.value.trim().length >= 2;
                validation.name = isValid;
                
                updateRequirement(nameLength, isValid);
                this.classList.toggle('valid', isValid);
                this.classList.toggle('invalid', this.value && !isValid);
                
                checkFormValidity();
            });
            
            // Validação do email
            emailInput.addEventListener('input', function() {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValid = emailRegex.test(this.value);
                validation.email = isValid;
                
                updateRequirement(emailValid, isValid);
                this.classList.toggle('valid', isValid);
                this.classList.toggle('invalid', this.value && !isValid);
                
                checkFormValidity();
            });
            
            // Validação da senha
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const hasLength = password.length >= 6;
                const hasLetter = /[a-zA-Z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                
                updateRequirement(passwordLength, hasLength);
                updateRequirement(passwordLetter, hasLetter);
                updateRequirement(passwordNumber, hasNumber);
                
                validation.password = hasLength && hasLetter && hasNumber;
                
                this.classList.toggle('valid', validation.password);
                this.classList.toggle('invalid', password && !validation.password);
                
                // Força de senha
                let strength = 0;
                let strengthClass = '';
                let strengthLabel = '';
                
                if (hasLength) strength++;
                if (hasLetter) strength++;
                if (hasNumber) strength++;
                if (password.length >= 8) strength++;
                if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
                
                if (password.length === 0) {
                    strengthClass = '';
                    strengthLabel = '';
                } else if (strength <= 2) {
                    strengthClass = 'strength-weak';
                    strengthLabel = 'Fraca';
                } else if (strength <= 3) {
                    strengthClass = 'strength-fair';
                    strengthLabel = 'Regular';
                } else if (strength <= 4) {
                    strengthClass = 'strength-good';
                    strengthLabel = 'Boa';
                } else {
                    strengthClass = 'strength-strong';
                    strengthLabel = 'Forte';
                }
                
                strengthFill.className = `strength-fill ${strengthClass}`;
                strengthText.textContent = strengthLabel;
                
                // Revalidar confirmação
                if (confirmPasswordInput.value) {
                    confirmPasswordInput.dispatchEvent(new Event('input'));
                }
                
                checkFormValidity();
            });
            
            // Validação da confirmação de senha
            confirmPasswordInput.addEventListener('input', function() {
                const isValid = this.value === passwordInput.value && this.value.length > 0;
                validation.confirmPassword = isValid;
                
                updateRequirement(passwordMatch, isValid);
                this.classList.toggle('valid', isValid);
                this.classList.toggle('invalid', this.value && !isValid);
                
                checkFormValidity();
            });
            
            // Validação dos termos
            termsInput.addEventListener('change', function() {
                validation.terms = this.checked;
                checkFormValidity();
            });
            
            // Efeito de loading no botão
            form.addEventListener('submit', function() {
                if (checkFormValidity()) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
                }
            });
            
            // Auto-focus
            nameInput.focus();
            
            // Mostrar/ocultar requisitos quando focado
            [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
                const requirements = document.getElementById(input.id + 'Requirements');
                if (requirements) {
                    input.addEventListener('focus', () => {
                        requirements.classList.add('visible');
                    });
                    
                    input.addEventListener('blur', () => {
                        if (input.value === '') {
                            requirements.classList.remove('visible');
                        }
                    });
                }
            });
            
            // Verificação inicial se há valores preenchidos
            [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
                if (input.value) {
                    input.dispatchEvent(new Event('input'));
                }
            });
            
            if (termsInput.checked) {
                validation.terms = true;
            }
            
            checkFormValidity();
        });
    </script>
</body>
</html>
