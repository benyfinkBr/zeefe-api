<?php
require_once __DIR__ . '/apiconfig.php';

$data = json_decode(file_get_contents('php://input'), true);
$token = trim($data['token'] ?? '');

if ($token === '') {
  echo json_encode(['success' => false, 'error' => 'Token ausente.']);
  exit;
}

try {
  $hash = hash('sha256', $token);
  $now = (new DateTimeImmutable())->format('Y-m-d H:i:s');

  $stmt = $pdo->prepare("
    SELECT t.admin_id, t.expires_at, a.*, p.name AS profile_name, p.permissions_json
    FROM admin_remember_tokens t
    JOIN admins a ON a.id = t.admin_id
    LEFT JOIN admin_profiles p ON p.id = a.profile_id
    WHERE t.token_hash = :hash
    LIMIT 1
  ");
  $stmt->execute([':hash' => $hash]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    echo json_encode(['success' => false, 'error' => 'Token inválido.']);
    exit;
  }

  if ($row['expires_at'] < $now) {
    echo json_encode(['success' => false, 'error' => 'Token expirado.']);
    exit;
  }

  if (!empty($row['status']) && in_array(strtolower($row['status']), ['inativo','bloqueado'], true)) {
    echo json_encode(['success' => false, 'error' => 'Conta inativa.']);
    exit;
  }

  session_regenerate_id(true);
  $_SESSION['admin_id'] = (int) $row['id'];
  $_SESSION['admin_name'] = $row['name'] ?? $row['username'] ?? 'Admin';
  $_SESSION['auth'] = [
    'logged_in' => true,
    'user_id' => (int) $row['id'],
    'name' => $_SESSION['admin_name'],
    'email' => $row['email'] ?? '',
    'role' => 'admin',
    'ts' => time(),
  ];

  echo json_encode([
    'success' => true,
    'admin' => [
      'id' => (int) $row['id'],
      'name' => $row['name'] ?? null,
      'username' => $row['username'] ?? null,
      'email' => $row['email'] ?? null,
      'profile_id' => isset($row['profile_id']) ? (int) $row['profile_id'] : null,
      'profile_name' => $row['profile_name'] ?? null,
      'permissions_json' => $row['permissions_json'] ?? null,
      'status' => $row['status'] ?? null,
      'is_master' => !empty($row['is_master']) ? 1 : 0
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}
