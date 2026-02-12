<?php
// =============================================
// CONFIGURAÇÃO GLOBAL DO BACKEND Ze.EFE
// =============================================

// When this file is included by other handlers (e.g., webhooks), it must NOT fatally exit.
// It should only exit when accessed directly.
$is_entrypoint = false;
if (isset($_SERVER['SCRIPT_FILENAME'])) {
  $is_entrypoint = (realpath($_SERVER['SCRIPT_FILENAME']) === realpath(__FILE__));
}

// Allow callers to disable global headers/sessions (useful for isolated webhooks).
$ZEEFE_NO_GLOBAL_HEADERS = defined('ZEEFE_NO_GLOBAL_HEADERS') ? true : false;
$ZEEFE_NO_SESSION = defined('ZEEFE_NO_SESSION') ? true : false;

// --- Suporte multi-origem (www / sem www / localhost) ---
$allowed_origins = [
  'https://www.zeefe.com.br',
  'https://zeefe.com.br',
  'http://localhost:8000',
  'http://localhost'
];

if (!$ZEEFE_NO_GLOBAL_HEADERS) {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
  } else {
    header("Access-Control-Allow-Origin: https://www.zeefe.com.br");
  }

  header('Content-Type: application/json; charset=UTF-8');
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
}

if (!$ZEEFE_NO_SESSION) {
  $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
  session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '.zeefe.com.br',
    'secure'   => $secure,
    'httponly' => true,
    'samesite' => 'Lax'
  ]);
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
    error_log('[SESSION] ID=' . session_id());
  }
}

// --- Tratar preflight OPTIONS ---
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// --- Conexão com o banco ---
$pdo = null;
$ZEEFE_CONFIG_ERROR = null;
$ZEEFE_DB_ERROR = null;

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
  $ZEEFE_CONFIG_ERROR = 'Missing config.php at ' . $configPath;
} else {
  $config = include $configPath;
  if (!is_array($config) || !isset($config['db']) || !is_array($config['db'])) {
    $ZEEFE_CONFIG_ERROR = 'Invalid config.php structure (expected ["db"] array)';
  }
}

if ($ZEEFE_CONFIG_ERROR === null) {
  $db = $config['db'];

  if (!isset($db['host'], $db['dbname'], $db['user'], $db['pass'])) {
    $ZEEFE_CONFIG_ERROR = 'DB config missing keys (host/dbname/user/pass)';
  } else {
    try {
      $dsn = "mysql:host={$db['host']};dbname={$db['dbname']};charset=utf8mb4";
      $pdo = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
      ]);
    } catch (PDOException $e) {
      $ZEEFE_DB_ERROR = 'Erro na conexão: ' . $e->getMessage();
    }
  }
}

// If accessed directly, keep legacy behavior: output error JSON and exit.
// If included, DO NOT exit; callers can handle $pdo === null.
if ($is_entrypoint && ($ZEEFE_CONFIG_ERROR !== null || $ZEEFE_DB_ERROR !== null)) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => $ZEEFE_DB_ERROR ?? $ZEEFE_CONFIG_ERROR,
  ]);
  exit;
}

// --- Função utilitária padrão ---
function getJsonInput(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '', true);
  return is_array($data) ? $data : [];
}
?>
