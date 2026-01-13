<?php
require 'apiconfig.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Método não permitido']);
  exit;
}

session_set_cookie_params([
  'lifetime' => 0,
  'path' => '/',
  'domain' => '',
  'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
  'httponly' => true,
  'samesite' => 'Lax'
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
  session_start();
}

if (empty($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Não autenticado']);
  exit;
}

function admin_can_inventory(PDO $pdo, int $adminId, string $action): bool {
  try {
    $stmt = $pdo->prepare('SELECT a.is_master, p.permissions_json FROM admins a LEFT JOIN admin_profiles p ON p.id = a.profile_id WHERE a.id = :id LIMIT 1');
    $stmt->execute([':id' => $adminId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return false;
    if (!empty($row['is_master'])) return true;
    $raw = $row['permissions_json'] ?? null;
    $perms = is_string($raw) ? json_decode($raw, true) : (is_array($raw) ? $raw : []);
    if (!is_array($perms)) return false;
    return !empty($perms['inventory_items'][$action]);
  } catch (Throwable $e) {
    return false;
  }
}

if (!admin_can_inventory($pdo, (int)$_SESSION['admin_id'], 'read')) {
  http_response_code(403);
  echo json_encode(['success' => false, 'error' => 'Sem permissão para inventário']);
  exit;
}

$token = trim($_GET['token'] ?? '');
if (!$token) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Token inválido']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT * FROM inventory_items WHERE qr_token = :token LIMIT 1');
  $stmt->execute([':token' => $token]);
  $item = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$item) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Item não encontrado']);
    exit;
  }
  echo json_encode(['success' => true, 'item' => $item]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
