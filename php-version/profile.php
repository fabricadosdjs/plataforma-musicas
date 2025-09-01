<?php
/**
 * 👤 PÁGINA DE PERFIL DO USUÁRIO
 * Gerenciamento de conta e configurações
 */

require_once 'includes/auth.php';

$auth = new Auth();

// Verificar se está logado
if (!$auth->isLoggedIn()) {
    header('Location: /login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

$user = $auth->getCurrentUser();
$db = Database::getInstance();

$errors = [];
$success = '';
$activeTab = $_GET['tab'] ?? 'profile';

// Processar atualização de perfil
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_profile') {
        $name = trim($_POST['name'] ?? '');
        $bio = trim($_POST['bio'] ?? '');
        $location = trim($_POST['location'] ?? '');
        $website = trim($_POST['website'] ?? '');
        
        if (empty($name)) {
            $errors[] = 'Nome é obrigatório';
        }
        
        if (empty($errors)) {
            $stmt = $db->prepare("
                UPDATE users 
                SET name = ?, bio = ?, location = ?, website = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            
            if ($stmt->execute([$name, $bio, $location, $website, $user['id']])) {
                $success = 'Perfil atualizado com sucesso!';
                $user['name'] = $name;
                $user['bio'] = $bio;
                $user['location'] = $location;
                $user['website'] = $website;
            } else {
                $errors[] = 'Erro ao atualizar perfil';
            }
        }
    }
    
    elseif ($action === 'change_password') {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';
        
        if (empty($currentPassword)) {
            $errors[] = 'Senha atual é obrigatória';
        }
        
        if (empty($newPassword)) {
            $errors[] = 'Nova senha é obrigatória';
        } elseif (strlen($newPassword) < 6) {
            $errors[] = 'Nova senha deve ter pelo menos 6 caracteres';
        }
        
        if ($newPassword !== $confirmPassword) {
            $errors[] = 'Confirmação de senha não confere';
        }
        
        if (empty($errors)) {
            // Verificar senha atual
            if (!password_verify($currentPassword, $user['password'])) {
                $errors[] = 'Senha atual incorreta';
            } else {
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $stmt = $db->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
                
                if ($stmt->execute([$hashedPassword, $user['id']])) {
                    $success = 'Senha alterada com sucesso!';
                } else {
                    $errors[] = 'Erro ao alterar senha';
                }
            }
        }
        
        $activeTab = 'security';
    }
    
    elseif ($action === 'update_preferences') {
        $notifications = isset($_POST['notifications']);
        $emailUpdates = isset($_POST['email_updates']);
        $darkMode = isset($_POST['dark_mode']);
        
        $preferences = json_encode([
            'notifications' => $notifications,
            'email_updates' => $emailUpdates,
            'dark_mode' => $darkMode
        ]);
        
        $stmt = $db->prepare("UPDATE users SET preferences = ?, updated_at = NOW() WHERE id = ?");
        
        if ($stmt->execute([$preferences, $user['id']])) {
            $success = 'Preferências atualizadas com sucesso!';
        } else {
            $errors[] = 'Erro ao atualizar preferências';
        }
        
        $activeTab = 'preferences';
    }
}

// Buscar estatísticas do usuário
$stats = [];

// Downloads
$stmt = $db->prepare("SELECT COUNT(*) as count FROM downloads WHERE user_id = ?");
$stmt->execute([$user['id']]);
$stats['downloads'] = $stmt->fetch()['count'];

// Likes
$stmt = $db->prepare("SELECT COUNT(*) as count FROM likes WHERE user_id = ?");
$stmt->execute([$user['id']]);
$stats['likes'] = $stmt->fetch()['count'];

// Playlists (se implementado)
$stats['playlists'] = 0;

// Atividade recente
$stmt = $db->prepare("
    SELECT 
        'download' as type, 
        t.title as track_title,
        t.artist,
        d.created_at
    FROM downloads d
    JOIN tracks t ON t.id = d.track_id
    WHERE d.user_id = ?
    
    UNION
    
    SELECT 
        'like' as type,
        t.title as track_title,
        t.artist,
        l.created_at
    FROM likes l
    JOIN tracks t ON t.id = l.track_id
    WHERE l.user_id = ?
    
    ORDER BY created_at DESC
    LIMIT 10
");
$stmt->execute([$user['id'], $user['id']]);
$recentActivity = $stmt->fetchAll();

$pageTitle = 'Meu Perfil - Nexor Records Pools';
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
        .profile-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .profile-header {
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-sm);
            padding: 2rem;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 2rem;
        }
        
        .profile-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: var(--gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: white;
            font-weight: 700;
            flex-shrink: 0;
        }
        
        .profile-info {
            flex: 1;
        }
        
        .profile-name {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .profile-email {
            color: var(--text-secondary);
            font-size: 1rem;
            margin-bottom: 1rem;
        }
        
        .profile-stats {
            display: flex;
            gap: 2rem;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
        }
        
        .stat-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .profile-tabs {
            display: flex;
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-sm);
            margin-bottom: 2rem;
            overflow-x: auto;
        }
        
        .tab-button {
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            transition: var(--transition);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .tab-button.active {
            color: var(--primary-color);
            background: rgba(59, 130, 246, 0.1);
        }
        
        .tab-button:hover {
            color: var(--text-primary);
        }
        
        .tab-content {
            display: none;
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-sm);
            padding: 2rem;
        }
        
        .tab-content.active {
            display: block;
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
        
        .form-input,
        .form-textarea {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid var(--bg-tertiary);
            border-radius: var(--border-radius);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 1rem;
            transition: var(--transition);
        }
        
        .form-textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        .form-input:focus,
        .form-textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-checkbox {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .form-checkbox input {
            width: 18px;
            height: 18px;
        }
        
        .form-checkbox label {
            color: var(--text-secondary);
            cursor: pointer;
        }
        
        .btn-primary {
            background: var(--gradient-primary);
            color: white;
            border: none;
            padding: 0.875rem 1.5rem;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-lg);
        }
        
        .btn-danger {
            background: var(--error-color);
            color: white;
            border: none;
            padding: 0.875rem 1.5rem;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .btn-danger:hover {
            background: #dc2626;
            transform: translateY(-1px);
        }
        
        .activity-list {
            list-style: none;
            padding: 0;
        }
        
        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border: 1px solid var(--bg-tertiary);
            border-radius: var(--border-radius);
            margin-bottom: 0.5rem;
            transition: var(--transition);
        }
        
        .activity-item:hover {
            background: var(--bg-secondary);
        }
        
        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }
        
        .activity-icon.download {
            background: var(--primary-color);
        }
        
        .activity-icon.like {
            background: var(--error-color);
        }
        
        .activity-details {
            flex: 1;
        }
        
        .activity-title {
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .activity-subtitle {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        
        .activity-time {
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        
        .danger-zone {
            border: 2px solid var(--error-color);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            margin-top: 2rem;
        }
        
        .danger-title {
            color: var(--error-color);
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .danger-description {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .profile-container {
                padding: 1rem;
            }
            
            .profile-header {
                flex-direction: column;
                text-align: center;
            }
            
            .profile-stats {
                justify-content: center;
            }
            
            .profile-tabs {
                border-radius: 0;
                margin-left: -1rem;
                margin-right: -1rem;
            }
            
            .tab-content {
                border-radius: 0;
                margin-left: -1rem;
                margin-right: -1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <div class="logo">
                <a href="/">
                    <i class="fas fa-music"></i>
                    <span>Nexor Records</span>
                </a>
            </div>
            
            <nav class="nav">
                <a href="/" class="nav-link">
                    <i class="fas fa-home"></i>
                    Início
                </a>
                <a href="/browse.php" class="nav-link">
                    <i class="fas fa-search"></i>
                    Explorar
                </a>
                <a href="/profile.php" class="nav-link active">
                    <i class="fas fa-user"></i>
                    Perfil
                </a>
                <a href="/logout.php" class="nav-link">
                    <i class="fas fa-sign-out-alt"></i>
                    Sair
                </a>
            </nav>
        </div>
    </header>
    
    <main class="main">
        <div class="profile-container">
            <!-- Cabeçalho do perfil -->
            <div class="profile-header">
                <div class="profile-avatar">
                    <?php echo strtoupper(substr($user['name'], 0, 1)); ?>
                </div>
                <div class="profile-info">
                    <h1 class="profile-name"><?php echo htmlspecialchars($user['name']); ?></h1>
                    <div class="profile-email"><?php echo htmlspecialchars($user['email']); ?></div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-number"><?php echo number_format($stats['downloads']); ?></div>
                            <div class="stat-label">Downloads</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number"><?php echo number_format($stats['likes']); ?></div>
                            <div class="stat-label">Curtidas</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number"><?php echo number_format($stats['playlists']); ?></div>
                            <div class="stat-label">Playlists</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Mensagens -->
            <?php if (!empty($errors)): ?>
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <?php foreach ($errors as $error): ?>
                        <div><?php echo htmlspecialchars($error); ?></div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <?php echo htmlspecialchars($success); ?>
                </div>
            <?php endif; ?>
            
            <!-- Abas -->
            <div class="profile-tabs">
                <button class="tab-button <?php echo $activeTab === 'profile' ? 'active' : ''; ?>" data-tab="profile">
                    <i class="fas fa-user"></i>
                    Perfil
                </button>
                <button class="tab-button <?php echo $activeTab === 'security' ? 'active' : ''; ?>" data-tab="security">
                    <i class="fas fa-lock"></i>
                    Segurança
                </button>
                <button class="tab-button <?php echo $activeTab === 'preferences' ? 'active' : ''; ?>" data-tab="preferences">
                    <i class="fas fa-cog"></i>
                    Preferências
                </button>
                <button class="tab-button <?php echo $activeTab === 'activity' ? 'active' : ''; ?>" data-tab="activity">
                    <i class="fas fa-history"></i>
                    Atividade
                </button>
            </div>
            
            <!-- Conteúdo das abas -->
            
            <!-- Aba Perfil -->
            <div class="tab-content <?php echo $activeTab === 'profile' ? 'active' : ''; ?>" id="profile">
                <h2>Informações do Perfil</h2>
                <form method="POST">
                    <input type="hidden" name="action" value="update_profile">
                    
                    <div class="form-group">
                        <label for="name" class="form-label">Nome completo</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            class="form-input"
                            value="<?php echo htmlspecialchars($user['name']); ?>"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="bio" class="form-label">Bio</label>
                        <textarea 
                            id="bio" 
                            name="bio" 
                            class="form-textarea"
                            placeholder="Conte um pouco sobre você..."
                        ><?php echo htmlspecialchars($user['bio'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="location" class="form-label">Localização</label>
                        <input 
                            type="text" 
                            id="location" 
                            name="location" 
                            class="form-input"
                            value="<?php echo htmlspecialchars($user['location'] ?? ''); ?>"
                            placeholder="Cidade, Estado/País"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="website" class="form-label">Website</label>
                        <input 
                            type="url" 
                            id="website" 
                            name="website" 
                            class="form-input"
                            value="<?php echo htmlspecialchars($user['website'] ?? ''); ?>"
                            placeholder="https://seusite.com"
                        >
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i>
                        Salvar alterações
                    </button>
                </form>
            </div>
            
            <!-- Aba Segurança -->
            <div class="tab-content <?php echo $activeTab === 'security' ? 'active' : ''; ?>" id="security">
                <h2>Segurança da Conta</h2>
                <form method="POST">
                    <input type="hidden" name="action" value="change_password">
                    
                    <div class="form-group">
                        <label for="current_password" class="form-label">Senha atual</label>
                        <input 
                            type="password" 
                            id="current_password" 
                            name="current_password" 
                            class="form-input"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="new_password" class="form-label">Nova senha</label>
                        <input 
                            type="password" 
                            id="new_password" 
                            name="new_password" 
                            class="form-input"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm_password" class="form-label">Confirmar nova senha</label>
                        <input 
                            type="password" 
                            id="confirm_password" 
                            name="confirm_password" 
                            class="form-input"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-key"></i>
                        Alterar senha
                    </button>
                </form>
                
                <div class="danger-zone">
                    <h3 class="danger-title">Zona de Perigo</h3>
                    <p class="danger-description">
                        Ações irreversíveis. Use com cuidado.
                    </p>
                    <button type="button" class="btn-danger" onclick="confirmDeleteAccount()">
                        <i class="fas fa-trash"></i>
                        Deletar conta
                    </button>
                </div>
            </div>
            
            <!-- Aba Preferências -->
            <div class="tab-content <?php echo $activeTab === 'preferences' ? 'active' : ''; ?>" id="preferences">
                <h2>Preferências</h2>
                <form method="POST">
                    <input type="hidden" name="action" value="update_preferences">
                    
                    <?php 
                    $preferences = json_decode($user['preferences'] ?? '{}', true);
                    ?>
                    
                    <div class="form-checkbox">
                        <input 
                            type="checkbox" 
                            id="notifications" 
                            name="notifications"
                            <?php echo ($preferences['notifications'] ?? true) ? 'checked' : ''; ?>
                        >
                        <label for="notifications">Receber notificações push</label>
                    </div>
                    
                    <div class="form-checkbox">
                        <input 
                            type="checkbox" 
                            id="email_updates" 
                            name="email_updates"
                            <?php echo ($preferences['email_updates'] ?? true) ? 'checked' : ''; ?>
                        >
                        <label for="email_updates">Receber atualizações por email</label>
                    </div>
                    
                    <div class="form-checkbox">
                        <input 
                            type="checkbox" 
                            id="dark_mode" 
                            name="dark_mode"
                            <?php echo ($preferences['dark_mode'] ?? false) ? 'checked' : ''; ?>
                        >
                        <label for="dark_mode">Modo escuro (experimental)</label>
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i>
                        Salvar preferências
                    </button>
                </form>
            </div>
            
            <!-- Aba Atividade -->
            <div class="tab-content <?php echo $activeTab === 'activity' ? 'active' : ''; ?>" id="activity">
                <h2>Atividade Recente</h2>
                
                <?php if (empty($recentActivity)): ?>
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>Nenhuma atividade recente</p>
                    </div>
                <?php else: ?>
                    <ul class="activity-list">
                        <?php foreach ($recentActivity as $activity): ?>
                            <li class="activity-item">
                                <div class="activity-icon <?php echo $activity['type']; ?>">
                                    <i class="fas fa-<?php echo $activity['type'] === 'download' ? 'download' : 'heart'; ?>"></i>
                                </div>
                                <div class="activity-details">
                                    <div class="activity-title">
                                        <?php echo $activity['type'] === 'download' ? 'Download' : 'Curtiu'; ?>: 
                                        <?php echo htmlspecialchars($activity['track_title']); ?>
                                    </div>
                                    <div class="activity-subtitle">
                                        <?php echo htmlspecialchars($activity['artist']); ?>
                                    </div>
                                </div>
                                <div class="activity-time">
                                    <?php echo date('d/m/Y H:i', strtotime($activity['created_at'])); ?>
                                </div>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
        </div>
    </main>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Sistema de abas
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const targetTab = this.dataset.tab;
                    
                    // Remover active de todos
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Ativar o clicado
                    this.classList.add('active');
                    document.getElementById(targetTab).classList.add('active');
                    
                    // Atualizar URL
                    const url = new URL(window.location);
                    url.searchParams.set('tab', targetTab);
                    window.history.replaceState({}, '', url);
                });
            });
            
            // Confirmação de senha
            const newPasswordInput = document.getElementById('new_password');
            const confirmPasswordInput = document.getElementById('confirm_password');
            
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', function() {
                    if (this.value !== newPasswordInput.value) {
                        this.setCustomValidity('Senhas não conferem');
                    } else {
                        this.setCustomValidity('');
                    }
                });
            }
        });
        
        function confirmDeleteAccount() {
            if (confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.')) {
                if (confirm('ÚLTIMA CONFIRMAÇÃO: Todos os seus dados serão perdidos permanentemente. Continuar?')) {
                    // Implementar deleção da conta
                    window.location.href = '/delete-account.php';
                }
            }
        }
    </script>
</body>
</html>
