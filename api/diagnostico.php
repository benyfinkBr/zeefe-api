<?php
// diagnostico.php — ferramenta de verificação de sessão, CORS e DB para Ze.EFE
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

header('Content-Type: application/json; charset=utf-8');

// ==== 1. Carregar config e tentar conexão ====
$diagnostic = [];
try {
    $config = require __DIR__ . '/config.php';
    $diagnostic['config_loaded'] = true;
} catch (Throwable $e) {
    $diagnostic['config_loaded'] = false;
    $diagnostic['config_error'] = $e->getMessage();
}

// ==== 2. Detectar HTTPS e origem ====
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$diagnostic['https_detected'] = $isHttps;
$diagnostic['http_origin'] = $_SERVER['HTTP_ORIGIN'] ?? null;
$diagnostic['server_name'] = $_SERVER['SERVER_NAME'] ?? null;

// ==== 3. Sessão ====
if (!isset($_SESSION['diagnostic_runs'])) $_SESSION['diagnostic_runs'] = 0;
$_SESSION['diagnostic_runs']++;

// ==== 4. Teste de conexão ao banco ====
try {
    require_once __DIR__ . '/db_connect.php';
    $pdo->query("SELECT 1");
    $diagnostic['db_connection'] = 'OK';
} catch (Throwable $e) {
    $diagnostic['db_connection'] = 'FAIL';
    $diagnostic['db_error'] = $e->getMessage();
}

// ==== 5. Resumo da sessão ====
$diagnostic['session'] = [
    'id' => session_id(),
    'save_path' => session_save_path(),
    'status' => session_status(),
    'cookie_params' => session_get_cookie_params(),
    'stored_counter' => $_SESSION['diagnostic_runs'],
    'is_admin_logged' => $_SESSION['admin_logged'] ?? false,
    'admin_user' => $_SESSION['admin_user'] ?? null
];

// ==== 6. Cabeçalhos ====
$diagnostic['headers'] = getallheaders();

// ==== 7. IP e data ====
$diagnostic['timestamp'] = date('Y-m-d H:i:s');
$diagnostic['client_ip'] = $_SERVER['REMOTE_ADDR'] ?? null;

// ==== 8. Enviar resposta ====
echo json_encode($diagnostic, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
