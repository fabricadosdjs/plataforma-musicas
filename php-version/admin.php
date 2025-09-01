<?php
/**
 * 🛠️ PAINEL ADMINISTRATIVO
 * Sistema de administração da plataforma
 */

require_once 'includes/auth.php';
require_once 'includes/tracks.php';

$auth = new Auth();

// Verificar se está logado e é admin
if (!$auth->isLoggedIn() || !$auth->isAdmin()) {
    header('Location: /login.php?message=admin_required');
    exit;
}

$user = $auth->getCurrentUser();
$db = Database::getInstance();
$tracksManager = new TracksManager();

$errors = [];
$success = '';
$activeTab = $_GET['tab'] ?? 'dashboard';

// Processar ações administrativas
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add_track') {
        $title = trim($_POST['title'] ?? '');
        $artist = trim($_POST['artist'] ?? '');
        $genre = trim($_POST['genre'] ?? '');
        $bpm = (int)($_POST['bpm'] ?? 0);
        $key_signature = trim($_POST['key_signature'] ?? '');
        $file_url = trim($_POST['file_url'] ?? '');
        $image_url = trim($_POST['image_url'] ?? '');
        
        if (empty($title) || empty($artist) || empty($file_url)) {
            $errors[] = 'Título, artista e URL do arquivo são obrigatórios';
        } else {
            $result = $tracksManager->addTrack($title, $artist, $genre, $bpm, $key_signature, $file_url, $image_url);
            if ($result['success']) {
                $success = 'Música adicionada com sucesso!';
            } else {
                $errors[] = $result['error'];
            }
        }
        $activeTab = 'tracks';
    }
    
    elseif ($action === 'delete_track') {
        $trackId = (int)($_POST['track_id'] ?? 0);
        
        if ($trackId > 0) {
            $stmt = $db->prepare("DELETE FROM tracks WHERE id = ?");
            if ($stmt->execute([$trackId])) {
                $success = 'Música removida com sucesso!';
            } else {
                $errors[] = 'Erro ao remover música';
            }
        }
        $activeTab = 'tracks';
    }
    
    elseif ($action === 'update_user_role') {
        $userId = (int)($_POST['user_id'] ?? 0);
        $role = $_POST['role'] ?? 'user';
        
        if ($userId > 0 && in_array($role, ['user', 'uploader', 'admin'])) {
            $stmt = $db->prepare("UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?");
            if ($stmt->execute([$role, $userId])) {
                $success = 'Função do usuário atualizada!';
            } else {
                $errors[] = 'Erro ao atualizar função';
            }
        }
        $activeTab = 'users';
    }
}

// Buscar estatísticas gerais
$stats = [];

// Total de usuários
$stmt = $db->query("SELECT COUNT(*) as count FROM users");
$stats['users'] = $stmt->fetch()['count'];

// Total de músicas
$stmt = $db->query("SELECT COUNT(*) as count FROM tracks");
$stats['tracks'] = $stmt->fetch()['count'];

// Total de downloads
$stmt = $db->query("SELECT COUNT(*) as count FROM downloads");
$stats['downloads'] = $stmt->fetch()['count'];

// Total de likes
$stmt = $db->query("SELECT COUNT(*) as count FROM likes");
$stats['likes'] = $stmt->fetch()['count'];

// Usuários por tipo
$stmt = $db->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
$usersByRole = [];
while ($row = $stmt->fetch()) {
    $usersByRole[$row['role']] = $row['count'];
}

// Buscar todas as músicas para administração
$tracks = [];
if ($activeTab === 'tracks') {
    $stmt = $db->query("
        SELECT t.*, 
               (SELECT COUNT(*) FROM downloads WHERE track_id = t.id) as download_count,
               (SELECT COUNT(*) FROM likes WHERE track_id = t.id) as like_count
        FROM tracks t 
        ORDER BY t.created_at DESC
    ");
    $tracks = $stmt->fetchAll();
}

// Buscar todos os usuários para administração
$users = [];
if ($activeTab === 'users') {
    $stmt = $db->query("
        SELECT u.*,
               (SELECT COUNT(*) FROM downloads WHERE user_id = u.id) as download_count,
               (SELECT COUNT(*) FROM likes WHERE user_id = u.id) as like_count
        FROM users u 
        ORDER BY u.created_at DESC
    ");
    $users = $stmt->fetchAll();
}

$pageTitle = 'Painel Admin - Nexor Records Pools';
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
        .admin-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .admin-header {
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-sm);
            padding: 2rem;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .admin-title {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .admin-badge {
            background: var(--gradient-primary);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: var(--border-radius);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-sm);
            padding: 1.5rem;
            text-align: center;
        }
        
        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
        }
        
        .stat-icon.users { background: var(--primary-color); }
        .stat-icon.tracks { background: var(--success-color); }
        .stat-icon.downloads { background: var(--warning-color); }
        .stat-icon.likes { background: var(--error-color); }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .admin-tabs {
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
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .data-table th,
        .data-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--bg-tertiary);
        }
        
        .data-table th {
            font-weight: 600;
            color: var(--text-primary);
            background: var(--bg-secondary);
        }
        
        .data-table td {
            color: var(--text-secondary);
        }
        
        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn-small {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
            border-radius: var(--border-radius);
            border: none;
            cursor: pointer;
            transition: var(--transition);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .btn-primary-small {
            background: var(--primary-color);
            color: white;
        }
        
        .btn-danger-small {
            background: var(--error-color);
            color: white;
        }
        
        .btn-warning-small {
            background: var(--warning-color);
            color: white;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-primary);
        }
        
        .form-input,
        .form-select {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid var(--bg-tertiary);
            border-radius: var(--border-radius);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 1rem;
            transition: var(--transition);
        }
        
        .form-input:focus,
        .form-select:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        .role-badge {
            padding: 0.25rem 0.5rem;
            border-radius: var(--border-radius);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .role-admin { background: var(--error-color); color: white; }
        .role-uploader { background: var(--warning-color); color: white; }
        .role-user { background: var(--bg-tertiary); color: var(--text-secondary); }
        
        @media (max-width: 768px) {
            .admin-container {
                padding: 1rem;
            }
            
            .admin-header {
                flex-direction: column;
                text-align: center;
                gap: 1rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            
            .data-table {
                font-size: 0.875rem;
            }
            
            .data-table th,
            .data-table td {
                padding: 0.5rem;
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
                <a href="/admin.php" class="nav-link active">
                    <i class="fas fa-cog"></i>
                    Admin
                </a>
                <a href="/profile.php" class="nav-link">
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
        <div class="admin-container">
            <!-- Cabeçalho admin -->
            <div class="admin-header">
                <div class="admin-title">
                    <i class="fas fa-cog"></i>
                    Painel Administrativo
                    <span class="admin-badge">Admin</span>
                </div>
                <div style="color: var(--text-secondary);">
                    Bem-vindo, <?php echo htmlspecialchars($user['name']); ?>
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
            
            <!-- Estatísticas -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon users">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-number"><?php echo number_format($stats['users']); ?></div>
                    <div class="stat-label">Usuários</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon tracks">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="stat-number"><?php echo number_format($stats['tracks']); ?></div>
                    <div class="stat-label">Músicas</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon downloads">
                        <i class="fas fa-download"></i>
                    </div>
                    <div class="stat-number"><?php echo number_format($stats['downloads']); ?></div>
                    <div class="stat-label">Downloads</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon likes">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="stat-number"><?php echo number_format($stats['likes']); ?></div>
                    <div class="stat-label">Curtidas</div>
                </div>
            </div>
            
            <!-- Abas -->
            <div class="admin-tabs">
                <button class="tab-button <?php echo $activeTab === 'dashboard' ? 'active' : ''; ?>" data-tab="dashboard">
                    <i class="fas fa-chart-bar"></i>
                    Dashboard
                </button>
                <button class="tab-button <?php echo $activeTab === 'tracks' ? 'active' : ''; ?>" data-tab="tracks">
                    <i class="fas fa-music"></i>
                    Músicas
                </button>
                <button class="tab-button <?php echo $activeTab === 'users' ? 'active' : ''; ?>" data-tab="users">
                    <i class="fas fa-users"></i>
                    Usuários
                </button>
                <button class="tab-button <?php echo $activeTab === 'settings' ? 'active' : ''; ?>" data-tab="settings">
                    <i class="fas fa-cog"></i>
                    Configurações
                </button>
            </div>
            
            <!-- Conteúdo das abas -->
            
            <!-- Dashboard -->
            <div class="tab-content <?php echo $activeTab === 'dashboard' ? 'active' : ''; ?>" id="dashboard">
                <h2>Visão Geral</h2>
                
                <div class="form-grid">
                    <div>
                        <h3>Usuários por Tipo</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 0.5rem;">
                                <span class="role-badge role-admin">Admin</span>
                                <?php echo number_format($usersByRole['admin'] ?? 0); ?>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <span class="role-badge role-uploader">Uploader</span>
                                <?php echo number_format($usersByRole['uploader'] ?? 0); ?>
                            </li>
                            <li style="margin-bottom: 0.5rem;">
                                <span class="role-badge role-user">User</span>
                                <?php echo number_format($usersByRole['user'] ?? 0); ?>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3>Ações Rápidas</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button class="btn-primary" onclick="showTab('tracks')">
                                <i class="fas fa-plus"></i>
                                Adicionar Música
                            </button>
                            <button class="btn-primary" onclick="showTab('users')">
                                <i class="fas fa-user-cog"></i>
                                Gerenciar Usuários
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Músicas -->
            <div class="tab-content <?php echo $activeTab === 'tracks' ? 'active' : ''; ?>" id="tracks">
                <h2>Gerenciar Músicas</h2>
                
                <!-- Formulário para adicionar música -->
                <form method="POST" style="background: var(--bg-secondary); padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 2rem;">
                    <input type="hidden" name="action" value="add_track">
                    <h3>Adicionar Nova Música</h3>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="title" class="form-label">Título *</label>
                            <input type="text" id="title" name="title" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="artist" class="form-label">Artista *</label>
                            <input type="text" id="artist" name="artist" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="genre" class="form-label">Gênero</label>
                            <input type="text" id="genre" name="genre" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label for="bpm" class="form-label">BPM</label>
                            <input type="number" id="bpm" name="bpm" class="form-input" min="0" max="300">
                        </div>
                        
                        <div class="form-group">
                            <label for="key_signature" class="form-label">Tom</label>
                            <input type="text" id="key_signature" name="key_signature" class="form-input" placeholder="Ex: Am, C#m">
                        </div>
                        
                        <div class="form-group">
                            <label for="file_url" class="form-label">URL do Arquivo *</label>
                            <input type="url" id="file_url" name="file_url" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="image_url" class="form-label">URL da Imagem</label>
                            <input type="url" id="image_url" name="image_url" class="form-input">
                        </div>
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-plus"></i>
                        Adicionar Música
                    </button>
                </form>
                
                <!-- Lista de músicas -->
                <h3>Músicas Existentes</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Artista</th>
                            <th>Gênero</th>
                            <th>Downloads</th>
                            <th>Likes</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($tracks as $track): ?>
                            <tr>
                                <td>#<?php echo $track['id']; ?></td>
                                <td><?php echo htmlspecialchars($track['title']); ?></td>
                                <td><?php echo htmlspecialchars($track['artist']); ?></td>
                                <td><?php echo htmlspecialchars($track['genre'] ?? '-'); ?></td>
                                <td><?php echo number_format($track['download_count']); ?></td>
                                <td><?php echo number_format($track['like_count']); ?></td>
                                <td>
                                    <div class="action-buttons">
                                        <a href="/track.php?id=<?php echo $track['id']; ?>" class="btn-small btn-primary-small">
                                            <i class="fas fa-eye"></i> Ver
                                        </a>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Confirma a exclusão?')">
                                            <input type="hidden" name="action" value="delete_track">
                                            <input type="hidden" name="track_id" value="<?php echo $track['id']; ?>">
                                            <button type="submit" class="btn-small btn-danger-small">
                                                <i class="fas fa-trash"></i> Excluir
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            
            <!-- Usuários -->
            <div class="tab-content <?php echo $activeTab === 'users' ? 'active' : ''; ?>" id="users">
                <h2>Gerenciar Usuários</h2>
                
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Função</th>
                            <th>Downloads</th>
                            <th>Likes</th>
                            <th>Registro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $userData): ?>
                            <tr>
                                <td>#<?php echo $userData['id']; ?></td>
                                <td><?php echo htmlspecialchars($userData['name']); ?></td>
                                <td><?php echo htmlspecialchars($userData['email']); ?></td>
                                <td>
                                    <span class="role-badge role-<?php echo $userData['role']; ?>">
                                        <?php echo ucfirst($userData['role']); ?>
                                    </span>
                                </td>
                                <td><?php echo number_format($userData['download_count']); ?></td>
                                <td><?php echo number_format($userData['like_count']); ?></td>
                                <td><?php echo date('d/m/Y', strtotime($userData['created_at'])); ?></td>
                                <td>
                                    <form method="POST" style="display: inline;">
                                        <input type="hidden" name="action" value="update_user_role">
                                        <input type="hidden" name="user_id" value="<?php echo $userData['id']; ?>">
                                        <select name="role" class="form-select" style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.75rem;" onchange="this.form.submit()">
                                            <option value="user" <?php echo $userData['role'] === 'user' ? 'selected' : ''; ?>>User</option>
                                            <option value="uploader" <?php echo $userData['role'] === 'uploader' ? 'selected' : ''; ?>>Uploader</option>
                                            <option value="admin" <?php echo $userData['role'] === 'admin' ? 'selected' : ''; ?>>Admin</option>
                                        </select>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            
            <!-- Configurações -->
            <div class="tab-content <?php echo $activeTab === 'settings' ? 'active' : ''; ?>" id="settings">
                <h2>Configurações do Sistema</h2>
                
                <div class="form-grid">
                    <div>
                        <h3>Configurações Gerais</h3>
                        <p style="color: var(--text-secondary);">
                            As configurações avançadas do sistema podem ser editadas diretamente no arquivo <code>config/settings.php</code>.
                        </p>
                        
                        <h4>Informações do Sistema</h4>
                        <ul style="color: var(--text-secondary);">
                            <li>PHP Version: <?php echo PHP_VERSION; ?></li>
                            <li>Database: MySQL</li>
                            <li>Server: <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'N/A'; ?></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3>Ações de Manutenção</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button class="btn-warning-small" onclick="alert('Funcionalidade em desenvolvimento')">
                                <i class="fas fa-database"></i>
                                Backup Database
                            </button>
                            <button class="btn-warning-small" onclick="alert('Funcionalidade em desenvolvimento')">
                                <i class="fas fa-broom"></i>
                                Limpar Cache
                            </button>
                            <button class="btn-danger-small" onclick="alert('Funcionalidade em desenvolvimento')">
                                <i class="fas fa-exclamation-triangle"></i>
                                Reset Sistema
                            </button>
                        </div>
                    </div>
                </div>
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
                    showTab(targetTab);
                });
            });
        });
        
        function showTab(tabName) {
            // Remover active de todos
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Ativar o selecionado
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            // Atualizar URL
            const url = new URL(window.location);
            url.searchParams.set('tab', tabName);
            window.history.replaceState({}, '', url);
            
            // Recarregar se necessário
            if (tabName === 'tracks' || tabName === 'users') {
                location.reload();
            }
        }
    </script>
</body>
</html>
