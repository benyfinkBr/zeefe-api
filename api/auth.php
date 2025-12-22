<?php
ini_set('session.save_path', '/home1/benyfi15/tmp');
session_save_path('/home1/benyfi15/tmp');
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => $secure,
    'httponly' => true,
    'samesite' => 'Lax'
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
    error_log('[SESSION] ID=' . session_id());
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: https://www.zeefe.com.br');

header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'benyfi15_zeefe_db';
$username = 'benyfi15_zeefe_user';
$password = 'Gafin123!';

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out']);
    exit;
}

// Login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        exit;
    }
    
    $login = trim($data['login'] ?? '');
    $pwd = trim($data['password'] ?? '');
    
    if (empty($login) || empty($pwd)) {
        echo json_encode(['success' => false, 'error' => 'Login e senha obrigatórios']);
        exit;
    }
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sql = "SELECT * FROM admin_users WHERE username = ? LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$login]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $passwordMatch = false;
            
            // TENTA HASH PRIMEIRO
            if (password_verify($pwd, $user['password_hash'])) {
                $passwordMatch = true;
            }
            // SE FALHAR, TENTA TEXTO PLANO (para senhas antigas)
            elseif ($pwd === $user['password_hash']) {
                $passwordMatch = true;
            }
            
            if ($passwordMatch) {
                $_SESSION['admin_logged'] = true;
                $_SESSION['admin_user'] = [
                    'id' => $user['id'],
                    'nome' => $user['nome'],
                    'username' => $user['username']
                ];
                echo json_encode([
                    'success' => true, 
                    'message' => 'Login OK',
                    'user' => $_SESSION['admin_user']
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Senha incorreta']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Usuário não encontrado']);
        }
        
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Erro DB: ' . $e->getMessage()]);
    }
    exit;
}

// Check auth
if (isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true) {
    echo json_encode(['success' => true, 'user' => $_SESSION['admin_user']]);
} else {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
}
?>
