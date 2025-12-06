<?php
// =============================================
// CONFIGURAÇÃO GLOBAL DO BACKEND Ze.EFE
// =============================================

// --- Suporte multi-origem (www / sem www / localhost) ---
$allowed_origins = [
  'https://www.zeefe.com.br',
  'https://zeefe.com.br',
  'http://localhost:8000',
  'http://localhost'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
  header("Access-Control-Allow-Origin: $origin");
} else {
  header("Access-Control-Allow-Origin: https://www.zeefe.com.br");
}

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// --- Tratar preflight OPTIONS ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// --- Conexão com o banco ---
$config = include __DIR__ . '/config.php';
$db = $config['db'];

try {
  $dsn = "mysql:host={$db['host']};dbname={$db['dbname']};charset=utf8";
  $pdo = new PDO($dsn, $db['user'], $db['pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'error' => 'Erro na conexão: ' . $e->getMessage()]);
  exit;
}

// --- Função utilitária padrão ---
function getJsonInput() {
  $data = json_decode(file_get_contents("php://input"), true);
  return is_array($data) ? $data : [];
}
?>
